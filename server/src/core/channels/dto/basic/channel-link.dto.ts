import { ChannelLinkType } from '../../types/ytch.types';

export class ChannelLinkDto implements ChannelLinkType {
  url: string;
  icon: string;
  title: string;
}
