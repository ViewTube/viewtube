import { defineStore } from 'pinia';

interface CaptchaResponse {
  token: string;
  captchaImage: string;
}

export const useCaptchaStore = defineStore('captcha', {
  state: () => ({
    token: '',
    solution: '',
    image: ''
  }),

  actions: {
    setToken(token: string) {
      this.token = token;
    },
    setImage(image: string) {
      this.image = image;
    },
    async getCaptcha() {
      const config = useRuntimeConfig();

      const { token, captchaImage } = await $fetch<CaptchaResponse>(
        `${config.public.apiUrl}auth/captcha`
      );

      this.token = token;
      this.image = captchaImage;
    }
  }
});
