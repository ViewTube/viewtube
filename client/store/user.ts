import { defineStore } from 'pinia';
import { useCaptchaStore } from '@/store/captcha';
import { useSettingsStore } from './settings';
import { UAParser } from 'ua-parser-js';

type User = {
  username: string;
  profileImage: string;
  settings: Record<string, unknown>;
  admin: boolean;
};

export const useUserStore = defineStore('user', {
  state: () => ({
    username: null,
    profileImage: null,
    admin: false,
    triedLogin: false
  }),
  getters: {
    isLoggedIn: state => !!state.username
  },
  actions: {
    async getUser() {
      const { apiUrl } = useApiUrl();
      const settingsStore = useSettingsStore();
      const { vtFetch } = useVtFetch();

      try {
        const user = await vtFetch<User>(`${apiUrl.value}user/profile`);
        if (user?.username) {
          this.username = user.username;
          this.profileImage = user.profileImage;
          this.admin = user.admin;

          settingsStore.updateSettings(user.settings);
        }
      } catch {
        // Ignore silently
      }
      this.triedLogin = true;
    },

    async login(username: string, password: string) {
      const { vtFetch } = useVtFetch();
      const { apiUrl } = useApiUrl();

      const userAgent = UAParser();

      const deviceName = `${userAgent.browser.name} ${userAgent.browser.version} on ${userAgent.os.name} ${userAgent.os.version}`;

      let deviceType = 'desktop';

      if (userAgent.device.type === 'mobile') {
        deviceType = 'mobile';
      } else {
        const mobile =
          window.matchMedia('(pointer: coarse)').matches &&
          navigator.maxTouchPoints > 1 &&
          window.matchMedia(`(max-width: 639px)`).matches &&
          'ontouchstart' in document.documentElement;

        if (mobile) {
          deviceType = 'mobile';
        }
      }

      try {
        await vtFetch(`${apiUrl.value}auth/login`, {
          method: 'POST',
          body: {
            username,
            password,
            deviceName,
            deviceType
          }
        });
        await this.getUser();
        return {
          success: true
        };
      } catch (error: any) {
        if (error?.data?.message) {
          return {
            error: error.data.message
          };
        }
        return {
          error: 'Sign in failed, please try reloading the page.'
        };
      }
    },

    async register(username: string, password: string, captchaSolution: string) {
      const { apiUrl } = useApiUrl();
      const captchaStore = useCaptchaStore();
      const { vtFetch } = useVtFetch();
      let registerResult = null;
      try {
        registerResult = await vtFetch(`${apiUrl.value}auth/register`, {
          method: 'POST',
          credentials: 'include',
          body: {
            username,
            password,
            captchaToken: captchaStore.token,
            captchaSolution
          }
        });
      } catch (error: any) {
        if (error?.data?.message) {
          return {
            error: error.data.message
          };
        }
        return {
          error: 'Registration failed, please try again.'
        };
      }
      if (registerResult) {
        try {
          await this.login(registerResult.username, password);
        } catch {
          return {
            error: 'Registration succeeded, but login failed, please try again.'
          };
        }
        await this.getUser();

        return { username: registerResult.username };
      }
      return {
        error: 'Registration failed'
      };
    },

    async logout() {
      const { apiUrl } = useApiUrl();
      const { vtFetch } = useVtFetch();
      try {
        await vtFetch(`${apiUrl.value}auth/logout`, {
          method: 'POST',
          credentials: 'include'
        });
      } catch {
        return {
          error: 'Logout failed. Try deleting cookes and cache.'
        };
      }
      this.username = null;
      this.profileImage = null;
      this.admin = false;
      return {
        success: true
      };
    }
  }
});
