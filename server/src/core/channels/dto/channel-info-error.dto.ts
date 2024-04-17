import type { ChannelInfoError } from '../yt-channel-info/app/types';

export class ChannelInfoErrorDto implements ChannelInfoError {
  alertMessage: string;
}
