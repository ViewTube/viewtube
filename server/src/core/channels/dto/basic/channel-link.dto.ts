import type { ChannelLink } from '../../yt-channel-info/app/types';

export class ChannelLinkDto implements ChannelLink {
  url: string;
  icon: string;
  title: string;
}
