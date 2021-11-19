import { getApiUrl } from '@/plugins/shared';
export class EnvironmentService {
  static getEnvironmentVariables() {
    if (!this.cached) {
      this.apiUrl = getApiUrl();
      this.vapidKey = process.env.VIEWTUBE_PUBLIC_VAPID;
      this.nodeEnv = process.env.NODE_ENV;
      this.cached = true;
    }
    return {
      apiUrl: this.apiUrl,
      vapidKey: this.vapidKey,
      nodeEnv: this.nodeEnv
    };
  }

  private static cached = false;

  private static apiUrl: string;
  private static vapidKey: string;
  private static nodeEnv: string;
}
