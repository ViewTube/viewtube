export class SessionDto {
  id: string;
  deviceName: string;
  deviceType: string;
  lastUsed: Date;
  expires: Date;
  current: boolean;
}
