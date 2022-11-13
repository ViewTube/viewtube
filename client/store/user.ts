import { defineStore } from 'pinia';
import { useCaptchaStore } from '@/store/captcha';

type User = {
  username: string;
  profileImage: string;
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
      const config = useRuntimeConfig();
      try {
        const user = await $fetch<User>(`${config.public.apiUrl}user/profile`, {
          headers: {
            Authorization: authenticationToken ? `Bearer ${authenticationToken}` : undefined
          },
          credentials: 'include'
        });
        this.username = user.username;
        this.profileImage = user.profileImage;
      } catch {}
    },

    async login(username: string, password: string) {
      const config = useRuntimeConfig();
      try {
        await $fetch(`${config.public.apiUrl}auth/login`, {
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
      } catch (error) {
        if (error?.response?.data?.message) {
          return {
            error: error.response.data.message
          };
        }
        return {
          error: 'Sign in failed, please try reloading the page.'
        };
      }
    },

    async register(username: string, password: string, captchaSolution: string) {
      const config = useRuntimeConfig();
      const captchaStore = useCaptchaStore();
      let registerResult = null;
      try {
        registerResult = await $fetch(`${config.public.apiUrl}auth/register`, {
          method: 'POST',
          credentials: 'include',
          body: {
            username,
            password,
            captchaToken: captchaStore.token,
            captchaSolution
          }
        });
        this.getUser();
      } catch (error) {
        if (error?.response?.data?.message) {
          return {
            error: error.response.data.message
          };
        }
        return {
          error: 'Registration failed, please try again.'
        };
      }
      if (registerResult?.data) {
        try {
          await this.login(registerResult.data.username, password);
        } catch {
          return {
            error: 'Registration succeeded, but login failed, please try again.'
          };
        }
        await this.getUser();

        return { username: registerResult.data.username };
      }
      return {
        error: 'Registration failed'
      };
    },

    async logout() {
      const config = useRuntimeConfig();
      try {
        await $fetch(`${config.public.apiUrl}auth/logout`, {
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
