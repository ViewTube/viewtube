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
    <h3 class="under-construction">🚧 Search is currently unavailable</h3>
    <div v-for="(results, i) in searchResults" :key="i" class="search-videos-container">
      <!-- <SectionTitle v-if="page > 0" :title="`Page ${page}`" /> -->
      <div
        v-if="results.searchRefinements && results.searchRefinements.length"
        class="related-searches-container"
      >
        <RelatedSearches
          v-for="(item, index) in results.searchRefinements"
          :key="index"
          :data="item"
        />
      </div>
      <div v-if="results.channels && results.channels.length" class="channels">
        <ChannelEntry
          v-for="(channel, index) in results.channels"
          :key="index"
          :channel="channel"
        />
      </div>
      <VerticalShelf
        v-for="(item, index) in results.verticalShelf"
        :key="index"
        :class="item.shelfType"
        :data="item"
      />
      <div v-if="results.compactShelf && results.compactShelf.length" class="compact-shelf">
        <CompactShelf v-for="(item, index) in results.compactShelf" :key="index" :data="item" />
      </div>
      <div v-if="results.playlists && results.playlists.length" class="playlists-container">
        <SectionTitle :title="'Playlists'" />
        <div class="playlists">
          <PlaylistEntry v-for="(item, index) in results.playlists" :key="index" :playlist="item" />
        </div>
      </div>
      <SectionTitle v-if="results.movies && results.movies.length" :title="'Movies'" />
      <div v-if="results.movies && results.movies.length" class="movies">
        <MovieEntry v-for="(item, index) in results.movies" :key="index" :data="item" />
      </div>
      <SectionTitle
        v-if="
          !(
            (results.channels && results.channels.length) ||
            (results.verticalShelf && results.verticalShelf.length) ||
            (results.compactShelf && results.compactShelf.length) ||
            (results.playlists && results.playlists.length) ||
            (results.movies && results.movies.length)
          )
        "
        :title="`More videos`"
      />
      <div v-if="results.videos && results.videos.length" class="videos">
        <VideoEntry v-for="(video, index) in results.videos" :key="index" :video="video" />
      </div>
    </div>
    <div class="show-more-btn-container">
      <BadgeButton :click="loadMoreVideos" :loading="moreVideosLoading">
        <LoadMoreIcon />
        <p>show more</p>
      </BadgeButton>
    </div>
  </div>
</template>

<script lang="ts">
// import Commons from '@/plugins/commons.ts'
import LoadMoreIcon from 'vue-material-design-icons/Reload.vue';
import VideoEntry from '@/components/list/VideoEntry.vue';
import PlaylistEntry from '@/components/list/PlaylistEntry.vue';
import ChannelEntry from '@/components/list/ChannelEntry.vue';
import MovieEntry from '@/components/list/MovieEntry.vue';
import RelatedSearches from '@/components/search/RelatedSearches.vue';
import CompactShelf from '@/components/search/CompactShelf.vue';
import VerticalShelf from '@/components/search/VerticalShelf.vue';
import Spinner from '@/components/Spinner.vue';
import GradientBackground from '@/components/GradientBackground.vue';
import Dropdown from '@/components/filter/Dropdown.vue';
import SectionTitle from '@/components/SectionTitle.vue';
import SearchParams from '@/plugins/services/searchParams.ts';
import BadgeButton from '@/components/buttons/BadgeButton.vue';
// import Invidious from '@/plugins/services/invidious';
import Vue from 'vue';
import ViewTubeApi from '~/plugins/services/viewTubeApi.ts';

