<template>
  <div
    class="switch"
    :class="{ on: value }"
    @click="$emit('valuechange', !value)"
  >
    <div class="switch-body">
      <span class="switch-circle">
        <span class="switch-circle-inner"></span>
      </span>
    </div>
    <p
      class="label"
      v-if="label"
    >{{ label }}</p>
  </div>
</template>

<script>
export default {
  name: 'switch-button',
  props: {
    value: Boolean,
    label: String
  }
}
</script>

<style lang="scss" scoped>
.switch {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  cursor: pointer;
  user-select: none;
  margin-top: 20px !important;

  &.on {
    .switch-body {
      .switch-circle {
        background-color: transparent;
        .switch-circle-inner {
          background-color: var(--bgcolor-alt);
          left: 26px;
        }
      }
    }
  }

  .label{
    line-height: 24px;
    text-align: center;
    margin: 0 0 0 10px;
  }

  .switch-body {
    background-image: $theme-color-primary-gradient;
    height: 24px;
    width: 50px;
    border-radius: 15px;
    background-repeat: no-repeat;

    .switch-circle {
      width: 44px;
      height: 18px;
      border-radius: 15px;
      background-color: var(--bgcolor-alt);
      display: block;
      margin: 3px;
      position: relative;
      transition: background-color 300ms $intro-easing;

      .switch-circle-inner {
        left: 0;
        width: 12px;
        height: 12px;
        margin: 3px;
        border-radius: 15px;
        background-color: var(--theme-color);
        display: block;
        position: absolute;
        transition: background-color 300ms $intro-easing, left 300ms $overshoot-easing;
      }
    }
  }
}
</style>
