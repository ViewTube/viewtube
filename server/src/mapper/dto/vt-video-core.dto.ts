export class VTVideoCoreDto {
  id: string;
  title: string;
  duration?: {
    text: string;
    seconds: number;
  };
}
