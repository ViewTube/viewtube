<template>
  <div class="search">
    <vue-headful :title="`${searchQuery} - ViewTube`" />
    <Spinner class="centered" v-if="loading"></Spinner>
    <div v-if="!loading" class="search-videos-container" ref="scrollContainer">
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
  methods: {
    loadData: function (data) {
      this.searchQuery = this.$route.query.search_query
      this.results = data
      this.loading = false
      this.$Progress.finish()
      // Just don't ask, it doesn't work without it
      setTimeout(() => {
        this.$refs.scrollContainer.scrollTop = this.$route.meta.scrollHeight
      }, 0)
    },
    getListEntryType: function (type) {
      if (type === 'video') {
        return 'VideoEntry'
      } else if (type === 'playlist') {
        return 'PlaylistEntry'
      } else if (type === 'channel') {
        return 'ChannelEntry'
      }
    }
  },
  beforeRouteEnter: function (to, from, next) {
    let searchQuery = to.query.search_query
    if (searchQuery.length > 0) {
      fetch(`${Commons.apiUrl}search?q=${searchQuery}&page=1&type=all`, {
        cache: 'force-cache',
        method: 'GET'
      })
        .then(response => response.json())
        .then(data => {
          next(vm => vm.loadData(data))
        })
        .catch(error => {
          console.error(error)
          next(vm => vm.$Progress.fail())
        })
    } else {
      next('/')
    }
  },
  beforeRouteUpdate: function (to, from, next) {
    this.$Progress.start()
    let searchQuery = to.query.search_query
    if (searchQuery.length > 0) {
      fetch(`${Commons.apiUrl}search?q=${searchQuery}&page=1&type=all`, {
        cache: 'force-cache',
        method: 'GET'
      })
        .then(response => response.json())
        .then(data => {
          this.loadData(data)
          next()
        })
        .catch(error => {
          console.error(error)
          this.$Progress.fail()
          next()
        })
    } else {
      next('/')
    }
  },
  beforeRouteLeave(to, from, next) {
    from.meta.scrollHeight = this.$refs.scrollContainer.scrollTop
    next()
  }
}
</script>

<style lang="scss">
.search {
  .search-videos-container {
    width: 100%;
    height: 100%;
    max-width: $main-width;
    margin: 0 auto;
    z-index: 10;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly;

    @media screen and (max-width: $mobile-width) {
      flex-direction: row;
    }
  }
}
</style>
