<template>
  <div class="settings popup">
    <div class="settings-container popup-container">
      <div class="settings-header">
        <CloseIcon class="close-icon" @click.stop="$emit('close')" />
        <h1 class="settings-title">
          Settings
          <div class="cloud-icon-container">
            <transition name="icon-switch" mode="out-in">
              <CloudCheckIcon
                v-if="!settingsSaving"
                v-tippy="'Settings synchronized'"
                class="cloud-icon"
              />
            </transition>
            <transition name="icon-switch" mode="out-in">
              <ReloadIcon
                v-if="settingsSaving"
                v-tippy="'Saving settings'"
                class="small-saving-spinner cloud-icon"
              />
            </transition>
          </div>
        </h1>
      </div>
      <h2><ThemeIcon />Theme</h2>
      <ThemeSelector />
      <h2><ChaptersIcon />Chapters</h2>
      <SwitchButton
        :value="$store.getters['settings/chapters']"
        :label="'Show chapters on a video'"
        :disabled="false"
        :btnId="'settings-btn-1'"
        :right="true"
        @valuechange="val => saveSetting('settings/setChapters', val)"
      />
      <h2><HistoryIcon />History</h2>
      <SwitchButton
        :value="$store.getters['settings/saveVideoHistory']"
        :label="'Save video history and progress'"
        :disabled="false"
        :btnId="'settings-btn-2'"
        :right="true"
        @valuechange="val => saveSetting('settings/setSaveVideoHistory', val)"
      />
      <h2>
        <img
          class="sponsorblock-image"
          src="@/assets/icons/sponsorblock.png"
          alt="Sponsorblock icon"
        />Block ads and annoyances
      </h2>
      <span class="small-label links"
        >Using
        <a href="https://sponsor.ajay.app/" target="_blank" rel="noreferrer noopener">
          https://sponsor.ajay.app/</a
        ></span
      >
      <SwitchButton
        :value="$store.getters['settings/sponsorblock']"
        :label="'Enable SponsorBlock'"
        :disabled="false"
        :btnId="'settings-btn-2'"
        :right="true"
        @valuechange="val => saveSetting('settings/setSponsorblock', val)"
      />
      <div
        class="sponsorblock-options"
        :class="{ disabled: !$store.getters['settings/sponsorblock'] }"
      >
        <MultiOptionButton
          :options="sponsorblockSegmentOptions"
          :selectedValue="$store.getters['settings/sponsorblock_sponsor']"
          :label="'Sponsor'"
          :small-label="'Advertisements, promotions and video sponsors'"
          :right="true"
          :color-mark="'#0fca15'"
          @valuechange="val => onSponsorblockOptionChange('sponsor', val)"
        />
        <MultiOptionButton
          :options="sponsorblockSegmentOptions"
          :selectedValue="$store.getters['settings/sponsorblock_intro']"
          :label="'Intro'"
          :small-label="'Intro animation, pause, intro sequence'"
          :right="true"
          :color-mark="'#07faf0'"
          @valuechange="val => onSponsorblockOptionChange('intro', val)"
        />
        <MultiOptionButton
          :options="sponsorblockSegmentOptions"
          :selectedValue="$store.getters['settings/sponsorblock_outro']"
          :label="'Outro'"
          :small-label="'Endcards, credits, outros'"
          :right="true"
          :color-mark="'#0103e1'"
          @valuechange="val => onSponsorblockOptionChange('outro', val)"
        />
        <MultiOptionButton
          :options="sponsorblockSegmentOptions"
          :selectedValue="$store.getters['settings/sponsorblock_interaction']"
          :label="'Interaction reminder'"
          :small-label="'Reminder to subscribe, like, follow on social media, etc.'"
          :right="true"
          :color-mark="'#b711df'"
          @valuechange="val => onSponsorblockOptionChange('interaction', val)"
        />
        <MultiOptionButton
          :options="sponsorblockSegmentOptions"
          :selectedValue="$store.getters['settings/sponsorblock_selfpromo']"
          :label="'Self promotion'"
          :small-label="'Unpaid promotion, for example donations, merchandise or shoutouts'"
          :right="true"
          :color-mark="'#fdfb0e'"
          @valuechange="val => onSponsorblockOptionChange('selfpromo', val)"
        />
        <MultiOptionButton
          :options="sponsorblockSegmentOptions"
          :selectedValue="$store.getters['settings/sponsorblock_music_offtopic']"
          :label="'Non-music section'"
          :small-label="'Skips non-music sections in music videos'"
          :right="true"
          :color-mark="'#f89c06'"
          @valuechange="val => onSponsorblockOptionChange('music_offtopic', val)"
        />
      </div>

      <h2><MiniplayerIcon />Miniplayer</h2>
      <SwitchButton
        :value="$store.getters['settings/miniplayer']"
        :label="'Enable miniplayer'"
        :disabled="false"
        :btnId="'settings-btn-3'"
        :right="true"
        @valuechange="val => saveSetting('settings/setMiniplayer', val)"
      />
    </div>
    <div class="settings-overlay popup-overlay" @click.stop="$emit('close')" />
  </div>
