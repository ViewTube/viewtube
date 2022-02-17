<template>
  <div class="history">
    <SectionTitle class="history-title" :title="'History'" />
    <SmallSearchBox v-model="searchTerm" :label="'Filter'" />
    <details class="delete-history">
      <summary>Delete history</summary>
      <div class="range">
        <client-only><DatePicker v-model="dateToDelete" range /></client-only>
        <BadgeButton :click="deleteRange" :disabled="!rangeSelected">Delete range</BadgeButton>
        <BadgeButton :click="() => (deletePopup = true)">Delete entire history</BadgeButton>
      </div>
    </details>
    <div v-if="history && !$accessor.settings.saveVideoHistory" class="no-history">
      <RestartOffIcon />
      <p>Video history is disabled. You can enable it in settings.</p>
    </div>
    <HistoryList
      class="history-main-list"
      :history="history"
      :deleteOption="true"
      @refresh="$fetch"
    />
    <div class="history-pagination">
      <Pagination :currentPage="currentPage" :pageCount="pageCount" />
    </div>
    <portal to="popup">
      <transition name="popup">
        <Confirmation
          v-if="deletePopup"
          :title="'Delete history'"
          :message="'Do you want to delete your entire history?'"
          @close="() => (deletePopup = false)"
        >
          <BadgeButton :click="() => (deletePopup = false)">Cancel</BadgeButton>
          <BadgeButton :click="() => deleteEntireHistory()">OK</BadgeButton>
        </Confirmation>
      </transition>
    </portal>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  useFetch,
  useMeta,
  useRoute,
  useRouter,
  watch
} from '#imports';
import { useNuxtApp } from '#app';
import RestartOffIcon from 'vue-material-design-icons/RestartOff.vue';
import SectionTitle from '@/components/SectionTitle.vue';
import Pagination from '@/components/pagination/Pagination.vue';
import HistoryList from '@/components/history/HistoryList.vue';
import { useAccessor } from '@/store';
import BadgeButton from '@/components/buttons/BadgeButton.vue';
import SmallSearchBox from '@/components/SmallSearchBox.vue';
import Confirmation from '@/components/popup/Confirmation.vue';

export default defineComponent({
  name: 'History',
  components: {
    SectionTitle,
    HistoryList,
    Pagination,
    BadgeButton,
    SmallSearchBox,
    Confirmation,
    RestartOffIcon
  },
  setup() {
    const { $axios: axios } = useNuxtApp();
    const router = useRouter();
    const accessor = useAccessor();
    const route = useRoute();

    const history = ref([]);
    const currentPage = ref(1);
    const pageCount = ref(0);
    const searchTerm = ref(null);
    const searchTimeout = ref(null);

    const deletePopup = ref(false);

    const dateToDelete = ref([]);

    const deleteRange = async () => {
      if (rangeSelected.value) {
        const firstDate = new Date(dateToDelete.value[0]).valueOf();
        const secondDate = new Date(dateToDelete.value[1]).valueOf();
        await axios
          .delete(`${accessor.environment.apiUrl}user/history/from/${firstDate}/to/${secondDate}`, {
            withCredentials: true
          })
          .then(() => {
            fetch();
          })
          .catch(() => {
            accessor.messages.createMessage({
              type: 'error',
              title: 'Error deleting history range',
              message: 'Try specifying the range again'
            });
          });
      }
    };

    const deleteEntireHistory = async () => {
      deletePopup.value = false;
      await axios
        .delete(`${accessor.environment.apiUrl}user/history/`, { withCredentials: true })
        .then(() => {
          fetch();
        })
        .catch(() => {
          accessor.messages.createMessage({
            type: 'error',
            title: 'Error deleting history',
            message: 'Try logging out and in again'
          });
        });
    };

    const rangeSelected = computed(() => {
      return (
        dateToDelete.value.length === 2 &&
        dateToDelete.value[0] !== null &&
        dateToDelete[1] !== null
      );
    });

    const { fetch } = useFetch(async () => {
      if (accessor.user.isLoggedIn) {
        const limit = 30;
        if (route.query && route.query.page) {
          currentPage.value = parseInt(route.query.page as string);
        }
        let filterString = '';
        if (searchTerm.value) {
          filterString = `&filter=${searchTerm.value}`;
        }
        const start = (currentPage.value - 1) * 30;
        const apiUrl = accessor.environment.apiUrl;
        await axios
          .get(`${apiUrl}user/history?limit=${limit}&start=${start}${filterString}&sort=DESC`, {
            withCredentials: true
          })
          .then((result: { data: any }) => {
            if (result) {
              history.value = result.data.videos;
              pageCount.value = Math.ceil(result.data.videoCount / 30);
            }
          })
          .catch((_: any) => {
            accessor.messages.createMessage({
              type: 'error',
              title: 'Error loading history',
              message: 'Try logging out and in again'
            });
          });
      } else {
        router.push('/login').catch(_ => {});
      }
    });

    watch(searchTerm, (newVal, oldVal): void => {
      if (searchTimeout.value) clearTimeout(searchTimeout.value);
      searchTimeout.value = setTimeout(() => {
        if (newVal !== null && newVal !== oldVal) {
          fetch();
        }
      }, 400);
    });

    watch(
      () => route.query,
      () => {
        fetch();
      }
    );

    useMeta(() => ({
      title: 'History :: ViewTube',
      meta: [
        {
          hid: 'description',
          vmid: 'descriptionMeta',
          name: 'description',
          content: 'See your watch history'
        },
        {
          hid: 'ogTitle',
          property: 'og:title',
          content: 'Your history'
        },
        {
          hid: 'ogDescription',
          property: 'og:description',
          content: 'See your watch history'
        }
      ]
    }));

    return {
      history,
      currentPage,
      pageCount,
      searchTerm,
      dateToDelete,
      deletePopup,
      deleteRange,
      deleteEntireHistory,
      rangeSelected
    };
  },
  head: {}
});
</script>

