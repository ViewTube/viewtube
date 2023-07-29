<template>
  <div class="search" :class="{ loading: pending }">
    <MetaPageHead :title="searchQuery" description="Search for videos, channels and playlists" />
    <Spinner v-if="pending" class="centered search-spinner" />
    <Filters
      v-if="searchData?.filters && searchData?.filters.length"
      :filters="searchData?.filters"
    />
    <p v-if="!pending && searchData?.searchResults" class="result-amount">
      {{ searchData?.searchResults?.results?.toLocaleString('en-US') }} results
    </p>
    <div v-if="isCorrectedSearchResult" class="correction-results links">
      <span>Showing results for </span>
      <nuxt-link :to="correctedSearchResultUrl">{{
        searchData?.searchResults.correctedQuery
      }}</nuxt-link>
    </div>
    <div v-if="!pending && searchData?.searchResults" class="search-results">
      <div
        v-if="searchData?.searchResults.refinements && searchData?.searchResults.refinements.length"
        class="search-refinements"
      >
        <RelatedSearches :refinements="searchData?.searchResults.refinements" />
      </div>
      <div v-if="!pending && searchData?.searchResults.items" class="search-videos-container">
        <component
          :is="getListEntryType(result.type)"
          v-for="(result, i) in searchData?.searchResults.items"
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
      <SeparatorSmall v-if="!pending && additionalResultItems.length > 0"
        >More results</SeparatorSmall
      >
      <div v-if="!pending && additionalResultItems.length > 0" class="search-videos-container">
        <component
          :is="getListEntryType(result.type)"
          v-for="(result, i) in additionalResultItems"
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
          <VTIcon name="mdi:reload" />
          <p>Show more</p>
        </BadgeButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import VideoEntry from '@/components/list/VideoEntry.vue';
import PlaylistEntry from '@/components/list/PlaylistEntry.vue';
import MixEntry from '@/components/list/MixEntry.vue';
import ChannelEntry from '@/components/list/ChannelEntry.vue';
import MovieEntry from '@/components/list/MovieEntry.vue';
import RelatedSearches from '@/components/search/RelatedSearches.vue';
import Shelf from '@/components/search/Shelf.vue';
import Spinner from '@/components/Spinner.vue';
import Dropdown from '@/components/filter/Dropdown.vue';
import BadgeButton from '@/components/buttons/BadgeButton.vue';
import Filters from '@/components/search/Filters.vue';
import SeparatorSmall from '@/components/list/SeparatorSmall.vue';
import { useMessagesStore } from '@/store/messages';
import ytsr from 'ytsr';

export default defineComponent({
  name: 'Search',
  components: {
    VideoEntry,
    Spinner,
    PlaylistEntry,
    ChannelEntry,
    Dropdown,
    BadgeButton,
    MovieEntry,
    RelatedSearches,
    Shelf,
    MixEntry,
    Filters,
    SeparatorSmall
  },
  setup() {
    const route = useRoute();
    const messagesStore = useMessagesStore();

    const loading = ref(false);
    const searchQuery = computed(() => {
      const searchParams = new URLSearchParams(route.query as Record<string, string>);
      return searchParams.get('search_query') || searchParams.get('q');
    });
    const page = ref(0);
    const moreVideosLoading = ref(false);
    const { apiUrl } = useApiUrl();

    const { data: searchData, pending, error } = useGetSearchResult();

    const additionalResultItems = ref<ytsr.Item[]>([]);
    const searchContinuationData = ref<any>(searchData.value?.searchResults.continuation);

    watch(
      () => searchData.value,
      newData => {
        additionalResultItems.value = [];
        searchContinuationData.value = newData?.searchResults.continuation;
      }
    );

    watch(error, newValue => {
      if (newValue) {
        messagesStore.createMessage({
          type: 'error',
          title: 'Search failed',
          message: 'Refresh the page to try again',
          dismissDelay: 0
        });
      }
    });

    const isCorrectedSearchResult = computed((): boolean => {
      if (searchData.value?.searchResults) {
        return (
          searchData.value?.searchResults.originalQuery !==
          searchData.value?.searchResults.correctedQuery
        );
      }
      return false;
    });

    const correctedSearchResultUrl = computed((): string => {
      if (searchData.value?.searchResults) {
        const url = route.fullPath;
        const newUrl = decodeURIComponent(url).replace(
          searchData.value?.searchResults.originalQuery,
          searchData.value?.searchResults.correctedQuery
        );
        return newUrl;
      }
      return route.fullPath;
    });

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

    const loadMoreVideos = async () => {
      moreVideosLoading.value = true;
      page.value += 1;

      if (searchData.value?.searchResults && searchContinuationData.value) {
        try {
          const searchContinuation = await vtFetch<ytsr.ContinueResult>(
            `${apiUrl.value}search/continuation`,
            {
              method: 'POST',
              body: {
                continuationData: searchContinuationData.value
              }
            }
          );

          if (searchContinuation) {
            additionalResultItems.value = [
              ...additionalResultItems.value,
              ...searchContinuation.items
            ];
            searchContinuationData.value = searchContinuation.continuation;
          }
        } catch (error) {
          messagesStore.createMessage({
            type: 'error',
            title: 'Unable to load more results',
            message: 'Try again or use a different search term for more results'
          });
        }
      } else {
        messagesStore.createMessage({
          type: 'error',
          title: 'Unable to load more results',
          message: 'Use a different search term for more results'
        });
      }
      moreVideosLoading.value = false;
    };

    return {
      searchData,
      loading,
      searchQuery,
      page,
      moreVideosLoading,
      isCorrectedSearchResult,
      correctedSearchResultUrl,
      loadMoreVideos,
      getListEntryType,
      pending,
      additionalResultItems
    };
  },
  head: {}
});
</script>

<style lang="scss">
.search {
  margin-top: $header-height;
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
    margin: 10px auto;
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
    margin: 0 auto 10px auto;
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
