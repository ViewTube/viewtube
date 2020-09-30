<template>
  <VSelect
    class="styled-dropdown"
    :placeholder="placeholder"
    :options="options"
    :value="value"
    :label="label"
    :clearable="clearable"
    @input="$emit('input', $event)"
  />
</template>

<script>
import VSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
export default {
  components: {
    VSelect
  },
  props: {
    placeholder: String,
    options: Array,
    label: String,
    value: Object,
    clearable: Boolean
  }
};
</script>

<style lang="scss">
.styled-dropdown {
  width: 100%;
}
.styled-dropdown .vs__dropdown-toggle,
.styled-dropdown .vs__dropdown-menu {
  background: var(--bgcolor-main);
  border: none;
  color: var(--theme-color);
}

.styled-dropdown .vs__selected,
.styled-dropdown .vs__dropdown-option,
.styled-dropdown .vs__search {
  color: var(--theme-color);
}

.styled-dropdown .vs__search::placeholder {
  color: var(--theme-color-translucent);
}
.styled-dropdown .vs__selected-options {
  flex-wrap: nowrap;
}

.styled-dropdown .vs__clear,
.styled-dropdown .vs__open-indicator {
  fill: var(--theme-color);
}

.vs__dropdown-option--highlight {
  background-color: var(--bgcolor-alt);
}
</style>
