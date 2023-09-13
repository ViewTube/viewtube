<script setup lang="ts">
import humanizeDuration from 'humanize-duration';
import dayjs from 'dayjs';

const { data } = useGetSessions();

const sessions = computed(() => {
  return data.value
    ?.map(session => {
      return {
        deviceName: session.deviceName,
        deviceType: session.deviceType,
        lastUsed: `${humanizeDateString(session.lastUsed)} ago`
      };
    })
    .sort((a, b) => {
      return dayjs(a.lastUsed).valueOf() > dayjs(b.lastUsed).valueOf() ? -1 : 1;
    });
});

const humanizeDateString = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const dateMs = now.valueOf() - date.valueOf();
  return humanizeDuration(dateMs, { largest: 1 });
};
</script>

<template>
  <div class="sessions">
    <SectionTitle :title="'Devices'" />
    <div v-for="(session, index) in sessions" :key="index" class="session">
      <VTIcon v-if="session.deviceType === 'desktop'" class="session-icon" name="mdi:monitor" />
      <VTIcon
        v-else-if="session.deviceType === 'mobile'"
        class="session-icon"
        name="mdi:cellphone"
      />
      <div class="session-details">
        <div class="session-name">
          <span>{{ session.deviceName }}</span>
        </div>
        <div class="session-last-used">
          <span>Last used {{ session.lastUsed }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sessions {
  display: flex;
  padding: 0 10px;
  flex-direction: column;

  .session {
    background-color: var(--bgcolor-alt);
    padding: 12px 15px;
    margin: 0 0 15px 0;
    border-radius: 8px;
    display: flex;
    flex-direction: row;
    gap: 15px;

    .session-icon {
      font-size: 1rem;
      color: var(--theme-color);
      margin: auto 0;
    }

    .session-details {
      .session-name {
        font-weight: bold;
      }

      .session-last-used {
        font-size: 0.8rem;
        color: var(--text-color-alt);
      }
    }
  }
}
</style>
