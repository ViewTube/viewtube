import { defineStore } from 'pinia';
import { useCaptchaStore } from '@/store/captcha';
import { useSettingsStore } from './settings';

type User = {
  username: string;
  profileImage: string;
  settings: Record<string, unknown>;
};

export const useUserStore = defineStore('user', {
  state: () => ({
    username: null,
    profileImage: null
  }),
  getters: {
    isLoggedIn: state => !!state.username
  },
  actions: {
    async getUser(authenticationToken?: string) {
      const { apiUrl } = useApiUrl();
      const settingsStore = useSettingsStore();
      try {
        const user = await $fetch<User>(`${apiUrl}user/profile`, {
          headers: {
            Authorization: authenticationToken ? `Bearer ${authenticationToken}` : undefined
          },
          credentials: 'include'
        });
        this.username = user.username;
        this.profileImage = user.profileImage;

        settingsStore.updateSettings(user.settings);
      } catch {}
    },

    async login(username: string, password: string) {
      const { apiUrl } = useApiUrl();
      try {
        await $fetch(`${apiUrl}auth/login`, {
          method: 'POST',
          credentials: 'include',
          body: {
            username,
            password
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
        registerResult = await $fetch(`${apiUrl}auth/register`, {
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
        await $fetch(`${apiUrl}auth/logout`, {
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
      return {
        success: true
      };
    }
  }
});
