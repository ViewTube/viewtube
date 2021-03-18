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
      :value="value"
      @input="$emit('input', $event.target.value)"
    />
    <AccountIcon v-if="type == 'username'" />
    <KeyIcon v-if="type == 'password'" />
    <MailIcon v-if="type == 'email'" />
    <label :for="id" class="input-label">{{ label }}</label>
  </div>
</template>

<script lang="ts">
import AccountIcon from 'vue-material-design-icons/AccountOutline.vue';
import KeyIcon from 'vue-material-design-icons/KeyOutline.vue';
import MailIcon from 'vue-material-design-icons/At.vue';
import { computed, defineComponent, reactive } from '@nuxtjs/composition-api';

export default defineComponent({
  name: 'FormInput',
  components: {
    AccountIcon,
    KeyIcon,
    MailIcon
  },
  props: {
    type: { type: String, required: false, default: () => undefined },
    value: null,
    label: String,
    id: String
  },
  setup(props) {
    const autocompleteTags = reactive({
      email: 'email',
      username: 'username',
      password: 'current-password',
      all: 'on'
    });

    const hasText = computed((): boolean => {
      return props.value && props.value.length > 0;
    });
    const autocompleteTag = computed((): string => {
      const tagId = Object.keys(autocompleteTags).find(type => type === props.type);
      const tag = tagId !== undefined ? tagId : 'all';

      return autocompleteTags[tag];
    });

    return {
      hasText,
      autocompleteTag
    };
  }
});
</script>

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
    border-style: none;
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
