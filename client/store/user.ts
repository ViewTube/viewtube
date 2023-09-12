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
      const testy = useCookie('RefreshToken');
      console.log('user', testy.value);

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

      console.log('userAgent', userAgent);

      const deviceName = `${userAgent.browser.name} ${userAgent.browser.version} on ${userAgent.os.name} ${userAgent.os.version}`;

      try {
        await vtFetch(`${apiUrl.value}auth/login`, {
          method: 'POST',
          credentials: 'include',
          body: {
            username,
            password,
            deviceName
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
      let registerResult = null;
      try {
        registerResult = await vtClientFetch(`${apiUrl.value}auth/register`, {
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
      try {
        await vtClientFetch(`${apiUrl.value}auth/logout`, {
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
