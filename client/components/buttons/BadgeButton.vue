<template>
  <element
    :is="internalLink ? 'nuxt-link' : 'a'"
    :to="internalLink && href ? href : '#'"
    :target="internalLink ? '' : '_blank'"
    :href="href || '#'"
    :class="{ disabled }"
    v-ripple
    class="badge-btn"
    rel="noreferrer"
    @click="clickFunction"
  >
    <div class="content" :class="{ loading: loading }">
      <slot />
    </div>
  </element>
</template>

<script>
export default {
  name: 'BadgeButton',
  props: {
    href: String,
    click: Function,
    loading: Boolean,
    internalLink: Boolean,
    disabled: Boolean
  },
  methods: {
    clickFunction(e) {
      if (this.click instanceof Function) {
        e.preventDefault();
        this.click();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.badge-btn {
  background-color: var(--bgcolor-alt);
  text-decoration: none;
  color: var(--title-color);
  margin: 2px 5px 2px 0;
  border-radius: 3px;
  display: inline-block;
  transition: background-color 200ms $intro-easing,
    border 200ms $intro-easing;
  border: 2px solid var(--theme-color-translucent);
  width: auto;
  white-space: nowrap;

  &:focus {
    border: 2px solid var(--theme-color);

    &::after {
      display: none !important;
    }
  }

  &.disabled {
    filter: grayscale(100%);
    opacity: 0.8;
    user-select: none;
    pointer-events: none;
  }

  .content {
    display: flex;
    flex-direction: row;
    padding: 2px 4px;
    position: relative;

    &.loading {
      &:before {
        display: block;
      }
    }

    &:before {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      background: linear-gradient(
        90deg,
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 0, 0, 0) 30%,
        var(--theme-color-translucent) 50%,
        rgba(0, 0, 0, 0) 70%,
        rgba(0, 0, 0, 0) 100%
      );
      background-size: 200%;
      animation: background-load 2000ms $intro-easing
        infinite;
      display: none;
    }
    p {
      margin: 0 0 0 2px;
      line-height: 24px;
      display: inline-block;
    }
  }
}

@keyframes background-load {
  0% {
    opacity: 0;
    background-position: 110%;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    background-position: -15%;
  }
}
</style>
