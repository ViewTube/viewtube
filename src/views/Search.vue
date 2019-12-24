<template>
  <div class="search" @scroll="$emit('scroll', $event)">
    <vue-headful :title="`${searchQuery} - ViewTube`" />
    <Spinner class="centered" v-if="loading"></Spinner>
    <GradientBackground :color="'blue'" />
    <div class="filters">
      <Dropdown
        :values="parameters.defaults.sort_by"
        :value="parameters.sort_by"
        :label="'Sort by'"
        class="dropdown-btn"
        @valuechange="onSearchSortChange"
      />
      <Dropdown
        :values="parameters.defaults.date"
        :value="parameters.date"
        :label="'Date'"
        :noDefault="true"
        class="dropdown-btn"
        @valuechange="onSearchDateChange"
      />
      <Dropdown
        :values="parameters.defaults.duration"
        :value="parameters.duration"
        :label="'Duration'"
        :noDefault="true"
        class="dropdown-btn"
        @valuechange="onSearchDurationChange"
      />
      <Dropdown
        :values="parameters.defaults.type"
        :value="parameters.type"
        :label="'Type'"
        class="dropdown-btn"
        @valuechange="onSearchTypeChange"
      />
    </div>
    <div v-if="!loading" class="search-videos-container">
      <component
        v-for="result in results"
        :is="getListEntryType(result.type)"
        :key="result.videoId"
        :video="result"
        :playlist="result"
        :channel="result"
      />
    </div>
    <BottomNavigation />
  </div>
</template>

<script>
import Commons from '@/commons.js'
import VideoEntry from '@/components/list/VideoEntry'
import PlaylistEntry from '@/components/list/PlaylistEntry'
import ChannelEntry from '@/components/list/ChannelEntry'
import Spinner from '@/components/Spinner'
import BottomNavigation from '@/components/BottomNavigation'
import GradientBackground from '@/components/GradientBackground.vue'
import Dropdown from '@/components/filter/Dropdown'
import SearchParams from '@/services/searchParams'

export default {
  name: 'search',
  components: {
    VideoEntry,
    Spinner,
    PlaylistEntry,
    ChannelEntry,
    BottomNavigation,
    GradientBackground,
    Dropdown
  },
  data: () => ({
    results: [],
    loading: true,
    searchQuery: 'loading',
    parameters: SearchParams
  }),
  methods: {
    loadData(data) {
      this.searchQuery = this.$route.query.search_query
      this.results = data
      this.loading = false
      this.$Progress.finish()
    },
    getListEntryType(type) {
      if (type === 'video') {
        return 'VideoEntry'
      } else if (type === 'playlist') {
        return 'PlaylistEntry'
      } else if (type === 'channel') {
        return 'ChannelEntry'
      }
    },
    reloadSearchWithParams() {
      let searchParams = SearchParams.getParamsString()
      this.$router.push(`/results?search_query=${this.searchQuery}${searchParams}`)
    },
    onSearchSortChange(element, index) {
      SearchParams.sort_by = element.value
      this.reloadSearchWithParams()
    },
    onSearchDateChange(element, index) {
      SearchParams.date = element.value
      this.reloadSearchWithParams()
    },
    onSearchDurationChange(element, index) {
      SearchParams.duration = element.value
      this.reloadSearchWithParams()
    },
    onSearchTypeChange(element, index) {
      SearchParams.type = element.value
      this.reloadSearchWithParams()
    }
  },
  beforeRouteEnter(to, from, next) {
    let searchQuery = to.query.search_query
    let searchParams = SearchParams.parseQuery(to.query)
    if (searchQuery.length > 0) {
      fetch(`${Commons.getApiUrl()}search?q=${searchQuery}&page=1${searchParams}`, {
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
  beforeRouteUpdate(to, from, next) {
    this.$Progress.start()
    let searchQuery = to.query.search_query
    let searchParams = SearchParams.parseQuery(to.query)
    if (searchQuery.length > 0) {
      fetch(`${Commons.getApiUrl()}search?q=${searchQuery}&page=1${searchParams}`, {
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
    next()
  }
}
</script>

<style lang="scss">
.search {
  overflow-y: scroll;
  overflow-x: hidden;
  perspective: 4px;
  perspective-origin: 0 0;
  display: flex;
  flex-direction: column;

  .filters {
    width: 100%;
    max-width: $main-width;
    padding: 10px 15px;
    margin: 0 auto;
    box-sizing: border-box;
    display: flex;

    .dropdown-btn {
      z-index: 20;
      margin: 0 10px 0 0;
    }
  }

  .search-videos-container {
    width: 100%;
    height: 100%;
    max-width: $main-width;
    margin: 0 auto;
    z-index: 10;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;

    @media screen and (max-width: $mobile-width) {
      flex-direction: row;
    }
  }
}
</style>
