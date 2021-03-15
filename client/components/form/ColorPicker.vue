<template>
  <div ref="colorpicker" class="color-picker" @blur="displayPicker = false">
    <ChromePicker
      v-if="displayPicker"
      :class="{ bottom: colorPickerPosBottom }"
      :value="color"
      @input="input"
    />
    <FormInput
      :id="'bgcolor-main'"
      :value="color"
      :label="label"
      :type="'text'"
      @input="input"
      @focus="showPicker()"
    />
  </div>
</template>

<script lang="ts">
import { Chrome } from 'vue-color';
import FormInput from '@/components/form/FormInput.vue';
import Vue from 'vue';
export default Vue.extend({
  name: 'ColorPicker',
  components: { ChromePicker: Chrome, FormInput },
  props: {
    initialColor: String,
    colorPickerPosBottom: { default: false, type: Boolean },
    label: String
  },
  data() {
    return {
      color: '',
      displayPicker: false
    };
  },
  mounted() {
    this.color = this.initialColor;
  },
  methods: {
    input(event) {
      this.color = event.hex8;
      this.$emit('input', event.hex8);
    },
    showPicker() {
      document.addEventListener('click', this.documentClick);
      this.displayPicker = true;
    },
    hidePicker() {
      document.removeEventListener('click', this.documentClick);
      this.displayPicker = false;
    },
    documentClick(e) {
      const el = this.$refs.colorpicker;
      const target = e.target;
      if (el !== target && !el.contains(target)) {
        this.hidePicker();
      }
    }
  }
});
</script>
<style lang="scss" scoped>
.color-picker {
  position: relative;
  .vc-chrome {
    position: absolute;
    bottom: calc(100%+10px);
    z-index: 10;
    &.bottom {
      bottom: unset;
      top: calc(100%+10px);
    }
  }
}
</style>
