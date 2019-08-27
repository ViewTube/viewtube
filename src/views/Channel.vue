<template>
  <div class="home">
    <vue-headful v-bind:title="channel.author + ' - ViewTube'" />
    <Spinner class="centered" v-if="loading"></Spinner>
    <div class="channel-banner" v-if="!loading">
      <div class="channel-banner-image">
        <clazy-load class="banner-image-loader" v-bind:src="channel.authorBanners[0].url">
          <img class="banner-image" v-bind:src="channel.authorBanners[0].url" />
          <img
            class="banner-placeholder"
            slot="placeholder"
            v-bind:src="channel.authorBanners[3].url"
          />
        </clazy-load>
      </div>
    </div>
    <div class="channel-information" v-if="!loading">
      <div class="channel-title">
        <div class="channel-thumbnail">
          <img v-bind:src="channel.authorThumbnails[0].url" alt="Author Image" />
        </div>
        <div class="channel-basics">
          <div class="channel-name">
            <h1>{{ channel.author }}</h1>
          </div>
          <div class="channel-subcount">
            <h2>{{ channel.subCount.toLocaleString() }} subscribers</h2>
          </div>
          <div class="channel-totalviews">
            <h2>{{ channel.totalViews.toLocaleString() }} total views</h2>
          </div>
          <div class="channel-joined-on">
            <h2>joined {{ getFormattedDate(new Date(channel.joined*1000)) }}</h2>
          </div>
          <div class="channel-family-friendly" v-if="channel.isFamilyFriendly">
            <FamilyFriendly />family friendly
          </div>
          <div class="channel-paid" v-if="channel.paid">
            <Paid />paid
          </div>
        </div>
        <div class="channel-description" v-html="channel.descriptionHtml"></div>
        <div class="related-channels">
          <div
            class="related-channel"
            v-for="channelEntry in channel.relatedChannels"
            v-bind:key="channelEntry.authorId"
          >
            <div class="related-channel-thumbnail">
              <router-link
                class="related-channel-thumbnail-image"
                :to="{path: '/channel/' + channelEntry.authorId}"
              >
                <img v-bind:src="channelEntry.authorThumbnails[0].url" alt />
              </router-link>
            </div>
            <div class="related-channel-info">
              <router-link
                class="related-channel-title"
                :to="{path: '/channel/' + channelEntry.authorId}"
              >{{ channelEntry.author }}</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="channel-videos-container" v-if="!loading">
      <VideoEntry
        v-for="video in channel.latestVideos"
        v-bind:key="video.videoId"
        v-bind:video="video"
      ></VideoEntry>
    </div>
  </div>
</template>

<script>
import Commons from '@/commons.js'
import VideoEntry from '@/components/VideoEntry'
import Spinner from '@/components/Spinner'
import FamilyFriendly from 'vue-material-design-icons/AccountChild'
import Paid from 'vue-material-design-icons/CurrencyUsd'

export default {
  name: 'home',
  components: {
    VideoEntry,
    Spinner,
    FamilyFriendly,
    Paid
  },
  data: function () {
    return {
      channel: [],
      loading: true
    }
  },
  methods: {
    getFormattedDate: rawDate => {
      let date = new Date(rawDate)
      return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`
    },
    loadChannelData: function () {
      fetch(`${Commons.apiUrl}channels/${this.$route.params.id}`)
        .then(response => response.json())
        .then(data => {
          this.channel = data
          this.loading = false
        })
        .catch((error) => {
          return error
        })
    }
  },
  watch: {
    '$route' (to, from) {
      this.loading = true
      this.loadChannelData()
    }
  },
  mounted: function () {
    this.loadChannelData()
  }
}
</script>

<style lang="scss">
.home {
  .home-videos-container {
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
