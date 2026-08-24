import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { FastifyReply } from 'fastify';
import fs from 'fs';
import path from 'path';
import { innertubeClient } from 'server/common/innertube/innertube';
import { sanitizeHtmlString } from 'server/common/sanitize-html';
import {
  toVTChannelAboutDto,
  toVTChannelPageDto
} from 'server/mapper/converter/channel/vt-channel-page.converter';
import { toVTChannelHomeDto } from 'server/mapper/converter/channel/vt-channel-shelf.converter';
import { toVTCommunityPostDtoList } from 'server/mapper/converter/channel/vt-community-post.converter';
import { toVTPlaylistDtoFromLockupView } from 'server/mapper/converter/lockup/vt-lockup.converter';
import { toVTVideoDtoList } from 'server/mapper/converter/video/vt-video-node.converter';
import { VTChannelAboutDto } from 'server/mapper/dto/channel/vt-channel-about.dto';
import { VTChannelFeedDto } from 'server/mapper/dto/channel/vt-channel-feed.dto';
import { VTChannelHomeDto } from 'server/mapper/dto/channel/vt-channel-home.dto';
import { VTChannelPageDto } from 'server/mapper/dto/channel/vt-channel-page.dto';
import { VTChannelPlaylistsDto } from 'server/mapper/dto/channel/vt-channel-playlists.dto';
import { VTChannelSearchDto } from 'server/mapper/dto/channel/vt-channel-search.dto';
import { VTChannelShelfDto } from 'server/mapper/dto/channel/vt-channel-shelf.dto';
import { VTCommunityPostsDto } from 'server/mapper/dto/channel/vt-community-posts.dto';
import sharp from 'sharp';
import { Parser, YTNodes } from 'youtubei.js';
import { extractAvailableFilters, extractFilterToken, extractSortToken } from './channel-chips';
import {
  collectFeedNodes,
  extractFeedContinuation,
  isRejectedFeedResponse,
  ParsedFeedResponse
} from './channel-feed';
import { buildChannelFeedToken, ChannelFeedTab, isFilterableTab } from './channel-feed-params';
import { channelResolveUrls, isChannelId } from './channel-identifier';
import { checkParams } from './channels.helper';
import { ChannelFeedStrategy, ContentFilterType, SortType } from './types/sort';

const RESOLVED_ID_CACHE_PREFIX = 'channel-id:';

/** A handle points at the same channel for as long as both exist, so this can be held for a day. */
const RESOLVED_ID_TTL_MS = 24 * 60 * 60 * 1000;

const isInvalidArgumentError = (error: { info?: unknown }): boolean => {
  if (typeof error?.info !== 'string') return false;

  try {
    return JSON.parse(error.info)?.error?.status === 'INVALID_ARGUMENT';
  } catch {
    return false;
  }
};

