<template>
  <div>
    <GradientBackground :color="'theme'" />
    <SectionTitle v-if="userAuthenticated" :title="'Subscriptions'" :link="'subscriptions'" />
  </div>
</template>

<script>
import SectionTitle from '@/components/SectionTitle.vue';
import GradientBackground from '@/components/GradientBackground.vue';

export default {
  name: 'ThemeManager',
  components: {
    SectionTitle,
    GradientBackground
  }
};
</script>
