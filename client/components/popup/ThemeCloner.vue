<template>
  <div class="popup">
    <div class="popup-container">
      <CloseIcon class="close-icon" @click.stop="$emit('close')" />
      <h1>Clone Theme</h1>
      <VSelect
        v-model="selectedTheme"
        class="themeSelector styled-dropdown"
        placeholder="Choose a Parent Theme"
        :options="themes"
        label="name"
      />
    </div>
    <div class="popup-overlay" @click.stop="$emit('close')" />
  </div>
</template>

<script>
import CloseIcon from 'vue-material-design-icons/Close';
import VSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
import '@/assets/styles/popup.scss';

export default {
  name: 'ThemeCloner',
  components: {
    CloseIcon,
    VSelect
  },
  props: {
    themes: Array
  },
  data: () => ({
    selectedTheme: String
  }),
  mounted() {
    this.selectedTheme = '';
  },
  methods: {
    valueChange(element) {
      this.selectedTheme = element.value;
    }
  }
};
</script>

<style lang="scss">
.themeSelector {
  margin: 0 !important;
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
