<script setup lang="ts">
defineProps<{
  postPoll: {
    choices: Array<string>;
    totalVotes: string;
  };
}>();
</script>

<template>
  <div class="post-poll">
    <div class="choices">
      <div v-for="(choice, index) in postPoll.choices" :key="index" class="choice">
        <p>{{ choice }}</p>
      </div>
    </div>
    <p class="total-votes">{{ postPoll.totalVotes }}</p>
  </div>
</template>

<style lang="scss" scoped>
.post-poll {
  display: flex;
  flex-direction: column;
  gap: 5px;

  .choices {
    display: flex;
    flex-direction: column;
    gap: 5px;

    .choice {
      border: 2px solid var(--bgcolor-alt-light);
      border-radius: 5px;
      padding: 2px 5px;
    }
  }

  .total-votes {
    font-size: 0.8rem;
    color: var(--subtitle-color-light);
  }
}
</style>
