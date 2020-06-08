<template>
  <div class="search">
    <Spinner
      class="centered"
      v-if="loading"
    ></Spinner>
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
    <div
      v-if="!loading"
      class="search-videos-container"
    >
      <component
        v-for="result in results"
        :is="getListEntryType(result.type)"
        :key="result.videoId"
        :video="result"
        :playlist="result"
        :channel="result"
      />
    </div>
    <div class="show-more-btn-container">
      <BadgeButton
        :click="loadMoreVideos"
        :loading="moreVideosLoading"
      >
        <LoadMoreIcon />
        <p>show more</p>
      </BadgeButton>
    </div>
  </div>
</template>

<script>
// import Commons from '@/plugins/commons.js'
import LoadMoreIcon from 'vue-material-design-icons/Reload'
import VideoEntry from '@/components/list/VideoEntry'
import PlaylistEntry from '@/components/list/PlaylistEntry'
import ChannelEntry from '@/components/list/ChannelEntry'
import Spinner from '@/components/Spinner'
import BottomNavigation from '@/components/BottomNavigation'
import GradientBackground from '@/components/GradientBackground.vue'
import Dropdown from '@/components/filter/Dropdown'
import SearchParams from '@/plugins/services/searchParams'
import Invidious from '@/plugins/services/invidious'
import BadgeButton from '@/components/buttons/BadgeButton'

export default {
  name: 'search',
  components: {
    LoadMoreIcon,
    VideoEntry,
    Spinner,
    PlaylistEntry,
    ChannelEntry,
    BottomNavigation,
    GradientBackground,
    Dropdown,
    BadgeButton
  },
  watchQuery: true,
  data: () => ({
    results: [],
    loading: false,
    searchQuery: null,
    parameters: SearchParams,
    page: 1,
    moreVideosLoading: false
  }),
  methods: {
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
      const searchParams = SearchParams.getParamsString()
      this.$router.push(
        `/results?search_query=${this.searchQuery}${searchParams}`
      )
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
    },
    loadMoreVideos() {
      this.moreVideosLoading = true
      const me = this
      this.page += 1
      SearchParams.page = this.page
      const searchParams = SearchParams.getParamsJson(this.searchQuery)
      Invidious.api.search({ params: searchParams })
        .then(response => {
          me.results = me.results.concat(response.data)
          me.moreVideosLoading = false
        })
        .catch(error => {
          console.error(error)
        })
    }
  },
  asyncData({ query }) {
    query.type = 'all'
    const searchParams = SearchParams.parseQueryJson(query, query.search_query)
    return Invidious.api.search({ params: searchParams })
      .then(response => {
        return { results: response.data, searchQuery: query.search_query }
      })
      .catch(error => {
        console.error(error)
      })
  }
}
</script>

<style lang="scss">
.search {
  overflow-y: scroll;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;

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

  .show-more-btn-container {
    display: flex;
    width: 100%;
    padding: 0 0 20px 0;

    > a {
      margin: 0 auto;
    }
  }
}
</style>
