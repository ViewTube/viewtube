<template>
  <div class="search" :class="{ loading: $fetchState.pending }">
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
import {
  computed,
  defineComponent,
  ref,
  useFetch,
  useMeta,
  useRoute,
  watch
} from '@nuxtjs/composition-api';
import { useAccessor } from '~/store';
import { useAxios } from '~/plugins/axios';

export default defineComponent({
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
  setup() {
    const route = useRoute();
    const accessor = useAccessor();
    const axios = useAxios();

    const searchResults = ref(null);
    const resultItems = ref([]);
    const searchContinuation = ref(null);
    const filters = ref([]);
    const loading = ref(false);
    const searchQuery = ref(null);
    const page = ref(0);
    const moreVideosLoading = ref(false);

    const isCorrectedSearchResult = computed((): boolean => {
      if (searchResults.value) {
        return searchResults.value.originalQuery !== searchResults.value.correctedQuery;
      }
      return false;
    });
    const correctedSearchResultUrl = computed((): string => {
      if (searchResults.value) {
        const url = route.value.fullPath;
        const newUrl = decodeURIComponent(url).replace(
          searchResults.value.originalQuery,
          searchResults.value.correctedQuery
        );
        return newUrl;
      }
      return route.value.fullPath;
    });

    const getFilterArray = (searchParams: URLSearchParams): Array<any> => {
      const allParams = (searchParams as any).entries();
      const filtersArray = [];
      for (const param of allParams) {
        if (filters.value.find(el => el.filterType === param[0])) {
          filters.value.push({
            filterName: param[0],
            filterValue: param[1]
          });
        }
      }
      return filtersArray;
    };
    const getListEntryType = (type: string): string => {
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
    };
    const loadMoreVideos = async (): Promise<void> => {
      moreVideosLoading.value = true;
      page.value += 1;

      if (searchResults.value && searchResults.value.continuation) {
        const apiUrl = accessor.environment.apiUrl;
        await axios
          .get(`${apiUrl}search/continuation`, {
            params: {
              continuationData: searchContinuation.value
            }
          })
          .then((response: { data: any }) => {
            if (response && response.data) {
              resultItems.value = resultItems.value.concat(response.data.items);
              searchContinuation.value = response.data.continuation;
              moreVideosLoading.value = false;
            }
          })
          .catch((_: any) => {
            accessor.messages.createMessage({
              type: 'error',
              title: 'Unable to load more results',
              message: 'Try again or use a different search term for more results'
            });
            moreVideosLoading.value = false;
          });
      }
    };

    const { fetch } = useFetch(async () => {
      const inputQuery = route.value.query as any;
      const searchParams = new URLSearchParams(inputQuery);
      const apiUrl = accessor.environment.apiUrl;
      const searchTerm = searchParams.get('search_query') || searchParams.get('q');
      if (searchTerm) {
        try {
          const newFilters = await axios.get(`${apiUrl}search/filters`, {
            params: {
              q: searchTerm
            }
          });

          if (newFilters && newFilters.data && newFilters.data.length) {
            filters.value = newFilters.data;
            const filterArray = getFilterArray(searchParams);

            const searchResponse = await axios.get(`${apiUrl}search`, {
              params: {
                q: searchTerm,
                pages: 1,
                filters: filterArray
              }
            });

            if (searchResponse && searchResponse.data) {
              searchResults.value = searchResponse.data;
              resultItems.value = searchResponse.data.items;
              searchContinuation.value = searchResponse.data.continuation;
              searchQuery.value = inputQuery.search_query;
            }
          }
        } catch (_) {
          accessor.messages.createMessage({
            type: 'error',
            title: 'Search failed',
            message: 'Click to try again',
            dismissDelay: 0,
            clickAction: () => fetch()
          });
        }
      } else {
        accessor.messages.createMessage({
          type: 'error',
          title: 'Search term is empty',
          message: "Search term can't be empty",
          dismissDelay: 0
        });
      }
    });

    watch(
      () => route.value.query,
      () => {
        fetch();
      }
    );

    useMeta(() => ({
      title: `${searchQuery.value ? searchQuery.value + ' :: ' : ''}Search :: ViewTube`,
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
    }));

    return {
      searchResults,
      resultItems,
      searchContinuation,
      filters,
      loading,
      searchQuery,
      page,
      moreVideosLoading,
      isCorrectedSearchResult,
      correctedSearchResultUrl,
      getFilterArray,
      getListEntryType,
      loadMoreVideos
    };
  },
  head: {}
});
</script>

<style lang="scss">
.search {
  display: flex;
  flex-direction: column;

  &.loading {
    height: 100vh;
  }

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
