/* Copyright (c) 2020, FreeTubeApp

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies. */

import axios, { AxiosInstance } from 'axios';
import { ChannelIdType } from './types';

export class YoutubeGrabberHelper {
  constructor(httpsAgent) {
    this.session = axios.create({
      timeout: 10000,
      headers: {
        'X-YouTube-Client-Name': '1',
        'X-YouTube-Client-Version': '2.20201021.03.00',
        'accept-language': 'en-US,en;q=0.9'
      },
      httpsAgent: httpsAgent
    });
  }

  session: any;

  /**
   * Try to get response from request
   * @param { string } url An url
   * @return { Promise<AxiosResponse | null> } Return AxiosResponse or null if response is end with error
   * */
  async makeChannelRequest(url): Promise<{
    data?: any;
    error?: boolean;
    message?: string;
  }> {
    // Electron doesn't like adding a user-agent in this way.  It might be needed in non-Electron based apps though.
    // 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36',

    try {
      const response = await this.session.get(url);
      return response;
    } catch (e) {
      return {
        error: true,
        message: e
      };
    }
  }

  async makeChannelPost(url, params) {
    // Electron doesn't like adding a user-agent in this way.  It might be needed in non-Electron based apps though.
    // 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36',

    try {
      const response = await this.session({
        url: url,
        method: 'post',
        data: params
      });

      return response;
    } catch (e) {
      return {
        error: true,
        message: e
      };
    }
  }

  async parseChannelVideoResponse(response, channelId, channelIdType) {
    let channelPageDataResponse = response.data.response;
    if (typeof channelPageDataResponse === 'undefined') {
      channelPageDataResponse = response.data[1].response;
    }
    if ('alerts' in channelPageDataResponse) {
      return {
        alertMessage: channelPageDataResponse.alerts[0].alertRenderer.text.simpleText
      };
    }
    let channelMetaData;
    let channelName;
    if ('metadata' in channelPageDataResponse) {
      channelMetaData = channelPageDataResponse.metadata.channelMetadataRenderer;
      channelName = channelMetaData.title;
    }
    const videoTab = YoutubeGrabberHelper.findTab(
      channelPageDataResponse.contents.twoColumnBrowseResultsRenderer.tabs
    );

    let channelVideoData;
    if (videoTab && 'richGridRenderer' in videoTab.tabRenderer.content) {
      channelVideoData = { items: videoTab.tabRenderer.content.richGridRenderer.contents };
    } else if (videoTab && 'sectionListRenderer' in videoTab.tabRenderer.content) {
      const contents =
        videoTab.tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer
          .contents[0];
      if ('reelShelfRenderer' in contents) {
        channelVideoData = contents.reelShelfRenderer;
      }
      if ('gridRenderer' in contents) {
        channelVideoData = contents.gridRenderer;
      }
    }
    if (typeof channelVideoData === 'undefined') {
      // Channel has no videos
      return {
        items: [],
        continuation: null
      };
    }

    let continuation = null;

    const continuationItem = channelVideoData.items.filter(item => {
      return typeof item.continuationItemRenderer !== 'undefined';
    });

    if (continuationItem.length > 0) {
      continuation =
        continuationItem[0].continuationItemRenderer.continuationEndpoint.continuationCommand.token;
    }

    const channelInfo = {
      channelId: channelId,
      channelName: channelName
    };

    const latestVideos = channelVideoData.items
      .filter(item => {
        return typeof item.continuationItemRenderer === 'undefined';
      })
      .map(item => {
        return this.parseVideo(item, channelInfo);
      });

    return {
      items: latestVideos,
      continuation: continuation,
      channelIdType: channelIdType
    };
  }

