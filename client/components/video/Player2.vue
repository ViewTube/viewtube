<script setup lang="ts">
import 'shaka-player/dist/controls.css';
import { ApiDto } from '@/utils/shared';
const props = defineProps<{
  video: ApiDto<'VTVideoInfoDto'>;
}>();

const shaka = ref(null);

const videoRef = ref<HTMLVideoElement | null>(null);

onBeforeMount(async () => {
  // @ts-expect-error
  shaka.value = await import('shaka-player/dist/shaka-player.ui.js');

  if (shaka.value) {
    shaka.value.polyfill.installAll();

    const ui = videoRef.value['ui'];
    const controls = ui.getControls();
    const player = controls.getPlayer();

    const videoPlaybackProxy = `${window.location.origin}/api`;

    const manifest = props.video.dashManifest.replace(
      /https:\/\/.*?.googlevideo\.com/gi,
      videoPlaybackProxy
    );
    const manifestUrl = 'data:application/dash+xml;charset=utf-8;base64,' + btoa(manifest);

    await player.load(manifestUrl);
  }
});
</script>

<template>
  <div class="video-player-2">
    <div data-shaka-player-container>
      <video
        id="video"
        ref="videoRef"
        autoplay
        data-shaka-player
        style="width: 100%; height: 100%"
      ></video>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.video-player-2 {
  .video-2 {
    width: 100%;
  }
}
</style>
