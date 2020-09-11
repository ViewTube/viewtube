<template>
  <div class="search">
    <Spinner v-if="loading" class="centered" />
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
        :no-default="true"
        class="dropdown-btn"
        @valuechange="onSearchDateChange"
      />
      <Dropdown
        :values="parameters.defaults.duration"
        :value="parameters.duration"
        :label="'Duration'"
        :no-default="true"
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
    <div v-if="searchResults && searchResults.items" class="search-videos-container">
      <component
        :is="getListEntryType(result.type)"
        v-for="result in searchResults.items"
        :key="result.videoId"
        :video="result"
        :playlist="result"
        :channel="result"
        :data="result"
      />
    </div>
    <div class="show-more-btn-container">
      <BadgeButton :click="loadMoreVideos" :loading="moreVideosLoading">
        <LoadMoreIcon />
        <p>show more</p>
      </BadgeButton>
    </div>
  </div>
</template>

<script>
// import Commons from '@/plugins/commons.js'
import LoadMoreIcon from 'vue-material-design-icons/Reload';
import VideoEntry from '@/components/list/VideoEntry';
import PlaylistEntry from '@/components/list/PlaylistEntry';
import ChannelEntry from '@/components/list/ChannelEntry';
import MovieEntry from '@/components/list/MovieEntry';
import RelatedSearches from '@/components/search/RelatedSearches';
import CompactShelf from '@/components/search/CompactShelf';
import VerticalShelf from '@/components/search/VerticalShelf';
import Spinner from '@/components/Spinner';
import BottomNavigation from '@/components/BottomNavigation';
import GradientBackground from '@/components/GradientBackground.vue';
import Dropdown from '@/components/filter/Dropdown';
import SearchParams from '@/plugins/services/searchParams';
import BadgeButton from '@/components/buttons/BadgeButton';
// import Invidious from '@/plugins/services/invidious';
import ViewtubeApi from '~/plugins/services/viewtubeApi';

export default {
  name: 'Search',
  components: {
    LoadMoreIcon,
    VideoEntry,
    Spinner,
    PlaylistEntry,
    ChannelEntry,
    BottomNavigation,
    GradientBackground,
    Dropdown,
    BadgeButton,
    MovieEntry,
    RelatedSearches,
    CompactShelf,
    VerticalShelf
  },
  watchQuery: true,
  asyncData({ query }) {
    query.type = 'all';
    query.limit = 10;
    const searchParams = SearchParams.parseQueryJson(query, query.search_query);
    return ViewtubeApi.api
      .search({ params: searchParams })
      .then(response => {
        return {
          searchResults: response.data,
          searchQuery: query.search_query
        };
      })
      .catch(error => {
        console.error(error);
      });
  },
  data: () => ({
    searchResults: null,
    loading: false,
    searchQuery: null,
    parameters: SearchParams,
    page: 1,
    moreVideosLoading: false
  }),
  methods: {
    getListEntryType(type) {
      switch (type) {
        case 'video':
          return 'VideoEntry';
        case 'playlist':
          return 'PlaylistEntry';
        case 'channel':
          return 'ChannelEntry';
        // case 'mix':
        //   return 'MixEntry';
        case 'movie':
          return 'MovieEntry';
        case 'search-refinements':
          return 'RelatedSearches';
        case 'shelf-compact':
          return 'CompactShelf';
        case 'shelf-vertical':
          return 'VerticalShelf';
      }
    },
    reloadSearchWithParams() {
      const searchParams = SearchParams.getParamsString();
      this.$router.push(`/results?search_query=${this.searchQuery}${searchParams}`);
    },
    onSearchSortChange(element, index) {
      SearchParams.sort_by = element.value;
      this.reloadSearchWithParams();
    },
    onSearchDateChange(element, index) {
      SearchParams.date = element.value;
      this.reloadSearchWithParams();
    },
    onSearchDurationChange(element, index) {
      SearchParams.duration = element.value;
      this.reloadSearchWithParams();
    },
    onSearchTypeChange(element, index) {
      SearchParams.type = element.value;
      this.reloadSearchWithParams();
    },
    loadMoreVideos() {
      this.moreVideosLoading = true;
      // this.page += 1;
      // SearchParams.page = this.page;
      const searchParams = SearchParams.getParamsJson(this.searchQuery);
      searchParams.nextpageRef = this.searchResults.nextpageRef;
      ViewtubeApi.api
        .search({ params: searchParams })
        .then(response => {
          this.searchResults.items = this.searchResults.items.concat(response.data.items);
          this.searchResults.nextpageRef = response.data.nextpageRef;
          this.moreVideosLoading = false;
        })
        .catch(error => {
          console.error(error);
        });
    }
  },
  head() {
    return {
      title: `${this.searchQuery ? this.searchQuery + ' - ' : ''}Search - ViewTube`,
      meta: [
        {
          hid: 'description',
          vmid: 'descriptionMeta',
          name: 'description',
          content: 'Search for videos, channels and playlists'
        },
        {
          hid: 'ogTitle',
          property: 'og:title',
          content: 'Search - ViewTube'
        },
        {
          hid: 'ogDescription',
          property: 'og:description',
          content: 'Search for videos, channels and playlists'
        }
      ]
    };
  }
};
</script>

<style lang="scss">
.search {
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
    max-width: $main-width;
    margin: 0 auto;
    z-index: 10;
    display: flex;

    .channel-entry {
      grid-column: 1;
      grid-row: 1;
      grid-row-start: 1;
      grid-row-end: span auto;
      justify-self: right;
    }

    .video-entry {
    }

    // @media screen and (max-width: 1400px) {
    //   width: 130%;
    //   left: calc(100vw - 115%);
    // }

    // @media screen and (max-width: 700px) {
    //   width: 160%;
    //   left: calc(100vw - 130%);
    // }

    // @media screen and (max-width: 500px) {
    //   width: 190%;
    //   left: calc(100vw - 145%);
    // }

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
