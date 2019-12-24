<template>
  <div class="error-page" @scroll="$emit('scroll', $event)">
    <div class="error-container">
      <h1 class="error-1">404</h1>
    </div>
    <div class="error-popup">
      <div class="error-message">
        <h2>{{ possibleSearch }} not found</h2>
        <router-link
          class="rippe"
          :to="`/results?search_query=${possibleSearch}`"
        >Search for {{ possibleSearch }}</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'error-page',
  methods: {
    retry() {
      window.location.reload()
    }
  },
  data: () => ({
    possibleSearch: ''
  }),
  mounted() {
    this.$Progress.fail()
    let path = this.$route.path
    this.possibleSearch = path.replace('/', '')
  },
  beforeCreate() {

  }
}
</script>

<style lang="scss" scoped>
.error-page {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;

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
