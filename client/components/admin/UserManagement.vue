<script setup lang="ts">
import { useMessagesStore } from '~/store/messages';

const { apiUrl } = useApiUrl();
const { vtFetch } = useVtFetch();
const messagesStore = useMessagesStore();

const { data, refresh } = useGetServerSettings();

const onRegistrationEnabledChange = async (value: boolean) => {
  await vtFetch(`${apiUrl.value}admin/server-settings`, {
    method: 'POST',
    body: {
      registrationEnabled: value
    }
  });
  await refresh();
  await nextTick();
  messagesStore.createMessage({
    type: 'info',
    title: 'Server settings updated',
    message: `Public registration ${value ? 'enabled' : 'disabled'}`
  });
};
</script>

<template>
  <div v-if="data" class="user-management">
    <ButtonsSwitchButton
      label="Enable public registration"
      :value="data.registrationEnabled"
      small-label="Anyone can create an account."
      small-label-negative="Accounts can only be created by the admin."
      @valuechange="onRegistrationEnabledChange"
    />
  </div>
  <Spinner v-if="!data" />
</template>

<style lang="scss" scoped>
.user-management {
  display: flex;
  margin: 0 0 15px 0;
}
</style>