  parseFeaturedChannel(author) {
    let channelName;
    if (typeof author.title.runs !== 'undefined') {
      channelName = author.title.runs?.[0].text;
    } else {
      channelName = author.title.simpleText;
    }
    const channelId = author.channelId;
    const channelUrl = author.navigationEndpoint.browseEndpoint.canonicalBaseUrl;
    const thumbnail = author.thumbnail.thumbnails;
    let videoCount = 0;
    if ('videoCountText' in author) {
      videoCount = author.videoCountText.runs?.[0].text;
    }
    let subscriberText;
    if (author.subscriberCountText) {
      if (typeof author.subscriberCountText.runs !== 'undefined') {
        subscriberText = author.subscriberCountText.runs?.[0].text;
      } else {
        subscriberText = author.subscriberCountText.simpleText;
      }
    } else {
      subscriberText = '0 subscribers';
    }

    const subscriberSplit = subscriberText.split(' ');
    const subscriberMultiplier = subscriberSplit[0]
      .substring(subscriberSplit[0].length - 1)
      .toLowerCase();
    let subscriberNumber;
    if (typeof parseFloat(subscriberMultiplier) === 'undefined') {
      subscriberNumber = parseFloat(subscriberText.substring(0, subscriberSplit[0].length - 1));
    } else {
      subscriberNumber = parseFloat(subscriberSplit[0]);
    }

    let subscriberCount = subscriberNumber;
    let verified = false;
    let officialArtist = false;
    if ('ownerBadges' in author) {
      verified = author.ownerBadges.some(
        badge => badge.metadataBadgeRenderer.style === 'BADGE_STYLE_TYPE_VERIFIED'
      );
      officialArtist = author.ownerBadges.some(
        badge => badge.metadataBadgeRenderer.style === 'BADGE_STYLE_TYPE_VERIFIED_ARTIST'
      );
    }
    if (subscriberMultiplier === 'k') {
      subscriberCount *= 1000;
    } else if (subscriberMultiplier === 'm') {
      subscriberCount *= 1000000;
    }
    return {
      channelName: channelName,
      channelId: channelId,
      channelUrl: channelUrl,
      thumbnail: thumbnail,
      videoCount: videoCount,
      subscriberText: subscriberText,
      subscriberCount: subscriberCount,
      verified: verified,
      officialArtist: officialArtist
    };
  }

