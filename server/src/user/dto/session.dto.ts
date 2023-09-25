export class SessionDto {
  id: string;
  deviceName: string;
  deviceType: string;
  updatedAt: Date;
  expires: Date;
  current: boolean;
}
