<template>
  <div class="messages-container">
    <MessageBox
      v-for="message in $store.getters[
        'messages/visibleMessages'
      ]"
      :key="message.id"
      :message="message"
    ></MessageBox>
  </div>
</template>

<script>
import MessageBox from '@/components/message/MessageBox';
export default {
  name: 'message-box-container',
  components: {
    MessageBox
  },
  data() {
    return {
      messages: this.$store.getters[
        'messages/visibleMessages'
      ]
    };
  }
};
</script>

<style lang="scss" scoped>
.messages-container {
  position: fixed;
  right: 0;
  top: 0;
  display: flex;
  z-index: 1000;
  padding: 0 10px;
  margin: $header-height 0 0 0;
  flex-direction: column;

  @media screen and (max-width: $mobile-width) {
    flex-direction: column-reverse;
    top: unset;
    bottom: 0;
    width: 100%;
  }
}
</style>
