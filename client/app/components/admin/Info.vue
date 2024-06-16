<script setup lang="ts">
import BadgeButton from '~/components/buttons/BadgeButton.vue';
const { data, refresh, pending } = useGetAdminInfo();
</script>

<template>
  <div class="info">
    <Spinner v-if="!data || pending" />
    <div v-for="(ip, key, index) in data" :key="index" class="ip-info">{{ key }}: {{ ip }}</div>
    <div class="refresh-btn-container">
      <BadgeButton v-if="data" class="refresh-btn" :click="refresh">Refresh</BadgeButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.info {
  display: flex;
  flex-direction: column;
  position: relative;

  .refresh-btn-container {
    position: absolute;
    display: flex;
    right: 0;

    .refresh-btn {
      margin: 0 0 0 auto;
    }
  }
}
</style>
