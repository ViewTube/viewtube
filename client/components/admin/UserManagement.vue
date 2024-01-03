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
    message: `Public registration ${
      value ? 'enabled' : 'disabled'
    }. Restart the server for the changes to take effect.`
  });
};

const onRequireLoginEverywhereChange = async (value: boolean) => {
  await vtFetch(`${apiUrl.value}admin/server-settings`, {
    method: 'POST',
    body: {
      requireLoginEverywhere: value
    }
  });
  await refresh();
  await nextTick();
  messagesStore.createMessage({
    type: 'info',
    title: 'Server settings updated',
    message: `Require login everywhere ${
      value ? 'enabled' : 'disabled'
    }. Restart the server for the changes to take effect.`
  });
};
</script>

<template>
  <div v-if="data" class="user-management">
    <ButtonsSwitchButton
      label="Enable public registration (restart required)"
      :value="data.registrationEnabled"
      small-label="Anyone can create an account"
      small-label-negative="Accounts can only be created by the admin"
      @valuechange="onRegistrationEnabledChange"
    />
    <ButtonsSwitchButton
      label="Require login everywhere (restart required)"
      :value="data.requireLoginEverywhere"
      small-label="Users must be logged in to access the site"
      small-label-negative="Users can access the site without being logged in"
      @valuechange="onRequireLoginEverywhereChange"
    />
  </div>
  <Spinner v-if="!data" />
</template>

<style lang="scss" scoped>
.user-management {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 0 0 15px 0;
}
</style>
