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
        lastUsed: `${humanizeDateString(session.lastUsed)} ago`,
        current: session.current
      };
    })
    .sort((a, b) => {
      return dayjs(a.lastUsed).valueOf() - dayjs(b.lastUsed).valueOf();
    });
});

const humanizeDateString = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const dateMs = now.valueOf() - date.valueOf();
  return humanizeDuration(dateMs, { largest: 1 });
};

const editSession = (id: string) => {
  console.log(id);
};

const removeSession = (id: string) => {
  console.log(id);
};
</script>

<template>
  <div class="sessions">
    <SectionTitle :title="'Devices'" />
    <div
      v-for="(session, index) in sessions"
      :key="index"
      class="session"
      :class="{ current: session.current }"
    >
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
      <button class="session-edit" @click="editSession(session.id)">
        <VTIcon name="mdi:pencil" />
      </button>
      <button class="session-remove" @click="removeSession(session.id)">
        <VTIcon name="mdi:trash-can-outline" />
      </button>
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
    margin: 0 0 15px 0;
    border-radius: 8px;
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
    box-shadow: $low-shadow;

    &.current {
      border: solid 2px var(--theme-color);
      box-shadow: $medium-shadow;
    }

    .session-remove,
    .session-edit {
      all: unset;
      cursor: pointer;
      width: 40px;
      height: 40px;
      display: flex;
      position: relative;
      border-radius: 3px;

      .vt-icon {
        margin: auto;
        height: 1.3rem;
        width: 1.3rem;
      }
    }

    .session-edit {
      margin: auto 0 auto auto;
    }

    .session-remove {
      margin: auto 6px auto 0;
      color: var(--error-color-red);
    }

    .session-icon {
      font-size: 1rem;
      color: var(--theme-color);
      margin: auto 12px auto 12px;
    }

    .session-details {
      margin: 8px 0;

      .session-name {
        font-size: 0.9rem;
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