  parseVideo(obj, channelInfo) {
    let video;
    let liveNow = false;
    let premiere = false;
    let premium = false;
    let viewCount;
    let viewCountText;
    let lengthSeconds = 0;
    let durationText;
    let publishedText = '';
    if (typeof obj.richItemRenderer !== 'undefined') {
      if ('videoRenderer' in obj.richItemRenderer.content) {
        video = obj.richItemRenderer.content.videoRenderer;
        video.lengthSeconds = video.lengthText?.simpleText
          .split(':')
          ?.reduce((acc, time) => 60 * acc + +time);
        video.title.simpleText = video.title.runs?.[0].text;
      }
      if ('reelItemRenderer' in obj.richItemRenderer.content) {
        video = obj.richItemRenderer.content.reelItemRenderer;
        video.title = video.headline;
        video.publishedTimeText = { simpleText: '' };
      }
    } else if (typeof obj.videoRenderer !== 'undefined') {
      video = obj.videoRenderer;
      video.title.simpleText = video.title.runs?.[0].text;
    } else if (typeof obj.reelItemRenderer !== 'undefined') {
      video = obj.reelItemRenderer;
      video.title = video.headline;
      video.publishedTimeText = { simpleText: '' };
    } else if (typeof obj.gridVideoRenderer !== 'undefined') {
      video = obj.gridVideoRenderer;
    } else {
      video = obj.channelVideoPlayerRenderer;
    }

    let title = video.title.simpleText;
    let statusRenderer;
    if (video.thumbnailOverlays) {
      statusRenderer = video.thumbnailOverlays[0].thumbnailOverlayTimeStatusRenderer;
    }

    if (typeof title === 'undefined') {
      title = video.title.runs?.[0].text;
    }
    if (
      typeof video.shortViewCountText !== 'undefined' &&
      typeof video.shortViewCountText.simpleText === 'undefined'
    ) {
      liveNow = true;
      publishedText = 'Live';
      viewCount = parseInt(video.viewCountText.runs?.[0].text.split(',').join(''));
      viewCountText =
        video.shortViewCountText.runs?.[0].text + video.shortViewCountText.runs?.[1].text;
    } else if (
      typeof statusRenderer !== 'undefined' &&
      typeof statusRenderer.text !== 'undefined' &&
      typeof statusRenderer.text.runs !== 'undefined'
    ) {
      if (statusRenderer.text.runs?.map(run => run.text).includes('LIVE')) {
        liveNow = true;
        publishedText = 'Live';
        viewCount = 0;
        viewCountText = '0 views';
      } else {
        premiere = true;
        durationText = 'PREMIERE';
        viewCount = 0;
        viewCountText = '0 views';
        const premiereDate = new Date(parseInt(video.upcomingEventData.startTime) * 1000);
        publishedText = premiereDate.toLocaleString();
      }
    } else if (typeof video.viewCountText === 'undefined') {
      premium = true;
      if (typeof video.publishedTimeText === 'undefined') {
        const regex = new RegExp('^.*' + channelInfo.channelName + ' (.*?) ago.*', 'g');
        publishedText = video.title.accessibility.accessibilityData.label.replace(regex, '$1');
      } else {
        publishedText = video.publishedTimeText.simpleText;
      }
      durationText = 'PREMIERE';
      viewCount = 0;
      viewCountText = '0 views';
    } else {
      viewCount = parseInt(video.viewCountText.simpleText.split(' ')[0].split(',').join(''));
      viewCountText = video.viewCountText.simpleText;

      publishedText = video.publishedTimeText.simpleText;

      if (video.thumbnailOverlays && typeof statusRenderer !== 'undefined') {
        durationText = statusRenderer.text.simpleText;
        const durationSplit = durationText.split(':');

        if (durationSplit.length === 3) {
          const hours = parseInt(durationSplit[0]);
          const minutes = parseInt(durationSplit[1]);
          const seconds = parseInt(durationSplit[2]);

          lengthSeconds = hours * 3600 + minutes * 60 + seconds;
        } else if (durationSplit.length === 2) {
          const minutes = parseInt(durationSplit[0]);
          const seconds = parseInt(durationSplit[1]);

          lengthSeconds = minutes * 60 + seconds;
        } else if (durationSplit[0] === 'SHORTS') {
          // durationText will still be 'SHORTS' for shorts
          // format: {Video Title} {x} weeks ago {y} seconds {z} views - play Short
          // (text is different depending on location, ex: german ip = german text)
          const accessibilityData = video.title.accessibility.accessibilityData.label;
          const numbersAndSpacesRegex = /[^0-9\s]/g;
          const numbersOnly = accessibilityData
            .replace(numbersAndSpacesRegex, '')
            .trim()
            .split(' ')
            .filter(number => {
              return number !== '';
            });
          // only care about seconds/minute, skip over view count
          lengthSeconds = parseInt(numbersOnly[numbersOnly.length - 2]);
          if (lengthSeconds === 1) {
            // assume it's a minute and not a second
            lengthSeconds *= 60;
            durationText = '1:00';
          } else {
            durationText = '0:' + lengthSeconds.toString().padStart(2, '0');
          }
        }
      } else {
        lengthSeconds = 0;
      }
    }
    let thumbnails = [];
    if (!('channelVideoPlayerRenderer' in obj)) {
      thumbnails = video.thumbnail.thumbnails;
    } else {
      publishedText = video.publishedTimeText.runs?.[0].text;
    }

    return {
      type: 'video',
      title: title,
      videoId: video.videoId,
      author: channelInfo.channelName,
      authorId: channelInfo.channelId,
      videoThumbnails: thumbnails,
      viewCountText: viewCountText,
      viewCount: viewCount,
      publishedText: publishedText,
      durationText: durationText,
      lengthSeconds: lengthSeconds,
      liveNow: liveNow,
      premiere: premiere,
      premium: premium
    };
  }

