<script setup lang="ts">
defineProps<{
  postPoll: {
    choices: Array<string>;
    totalVotesText?: string;
    correctChoice?: string;
  };
}>();
</script>

<template>
  <div class="post-poll">
    <div class="choices">
      <div
        v-for="(choice, index) in postPoll.choices"
        :key="index"
        class="choice"
        :class="{ correct: postPoll.correctChoice === choice }"
      >
        <p>{{ choice }}</p>
      </div>
    </div>
    <p class="total-votes">{{ postPoll.totalVotesText }}</p>
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

      &.correct {
        border-color: var(--theme-color);
      }
    }
  }

  .total-votes {
    font-size: 0.8rem;
    color: var(--subtitle-color-light);
  }
}
</style>
