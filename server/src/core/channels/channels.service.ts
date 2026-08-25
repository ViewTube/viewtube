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
import { channelNotFound, channelUpstreamFailed, isChannelGone } from './channel-errors';
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

@Injectable()
export class ChannelsService {
  private readonly logger = new Logger(ChannelsService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * YouTube addresses one channel by several names — the `UC…` id, an `@handle`, a legacy custom
   * url or username — but only the id can be put in a browse token, so everything else is resolved
   * to one first. The result is cached, since it only changes when the channel itself does.
   */
  private async resolveChannelId(identifier: string): Promise<string> {
    if (isChannelId(identifier)) return identifier;

    const urls = channelResolveUrls(identifier);
    if (!urls.length) channelNotFound('That is not a channel id, handle or custom url');

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
        // Youtube answers a name it does not know with a plain request failure, indistinguishable
        // from a transport problem, so a single miss is only worth a debug line
        this.logger.debug(`Could not resolve ${url}: ${error?.message}`);
      }
    }

    channelNotFound(`Nothing resolved for ${identifier}`);
  }

  private async getChannel(identifier: string) {
    const channelId = await this.resolveChannelId(identifier);

    const innertube = await innertubeClient();
    try {
      return await innertube.getChannel(channelId);
    } catch (error) {
      if (isChannelGone(error)) channelNotFound(error?.message);

      channelUpstreamFailed('page', error);
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
    const channel = await this.getChannel(channelId);

    // The about data only enriches this page, so a channel that has none — topic channels, whose
    // microformat carries the description instead — and one whose about breaks both still get a
    // usable page rather than a failure
    let about = null;

    if (channel.has_about) {
      try {
        about = await this.getAboutMetadata(channel);
      } catch (error) {
        this.logger.warn(`About tab present but unreadable for ${channelId}: ${error?.message}`);
      }
    } else {
      this.logger.debug(`Channel ${channelId} has no about tab`);
    }

    const channelPage = toVTChannelPageDto(channel as never, about);

    return {
      ...channelPage,
      description: sanitizeHtmlString(channelPage.description)
    };
  }

  async getChannelStats(channelId: string): Promise<VTChannelAboutDto> {
    const channel = await this.getChannel(channelId);

    if (!channel.has_about) {
      this.logger.debug(`Channel ${channelId} has no about tab`);
      return {};
    }

    // Unlike on the channel page, the about data is the whole answer here, so breakage cannot be
    // quietly swallowed into an empty one
    try {
      const about = await this.getAboutMetadata(channel);
      const stats = toVTChannelAboutDto(about);

      return { ...stats, description: sanitizeHtmlString(stats.description) };
    } catch (error) {
      channelUpstreamFailed('stats', error);
    }
  }

  async getChannelHome(channelId: string): Promise<VTChannelHomeDto> {
    const channel = await this.getChannel(channelId);

    if (!channel.has_home) {
      this.logger.debug(`Channel ${channelId} has no home tab`);
      return { shelves: await this.fallbackHomeShelves(channel) };
    }

    try {
      const home = await channel.getHome();

      return toVTChannelHomeDto(home?.current_tab?.content as never);
    } catch (error) {
      channelUpstreamFailed('home', error);
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
    // A channel with neither tab, e.g. one that only posts to community
    if (!channel.has_videos) return [];

    // Standing in for a tab is already the degraded path, so failing here just costs the shelf
    try {
      const videosTab = await channel.getVideos();
      const videos = this.feedVideosOf(videosTab?.page as unknown as ParsedFeedResponse);

      return videos.length ? [{ title: 'Videos', type: 'videos', videos }] : [];
    } catch (error) {
      this.logger.warn(`Videos tab unreadable while standing in for home: ${error?.message}`);
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

      // The channel is fine; it is the token layout this build assumes that YouTube refused
      if (strategy === 'params') {
        channelUpstreamFailed(tab, { message: 'YouTube rejected the locally built token' });
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

    // A token YouTube does not accept comes back as a re-render of the whole channel page
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

    const hasTab =
      tab === 'shorts'
        ? channel.has_shorts
        : tab === 'live'
          ? channel.has_live_streams
          : channel.has_videos;

    // A channel without the tab at all, e.g. no live streams
    if (!hasTab) {
      this.logger.debug(`Channel ${channelId} has no ${tab} tab`);
      return { videos: [], appliedSort: 'newest', appliedFilter: 'all', availableFilters: [] };
    }

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
      channelUpstreamFailed(tab, error);
    }

    const availableFilters = extractAvailableFilters(page);

    let current = page;

    // A chip youtube did not hand out cannot be followed, and reporting the request back as though
    // it had been would put "sorted by popular" over a newest-first list
    let appliedFilter: ContentFilterType = 'all';
    let appliedSort: SortType = 'newest';

    if (filter !== 'all') {
      const filterToken = extractFilterToken(current, filter);

      if (filterToken) {
        current = await this.browse(filterToken);
        appliedFilter = filter;
      } else {
        this.logger.warn(`No ${filter} filter chip on ${tab} for ${channelId}`);
      }
    }

    if (sort !== 'newest') {
      const sortToken = extractSortToken(current, sort);

      if (sortToken) {
        current = await this.browse(sortToken);
        appliedSort = sort;
      } else {
        this.logger.warn(`No ${sort} sort chip on ${tab} for ${channelId}`);
      }
    }

    return {
      videos: this.feedVideosOf(current),
      continuation: extractFeedContinuation(current),
      appliedSort,
      appliedFilter,
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
    const channel = await this.getChannel(channelId);

    if (!channel.has_playlists) {
      this.logger.debug(`Channel ${channelId} has no playlists tab`);
      return { playlists: [] };
    }

    try {
      const playlistsTab = await channel.getPlaylists();
      const page = playlistsTab?.page as unknown as ParsedFeedResponse;

      return {
        playlists: this.playlistsOf(page),
        continuation: extractFeedContinuation(page)
      };
    } catch (error) {
      channelUpstreamFailed('playlists', error);
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
    if (!checkParams(query)) {
      throw new BadRequestException('Error searching channel', 'Invalid query');
    }

    const channel = await this.getChannel(channelId);

    if (!channel.has_search) {
      this.logger.debug(`Channel ${channelId} cannot be searched`);
      return { videos: [], playlists: [] };
    }

    try {
      const results = await channel.search(query);
      const page = results?.page as unknown as ParsedFeedResponse;

      return {
        videos: this.feedVideosOf(page),
        playlists: this.playlistsOf(page),
        continuation: extractFeedContinuation(page)
      };
    } catch (error) {
      channelUpstreamFailed('search', error);
    }
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
    const channel = await this.getChannel(channelId);

    if (!channel.has_community) {
      this.logger.debug(`Channel ${channelId} has no community tab`);
      return { posts: [] };
    }

    try {
      const community = await channel.getCommunity();
      const page = community?.page as unknown as ParsedFeedResponse;

      return {
        posts: this.postsOf(page),
        continuation: extractFeedContinuation(page)
      };
    } catch (error) {
      channelUpstreamFailed('community', error);
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
    // The id is interpolated into a path, so nothing but a channel id may reach it
    if (!isChannelId(id)) channelNotFound();

    const imageTransformer = sharp().resize(36, 36);

    // `createReadStream` reports a missing file through an error event rather than by throwing, so
    // presence has to be checked up front for the 404 below to be reachable at all
    const candidates: Array<[string, string]> = [
      [path.join(global.__basedir, `channels/${id}.webp`), 'image/webp'],
      [path.join(global.__basedir, `channels/${id}.jpg`), 'image/jpeg']
    ];

    for (const [imgPath, mimeType] of candidates) {
      if (!fs.existsSync(imgPath)) continue;

      reply.type(mimeType).send(fs.createReadStream(imgPath).pipe(imageTransformer));
      return;
    }

    throw new NotFoundException({
      message: 'Thumbnail not found',
      description: 'No thumbnail is stored for that channel'
    });
  }
}