  parseCommunityPage(communityInfo, channelIdType) {
    // A broader match approach to the whole JSON is required, because trackingParams can now occur in polls
    // Get the JSON data as string
    let contentDataString = communityInfo.data.match(/ytInitialData.+?(?=;<\/script>)/)[0];
    let innertubeAPIkey = communityInfo.data.match(/innertubeApiKey.+?(?=innertubeApiVersion)/)[0];
    innertubeAPIkey = innertubeAPIkey.substring(18, innertubeAPIkey.length - 3);

    contentDataString = contentDataString.substring(16, contentDataString.length);

    // Parse the JSON data and get the relevent array with data
    let contentDataJSON = JSON.parse(contentDataString);
    if (typeof contentDataJSON.alerts !== 'undefined') {
      return {
        alertMessage: contentDataJSON.alerts[0].alertRenderer.text.simpleText
      };
    }
    const communityTab = YoutubeGrabberHelper.findTab(
      contentDataJSON.contents.twoColumnBrowseResultsRenderer.tabs
    );

    if (communityTab) {
      contentDataJSON =
        communityTab.tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer;
      if (
        'continuationItemRenderer' in contentDataJSON.contents[contentDataJSON.contents.length - 1]
      ) {
        return {
          items: this.createCommunityPostArray(contentDataJSON.contents),
          continuation:
            contentDataJSON.contents[contentDataJSON.contents.length - 1].continuationItemRenderer
              .continuationEndpoint.continuationCommand.token,
          innerTubeApi: innertubeAPIkey,
          channelIdType: channelIdType
        };
      }
    } else {
      contentDataJSON = { contents: [] };
    }
    return {
      items: this.createCommunityPostArray(contentDataJSON.contents),
      continuation: null,
      innerTubeApi: null,
      channelIdType: channelIdType
    };
  }

