<template>
  <div class="confirmation-popup">
    <div class="popup-overlay" @click.prevent="$emit('close')" />
    <div class="confirmation">
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <div class="actions">
        <slot />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted } from '@nuxtjs/composition-api';

export default defineComponent({
  name: 'Confirmation',
  props: {
    title: String,
    message: String
  },
  setup(_, { emit }) {
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        emit('close');
      }
    };
    onMounted(() => {
      window.addEventListener('keydown', onEscape);
    });
    onBeforeUnmount(() => {
      window.removeEventListener('keydown', onEscape);
    });
  }
});
</script>

<style lang="scss">
.confirmation-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  .confirmation {
    padding: 10px 20px;
    border-radius: 5px;
    box-shadow: $max-shadow;
    z-index: 9;
    position: fixed;
    top: 50%;
    min-width: 250px;
    max-width: 350px;
    width: 100%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--bgcolor-alt);
    box-sizing: border-box;

    .actions {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      margin-top: 10px;

      .badge-btn:last-of-type {
        margin: 2px 0;
      }
    }
  }
}
</style>
