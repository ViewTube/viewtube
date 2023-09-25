<script setup lang="ts">
import dayjs from 'dayjs';

const { data, refresh } = useGetSessions();

const sessions = computed(() => {
  const currentSession = data.value?.find(session => session.current);
  const sortedSessions =
    data.value
      ?.filter(el => !el.current)
      .sort((a, b) => {
        return dayjs(b.updatedAt).valueOf() - dayjs(a.updatedAt).valueOf();
      }) ?? [];
  return [currentSession, ...sortedSessions].filter(Boolean);
});
</script>

<template>
  <div class="sessions">
    <SectionTitle :title="'Devices'" />
    <UserSession
      v-for="(session, index) in sessions"
      :key="index"
      :session="session"
      @refresh="refresh"
    />
  </div>
</template>

<style lang="scss" scoped>
.sessions {
  display: flex;
  padding: 0 10px;
  flex-direction: column;
}
</style>
