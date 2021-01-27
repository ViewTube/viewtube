<template>
  <div class="search">
    <Spinner v-if="$fetchState.pending" class="centered search-spinner" />
    <GradientBackground :color="'blue'" />
    <!-- <div class="filters">
      <Dropdown
        :values="parameters.defaults.sort_by"
        :value="parameters.sort_by"
        :label="'Sort by'"
        class="dropdown-btn"
        :no-default="false"
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
        :no-default="false"
        :label="'Type'"
        class="dropdown-btn"
        @valuechange="onSearchTypeChange"
      />
    </div> -->
    <p v-if="!$fetchState.pending && searchResults" class="result-amount">
      {{ searchResults.results.toLocaleString('en-US') }} results
    </p>
    <div v-if="isCorrectedSearchResult" class="correction-results links">
      <span>Showing results for</span>
      <nuxt-link :to="correctedSearchResultUrl">{{ searchResults.correctedQuery }}</nuxt-link>
    </div>
    <div v-if="!$fetchState.pending && searchResults" class="search-results">
      <div v-if="searchResults.refinements" class="search-refinements">
        <RelatedSearches :refinements="searchResults.refinements" />
      </div>
      <div class="search-videos-container">
        <component
          :is="getListEntryType(result.type)"
          v-for="(result, i) in searchResults.items"
          :key="i"
          :video="result"
          :channel="result"
          :playlist="result"
          :mix="result"
          :shelf="result"
          :horizontal="true"
          :lazy="true"
        />
      </div>
      <div class="show-more-btn-container">
        <BadgeButton :click="loadMoreVideos" :loading="moreVideosLoading">
          <LoadMoreIcon />
          <p>show more</p>
        </BadgeButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import LoadMoreIcon from 'vue-material-design-icons/Reload.vue';
import VideoEntry from '@/components/list/VideoEntry.vue';
import PlaylistEntry from '@/components/list/PlaylistEntry.vue';
import MixEntry from '@/components/list/MixEntry.vue';
import ChannelEntry from '@/components/list/ChannelEntry.vue';
import MovieEntry from '@/components/list/MovieEntry.vue';
import RelatedSearches from '@/components/search/RelatedSearches.vue';
import Shelf from '@/components/search/Shelf.vue';
import Spinner from '@/components/Spinner.vue';
import GradientBackground from '@/components/GradientBackground.vue';
import Dropdown from '@/components/filter/Dropdown.vue';
import SearchParams from '@/plugins/services/searchParams.ts';
import BadgeButton from '@/components/buttons/BadgeButton.vue';
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
    Shelf,
    MixEntry
  },
  data: () => ({
    searchResults: null,
    searchInformation: null,
    loading: false,
    searchQuery: null,
    page: 0,
    moreVideosLoading: false
  }),
  async fetch() {
    const inputQuery = this.$nuxt.context.query;
    const searchParams = new URLSearchParams(inputQuery);
    const apiUrl = this.$store.getters['environment/apiUrl'];
    const searchTerm = searchParams.get('search_query') || searchParams.get('q');
    await this.$axios
      .get(`${apiUrl}search`, {
        params: {
          q: searchTerm,
          pages: 1
        }
      })
      .then(response => {
        if (response && response.data) {
          this.searchResults = response.data;
          this.searchQuery = inputQuery.search_query;
        }
      })
      .catch(_ => {
        this.$store.dispatch('messages/createMessage', {
          type: 'error',
          title: 'Search failed',
          message: 'Try reloading the page'
        });
      });
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
  },
  computed: {
    isCorrectedSearchResult(): boolean {
      if (this.searchResults) {
        return this.searchResults.originalQuery !== this.searchResults.correctedQuery;
      }
      return false;
    },
    correctedSearchResultUrl(): string {
      if (this.searchResults) {
        const url = this.$nuxt.$route.fullPath;
        const newUrl = decodeURIComponent(url).replace(
          this.searchResults.originalQuery,
          this.searchResults.correctedQuery
        );
        return newUrl;
      }
      return this.$nuxt.$route.fullPath;
    }
  },
  watch: {
    '$route.query': '$fetch'
  },
  methods: {
    getListEntryType(type: string): string {
      switch (type) {
        case 'video':
          return 'VideoEntry';
        case 'playlist':
          return 'PlaylistEntry';
        case 'channel':
          return 'ChannelEntry';
        case 'mix':
          return 'MixEntry';
        case 'shelf':
          return 'Shelf';
        default:
          return null;
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
        .catch(_ => {
          this.$store.dispatch('messages/createMessage', {
            type: 'error',
            title: 'Unable to load more results',
            message: 'Try a different search term for more results'
          });
        });
    }
  }
});
</script>

<style lang="scss">
.search {
  display: flex;
  flex-direction: column;

  .search-spinner {
    z-index: 11;
  }

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

  .result-amount {
    margin: 10px auto 0 auto;
  }

  .correction-results,
  .result-amount {
    z-index: 10;
    width: 100%;
    max-width: $main-width;
    padding: 0 15px;
    box-sizing: border-box;
  }

  .correction-results {
    margin: 0 auto;
  }

  .search-results {
    .search-refinements {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: $main-width;
      margin: 0 auto 10px auto;
      padding: 0 15px;
      box-sizing: border-box;
    }
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
    @include viewtube-grid;

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
    .shelf {
      grid-column-start: 1;
      grid-column-end: -1;
    }
    .channel-entry {
      grid-column-start: 1;
      grid-column-end: -1;
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
