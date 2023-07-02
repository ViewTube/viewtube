export class VTPlaylistCardContentDto {
  type: 'playlist';
  id: string;
  firstVideoId: string;
  videoCount: number;
  title: string;
  author: {
    name: string;
  };
}