<style lang="scss">
.popup-enter-active,
.popup-leave-active {
  transition: opacity 300ms $intro-easing, transform 300ms $intro-easing;
}
.popup-enter-to,
.popup-leave {
  opacity: 1;
  transform: scale(1);
}
.popup-enter,
.popup-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

.history {
  width: 100%;
  max-width: 800px;
  padding-top: $header-height;
  margin: 0 auto;
  overflow: hidden;

  .history-title {
    margin: 0 15px;
  }

  .delete-history {
    margin: 10px 15px 5px 15px;
    width: 100%;

    .range {
      display: flex;
      flex-direction: row;

      .badge-btn {
        margin: 0 0 0 5px;
      }
    }

    summary {
      cursor: pointer;
      margin: 0 0 5px 0;
    }
  }

  .no-history {
    margin: 20px 0;
    position: relative;
    width: 100%;
    text-align: center;
  }

  .history-main-list {
    margin: 15px;
  }
}
</style>

<style lang="scss">
.mx-input {
  // all: unset;
  cursor: pointer;
  border: 2px solid var(--theme-color-translucent);
  border-radius: 3px;
  padding: 2px 4px;
  text-align: center;
  background: var(--bgcolor-main);
  color: var(--title-color);

  &:hover,
  &:focus {
    border: 2px solid var(--theme-color);
  }
}

.mx-calendar + .mx-calendar {
  border-left: 1px solid #e8e8e84b;
}

.mx-icon-calendar,
.mx-icon-clear {
  color: var(--theme-color) !important;
}

.mx-datepicker-main {
  color: var(--theme-color) !important;
  background-color: var(--bgcolor-alt) !important;
  border: none !important;

  .mx-btn {
    &:hover {
      color: var(--theme-color);
    }
  }

  .cell {
    border: 2px solid transparent;
    box-sizing: border-box;

    &:not(.not-current-month) {
      color: var(--title-color) !important;
      background-color: inherit !important;
    }
    &:hover {
      border: 2px solid var(--theme-color);
    }

    &.not-current-month {
      color: var(--subtitle-color-light);
    }

    &.hover-in-range,
    &.in-range {
      background-color: var(--theme-color-translucent) !important;
    }

    &.in-range {
      background-color: var(--theme-color-translucent) !important;
    }

    &.hover-active,
    &.active {
      background-color: var(--theme-color) !important;
    }
  }
}
</style>
