<template>
  <div class="settings popup">
    <div class="settings-container popup-container">
      <CloseIcon class="close-icon" @click.stop="$emit('close')" />
      <h1>Settings</h1>
      <h2><ThemeIcon />Theme</h2>
      <ThemeSelector />
      <h2><ChaptersIcon />Chapters</h2>
      <SwitchButton
        :value="$store.getters['settings/chapters']"
        :label="'Show chapters on a video'"
        :disabled="false"
        :btnId="'settings-btn-1'"
        :right="true"
        @valuechange="val => $store.dispatch('settings/setChapters', val)"
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
        @valuechange="val => $store.dispatch('settings/setSponsorblock', val)"
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
        @valuechange="val => $store.dispatch('settings/setMiniplayer', val)"
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
import ThemeSelector from '@/components/themes/ThemeSelector.vue';
import SwitchButton from '@/components/buttons/SwitchButton.vue';
import MultiOptionButton from '@/components/buttons/MultiOptionButton.vue';
import '@/assets/styles/popup.scss';
import { computed, defineComponent, reactive } from '@nuxtjs/composition-api';
import { useAccessor } from '~/store';

export default defineComponent({
  name: 'Settings',
  components: {
    CloseIcon,
    ThemeIcon,
    MiniplayerIcon,
    SwitchButton,
    ThemeSelector,
    ChaptersIcon,
    MultiOptionButton
  },
  setup() {
    const accessor = useAccessor();
    const sponsorblockSegmentOptions = reactive([
      { label: 'Skip', value: 'skip' },
      { label: 'Ask', value: 'ask' },
      { label: 'None', value: 'none' }
    ]);

    const themes = computed(() => accessor.settings.defaultThemes);
    const currentTheme = computed(() => accessor.settings.theme);

    const onSponsorblockOptionChange = (category: string, value: { value: string }) => {
      accessor.settings.setSponsorblockCategoryStatus({
        category,
        status: value.value
      });
    };
    const onThemeChange = (element: any) => {
      setTimeout(() => {
        document.body.classList.add('transition-all');
        accessor.settings.setTheme(element.value);
        setTimeout(() => {
          document.body.classList.remove('transition-all');
        }, 300);
      }, 300);
    };

    return {
      sponsorblockSegmentOptions,
      themes,
      currentTheme,
      onSponsorblockOptionChange,
      onThemeChange
    };
  }
});
</script>

<style lang="scss">
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
</style>