export default Vue.extend({
  name: 'Search',
  components: {
    LoadMoreIcon,
    VideoEntry,
    Spinner,
    PlaylistEntry,
    ChannelEntry,
    GradientBackground,
    Dropdown,
    BadgeButton,
    MovieEntry,
    RelatedSearches,
    CompactShelf,
    VerticalShelf,
    SectionTitle
  },
  watchQuery: true,
  async fetch() {
    const inputQuery = this.$nuxt.context.query;
    inputQuery.type = 'all';
    inputQuery.limit = 10;
    const searchParams = SearchParams.parseQueryJson(inputQuery, inputQuery.search_query);
    const viewTubeApi = new ViewTubeApi(this.$store.getters['environment/apiUrl']);
    await viewTubeApi.api
      .search({ params: searchParams })
      .then(response => {
        const results = [];
        results.push(response.data.items);
        delete response.data.items;
        this.searchResults = results;
        this.searchInformation = response.data;
        this.searchQuery = inputQuery.search_query;
      })
      .catch(error => {
        console.error(error);
      });
  },
  data: () => ({
    searchResults: null,
    searchInformation: null,
    loading: false,
    searchQuery: null,
    parameters: SearchParams,
    page: 0,
    moreVideosLoading: false
  }),
  methods: {
    getListEntryType(type: string): string {
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
      this.$fetch();
    },
    onSearchSortChange(element: any) {
      SearchParams.sort_by = element.value;
      this.reloadSearchWithParams();
    },
    onSearchDateChange(element: any) {
      SearchParams.date = element.value;
      this.reloadSearchWithParams();
    },
    onSearchDurationChange(element: any) {
      SearchParams.duration = element.value;
      this.reloadSearchWithParams();
    },
    onSearchTypeChange(element: any) {
      SearchParams.type = element.value;
      this.reloadSearchWithParams();
    },
    loadMoreVideos(): void {
      this.moreVideosLoading = true;
      this.page += 1;
      // SearchParams.page = this.page;
      const searchParams = SearchParams.getParamsJson(this.searchQuery);
      searchParams.nextpageRef = this.searchInformation.nextpageRef;
      const viewTubeApi = new ViewTubeApi(this.$store.getters['environment/apiUrl']);
      viewTubeApi.api
        .search({ params: searchParams })
        .then(response => {
          this.searchResults.push(response.data.items);
          this.searchInformation.nextpageRef = response.data.nextpageRef;
          this.moreVideosLoading = false;
        })
        .catch(error => {
          console.error(error);
        });
    }
  },
  head() {
    return {
      title: `${this.searchQuery ? this.searchQuery + ' :: ' : ''}Search :: ViewTube`,
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
});
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

  .under-construction {
    position: absolute;
    top: 30%;
    left: 50%;
    transform: translateX(-50%);
  }

  .search-videos-container {
    width: 100%;
    max-width: $main-width;
    margin: 0 auto;
    padding: 0 15px;
    z-index: 10;
    display: grid;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: 200px repeat(auto-fill, minmax(300px, 1fr));
    // grid-auto-rows: minmax(300px, auto);
    gap: 1em 2em;

    @media screen and (max-width: $mobile-width) {
      grid-template-columns: 1fr;

      > div {
        grid-column: unset !important;
      }
    }

    .section-title {
      grid-column: 1 / -1;
      gap: 0;
    }
    .related-searches-container {
      grid-row: 1;
      grid-column: 1 / -1;
    }
    .channels {
      height: 100%;
      grid-column: 1;
      position: sticky;
      top: 0;

      margin: 80px 0 0 0;

      .channel-entry {
        padding: 0;
      }
    }
    .vertical-shelf {
      &.channel {
        grid-column-start: 2;
      }

      &.general {
        grid-column-start: 1;
      }
      grid-column-end: -1;
    }
    .compact-shelf {
      grid-column: 1 / -1;
    }
    .playlists-container {
      grid-column: 1 / -1;

      .playlists {
        grid-column: 1 / -1;
        @include viewtube-grid;

        .playlist-entry {
          padding: 0;
        }
      }
    }
    .movies {
      grid-column: 1 / -1;
    }
    .videos {
      grid-column-start: 1;
      grid-column-end: -1;
      @include viewtube-grid;
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
