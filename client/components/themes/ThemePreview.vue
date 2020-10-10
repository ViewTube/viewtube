<template>
  <div class="theme-selector">
    <div
      v-if="themeEditable"
      class="edit-btn-container"
      @click.stop="$emit('edit-theme', theme.key)"
    >
      <div v-ripple v-tippy="'Edit Theme'" class="edit-btn">
        <EditIcon />
      </div>
    </div>
    <!-- <input v-if="themeEditable" id="edit-theme" type="checkbox" name="edit-theme" /> -->
    <a
      v-ripple
      class="theme-preview"
      :style="{
        'border-color': getBorderThemeColor(theme)
      }"
      @click.prevent="onThemeChange(theme)"
    >
      <div
        class="preview-graphic"
        :style="{
          'background-color': theme.variables.find(
            element => element.variableKey === 'bgcolor-main'
          ).variableValue
        }"
      >
        <span
          class="prev-header"
          :style="{
            'background-color': theme.variables.find(
              element => element.variableKey === 'header-bgcolor'
            ).variableValue
          }"
        >
          <span
            class="prev-logo"
            :style="{
              'background-color': theme.variables.find(
                element => element.variableKey === 'theme-color'
              ).variableValue
            }"
          />
          <span
            class="prev-searchbar"
            :style="{
              'background-color': theme.variables.find(
                element => element.variableKey === 'theme-color'
              ).variableValue
            }"
          />
        </span>
        <div class="prev-thmbs">
          <span
            v-for="(i, n) in 6"
            :key="n"
            class="prev-thmb"
            :style="{
              'background-color': theme.variables.find(
                element => element.variableKey === 'theme-color'
              ).variableValue
            }"
          />
        </div>
        <span
          class="prev-gradient"
          :style="{
            opacity: theme.variables.find(element => element.variableKey === 'gradient-opacity')
              .variableValue
          }"
        />
      </div>
    </a>
    <span class="theme-title">{{ theme.name }}</span>
  </div>
</template>

<script>
import EditIcon from 'vue-material-design-icons/Pencil';
export default {
  components: {
    EditIcon
  },
  props: {
    theme: Object,
    themeEditable: Boolean
  },
  methods: {
    onThemeChange(element) {
      document.body.classList.add('transition-all');
      this.$store.commit('theme/setTheme', element.key);
      setTimeout(() => {
        document.body.classList.remove('transition-all');
      }, 300);
    },
    getBorderThemeColor(theme) {
      return theme.key === this.$store.getters['theme/currentTheme'] //highlight if active theme
        ? theme.variables.find(element => element.variableKey === 'theme-color').variableValue
        : 'transparent';
    }
  }
};
</script>

<style lang="scss" scoped>
.edit-btn {
  color: white;
}
.theme-selector {
  display: flex;
  flex-direction: column;
  width: 200px;
  margin: 0 15px 20px 0;
  position: relative;

  &:hover {
    .edit-btn-container {
      opacity: 1;
      transform: scale(1);
    }
  }

  .edit-btn-container {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 12;
    width: 44px;
    height: 44px;
    padding: 10px;
    margin: 5px;
    opacity: 0;
    transform: scale(0.8);
    background-color: $video-thmb-overlay-bgcolor;
    border-radius: 5px;
    box-sizing: border-box;
    cursor: pointer;
    transition: opacity 200ms $intro-easing, transform 200ms $intro-easing;
  }

  #edit-theme {
    position: absolute;
    top: 2px;
    right: 2px;
    z-index: 13;
    opacity: 0;
    width: 50px;
    height: 50px;
    cursor: pointer;
  }

  #edit-theme:checked + .video-entry-thmb .video-entry-length {
    transform: scale(0);
  }

  #edit-theme:checked + .video-entry-thmb .thmb-image-container .video-description-overlay {
    opacity: 1;
  }

  .theme-preview {
    height: 120px;
    display: flex;
    flex-direction: column;
    border-style: solid;
    border-width: 2px;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
    transition: box-shadow 200ms $intro-easing, border-color 200ms $intro-easing;
    box-sizing: border-box;
    box-shadow: $low-shadow;
    cursor: pointer;

    &:hover {
      box-shadow: $max-shadow;
    }

    .preview-graphic {
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
      pointer-events: none;
      user-select: none;

      .prev-gradient {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 80%;
        background: linear-gradient(
          165deg,
          rgba(241, 87, 10, 0.705) 0%,
          rgba(116, 21, 10, 0.801) 28%,
          rgba(18, 18, 18, 1) 69%,
          rgba(18, 18, 18, 1) 100%
        );
      }

      .prev-header {
        width: 100%;
        height: 20px;
        display: flex;
        flex-direction: row;
        box-sizing: border-box;
        z-index: 9;

        .prev-logo {
          width: 12px;
          height: 8px;
          margin: auto 8px;
          box-sizing: border-box;
          clip-path: polygon(0% 0%, 100% 50%, 0% 100%);
        }

        .prev-searchbar {
          width: 80%;
          height: 5px;
          margin: auto calc(20% + 28px) auto 20%;
          box-sizing: border-box;
          border-radius: 1px;
        }
      }

      .prev-thmbs {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        padding: 12px 15px 0 15px;
        justify-content: space-around;
        box-sizing: border-box;

        .prev-thmb {
          width: 45px;
          height: 28px;
          z-index: 9;
        }
      }
    }
  }
  .theme-title {
    color: var(--theme-color);
  }
}
</style>
