<template>
  <div class="subscriptions">
    <GradientBackground :color="'green'" />
    <SectionTitle :title="'Subscriptions'">
      <div class="manage-btn-container">
        <BadgeButton
          class="manage-subscriptions-btn"
          :href="'subscriptions/manage'"
          :internalLink="true"
        >
          <EditIcon />
          <p>Manage</p>
        </BadgeButton>
      </div>
    </SectionTitle>
    <div class="subscription-videos-container">
      <VideoEntry
        v-for="video in videos"
        :key="video.videoId"
        :video="video"
      />
    </div>
    <BottomNavigation />
  </div>
</template>

<script>
import Commons from '@/plugins/commons.js'
import VideoEntry from '@/components/list/VideoEntry'
import BottomNavigation from '@/components/BottomNavigation'
import GradientBackground from '@/components/GradientBackground'
import SectionTitle from '@/components/SectionTitle'
import BadgeButton from '@/components/buttons/BadgeButton'
import EditIcon from 'vue-material-design-icons/PencilBoxMultipleOutline'

export default {
  name: 'Home',
  components: {
    VideoEntry,
    BottomNavigation,
    GradientBackground,
    SectionTitle,
    BadgeButton,
    EditIcon
  },
  data: () => ({
    videos: [],
    loading: true,
    commons: Commons
  }),
  mounted() {
    this.$axios.get(`${Commons.getOwnApiUrl()}user/subscriptions/videos`, {
      withCredentials: true
    })
      .then((response) => {
        console.log(response.data)
        this.videos = response.data
        this.loading = false
      })
      .catch((error) => {
        console.error(error)
      })
  }
}
</script>

<style lang="scss">
.subscriptions {
  overflow-y: scroll;
  overflow-x: hidden;
  height: 100%;

  .manage-btn-container {
    width: auto;
    position: absolute;
    right: 0;
    z-index: 11;
    height: 80px;
    display: grid;
    padding: 0 20px 0 0;

    .badge-btn {
      margin: auto;
    }
  }

  .subscription-videos-container {
    width: 100%;
    max-width: $main-width;
    margin: 0 auto;
    z-index: 10;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly;

    @media screen and (max-width: $mobile-width) {
      flex-direction: column;
    }
  }
}
</style>
