<template>
  <transition name="fade-up">
    <div
      v-if="$store.state.miniplayer.currentVideo && visible && !dismissed"
      ref="miniplayerRef"
      class="miniplayer"
      :style="{
        top: `${Math.floor(positionTop)}px`,
        left: `${Math.floor(positionLeft)}px`,
        transform: `translate3d(calc(-50% + ${Math.floor(
          dragOffsetLeft
        )}px), calc(-10% + ${Math.floor(dragOffsetTop)}px), 0)`
      }"
      :class="{ animated: transition }"
    >
      <div
        class="drag-space"
        tabindex="0"
        :style="{ cursor: dragging ? 'grabbing' : 'grab' }"
        @mousedown.prevent="onDragSpaceMouseDown"
        @touchstart.prevent="onDragSpaceTouchStart"
      />
      <VideoPlayer
        :video="$store.state.miniplayer.currentVideo"
        :mini="true"
        :autoplay="true"
        :embedded="false"
        @close="hide"
      />
    </div>
  </transition>
</template>

<script lang="ts">
import VideoPlayer from '@/components/videoplayer/VideoPlayer.vue';
import { commons } from '@/plugins/commons';
import { computed, defineComponent, ref, useRoute, watch } from '@nuxtjs/composition-api';
import { useAccessor } from '@/store/index';

