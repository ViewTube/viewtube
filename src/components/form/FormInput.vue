<template>
  <div class="form-input">
    <input
      :id="id"
      class="input"
      :class="{ 'focus-content': hasText }"
      :autocomplete="autocompleteTag"
      :type="type"
      required
      :value="value"
      v-on:input="$emit('input', $event.target.value)"
    />
    <label :for="id" class="input-label">{{ label }}</label>
  </div>
</template>

<script>
export default {
  name: 'form-input',
  props: {
    type: String,
    value: null,
    label: String,
    id: String
  },
  data: function () {
    return {
      autocompleteTags: {
        email: 'email',
        username: 'username',
        password: 'current-password',
        all: 'on'
      }
    }
  },
  computed: {
    hasText () {
      return this.value && this.value.length > 0
    },
    autocompleteTag () {
      let tagId = Object.keys(this.autocompleteTags).find(this.type)
      let tag = tagId !== undefined ? tagId : 'all'

      return this.autocompleteTags[tag]
    }
  }
}
</script>

<style lang="scss" scoped>
.form-input {
  position: relative;
  $input-line-height: 50px;

  .input {
    margin: 20px 20px;
    padding: 12px 12px;
    line-height: 30px;
    border-radius: 4px;
    width: calc(100% - 40px);
    height: $input-line-height;

    font-size: 1rem;
    border-style: none;
    color: $title-color;
    box-sizing: border-box;
    font-family: $default-font;
    background-color: transparent;
    border: 2px solid $bgcolor-alt-light;
    transition: border 300ms $intro-easing;

    &:focus {
      border-color: $theme-color;
    }

    &:focus,
    &.focus-content {
      padding: 20px 12px 4px 12px;
    }

    &:not(:valid) {
      box-shadow: none;
      border-color: $error-color-red;
    }
  }

  .input-label {
    position: absolute;
    left: 34px;
    top: 20px;
    height: $input-line-height;
    line-height: $input-line-height;
    text-align: center;
    margin: auto;
    pointer-events: none;
    transition: transform 300ms $intro-easing, color 300ms $intro-easing;
    transform-origin: left top;
    color: $subtitle-color-light;
  }

  .focus-content ~ .input-label,
  .input:focus ~ .input-label {
    transform: scale(0.8) translateY(-10px);
  }

  .input:focus ~ .input-label {
    color: $theme-color;
  }
}
</style>
