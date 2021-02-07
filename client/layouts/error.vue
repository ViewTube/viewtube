<template>
  <div class="error-page">
    <div class="error-popup">
      <div class="error-message">
        <div class="error-logo">
          <img src="@/assets/icon-error.svg" alt="Viewtube broken logo" />
        </div>
        <h2>{{ error.message }}</h2>
        <p>Api-url: {{ apiUrl }}</p>
        <details v-if="error.detail" class="error-details">
          <summary>Full error</summary>
          <pre class="json" v-html="renderJSON(error.detail)" />
          <BadgeButton :click="copyError" class="copy-error-btn">Copy</BadgeButton>
        </details>
        <nuxt-link
          v-if="possibleSearch"
          class="possible-search ripple"
          :to="`/results?search_query=${possibleSearch}`"
          >Search for {{ possibleSearch }}</nuxt-link
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import BadgeButton from '@/components/buttons/BadgeButton.vue';
import Vue from 'vue';

export default Vue.extend({
  name: 'ErrorPage',
  components: {
    BadgeButton
  },
  props: {
    error: Object
  },
  data() {
    return {
      possibleSearch: null,
      apiUrl: this.$store.getters['environment/apiUrl']
    };
  },
  mounted() {
    if (this.error.statusCode === 404) {
      const path = this.$route.path;
      this.possibleSearch = path.replace('/', '');
    }
  },
  methods: {
    copyError(): void {
      if (process.browser && 'clipboard' in navigator) {
        navigator.clipboard.writeText(this.renderJSON(this.error.detail)).then(() => {
          this.$store.dispatch('messages/createMessage', {
            type: 'info',
            title: 'Copied error',
            message: null
          });
        });
      }
    },
    retry(): void {
      window.location.reload();
    },
    renderJSON(json: any): string {
      return JSON.stringify(json, this.replacerFunc(), 2);
    },
    replacerFunc() {
      const visited = new WeakSet();
      return (_key: any, value: object) => {
        if (typeof value === 'object' && value !== null) {
          if (visited.has(value)) {
            return;
          }
          visited.add(value);
        }
        return value;
      };
    }
  }
});
</script>

<style lang="scss" scoped>
.error-page {
  display: flex;

  .error-popup {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
    width: 500px;
    max-height: 100%;
    margin-top: $header-height;

    @media screen and (max-width: $mobile-width) {
      position: static;
      transform: none;
      width: 100vw;
      padding: $header-height 10px 10px 10px;
      box-sizing: border-box;
    }

    .error-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      background-color: var(--bgcolor-main);

      .error-logo {
        width: 300px;
        height: 300px;
        position: relative;

        img {
          width: 100%;
          height: 100%;
        }

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 100px;
          background: linear-gradient(to bottom, transparent, var(--bgcolor-main));
        }
      }

      .error-details {
        max-width: 100%;
        position: relative;

        summary {
          user-select: none;
          cursor: pointer;
          padding: 4px;
        }
        .copy-error-btn {
          position: absolute !important;
          right: 0;
          top: 36px;
        }

        .json {
          background-color: var(--bgcolor-translucent);
          width: 100%;
          overflow: scroll;
          margin: 0;
        }
      }

      .possible-search {
        font-size: 1rem;
        border-style: none;
        width: 300px;
        text-align: center;
        cursor: pointer;
        user-select: none;
        margin: 20px 20px;
        background-color: var(--bgcolor-main);
        padding: 8px 0;
        border-radius: 5px;
        box-sizing: border-box;
        color: var(--title-color);
        box-shadow: $low-shadow;
        transition: box-shadow 300ms $intro-easing;
        border: 2px solid var(--theme-color);
        user-select: none;

        &:hover {
          box-shadow: $max-shadow;
        }
      }
    }
  }
}
</style>
