<template>
  <div v-if="description" class="channel-description">
    <div v-show="isSmall" v-create-links class="description-container links">
      {{ smallDescription }}
    </div>
    <div v-show="!isSmall" v-create-links class="description-container links">
      {{ description }}
    </div>
    <BadgeButton v-if="isSmall" class="desc-show-more" :click="onShowFullDescription"
      >Show more
    </BadgeButton>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '#imports';
import BadgeButton from '@/components/buttons/BadgeButton.vue';

export default defineComponent({
  name: 'ChannelDescription',
  components: {
    BadgeButton
  },
  props: {
    description: String
  },
  setup(props) {
    const smallDescription = ref('');
    const isSmall = ref(true);

    const onShowFullDescription = (): void => {
      isSmall.value = false;
    };

    if (props.description.length > 300) {
      let smallDescriptionString = props.description.split('\n')[0];
      if (smallDescriptionString.length > 300) {
        smallDescriptionString = `${props.description.substr(0, 300)}...`;
      }
      smallDescription.value = smallDescriptionString;
    } else {
      isSmall.value = false;
    }

    return {
      smallDescription,
      isSmall,
      onShowFullDescription
    };
  }
});
</script>

<style lang="scss">
.channel-description {
  width: 100%;
  max-width: $main-width;
  box-sizing: border-box;
  z-index: 10;
  margin: 0 auto;
  padding: 20px 10px;
  z-index: 14;

  .description-container {
    white-space: pre-wrap;
  }

  .desc-show-more {
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
