<script setup lang="ts">
const disableRegistration = ref(false);
</script>

<template>
  <div class="user-management">
    <ButtonsSwitchButton
      label="Disable registration"
      :value="disableRegistration"
      small-label="Disables registration. Users can only be created by the admin."
    />
  </div>
</template>

<style lang="scss" scoped>
.user-management {
  display: flex;
  margin: 0 0 15px 0;
}
</style>