</template>

<script lang="ts">
import CloseIcon from 'vue-material-design-icons/Close.vue';
import ThemeIcon from 'vue-material-design-icons/Brightness4.vue';
import MiniplayerIcon from 'vue-material-design-icons/WindowRestore.vue';
import ChaptersIcon from 'vue-material-design-icons/BookOpenVariant.vue';
import CloudCheckIcon from 'vue-material-design-icons/CloudCheckOutline.vue';
import HistoryIcon from 'vue-material-design-icons/History.vue';
import ReloadIcon from 'vue-material-design-icons/Reload.vue';
import ThemeSelector from '@/components/themes/ThemeSelector.vue';
import SwitchButton from '@/components/buttons/SwitchButton.vue';
import MultiOptionButton from '@/components/buttons/MultiOptionButton.vue';
import '@/assets/styles/popup.scss';
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  reactive,
  ref,
  useStore
} from '@nuxtjs/composition-api';
import { useAccessor } from '~/store';

export default defineComponent({
  name: 'Settings',
  components: {
    CloseIcon,
    ThemeIcon,
    MiniplayerIcon,
    HistoryIcon,
    SwitchButton,
    ThemeSelector,
    ChaptersIcon,
    MultiOptionButton,
    CloudCheckIcon,
    ReloadIcon
  },
  setup(_, { root }) {
    const accessor = useAccessor();
    const store = useStore();
    const sponsorblockSegmentOptions = reactive([
      { label: 'Skip', value: 'skip' },
      { label: 'Ask', value: 'ask' },
      { label: 'None', value: 'none' }
    ]);

    const settingsSaving = ref(false);
    const themes = computed(() => accessor.settings.defaultThemes);
    const currentTheme = computed(() => accessor.settings.theme);

    const onThemeChange = (element: any) => {
      setTimeout(() => {
        document.body.classList.add('transition-all');
        accessor.settings.setTheme(element.value);
        setTimeout(() => {
          document.body.classList.remove('transition-all');
        }, 300);
      }, 300);
    };

    const onSettingsSaving = value => {
      settingsSaving.value = value;
    };

    const saveSetting = async (storeAction: string, value: string): Promise<void> => {
      root.$nuxt.$emit('settings-saving', true);
      await store.dispatch(storeAction, value);
      root.$nuxt.$emit('settings-saving', false);
    };

    const onSponsorblockOptionChange = async (category, value) => {
      root.$nuxt.$emit('settings-saving', true);

      accessor.settings.setMutateSponsorblockCategoryStatus({
        category,
        status: value.value
      });
      await accessor.settings.storeSponsorblock();
      root.$nuxt.$emit('settings-saving', false);
    };

    root.$nuxt.$on('settings-saving', onSettingsSaving);

    onBeforeUnmount(() => {
      root.$nuxt.$off('settings-saving');
    });

    return {
      sponsorblockSegmentOptions,
      themes,
      currentTheme,
      settingsSaving,
      onSponsorblockOptionChange,
      onThemeChange,
      saveSetting
    };
  }
});
</script>

<style lang="scss">
.icon-switch-enter-active,
.icon-switch-leave-active {
  transform: rotate(0);
  opacity: 1;
}
.icon-switch-enter {
  transform: rotate(-80deg);
  opacity: 0;
}
.icon-switch-leave-to {
  opacity: 0;
  transform: rotate(80deg);
}
.settings-container {
  padding: 50px 20px 0 20px !important;

  .settings-header {
    position: fixed;
    width: calc(100% - 20px);
    max-width: 700px;
    top: 10%;
    margin: 0 !important;
    padding: 0;
    z-index: 12;
    background-color: var(--bgcolor-alt);

    .settings-title {
      text-align: center;
    }

    .cloud-icon-container {
      display: inline-block;
      position: relative;
      top: 0;
      left: 0;
      width: 24px;
      height: 24px;

      .cloud-icon {
        position: absolute;
        top: 0;
        left: 0;
        transition: opacity 300ms $intro-easing, transform 300ms $intro-easing;

        .material-design-icon__svg {
          position: absolute;
          left: 1px;
        }
      }

      .small-saving-spinner {
        animation: spin 600ms linear infinite;
        transform-origin: center;
      }
    }

    .close-icon {
      position: absolute;
    }

    @media screen and (max-width: $mobile-width) {
      top: 0;
      padding: 15px 0;
    }
  }

  h2 {
    .sponsorblock-image {
      height: 24px;
      width: 24px;
      margin: 0 10px 0 0;
      filter: grayscale(100%) brightness(0.9) invert(1);
    }
  }

  .sponsorblock-options {
    width: calc(100% - 20px);
    transition: padding 300ms $intro-easing;
    padding-bottom: 384px;
    overflow: hidden;

    &.disabled {
      pointer-events: none;
      user-select: none;
      padding-bottom: 0;
    }
  }

  .small-label {
    margin: 0 0 0 36px;
    font-size: 0.8rem;
  }

  .settings-subtitle {
    margin-left: 36px;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
