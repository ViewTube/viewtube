<template>
  <div class="multi-option">
    <input
      :id="`multi-option-button-${btnId}`"
      class="multi-option-button"
      type="checkbox"
      :name="label"
      :checked="value"
      :disabled="disabled"
      @change="onChange"
    />
    <div class="multi-option-body">
      <span class="multi-option-circle">
        <span class="multi-option-circle-inner" />
      </span>
    </div>
    <label v-if="label" :for="`multi-option-button-${btnId}`" class="label">{{ label }}</label>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'MultiOptionButton',
  props: {
    value: Boolean,
    label: String,
    disabled: Boolean,
    btnId: {
      type: Number,
      required: true
    }
  },
  methods: {
    onChange(e: any): void {
      this.$emit('valuechange', e.target.checked);
    }
  }
});
</script>

<style lang="scss" scoped>
.multi-option {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  user-select: none;
  margin-top: 20px !important;
  position: relative;

  .multi-option-button {
    all: unset;
    width: 50px;
    height: 24px;
    background-image: $theme-color-primary-gradient;
    border-radius: 15px;
    background-repeat: no-repeat;

    &:focus {
      outline: solid 2px var(--theme-color) !important;
    }
  }

  .label {
    line-height: 24px;
    text-align: center;
    margin: 0 0 0 10px;
  }
}
</style>
