<script setup lang="ts">
import dayjs from 'dayjs';

const { data } = useGetSessions();

const sessions = computed(() => {
  return data.value?.sort((a, b) => {
    return dayjs(b.lastUsed).valueOf() - dayjs(a.lastUsed).valueOf();
  });
});
</script>

<template>
  <div class="sessions">
    <SectionTitle :title="'Devices'" />
    <UserSession v-for="(session, index) in sessions" :key="index" :session="session" />
  </div>
</template>

<style lang="scss" scoped>
.sessions {
  display: flex;
  padding: 0 10px;
  flex-direction: column;
}
</style>