export default defineComponent({
  name: 'Miniplayer',
  components: {
    VideoPlayer
  },
  setup(prop) {
    const accessor = useAccessor();
    const route = useRoute();

    const dismissed = ref(false);
    const dragging = ref(false);
    const positionTop = ref(200);
    const positionLeft = ref(200);
    const startPositionTop = ref(0);
    const startPositionLeft = ref(0);
    const dragOffsetTop = ref(0);
    const dragOffsetLeft = ref(0);
    const transition = ref(false);

    const miniplayerRef = ref(null);

    const video = computed(() => {
      return accessor.miniplayer.currentVideo;
    });

    const visible = computed((): boolean => {
      return route.value.name !== 'watch';
    });

    watch(visible, (newValue, oldValue) => {
      if (newValue !== oldValue) {
        dismissed.value = false;
      }
    });

    const hide = () => {
      dismissed.value = true;
    };

    const onDragSpaceMouseDown = (e: { pageY: number; pageX: number }) => {
      dragging.value = true;
      startPositionTop.value = e.pageY;
      startPositionLeft.value = e.pageX;
      document.addEventListener('mousemove', onDragSpaceMouseMove);
      document.addEventListener('mouseup', onDragSpaceMouseUp);
    };
    const onDragSpaceTouchStart = (e: { touches: Array<{ pageX: number; pageY: number }> }) => {
      dragging.value = true;
      startPositionTop.value = e.touches[0].pageY;
      startPositionLeft.value = e.touches[0].pageX;
      document.addEventListener('touchmove', onDragSpaceTouchMove);
      document.addEventListener('touchend', onDragSpaceTouchEnd);
    };
    const onDragSpaceTouchMove = e => {
      const mouseOutOfScreenY = Boolean(
        e.touches[0].pageY < 0 || e.touches[0].pageY > commons.getPageHeight()
      );
      const mouseOutOfScreenX = Boolean(
        e.touches[0].pageX < 0 || e.touches[0].pageX > commons.getPageWidth()
      );
      if (mouseOutOfScreenY || mouseOutOfScreenX) {
        dragging.value = false;
      } else {
        calculateDrag(e.touches[0].pageX, e.touches[0].pageY);
      }
    };
    const onDragSpaceTouchEnd = e => {
      calculateFinish(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
      dragging.value = false;

      document.removeEventListener('touchmove', onDragSpaceMouseMove);
      document.removeEventListener('touchend', onDragSpaceTouchEnd);
    };
    const onDragSpaceMouseUp = e => {
      calculateFinish(e.pageX, e.pageY);
      dragging.value = false;
      document.removeEventListener('mousemove', onDragSpaceMouseMove);
      document.removeEventListener('mouseup', onDragSpaceMouseUp);
    };
    const onDragSpaceMouseMove = e => {
      const mouseOutOfScreenY = Boolean(e.pageY < 0 || e.pageY > commons.getPageHeight());
      const mouseOutOfScreenX = Boolean(e.pageX < 0 || e.pageX > commons.getPageWidth());
      if (mouseOutOfScreenY || mouseOutOfScreenX) {
        calculateFinish(e.pageX, e.pageY);
        dragging.value = false;
      } else {
        calculateDrag(e.pageX, e.pageY);
      }
    };
    const calculateDrag = (posX: number, posY: number) => {
      if (dragging) {
        const halfElementWidth = miniplayerRef.clientWidth / 2;
        const tenthElementHeight = miniplayerRef.clientHeight / 10;

        let positionLeft = 0;
        let positionTop = 0;

        if (posX - halfElementWidth < 0) {
          positionLeft = posX - (0 - (posX - halfElementWidth)) / -1.5;
        } else if (posX + halfElementWidth > commons.getPageWidth()) {
          positionLeft = posX - (commons.getPageWidth() - (posX + halfElementWidth)) / -1.5;
        } else {
          positionLeft = posX;
        }

        if (posY - tenthElementHeight < 0) {
          positionTop = posY - (0 - (posY - tenthElementHeight)) / -1.5;
        } else if (posY + tenthElementHeight * 9 > commons.getPageHeight()) {
          positionTop = posY - (commons.getPageHeight() - (posY + tenthElementHeight * 9)) / -1.5;
        } else {
          positionTop = posY;
        }

        dragOffsetTop.value = positionTop - startPositionTop.value;
        dragOffsetLeft.value = positionLeft - startPositionLeft.value;
      }
    };
    const calculateFinish = (posX: number, posY: number) => {
      transition.value = true;
      setTimeout(() => {
        transition.value = false;
      }, 600);
      const pageWidth = commons.getPageWidth();
      const pageHeight = commons.getPageHeight();
      const halfElementWidth = miniplayerRef.clientWidth / 2;
      const tenthElementHeight = miniplayerRef.clientHeight / 10;

      // Top left
      if (posX < pageWidth / 2 && posY < pageHeight / 2) {
        positionTop.value = tenthElementHeight + 60;
        positionLeft.value = halfElementWidth;
        // Top right
      } else if (posX > pageWidth / 2 && posY < pageHeight / 2) {
        positionTop.value = tenthElementHeight + 60;
        positionLeft.value = pageWidth - halfElementWidth;
        // Bottom right
      } else if (posX > pageWidth / 2 && posY > pageHeight / 2) {
        positionTop.value = pageHeight - tenthElementHeight * 9;
        positionLeft.value = pageWidth - halfElementWidth;
        // Bottom left
      } else if (posX < pageWidth / 2 && posY > pageHeight / 2) {
        positionTop.value = pageHeight - tenthElementHeight * 9;
        positionLeft.value = halfElementWidth;
      }

      dragOffsetTop.value = 0;
      dragOffsetLeft.value = 0;
    };

    return {
      dismissed,
      dragging,
      positionTop,
      positionLeft,
      startPositionTop,
      startPositionLeft,
      dragOffsetTop,
      dragOffsetLeft,
      transition,
      video,
      visible,
      miniplayerRef,
      hide,
      onDragSpaceMouseDown,
      onDragSpaceTouchStart,
      onDragSpaceTouchMove,
      onDragSpaceTouchEnd,
      onDragSpaceMouseUp,
      onDragSpaceMouseMove
    };
  }
});
</script>

<style lang="scss" scoped>
.fade-up-enter-active,
.fade-up-leave-active {
  transition: opacity 300ms $intro-easing;
}
.fade-up-enter-to,
.fade-up-leave {
  opacity: 1;
}
.fade-up-enter,
.fade-up-leave-to {
  opacity: 0;
}

.miniplayer {
  position: fixed;
  width: 500px;
  height: 280px;
  z-index: 800;
  cursor: grab;
  box-shadow: $max-shadow;

  &.animated {
    transition: 500ms $overshoot-easing;
  }

  &:focus {
    cursor: grabbing;
  }

  .drag-space {
    z-index: 15;
    position: absolute;
    left: 0;
    top: 0;
    width: 70%;
    height: 20%;
    transition: opacity 300ms $intro-easing;
    opacity: 0;

    &:hover {
      opacity: 1;
      transition: opacity 300ms 300ms $intro-easing;
      height: 100%;
      width: 100%;

      &:before {
        content: 'Click and drag...';
        font-size: 1.4rem;
        margin: 4px;
        width: 50%;
        padding: 2px 2px 2px 10px;
        box-shadow: $max-shadow;
        background-color: #00000070;
        border-radius: 4px;
        display: block;
      }
    }
  }

  @media screen and (max-width: 1100px) {
    width: 450px;
    height: 250px;
  }

  @media screen and (max-width: 900px) {
    width: 400px;
    height: 225px;
  }

  @media screen and (max-width: 700px) {
    width: 300px;
    height: 170px;
  }

  @media screen and (max-width: 500px) {
    width: 250px;
    height: 140px;
  }
}
</style>