@Injectable()
export class ChannelsService {
  private readonly logger = new Logger(ChannelsService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  private channelNotFound(): never {
    throw new NotFoundException({
      message: 'Channel not found',
      description: 'No channel exists for that id'
    });
  }

  /**
   * YouTube addresses one channel by several names — the `UC…` id, an `@handle`, a legacy custom
   * url or username — but only the id can be put in a browse token, so everything else is resolved
   * to one first. The result is cached, since it only changes when the channel itself does.
   */
  private async resolveChannelId(identifier: string): Promise<string> {
    if (isChannelId(identifier)) return identifier;

    const urls = channelResolveUrls(identifier);
    if (!urls.length) this.channelNotFound();

    const cacheKey = `${RESOLVED_ID_CACHE_PREFIX}${identifier}`;
    const cached = await this.cacheManager.get<string>(cacheKey);
    if (cached) return cached;

    const innertube = await innertubeClient();

    for (const url of urls) {
      try {
        const endpoint = await innertube.resolveURL(url);
        const browseId = endpoint?.payload?.browseId;

        if (isChannelId(browseId)) {
          await this.cacheManager.set(cacheKey, browseId, RESOLVED_ID_TTL_MS);
          return browseId;
        }
      } catch (error) {
        // An unknown name is a plain request failure here, so a miss is not worth surfacing
        this.logger.debug(`Could not resolve ${url}: ${error?.message}`);
      }
    }

    this.channelNotFound();
  }

  private async getChannel(identifier: string) {
    const channelId = await this.resolveChannelId(identifier);

    const innertube = await innertubeClient();
    try {
      return await innertube.getChannel(channelId);
    } catch (error) {
      // youtubei.js reports a missing or terminated channel as a typed ChannelError, and an id
      // YouTube itself rejects as a plain request failure carrying an INVALID_ARGUMENT body
      if (error?.constructor?.name === 'ChannelError' || isInvalidArgumentError(error)) {
        throw new NotFoundException({ message: 'Channel not found', description: error?.message });
      }
      throw error;
    }
  }

  /**
   * `getAbout` returns the new `AboutChannel` view model or, for channels YouTube still serves the
   * old way, a `ChannelAboutFullMetadata` node whose fields sit at the top level.
   */
  private async getAboutMetadata(channel: Awaited<ReturnType<typeof this.getChannel>>) {
    const about = await channel.getAbout();

    return (about && 'metadata' in about ? about.metadata : about) as never;
  }

  private async browse(continuation: string): Promise<ParsedFeedResponse> {
    const innertube = await innertubeClient();
    const response = await innertube.actions.execute('/browse', {
      continuation,
      parse: false
    });

    return Parser.parseResponse(response.data) as unknown as ParsedFeedResponse;
  }

  /**
   * Feeds are homogeneous in practice — a videos tab is all lockups, a shorts tab all shorts —
   * so gathering per node type keeps the order YouTube sent them in.
   */
  private feedVideosOf(parsed: ParsedFeedResponse) {
    const nodes = [
      ...collectFeedNodes(parsed, YTNodes.LockupView),
      ...collectFeedNodes(parsed, YTNodes.ShortsLockupView),
      ...collectFeedNodes(parsed, YTNodes.Video)
    ];

    return toVTVideoDtoList(nodes);
  }

  async getChannelInfo(channelId: string): Promise<VTChannelPageDto> {
    if (!checkParams(channelId)) {
      throw new BadRequestException('Error fetching channel info', 'Invalid channelId');
    }

    const channel = await this.getChannel(channelId);

    // Topic channels have no about tab; the microformat still carries a description
    let about = null;
    try {
      about = await this.getAboutMetadata(channel);
    } catch (error) {
      this.logger.debug(`No about tab for channel ${channelId}: ${error?.message}`);
    }

    const channelPage = toVTChannelPageDto(channel as never, about);

    return {
      ...channelPage,
      description: sanitizeHtmlString(channelPage.description)
    };
  }

  async getChannelStats(channelId: string): Promise<VTChannelAboutDto> {
    if (!checkParams(channelId)) {
      throw new BadRequestException('Error fetching channel stats', 'Invalid channelId');
    }

    const channel = await this.getChannel(channelId);

    try {
      const about = await this.getAboutMetadata(channel);
      const stats = toVTChannelAboutDto(about);

      return { ...stats, description: sanitizeHtmlString(stats.description) };
    } catch (error) {
      this.logger.debug(`No about tab for channel ${channelId}: ${error?.message}`);
      return {};
    }
  }

  async getChannelHome(channelId: string): Promise<VTChannelHomeDto> {
    if (!checkParams(channelId)) {
      throw new BadRequestException('Error fetching channel homepage', 'Invalid channelId');
    }

    const channel = await this.getChannel(channelId);

    try {
      const home = await channel.getHome();

      return toVTChannelHomeDto(home?.current_tab?.content as never);
    } catch (error) {
      // A channel that never set one up has no home tab at all
      this.logger.debug(`No home tab for channel ${channelId}: ${error?.message}`);
      return { shelves: await this.fallbackHomeShelves(channel) };
    }
  }

  async getChannelVideos(
    channelId: string,
    sort: SortType = 'newest',
    filter: ContentFilterType = 'public',
    strategy?: ChannelFeedStrategy
  ): Promise<VTChannelFeedDto> {
    return this.getChannelFeed(channelId, 'videos', sort, filter, strategy);
  }

  async getChannelShorts(
    channelId: string,
    sort: SortType = 'newest',
    strategy?: ChannelFeedStrategy
  ): Promise<VTChannelFeedDto> {
    return this.getChannelFeed(channelId, 'shorts', sort, 'all', strategy);
  }

  async getChannelLivestreams(
    channelId: string,
    sort: SortType = 'newest',
    strategy?: ChannelFeedStrategy
  ): Promise<VTChannelFeedDto> {
    return this.getChannelFeed(channelId, 'live', sort, 'all', strategy);
  }

  /**
   * Youtube sends a channel without a home tab to its videos instead. Standing in a shelf of them
   * keeps the tab worth opening, rather than leaving the about info on its own.
   */
  private async fallbackHomeShelves(
    channel: Awaited<ReturnType<typeof this.getChannel>>
  ): Promise<Array<VTChannelShelfDto>> {
    try {
      const videosTab = await channel.getVideos();
      const videos = this.feedVideosOf(videosTab?.page as unknown as ParsedFeedResponse);

      return videos.length ? [{ title: 'Videos', type: 'videos', videos }] : [];
    } catch (error) {
      // A channel with neither tab, e.g. one that only posts to community
      this.logger.debug(`No videos tab to stand in for the home tab: ${error?.message}`);
      return [];
    }
  }

  private async getChannelFeed(
    identifier: string,
    tab: ChannelFeedTab,
    sort: SortType,
    filter: ContentFilterType,
    strategy?: ChannelFeedStrategy
  ): Promise<VTChannelFeedDto> {
    if (!checkParams(identifier)) {
      throw new BadRequestException(`Error fetching channel ${tab}`, 'Invalid channelId');
    }

    // The params strategy never touches getChannel, so the id is resolved here too
    const channelId = await this.resolveChannelId(identifier);

    const appliedFilter = isFilterableTab(tab) ? filter : 'all';

    if (strategy !== 'discover') {
      const feed = await this.getFeedFromParams(channelId, tab, sort, appliedFilter);

      if (feed) {
        // Youtube answers a well-formed id it does not know with an empty feed rather than an
        // error, which is indistinguishable from a channel that simply has nothing in this tab.
        // Only then is it worth a second request to tell the two apart.
        if (!feed.videos.length && !feed.continuation) {
          await this.getChannel(channelId);
        }

        return feed;
      }

      if (strategy === 'params') {
        throw new NotFoundException(
          `Error fetching channel ${tab}`,
          'Youtube rejected the generated request'
        );
      }

      this.logger.warn(
        `Locally built ${tab} token rejected for ${channelId} (sort=${sort}, filter=${appliedFilter}), falling back to chip discovery`
      );
    }

    return this.getFeedFromDiscovery(channelId, tab, sort, appliedFilter);
  }

  /**
   * The fast path: one request with a token built from the sort and filter directly.
   * Returns null when YouTube did not honor it, so the caller can fall back.
   */
  private async getFeedFromParams(
    channelId: string,
    tab: ChannelFeedTab,
    sort: SortType,
    filter: ContentFilterType
  ): Promise<VTChannelFeedDto | null> {
    const parsed = await this.browse(buildChannelFeedToken({ channelId, tab, sort, filter }));

    // A token youtube does not accept comes back as a re-render of the whole channel page
    if (isRejectedFeedResponse(parsed)) return null;

    const videos = this.feedVideosOf(parsed);

    // A filter can also be dropped silently, which shows up as members-only entries surviving it
    if (filter === 'public' && videos.some(video => video.isMembersOnly)) {
      this.logger.warn(`Public filter was not applied for ${channelId}`);
      return null;
    }

    return {
      videos,
      continuation: extractFeedContinuation(parsed),
      appliedSort: sort,
      appliedFilter: filter,
      availableFilters: extractAvailableFilters(parsed)
    };
  }

  /**
   * The fallback: fetch the tab, then follow the chip tokens YouTube handed out. Costs an extra
   * request per applied chip, but does not depend on the token layout staying put.
   */
  private async getFeedFromDiscovery(
    channelId: string,
    tab: ChannelFeedTab,
    sort: SortType,
    filter: ContentFilterType
  ): Promise<VTChannelFeedDto> {
    const channel = await this.getChannel(channelId);

    let page: ParsedFeedResponse;
    try {
      const tabResult =
        tab === 'shorts'
          ? await channel.getShorts()
          : tab === 'live'
            ? await channel.getLiveStreams()
            : await channel.getVideos();
      page = tabResult?.page as unknown as ParsedFeedResponse;
    } catch (error) {
      // A channel without the tab at all, e.g. no live streams
      this.logger.debug(`No ${tab} tab for channel ${channelId}: ${error?.message}`);
      return { videos: [], appliedSort: sort, appliedFilter: filter, availableFilters: [] };
    }

    const availableFilters = extractAvailableFilters(page);

    let current = page;

    if (filter !== 'all') {
      const filterToken = extractFilterToken(current, filter);
      if (filterToken) current = await this.browse(filterToken);
    }

    if (sort !== 'newest') {
      const sortToken = extractSortToken(current, sort);
      if (sortToken) current = await this.browse(sortToken);
    }

    return {
      videos: this.feedVideosOf(current),
      continuation: extractFeedContinuation(current),
      appliedSort: sort,
      appliedFilter: filter,
      availableFilters
    };
  }

  async getChannelFeedContinuation(continuation: string): Promise<VTChannelFeedDto> {
    if (!checkParams(continuation)) {
      throw new BadRequestException('Error fetching channel feed', 'Invalid continuation string');
    }

    const parsed = await this.browse(continuation);

    return {
      videos: this.feedVideosOf(parsed),
      continuation: extractFeedContinuation(parsed)
    };
  }

  async getChannelPlaylists(channelId: string): Promise<VTChannelPlaylistsDto> {
    if (!checkParams(channelId)) {
      throw new BadRequestException('Error fetching channel playlists', 'Invalid channelId');
    }

    const channel = await this.getChannel(channelId);

    try {
      const playlistsTab = await channel.getPlaylists();
      const page = playlistsTab?.page as unknown as ParsedFeedResponse;

      return {
        playlists: this.playlistsOf(page),
        continuation: extractFeedContinuation(page)
      };
    } catch (error) {
      this.logger.debug(`No playlists tab for channel ${channelId}: ${error?.message}`);
      return { playlists: [] };
    }
  }

  async getChannelPlaylistsContinuation(continuation: string): Promise<VTChannelPlaylistsDto> {
    if (!checkParams(continuation)) {
      throw new BadRequestException(
        'Error fetching channel playlists',
        'Invalid continuation string'
      );
    }

    const parsed = await this.browse(continuation);

    return {
      playlists: this.playlistsOf(parsed),
      continuation: extractFeedContinuation(parsed)
    };
  }

  private playlistsOf(parsed: ParsedFeedResponse) {
    return collectFeedNodes(parsed, YTNodes.LockupView)
      .map(node => toVTPlaylistDtoFromLockupView(node as never))
      .filter(Boolean);
  }

  async searchChannel(channelId: string, query: string): Promise<VTChannelSearchDto> {
    if (!checkParams(channelId, query)) {
      throw new BadRequestException('Error searching channel', 'Invalid channelId or query');
    }

    const channel = await this.getChannel(channelId);
    const results = await channel.search(query);
    const page = results?.page as unknown as ParsedFeedResponse;

    return {
      videos: this.feedVideosOf(page),
      playlists: this.playlistsOf(page),
      continuation: extractFeedContinuation(page)
    };
  }

  async searchChannelContinuation(continuation: string): Promise<VTChannelSearchDto> {
    if (!checkParams(continuation)) {
      throw new BadRequestException('Error searching channel', 'Invalid continuation string');
    }

    const parsed = await this.browse(continuation);

    return {
      videos: this.feedVideosOf(parsed),
      playlists: this.playlistsOf(parsed),
      continuation: extractFeedContinuation(parsed)
    };
  }

  async getChannelCommunityPosts(channelId: string): Promise<VTCommunityPostsDto> {
    if (!checkParams(channelId)) {
      throw new BadRequestException('Error fetching channel community posts', 'Invalid channelId');
    }

    const channel = await this.getChannel(channelId);

    try {
      const community = await channel.getCommunity();
      const page = community?.page as unknown as ParsedFeedResponse;

      return {
        posts: this.postsOf(page),
        continuation: extractFeedContinuation(page)
      };
    } catch (error) {
      this.logger.debug(`No community tab for channel ${channelId}: ${error?.message}`);
      return { posts: [] };
    }
  }

  async getChannelCommunityPostsContinuation(continuation: string): Promise<VTCommunityPostsDto> {
    if (!checkParams(continuation)) {
      throw new BadRequestException(
        'Error fetching channel community posts',
        'Invalid continuation string'
      );
    }

    const parsed = await this.browse(continuation);

    return {
      posts: this.postsOf(parsed),
      continuation: extractFeedContinuation(parsed)
    };
  }

  private postsOf(parsed: ParsedFeedResponse) {
    const posts = toVTCommunityPostDtoList(
      collectFeedNodes(parsed, YTNodes.BackstagePost) as never
    );

    return posts.map(post => ({ ...post, text: sanitizeHtmlString(post.text) }));
  }

  getTinyThumbnail(reply: FastifyReply, id: string): void {
    if (!isChannelId(id)) throw new NotFoundException();

    const imgPathWebp = path.join(global.__basedir, `channels/${id}.webp`);

    const imgPathJpg = path.join(global.__basedir, `channels/${id}.jpg`);

    const imageTransformer = sharp().resize(36, 36);

    try {
      const fileStream = fs.createReadStream(imgPathWebp);
      reply.type('image/webp').send(fileStream.pipe(imageTransformer));
      return;
    } catch {
      // Error is thrown later
    }

    try {
      const fileStream = fs.createReadStream(imgPathJpg);
      reply.type('image/jpeg').send(fileStream.pipe(imageTransformer));
      return;
    } catch {
      // Error is thrown later
    }

    throw new NotFoundException();
  }
}
