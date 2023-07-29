<script setup lang="ts">
import ThemeSelector from '@/components/themes/ThemeSelector.vue';
import SwitchButton from '@/components/buttons/SwitchButton.vue';
import MultiOptionButton from '@/components/buttons/MultiOptionButton.vue';
import Dropdown from '@/components/filter/Dropdown.vue';
import '@/assets/styles/popup.scss';
import { SegmentOption, useSettingsStore } from '@/store/settings';

defineEmits<{
  (e: 'close'): void;
}>();

const settingsStore = useSettingsStore();
const sponsorblockSegmentOptions = reactive([
  { label: 'Skip', value: 'skip' },
  { label: 'Ask', value: 'ask' },
  { label: 'None', value: 'none' }
]);

const videoQualities = ['144p', '240p', '360p', '720p', '1080p', '1440p', '2160p'];
</script>

<template>
  <div class="settings popup">
    <div class="settings-container popup-container">
      <div class="settings-header">
        <VTIcon v-ripple name="mdi:close" class="close-icon" @click.stop="$emit('close')" />
        <h1 class="settings-title">
          Settings
          <div class="cloud-icon-container">
            <transition name="icon-switch" mode="out-in">
              <VTIcon
                v-if="!settingsStore.settingsSaving"
                v-tippy="'Settings synchronized'"
                name="mdi:cloud-check-outline"
                class="cloud-icon"
              />
            </transition>
            <transition name="icon-switch" mode="out-in">
              <VTIcon
                v-if="settingsStore.settingsSaving"
                v-tippy="'Saving settings'"
                name="mdi:reload"
                class="small-saving-spinner cloud-icon"
              />
            </transition>
          </div>
        </h1>
      </div>
      <h2><VTIcon name="mdi:brightness-4" />Theme</h2>
      <div class="theme-selector-container">
        <ThemeSelector />
      </div>
      <h2><VTIcon name="mdi:book-open-variant" />Chapters</h2>
      <SwitchButton
        :value="settingsStore.chapters"
        :label="'Show chapters on a video'"
        :disabled="false"
        :right="true"
        @valuechange="val => settingsStore.setChapters(val)"
      />
      <h2><VTIcon name="mdi:history" />History</h2>
      <SwitchButton
        :value="settingsStore.saveVideoHistory"
        :label="'Save video history and progress'"
        :disabled="false"
        :right="true"
        @valuechange="val => settingsStore.setSaveVideoHistory(val)"
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
        :value="settingsStore.sponsorblockEnabled"
        :label="'Enable SponsorBlock'"
        :disabled="false"
        :right="true"
        @valuechange="val => settingsStore.setSponsorblockEnabled(val)"
      />
      <div class="sponsorblock-options-container">
        <div class="sponsorblock-options" :class="{ disabled: !settingsStore.sponsorblockEnabled }">
          <MultiOptionButton
            :options="sponsorblockSegmentOptions"
            :model-value="settingsStore.sponsorblockSegmentSponsor"
            :label="'Sponsor'"
            :small-label="'Advertisements, promotions and video sponsors'"
            :right="true"
            :color-mark="'#0fca15'"
            class="sponsorblock-option"
            @update:model-value="val => settingsStore.setSponsorblockSegmentSponsor(val as SegmentOption)"
          />
          <MultiOptionButton
            :options="sponsorblockSegmentOptions"
            :model-value="settingsStore.sponsorblockSegmentIntro"
            :label="'Intro'"
            :small-label="'Intro animation, pause, intro sequence'"
            :right="true"
            :color-mark="'#07faf0'"
            class="sponsorblock-option"
            @update:model-value="val => settingsStore.setSponsorblockSegmentIntro(val as SegmentOption)"
          />
          <MultiOptionButton
            :options="sponsorblockSegmentOptions"
            :model-value="settingsStore.sponsorblockSegmentOutro"
            :label="'Outro'"
            :small-label="'Endcards, credits, outros'"
            :right="true"
            :color-mark="'#0103e1'"
            class="sponsorblock-option"
            @update:model-value="val => settingsStore.setSponsorblockSegmentOutro(val as SegmentOption)"
          />
          <MultiOptionButton
            :options="sponsorblockSegmentOptions"
            :model-value="settingsStore.sponsorblockSegmentInteraction"
            :label="'Interaction reminder'"
            :small-label="'Reminder to subscribe, like, follow on social media, etc.'"
            :right="true"
            :color-mark="'#b711df'"
            class="sponsorblock-option"
            @update:model-value="val => settingsStore.setSponsorblockSegmentInteraction(val as SegmentOption)"
          />
          <MultiOptionButton
            :options="sponsorblockSegmentOptions"
            :model-value="settingsStore.sponsorblockSegmentSelfpromo"
            :label="'Self promotion'"
            :small-label="'Unpaid promotion, for example donations, merchandise or shoutouts'"
            :right="true"
            :color-mark="'#fdfb0e'"
            class="sponsorblock-option"
            @update:model-value="val => settingsStore.setSponsorblockSegmentSelfpromo(val as SegmentOption)"
          />
          <MultiOptionButton
            :options="sponsorblockSegmentOptions"
            :model-value="settingsStore.sponsorblockSegmentMusicOfftopic"
            :label="'Non-music section'"
            :small-label="'Skips non-music sections in music videos'"
            :right="true"
            :color-mark="'#f89c06'"
            class="sponsorblock-option"
            @update:model-value="val => settingsStore.setSponsorblockSegmentMusicOfftopic(val as SegmentOption)"
          />
          <MultiOptionButton
            :options="sponsorblockSegmentOptions"
            :model-value="settingsStore.sponsorblockSegmentPreview"
            :label="'Preview'"
            :small-label="'Skips previews and recaps'"
            :right="true"
            :color-mark="'#f70000'"
            class="sponsorblock-option"
            @update:model-value="val => settingsStore.setSponsorblockSegmentPreview(val as SegmentOption)"
          />
        </div>
      </div>

      <h2><VTIcon name="mdi:window-restore" />Miniplayer</h2>
      <SwitchButton
        :value="settingsStore.miniplayer"
        :label="'Enable miniplayer'"
        :small-label="'Not working at the moment'"
        :disabled="true"
        :right="true"
        @valuechange="val => settingsStore.setMiniplayer(val)"
      />

      <h2><VTIcon name="mdi:home" />Homescreen</h2>
      <SwitchButton
        :value="settingsStore.showHomeSubscriptions"
        :label="'Show subscriptions on home screen'"
        :small-label="'Subscriptions require signing in'"
        :disabled="false"
        :right="true"
        @valuechange="val => settingsStore.setShowHomeSubscriptions(val)"
      />

      <h2><VTIcon name="mdi:television" />Videoplayer</h2>
      <div class="settings-dropdown-menu">
        <div class="quality-label">
          <label>Default video quality</label>
          <label class="small-label">If unavailable, the next lower quality will be chosen</label>
        </div>
        <Dropdown
          :values="videoQualities"
          :value="settingsStore.defaultVideoQuality"
          @valuechange="val => settingsStore.setDefaultVideoQuality(val.value)"
        />
      </div>
      <SwitchButton
        :value="settingsStore.dashPlaybackEnabled"
        :label="'Enable MPEG-DASH'"
        :small-label="'Enable high quality video playback using MPEG-DASH adaptive bitrate streaming'"
        :disabled="false"
        :right="true"
        @valuechange="val => settingsStore.setDashPlaybackEnabled(val)"
      />
      <SwitchButton
        :value="settingsStore.autoplay"
        :label="'Autoplay video'"
        :small-label="'Automatically plays video after opening'"
        :disabled="false"
        :right="true"
        @valuechange="val => settingsStore.setAutoplay(val)"
      />
      <SwitchButton
        :value="settingsStore.autoplayNextVideo"
        :label="'Autoplay next video'"
        :small-label="'Automatically plays the next recommended video'"
        :disabled="false"
        :right="true"
        @valuechange="val => settingsStore.setAutoplayNextVideo(val)"
      />
      <SwitchButton
        :value="settingsStore.alwaysLoopVideo"
        :label="'Loop video'"
        :small-label="'Overrides playing next video with autoplay or in playlists'"
        :disabled="false"
        :right="true"
        @valuechange="val => settingsStore.setAlwaysLoopVideo(val)"
      />
      <SwitchButton
        :value="settingsStore.audioModeDefault"
        :label="'Audio mode default'"
        :small-label="'Not implemented yet'"
        :disabled="true"
        :right="true"
        @valuechange="val => settingsStore.setAudioModeDefault(val)"
      />
      <div class="settings-number-menu">
        <label for="video-speed-input">Default video speed</label>
        <input
          id="video-speed-input"
          class="settings-number-input"
          type="number"
          name="video-speed"
          :value="settingsStore.defaultVideoSpeed"
          step="0.1"
          max="3"
          min="0.1"
          @change="(e: any) => settingsStore.setDefaultVideoSpeed(parseInt(e.target.value))"
        />
      </div>
    </div>
    <div class="settings-overlay popup-overlay" @click.stop="$emit('close')" />
  </div>
