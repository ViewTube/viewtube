<template>
  <div class="manage-subscriptions">
    <GradientBackground :color="'theme'" />
    <SectionTitle
      v-if="userAuthenticated"
      :title="'Subscriptions'"
      :link="'subscriptions'"
    />
    <div class="title-bar"></div>
  </div>
</template>

<script>
import GradientBackground from '@/components/GradientBackground'
import SectionTitle from '@/components/SectionTitle'

export default {
  name: 'ManageSubscriptions',
  components: {
    GradientBackground,
    SectionTitle
  },
  data() {
    return {
      subscriptionChannels: []
    }
  },
  mounted() {
    return this.$axios.get(`${Commons.getOwnApiUrl()}user/subscriptions/channels`, {
      withCredentials: true
    })
      .then((response) => {
        this.subscriptionChannels = response.data
        this.loading = false
      })
      .catch((error) => {
        console.error(error)
      })
  }
}
</script>

<style>
</style>