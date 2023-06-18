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
      const { apiUrl } = useApiUrl();

      const { token, captchaImage } = await vtFetch<CaptchaResponse>(`${apiUrl.value}auth/captcha`);

      this.token = token;
      this.image = captchaImage;
    }
  }
});