</template>

<style lang="scss">
.icon-switch-enter-active,
.icon-switch-leave-active {
  transform: rotate(0);
  opacity: 1;
}
.icon-switch-enter-from {
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

  .settings-dropdown-menu {
    display: flex;
    flex-direction: row;
    width: calc(100% - 36px);
    justify-content: space-between;

    .quality-label {
      display: flex;
      flex-direction: column;

      .small-label {
        margin: 0 !important;
      }
    }

    label {
      margin-top: 20px !important;
      height: 100%;
    }
  }

  .settings-number-menu {
    display: flex;
    flex-direction: row;
    width: calc(100% - 36px);
    justify-content: space-between;
    margin-top: 20px !important;

    .settings-number-input {
      all: unset;
      border: 2px solid var(--bgcolor-alt-light);
      width: 50px;
      padding: 2px 5px;
      border-radius: 5px;
      transition: border 300ms $intro-easing;

      &:focus {
        border: 2px solid var(--theme-color);
      }
    }
  }

  .sponsorblock-options-container {
    width: calc(100% - 36px);

    .sponsorblock-options {
      // width: calc(100% - 20px);
      transition: padding 300ms $intro-easing;
      overflow: hidden;

      .sponsorblock-option {
        margin: 20px 0 0 0;
      }

      &.disabled {
        pointer-events: none;
        user-select: none;
        filter: grayscale(100%);
        opacity: 0.9;
      }
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
