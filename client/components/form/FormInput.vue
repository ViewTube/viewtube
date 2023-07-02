<script setup lang="ts">
const props = defineProps<{
  type?: string;
  modelValue: string;
  label: string;
  id: string;
}>();

defineEmits<{ (e: 'update:modelValue', value: string): void }>();

const autocompleteTags = {
  email: 'email',
  username: 'username',
  password: 'current-password',
  all: 'on'
};

const hasText = computed((): boolean => {
  return props.modelValue && props.modelValue.length > 0;
});

const autocompleteTag = computed((): string => autocompleteTags[props.type] ?? 'all');
</script>

<template>
  <div class="form-input">
    <input
      :id="id"
      class="input"
      :class="{ 'focus-content': hasText }"
      :autocomplete="autocompleteTag"
      :type="type"
      :name="autocompleteTag"
      required
      :value="modelValue"
      @input="(e: any) => $emit('update:modelValue', e.target.value)"
    />
    <Icon v-if="type === 'username'" name="mdi:account-outline" />
    <Icon v-if="type === 'password'" name="mdi:key-outline" />
    <Icon v-if="type === 'email'" name="mdi:at" />
    <label :for="id" class="input-label">{{ label }}</label>
  </div>
</template>

<style lang="scss" scoped>
.form-input {
  position: relative;
  $input-line-height: 50px;

  .material-design-icon {
    position: absolute;
    right: 40px;
    top: 30px;
    color: var(--title-color);
  }

  .input:not(:valid) + .material-design-icon {
    color: var(--error-color-red);
  }

  .input {
    margin: 15px 20px;
    padding: 12px 12px;
    line-height: 30px;
    border-radius: 4px;
    width: calc(100% - 40px);
    height: $input-line-height;
    font-size: 1rem;
    color: var(--title-color);
    box-sizing: border-box;
    font-family: $default-font;
    background-color: transparent;
    border: 2px solid var(--bgcolor-alt-light);
    transition: border 300ms $intro-easing;

    &:focus {
      outline: none;
      border-color: var(--theme-color);
    }

    &:focus,
    &.focus-content {
      padding: 20px 12px 4px 12px;
    }

    &:not(:valid) {
      box-shadow: none;
      // border-color: var(--error-color-red)
    }
  }

  .input-label {
    position: absolute;
    left: 34px;
    top: 15px;
    height: $input-line-height;
    line-height: $input-line-height;
    text-align: center;
    margin: auto;
    pointer-events: none;
    transition: transform 300ms $intro-easing, color 300ms $intro-easing;
    transform-origin: left top;
    color: var(--subtitle-color-light);
  }

  .focus-content ~ .input-label,
  .input:focus ~ .input-label {
    transform: scale(0.8) translateY(-10px);
  }

  .input:focus ~ .input-label {
    color: var(--theme-color);
  }
}
</style>
