<template>
  <div v-if="description" class="channel-description">
    <div v-show="isSmall" v-create-links class="description-container links">
      {{ smallDescription }}
    </div>
    <div v-show="!isSmall" v-create-links class="description-container links">
      {{ description }}
    </div>
    <BadgeButton v-if="isSmall" class="desc-show-more" :click="onShowFullDescription"
      >Show more</BadgeButton
    >
  </div>
</template>

<script>
import BadgeButton from '@/components/buttons/BadgeButton';
export default {
  name: 'ChannelDescription',
  components: {
    BadgeButton
  },
  props: {
    description: String
  },
  data() {
    return {
      smallDescription: '',
      isSmall: true
    };
  },
  created() {
    if (this.description.length > 300) {
      let smallDescription = this.description.split('\n')[0];
      if (smallDescription.length > 300) {
        smallDescription = `${this.description.substr(0, 300)}...`;
      }
      this.smallDescription = smallDescription;
    } else {
      this.isSmall = false;
    }
  },
  methods: {
    onShowFullDescription() {
      this.isSmall = false;
    }
  }
};
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