  createCommunityPostArray(postArray) {
    const postsArray = [];
    postArray.forEach(post => {
      if ('continuationItemRenderer' in post) {
        // we do not want to access the continuation data like a normal post, but instead later
        return;
      }
      if ('sharedPostRenderer' in post.backstagePostThreadRenderer.post) {
        // this are special and rare posts, we only care about the text no content
        const postData = this.parseSharedPost(post);
        postsArray.push(postData);
        return;
      }
      // Default structure of a post
      // comment count not available on shared posts
      const postData = {
        postText: '',
        postId: post.backstagePostThreadRenderer.post.backstagePostRenderer.postId,
        author:
          post.backstagePostThreadRenderer.post.backstagePostRenderer.authorText.runs?.[0].text,
        authorId: this.extractChannelId(
          post.backstagePostThreadRenderer.post.backstagePostRenderer.authorEndpoint
        ),
        authorThumbnails:
          post.backstagePostThreadRenderer.post.backstagePostRenderer.authorThumbnail.thumbnails,
        publishedText:
          post.backstagePostThreadRenderer.post.backstagePostRenderer.publishedTimeText.runs?.[0]
            .text,
        voteCount: post.backstagePostThreadRenderer.post.backstagePostRenderer.voteCount.simpleText,
        postContent: null,
        commentCount:
          'text' in
          post.backstagePostThreadRenderer.post.backstagePostRenderer.actionButtons
            .commentActionButtonsRenderer.replyButton.buttonRenderer
            ? post.backstagePostThreadRenderer.post.backstagePostRenderer.actionButtons
                .commentActionButtonsRenderer.replyButton.buttonRenderer.text.simpleText
            : '0'
      };

      if ('runs' in post.backstagePostThreadRenderer.post.backstagePostRenderer.contentText) {
        // eslint-disable-next-line no-return-assign
        post.backstagePostThreadRenderer.post.backstagePostRenderer.contentText.runs?.forEach(
          (element, index) => {
            if ('navigationEndpoint' in element) {
              postData.postText += this.extractLinks(element) + ' ';
            } else {
              postData.postText += element.text + ' ';
            }
          }
        );
      }

      // if this exists, then the post contains more data than only text - Assumption: sharedPostRenderer only has text. Only occurred once so far
      if ('backstageAttachment' in post.backstagePostThreadRenderer.post.backstagePostRenderer) {
        if (
          'backstageImageRenderer' in
          post.backstagePostThreadRenderer.post.backstagePostRenderer.backstageAttachment
        ) {
          // post with an image
          postData.postContent = {
            type: 'image',
            content:
              post.backstagePostThreadRenderer.post.backstagePostRenderer.backstageAttachment
                .backstageImageRenderer.image.thumbnails
          };
        } else if (
          'pollRenderer' in
          post.backstagePostThreadRenderer.post.backstagePostRenderer.backstageAttachment
        ) {
          // post with a poll
          const pollObject =
            post.backstagePostThreadRenderer.post.backstagePostRenderer.backstageAttachment
              .pollRenderer;
          postData.postContent = {
            type: 'poll',
            content: {
              choices: pollObject.choices.map(entry => entry.text.runs?.[0].text),
              totalVotes: pollObject.totalVotes.simpleText
            }
          };
        } else if (
          'videoRenderer' in
          post.backstagePostThreadRenderer.post.backstagePostRenderer.backstageAttachment
        ) {
          // post with a video
          const videoRenderer =
            post.backstagePostThreadRenderer.post.backstagePostRenderer.backstageAttachment
              .videoRenderer;

          postData.postContent = {
            type: 'video',
            content: {
              videoId: videoRenderer.videoId,
              title: videoRenderer.title.runs?.[0].text,
              description: '',
              publishedText: videoRenderer.publishedTimeText.simpleText,
              lengthText: videoRenderer.lengthText.simpleText,
              viewCountText: videoRenderer.viewCountText.simpleText,
              badges: { verified: false, officialArtist: false },
              author: videoRenderer.ownerText.runs?.[0].text,
              authorId: this.extractChannelId(videoRenderer.ownerText.runs?.[0].navigationEndpoint),
              thumbnails: videoRenderer.thumbnail.thumbnails
            }
          };
          if ('descriptionSnippet' in videoRenderer) {
            postData.postContent.content.description =
              videoRenderer.descriptionSnippet.runs?.[0].text;
          }
          if ('ownerBadges' in videoRenderer) {
            videoRenderer.ownerBadges.forEach(badge => {
              postData.postContent.content.badges.officialArtist =
                badge.metadataBadgeRenderer.tooltip === 'Official Artist Channel' ||
                postData.postContent.content.badges.officialArtist;
              postData.postContent.content.badges.verified =
                badge.metadataBadgeRenderer.tooltip === 'Verified' ||
                postData.postContent.content.badges.verified;
            });
          }
        } else if (
          'playlistRenderer' in
          post.backstagePostThreadRenderer.post.backstagePostRenderer.backstageAttachment
        ) {
          // post with a playlist
          const playlistRenderer =
            post.backstagePostThreadRenderer.post.backstagePostRenderer.backstageAttachment
              .playlistRenderer;
          postData.postContent = {
            type: 'playlist',
            content: {
              playlistId: playlistRenderer.playlistId,
              title: playlistRenderer.title.simpleText,
              playlistVideoRenderer: [],
              videoCountText: playlistRenderer.videoCountText.runs?.[0],
              ownerBadges: playlistRenderer.ownerBadges,
              author: playlistRenderer.longBylineText.runs?.[0].text,
              authorId: this.extractChannelId(
                playlistRenderer.longBylineText.runs?.[0].navigationEndpoint
              ), // this might fail, no channel with a playlist posted was found
              thumbnails: playlistRenderer.thumbnails
            }
          };
          // there are small preview lines of the first view videos in the playlist
          playlistRenderer.videos.forEach(video => {
            postData.postContent.content.playlistVideoRenderer.push({
              title: video.childVideoRenderer.title.simpleText,
              videoId: video.childVideoRenderer.videoId,
              lengthText: video.childVideoRenderer.lengthText.simpleText
            });
          });
        } else if (
          'postMultiImageRenderer' in
          post.backstagePostThreadRenderer.post.backstagePostRenderer.backstageAttachment
        ) {
          postData.postContent = {
            type: 'multiImage',
            content:
              post.backstagePostThreadRenderer.post.backstagePostRenderer.backstageAttachment.postMultiImageRenderer.images.map(
                im => {
                  return im.backstageImageRenderer.image.thumbnails;
                }
              )
          };
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.error(
              'New type of post detected. Please report this to the repository with the log and channel that was scraped'
            );
            console.log(
              post.backstagePostThreadRenderer.post.backstagePostRenderer.backstageAttachment.keys()
            );
          }
        }
      }
      postsArray.push(postData);
    });
    return postsArray;
  }

  extractChannelId(browseEndPoint) {
    const channelLinkSplit = browseEndPoint.commandMetadata.webCommandMetadata.url.split('/');
    return channelLinkSplit[channelLinkSplit.length - 1];
  }

  extractLinks(text) {
    if ('urlEndpoint' in text.navigationEndpoint) {
      const linkText = text.navigationEndpoint.urlEndpoint.url;
      const matches = linkText.match(/&q=(.)+/);
      if (matches !== null) {
        return decodeURIComponent(matches[0].substring(3));
      }
      return linkText;
    } else {
      return text.text;
    }
  }

  parseSharedPost(post) {
    const postData = {
      postText: '',
      postId: post.backstagePostThreadRenderer.post.sharedPostRenderer.postId,
      author: post.backstagePostThreadRenderer.post.sharedPostRenderer.displayName.runs?.[0].text,
      authorThumbnails:
        post.backstagePostThreadRenderer.post.sharedPostRenderer.thumbnail.thumbnails,
      publishedText:
        post.backstagePostThreadRenderer.post.sharedPostRenderer.publishedTimeText.runs?.[0].text,
      voteCount:
        post.backstagePostThreadRenderer.post.sharedPostRenderer.originalPost.backstagePostRenderer
          .voteCount.simpleText,
      postContent: null,
      commentCount:
        'text' in
        post.backstagePostThreadRenderer.post.sharedPostRenderer.originalPost.backstagePostRenderer
          .actionButtons.commentActionButtonsRenderer.replyButton.buttonRenderer
          ? post.backstagePostThreadRenderer.post.sharedPostRenderer.originalPost
              .backstagePostRenderer.actionButtons.commentActionButtonsRenderer.replyButton
              .buttonRenderer.text.simpleText
          : '0'
    };
    post.backstagePostThreadRenderer.post.sharedPostRenderer.content.runs?.forEach(
      (element, index) => {
        postData.postText += index !== 0 ? ' ' + element.text : element.text;
      }
    );
    return postData;
  }

  parseMix(obj, channelInfo) {
    const mix = obj.compactStationRenderer;
    const playlistId = mix.navigationEndpoint.watchEndpoint.playlistId;
    const title = mix.title.simpleText;
    const description = mix.description.simpleText;
    const videoCount = parseInt(mix.videoCountText.runs?.[0].text);
    const url = mix.navigationEndpoint.commandMetadata.url;
    const thumbnails = mix.thumbnail.thumbnails;
    return {
      playlistId: playlistId,
      title: title,
      description: description,
      videoCount: videoCount,
      url: url,
      thumbnails: thumbnails
    };
  }

  parsePlaylist(obj, channelInfo) {
    if (typeof obj.gridShowRenderer !== 'undefined') {
      return;
    }

    let playlist;
    let thumbnails;
    let title;
    let videoCount;

    if (
      typeof obj.gridPlaylistRenderer === 'undefined' &&
      typeof obj.playlistRenderer !== 'undefined'
    ) {
      playlist = obj.playlistRenderer;

      if (typeof playlist === 'undefined') {
        return null;
      }

      thumbnails = playlist.thumbnails[0].thumbnails;
      title = playlist.title.simpleText;
      videoCount = parseInt(playlist.videoCount);
    } else {
      playlist = obj.gridPlaylistRenderer;

      if (typeof playlist === 'undefined') {
        return null;
      }

      thumbnails = playlist.thumbnail.thumbnails;
      if ('simpleText' in playlist.title) {
        title = playlist.title.simpleText;
      } else {
        title = playlist.title.runs?.[0].text;
      }
      videoCount = parseInt(playlist.videoCountShortText.simpleText);
    }

    return {
      title: title,
      type: 'playlist',
      playlistThumbnail: thumbnails[thumbnails.length - 1].url,
      author: channelInfo.channelName,
      authorUrl: channelInfo.channelUrl,
      authorId: channelInfo.channelId,
      playlistId: playlist.playlistId,
      playlistUrl: `https://www.youtube.com/playlist?list=${playlist.playlistId}`,
      videoCount: videoCount
    };
  }

  parseHomeItem(item, channelInfo) {
    let shelfName = '';
    let shelfUrl = null;
    let items = [];
    let type = 'video';
    if ('richSectionRenderer' in item) {
      const shelf = item.richSectionRenderer.content.richShelfRenderer;
      shelfName = shelf.title.simpleText;
      type = 'verticalVideoList';
      items = shelf.contents.map(shelfContent => {
        return this.parseVideo(shelfContent.richItemRenderer.content, channelInfo);
      });
    } else if ('richItemRenderer' in item) {
      items = [this.parseVideo(item.richItemRenderer.content, channelInfo)];
    } else if ('itemSectionRenderer' in item) {
      if ('channelFeaturedContentRenderer' in item.itemSectionRenderer.contents[0]) {
        type = 'livestreams';
        shelfName = item.itemSectionRenderer.contents[0].channelFeaturedContentRenderer.title?.runs
          .map(run => run.text)
          .join(' ');
        if (!shelfName) shelfName = 'Livestreams';
        items = item.itemSectionRenderer.contents[0].channelFeaturedContentRenderer?.items?.map(
          item => this.parseVideo(item, channelInfo)
        );
      } else {
        const shelf = item.itemSectionRenderer.contents[0].shelfRenderer;

        if ('runs' in shelf.title) {
          const title = shelf.title.runs?.[0];
          if ('navigationEndpoint' in title) {
            shelfUrl = title.navigationEndpoint.commandMetadata.webCommandMetadata.url;
          }
          shelfName = title.text;
        } else {
          shelfName = shelf.title.simpleText;
          shelfUrl = shelf.endpoint.commandMetadata.webCommandMetadata.url;
        }
        if (shelfUrl === null) {
          let shelfRenderer;
          if ('expandedShelfContentsRenderer' in shelf.content) {
            type = 'verticalVideoList';
            shelfRenderer = shelf.content.expandedShelfContentsRenderer;
            items = shelfRenderer.items?.map(video => {
              return this.parseVideo(video, channelInfo);
            });
          } else {
            type = 'playlist';
            shelfRenderer = shelf.content.horizontalListRenderer;
            items = shelfRenderer.items?.map(pl => {
              return this.parsePlaylist(pl, channelInfo);
            });
          }
        } else if (/\?list=/.test(shelfUrl)) {
          type = 'playlist'; // similar to videos but links to a playlist url
          if ('horizontalListRenderer' in shelf.content) {
            items = shelf.content.horizontalListRenderer.items?.map(video => {
              return this.parseVideo(video, channelInfo);
            });
          } else {
            items = shelf.content.expandedShelfContentsRenderer.items?.map(video => {
              return this.parseVideo(video, channelInfo);
            });
          }
        } else if (/\/channels/.test(shelfUrl)) {
          type = 'channels';
          if ('expandedShelfContentsRenderer' in shelf.content) {
            items = shelf.content.expandedShelfContentsRenderer.items?.map(channel => {
              return this.parseFeaturedChannel(channel.channelRenderer);
            });
          } else {
            items = shelf.content.horizontalListRenderer.items?.map(channel => {
              return this.parseFeaturedChannel(channel.gridChannelRenderer);
            });
          }
        } else if (/\/videos/.test(shelfUrl)) {
          type = 'videos';
          items = shelf.content.horizontalListRenderer.items?.map(video => {
            return this.parseVideo(video, channelInfo);
          });
        } else if (/\/playlists/.test(shelfUrl)) {
          if (
            shelf.content.horizontalListRenderer !== undefined &&
            shelf.content.horizontalListRenderer.items?.[0].compactStationRenderer != null
          ) {
            type = 'mix';
            items = shelf.content.horizontalListRenderer.items?.map(mix => {
              return this.parseMix(mix, channelInfo);
            });
          } else if (
            shelf.content.expandedShelfContentsRenderer !== undefined &&
            shelf.content.expandedShelfContentsRenderer.items?.[0].playlistRenderer != null
          ) {
            type = 'playlists';
            items = shelf.content.expandedShelfContentsRenderer.items?.map(playlist => {
              return this.parsePlaylist(playlist, channelInfo);
            });
          } else {
            type = 'playlists';
            items = shelf.content.horizontalListRenderer.items?.map(playlist => {
              return this.parsePlaylist(playlist, channelInfo);
            });
          }
        }
      }
    }
    return {
      shelfName: shelfName,
      type: type,
      shelfUrl: shelfUrl,
      items: items
    };
  }

  async decideUrlRequestType(channelId, urlAppendix, channelIdType) {
    switch (channelIdType) {
      case 0:
        return this.performChannelPageRequestWithFallbacks(channelId, urlAppendix);
      case 1:
        return this.performChannelUrlRequest(channelId, urlAppendix);
      case 2:
        return this.performUserUrlRequest(channelId, urlAppendix);
      case 3:
        return this.performCUrlRequest(channelId, urlAppendix);
      case 4:
        return this.performChannelTagRequest(channelId, urlAppendix);
      case 5:
        return this.performChannelRequest(channelId, urlAppendix);
      default:
        return this.performChannelPageRequestWithFallbacks(channelId, urlAppendix);
    }
  }

  async performChannelRequest(ajaxUrl, urlAppendix, cType?: ChannelIdType) {
    if (urlAppendix !== null) {
      ajaxUrl += ajaxUrl.endsWith('/') ? urlAppendix : '/' + urlAppendix;
    }
    const channelPageResponse = await this.makeChannelRequest(ajaxUrl);

    if ((channelPageResponse as any).error) {
      return Promise.reject((channelPageResponse as any).message);
    }
    return { response: channelPageResponse, channelIdType: cType };
  }

  async performChannelPageRequestWithFallbacks(channelId, urlAppendix) {
    return await this.performChannelUrlRequest(channelId, urlAppendix).catch(async _ => {
      return await this.performChannelTagRequest(channelId, urlAppendix).catch(async _ => {
        return await this.performUserUrlRequest(channelId, urlAppendix).catch(async _ => {
          return await this.performCUrlRequest(channelId, urlAppendix).catch(async _ => {
            return await this.performChannelRequest(channelId, urlAppendix).catch(async e => {
              return Promise.reject(e);
            });
          });
        });
      });
    });
  }

  async performChannelUrlRequest(channelId, urlAppendix) {
    const ajaxUrl = `https://www.youtube.com/channel/${channelId}/`;
    return await this.performChannelRequest(ajaxUrl, urlAppendix, ChannelIdType.ChannelId);
  }

  async performUserUrlRequest(channelId, urlAppendix) {
    const ajaxUrl = `https://www.youtube.com/user/${channelId}/`;
    return await this.performChannelRequest(ajaxUrl, urlAppendix, ChannelIdType.LegacyName);
  }

  async performCUrlRequest(channelId, urlAppendix) {
    const ajaxUrl = `https://www.youtube.com/c/${channelId}/`;
    return await this.performChannelRequest(ajaxUrl, urlAppendix, ChannelIdType.CustomURL);
  }

  async performChannelTagRequest(channelTag, urlAppendix) {
    const ajaxUrl = `https://www.youtube.com/@${channelTag}/`;
    return await this.performChannelRequest(ajaxUrl, urlAppendix, ChannelIdType.ChannelTag);
  }

  static findTab(tabs) {
    return tabs.find(tab => tab?.tabRenderer?.selected === true);
  }

  static create(httpsAgent) {
    return new YoutubeGrabberHelper(httpsAgent);
  }
}
