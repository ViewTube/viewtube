<template>
  <div class="search">
    <vue-headful :title="`${searchQuery} - ViewTube`" />
    <Spinner class="centered" v-if="loading"></Spinner>
    <div class="search-videos-container">
      <component
        v-for="result in results"
        :is="getListEntryType(result.type)"
        :key="result.videoId"
        :video="result"
        :playlist="result"
        :channel="result"
      ></component>
    </div>
  </div>
</template>

<script>
import Commons from '@/commons.js'
import VideoEntry from '@/components/list/VideoEntry'
import PlaylistEntry from '@/components/list/PlaylistEntry'
import ChannelEntry from '@/components/list/ChannelEntry'
import Spinner from '@/components/Spinner'

export default {
  name: 'search',
  components: {
    VideoEntry,
    Spinner,
    PlaylistEntry,
    ChannelEntry
  },
  data: function () {
    return {
      results: [],
      loading: true,
      searchQuery: 'loading'
    }
  },
  mounted: function () {
    this.searchQuery = this.$route.query.search_query
    fetch(`${Commons.apiUrl}search?q=${this.searchQuery}&page=1&type=all`)
      .then(response => response.json())
      .then(data => {
        this.results = data
        this.loading = false
      })
      .catch((error) => {
        console.error(error)
      })
  },
  methods: {
    getListEntryType: function (type) {
      if (type === 'video') {
        return 'VideoEntry'
      } else if (type === 'playlist') {
        return 'PlaylistEntry'
      } else if (type === 'channel') {
        return 'ChannelEntry'
      }
    }
  }
}
</script>

<style lang="scss">
.search {
  .search-videos-container {
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
