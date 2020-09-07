<template>
  <div class="error-page">
    <div class="error-container">
      <h1 class="error-1">{{ error.statusCode }}</h1>
    </div>
    <div class="error-popup">
      <div class="error-message">
        <h2>{{ error.message }}</h2>
        <p>Api-url: {{ apiUrl }}</p>
        <details v-if="error.detail" class="error-details">
          <summary>Full error</summary>
          <p>{{ error.detail }}</p>
        </details>
        <nuxt-link
          v-if="possibleSearch"
          class="ripple"
          :to="`/results?search_query=${possibleSearch}`"
          >Search for {{ possibleSearch }}</nuxt-link
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'error-page',
  props: {
    error: Object
  },
  methods: {
    retry() {
      window.location.reload();
    }
  },
  data: () => ({
    possibleSearch: null,
    apiUrl: process.env.API_URL
  }),
  mounted() {
    if (this.error.statusCode === 404) {
      const path = this.$route.path;
      this.possibleSearch = path.replace('/', '');
    }
  },
  beforeCreate() {}
};
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

    .error-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      background-color: var(--bgcolor-main);

      .error-details {
        max-width: 80%;
      }

      a {
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

  .error-container {
    margin: auto;
    width: 100%;
    height: 100%;
    text-align: center;
    position: relative;

    h1 {
      position: absolute;
      left: 0;
      top: 30%;
      transform: translateY(-50%);
      font-size: 200px;
      width: 100%;
      overflow: hidden;
      text-overflow: wrap;
      color: var(--bgcolor-main);

      &.error-1 {
        text-shadow: 0 0 5px var(--theme-color);
      }
    }
  }
}
</style>
