import { VTCommunityPostDto } from './vt-community-post.dto';

export class VTCommunityPostsDto {
  posts: Array<VTCommunityPostDto>;
  continuation?: string;
}
