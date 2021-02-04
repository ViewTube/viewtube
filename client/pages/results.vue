<template>
  <div class="search">
    <Spinner v-if="$fetchState.pending" class="centered search-spinner" />
    <GradientBackground :color="'blue'" />
    <Filters v-if="filters && filters.length" :filters="filters" />
    <p v-if="!$fetchState.pending && searchResults" class="result-amount">
      {{ searchResults.results.toLocaleString('en-US') }} results
    </p>
    <div v-if="isCorrectedSearchResult" class="correction-results links">
      <span>Showing results for</span>
      <nuxt-link :to="correctedSearchResultUrl">{{ searchResults.correctedQuery }}</nuxt-link>
    </div>
    <div v-if="!$fetchState.pending && searchResults" class="search-results">
      <div
        v-if="searchResults.refinements && searchResults.refinements.length"
        class="search-refinements"
      >
        <RelatedSearches :refinements="searchResults.refinements" />
      </div>
      <div class="search-videos-container">
        <component
          :is="getListEntryType(result.type)"
          v-for="(result, i) in resultItems"
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
import BadgeButton from '@/components/buttons/BadgeButton.vue';
import Filters from '@/components/search/Filters.vue';
import Vue from 'vue';

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
    MixEntry,
    Filters
  },
  data: () => ({
    searchResults: null,
    resultItems: [],
    searchContinuation: null,
    filters: [],
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
    try {
      const filters = await this.$axios.get(`${apiUrl}search/filters`, {
        params: {
          q: searchTerm
        }
      });

      if (filters && filters.data && filters.data.length) {
        this.filters = filters.data;
        const filterArray = this.getFilterArray(searchParams);

        const searchResponse = await this.$axios.get(`${apiUrl}search`, {
          params: {
            q: searchTerm,
            pages: 1,
            filters: filterArray
          }
        });

        if (searchResponse && searchResponse.data) {
          this.searchResults = searchResponse.data;
          this.resultItems = searchResponse.data.items;
          this.searchContinuation = searchResponse.data.continuation;
          this.searchQuery = inputQuery.search_query;
        }
      }
    } catch (_) {
      this.$store.dispatch('messages/createMessage', {
        type: 'error',
        title: 'Search failed',
        message: 'Try reloading the page'
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
    getFilterArray(searchParams: URLSearchParams): Array<any> {
      const allParams = (searchParams as any).entries();
      const filters = [];
      for (const param of allParams) {
        if (this.filters.find(el => el.filterType === param[0])) {
          filters.push({
            filterName: param[0],
            filterValue: param[1]
          });
        }
      }
      return filters;
    },
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
    async loadMoreVideos(): Promise<void> {
      this.moreVideosLoading = true;
      this.page += 1;

      if (this.searchResults && this.searchResults.continuation) {
        const apiUrl = this.$store.getters['environment/apiUrl'];
        await this.$axios
          .get(`${apiUrl}search/continuation`, {
            params: {
              continuationData: this.searchContinuation
            }
          })
          .then((response: { data: any }) => {
            if (response && response.data) {
              this.resultItems = this.resultItems.concat(response.data.items);
              this.searchContinuation = response.data.continuation;
              this.moreVideosLoading = false;
            }
          })
          .catch((_: any) => {
            this.$store.dispatch('messages/createMessage', {
              type: 'error',
              title: 'Unable to load more results',
              message: 'Try again or use a different search term for more results'
            });
            this.moreVideosLoading = false;
          });
      }
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
    padding: 15px 15px 0 15px;
    margin: 0 auto;
    box-sizing: border-box;
    display: flex;

    .dropdown-btn {
      z-index: 20;
      margin: 0 10px 0 0;
    }
  }

  .result-amount {
    margin: 15px auto;
    color: var(--subtitle-color);
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
