<template>
  <div v-ripple v-tippy="optionName" class="share-option" @click="onClick">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api';

export default defineComponent({
  name: 'ShareOptionEntry',
  props: {
    optionName: { type: String, required: true },
    click: Function as PropType<() => {}>
  },
  setup(props) {
    const onClick = () => {
      props.click();
    };

    return {
      onClick
    };
  }
});
</script>

<style lang="scss">
.share-option {
  background-color: var(--bgcolor-alt);
  text-decoration: none;
  color: var(--title-color);
  margin: 2px 5px 2px 0;
  border-radius: 3px;
  display: inline-block;
  transition: background-color 200ms $intro-easing, border 200ms $intro-easing;
  border: 2px solid var(--theme-color-translucent);
  width: auto;
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  height: 46px;
  width: 46px;
  margin: 4px 4px 4px 0;

  .material-design-icon__svg {
    margin: 4px;
    height: 38px !important;
    width: 38px !important;
    position: unset !important;
  }

  img {
    width: 50px;
    margin: -1px 0 0 8px;
  }

  &:hover {
    cursor: pointer;
  }
}
</style>
