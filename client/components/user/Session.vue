<script setup lang="ts">
import humanizeDuration from 'humanize-duration';
import { ApiDto } from '@/utils/shared';

const props = defineProps<{
  session: ApiDto<'SessionDto'>;
}>();

const { currentTheme } = useCurrentTheme();

const darknessInverted = computed(() => {
  const darknessMatch = currentTheme.value.darkness.match(/invert\((\d*)%\)/i);
  return `invert(${Math.abs(parseInt(darknessMatch?.[1]) - 100)}%)`;
});

const lastUsed = computed(() => humanizeDateString(props.session.lastUsed));
const expires = computed(() => humanizeDateString(props.session.expires));

const humanizeDateString = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const dateMs = now.valueOf() - date.valueOf();
  return humanizeDuration(dateMs, { largest: 1, round: true });
};

const editSession = (id: string) => {
  console.log(id);
};

const removalPrompt = ref(false);
const removeSession = (id: string) => {
  removalPrompt.value = true;
};
const cancelRemoveSession = () => {
  removalPrompt.value = false;
};

const confirmRemoveSession = (id: string) => {
  console.log(id);
};
</script>

<template>
  <div class="session" :class="{ current: session.current }">
    <div class="removal-prompt" :class="{ visible: removalPrompt }">
      <div class="prompt-text">
        <span>Remove session and log out this device?</span>
      </div>
      <div class="prompt-actions">
        <button class="prompt-confirm" @click="confirmRemoveSession(session.id)">
          <VTIcon name="mdi:check" />
        </button>
        <button class="prompt-cancel" @click="cancelRemoveSession">
          <VTIcon name="mdi:close" />
        </button>
      </div>
    </div>
    <VTIcon v-if="session.deviceType === 'desktop'" class="session-icon" name="mdi:monitor" />
    <VTIcon v-else-if="session.deviceType === 'mobile'" class="session-icon" name="mdi:cellphone" />
    <div class="session-details">
      <div class="session-name">
        <span>{{ session.deviceName }}</span>
      </div>
      <div class="session-last-used">
        <span>Last used {{ lastUsed }} ago · Expires in {{ expires }}</span>
      </div>
    </div>
    <button class="session-edit" @click="editSession(session.id)">
      <VTIcon name="mdi:pencil" />
    </button>
    <button class="session-remove" @click="removeSession(session.id)">
      <VTIcon name="mdi:trash-can-outline" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.session {
  background-color: var(--bgcolor-alt);
  margin: 0 0 15px 0;
  border-radius: 8px;
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  box-shadow: $low-shadow;
  position: relative;
  overflow: hidden;

  .removal-prompt {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: var(--error-color-red);
    z-index: 10;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    padding: 0 6px 0 15px;
    transition: clip-path 300ms $intro-easing;
    clip-path: circle(0% at calc(100% - 28px) 50%);

    &.visible {
      clip-path: circle(150% at 100% 0%);
    }

    .prompt-text {
      font-size: 0.9rem;
      color: var(--text-color);
      filter: v-bind(darknessInverted);
    }

    .prompt-actions {
      display: flex;

      .prompt-confirm,
      .prompt-cancel {
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
          color: var(--text-color);
          filter: v-bind(darknessInverted);
        }
      }
    }
  }

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
</style>
