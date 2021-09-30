<template>
  <div class="subscriptions" :class="{ empty: hasNoSubscriptions, loading: $fetchState.pending }">
    <Spinner v-if="$fetchState.pending" class="centered" />
    <GradientBackground :color="'green'" />
    <div class="subscribe-info-container">
      <div class="subscribe-info">
        <div class="info">
          <h2>Subscription feed for {{ $accessor.user.username }}</h2>
          <p v-if="lastRefreshTime">
            Last refresh: {{ new Date(lastRefreshTime).toLocaleString() }}
          </p>
        </div>
        <div class="actions">
          <BadgeButton
            class="import-subscriptions-btn"
            :click="() => (subscriptionImportOpen = true)"
          >
            <ImportIcon />
            <p>Import subscriptions</p>
          </BadgeButton>
          <BadgeButton
            class="manage-subscriptions-btn"
            :disabled="hasNoSubscriptions"
            :href="'subscriptions/manage'"
            :internal-link="true"
          >
            <EditIcon />
            <p>Manage</p>
          </BadgeButton>
          <SwitchButton
            v-tippy="getNotificationStatus"
            :value="notificationsEnabled"
            :label="'Enable notifications'"
            :disabled="notificationsBtnDisabled"
            :btnId="'index-btn-1'"
            @valuechange="subscribeToNotifications"
          />
        </div>
      </div>
    </div>
    <div v-if="hasNoSubscriptions && !$fetchState.pending" class="no-subscriptions">
      <SubscriptionIcon />
      <p>No subscriptions yet. Subscribe to a channel to see their latest uploads.</p>
    </div>
    <div class="subscription-videos-container">
      <div
        v-for="(videoSection, index) in getOrderedVideoSections()"
        :key="index"
        class="subscription-section"
      >
        <SectionTitle :title="videoSection.sectionMessage" />
        <div class="section-videos-container">
          <VideoEntry
            v-for="video in videoSection.videos"
            :key="video.videoId"
            :video="video"
            :lazy="false"
          />
        </div>
      </div>
    </div>
    <div
      v-if="getOrderedVideoSections() && getOrderedVideoSections().length > 0"
      class="feed-pagination"
    >
      <Pagination :currentPage="currentPage" :pageCount="pageCount" />
    </div>

    <portal to="popup">
      <transition name="fade-down">
        <SubscriptionImport
          v-if="subscriptionImportOpen"
          @close="closeSubscriptionImport"
          @done="onSubscriptionImportDone"
        />
      </transition>
    </portal>
  </div>
</template>

<script lang="ts">
import EditIcon from 'vue-material-design-icons/PencilBoxMultipleOutline.vue';
import SubscriptionIcon from 'vue-material-design-icons/YoutubeSubscription.vue';
import ImportIcon from 'vue-material-design-icons/Import.vue';
import {
  defineComponent,
  onMounted,
  Ref,
  ref,
  useFetch,
  useMeta,
  useRoute,
  watch
} from '@nuxtjs/composition-api';
import SubscriptionImport from '@/components/popup/SubscriptionImport.vue';
import VideoEntry from '@/components/list/VideoEntry.vue';
import GradientBackground from '@/components/GradientBackground.vue';
import Spinner from '@/components/Spinner.vue';
import SectionTitle from '@/components/SectionTitle.vue';
import SwitchButton from '@/components/buttons/SwitchButton.vue';
import BadgeButton from '@/components/buttons/BadgeButton.vue';
import Pagination from '@/components/pagination/Pagination.vue';
import { useAccessor } from '@/store';
import { useAxios } from '@/plugins/axiosPlugin';

export default defineComponent({
  name: 'Subscriptions',
  components: {
    VideoEntry,
    SubscriptionImport,
    GradientBackground,
    SectionTitle,
    SwitchButton,
    BadgeButton,
    EditIcon,
    ImportIcon,
    Pagination,
    Spinner,
    SubscriptionIcon
  },
  setup() {
    const accessor = useAccessor();
    const route = useRoute();
    const axios = useAxios();

    const videos = ref([]);
    const loading = ref(true);
    const notificationsEnabled = ref(false);
    const notificationsBtnDisabled = ref(false);
    const notificationsSupported = ref(true);
    const subscriptionImportOpen = ref(false);
    const currentPage = ref(1);
    const currentPageTest = ref(1);
    const pageCount = ref(1);

    const { fetch } = useFetch(async () => {
      const apiUrl = accessor.environment.apiUrl;
      const limit = 20;
      if (route.value.query && route.value.query.page) {
        currentPage.value = parseInt(route.value.query.page.toString());
      }
      const start = (currentPage.value - 1) * 30;
      await axios
        .get(`${apiUrl}user/subscriptions/videos?limit=${limit}&start=${start}`, {
          withCredentials: true
        })
        .then(
          (response: { data: { videos: Array<any>; videoCount: number; lastRefresh: Date } }) => {
            videos.value = response.data.videos;
            pageCount.value = Math.ceil(response.data.videoCount / 30);
            loading.value = false;
            hasNoSubscriptions.value =
              !getOrderedVideoSections() || getOrderedVideoSections().length <= 0;
            lastRefreshTime.value = response.data.lastRefresh;
          }
        )
        .catch(_ => {
          accessor.messages.createMessage({
            type: 'error',
            title: 'Error loading subscription feed',
            message: 'Error loading subscription feed'
          });
        });
    });

    const vapidKey = ref(accessor.environment.vapidKey);
    const hasNoSubscriptions = ref(true);
    const getOrderedVideoSections = (): Array<any> => {
      const orderedArray = [];
      let i = 0;
      videos.value.forEach(video => {
        let sectionMessage = 'Older videos';
        const now = new Date();
        if (video.published > now.valueOf() - 604800000) {
          sectionMessage = 'Last 7 days';
        }
        if (video.published > now.valueOf() - 172800000) {
          sectionMessage = 'Yesterday';
        }
        if (video.published > now.valueOf() - 86400000) {
          sectionMessage = 'Today';
        }
        const possibleIndex = orderedArray.findIndex(el => el.sectionMessage === sectionMessage);
        if (possibleIndex !== -1) {
          orderedArray[possibleIndex].videos.push(video);
        } else {
          orderedArray.push({ sectionMessage, videos: [video], id: i++ });
        }
      });
      return orderedArray;
    };
    const lastRefreshTime: Ref<Date> = ref(null);

    const closeSubscriptionImport = () => {
      subscriptionImportOpen.value = false;
    };
    const onSubscriptionImportDone = () => {
      fetch();
    };
    const subscribeToNotifications = (val: any) => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          const worker = registrations[0];

          if (val) {
            worker.pushManager
              .subscribe({
                userVisibleOnly: true,
                applicationServerKey: vapidKey.value
              })
              .then(subscription => {
                axios
                  .post(
                    `${accessor.environment.apiUrl}user/notifications/subscribe`,
                    subscription,
                    {
                      withCredentials: true
                    }
                  )
                  .then(() => {
                    notificationsEnabled.value = true;
                  });
              })
              .catch(err => {
                notificationsEnabled.value = false;
                notificationsBtnDisabled.value = true;
                accessor.messages.createMessage({
                  type: 'error',
                  title: 'Error subscribing to notifications',
                  message: err.message
                });
              });
          } else {
            worker.pushManager.getSubscription().then((subscription: PushSubscription) => {
              if (subscription) {
                subscription.unsubscribe();
              }
              notificationsEnabled.value = false;
            });
          }
        });
      }
    };
    const getNotificationStatus = () => {
      if (notificationsBtnDisabled.value && notificationsEnabled.value) {
        return 'Notifications are enabled';
      } else if (notificationsSupported.value) {
        return 'Notifications are not supported';
      } else if (!notificationsBtnDisabled.value && !notificationsEnabled.value) {
        return 'Notifications are disabled';
      }
    };

    onMounted(() => {
      if (vapidKey.value && 'serviceWorker' in navigator) {
        navigator.serviceWorker
          .getRegistrations()
          .then(registrations => {
            const worker = registrations[0];
            if (worker) {
              worker.pushManager
                .permissionState({
                  userVisibleOnly: true,
                  applicationServerKey: vapidKey.value
                })
                .then(permissionState => {
                  if (permissionState === 'granted') {
                    notificationsEnabled.value = true;
                  } else if (permissionState === 'denied') {
                    notificationsEnabled.value = false;
                    notificationsBtnDisabled.value = true;
                  }
                });
            } else {
              notificationsEnabled.value = false;
              notificationsBtnDisabled.value = true;
            }
          })
          .catch(err => {
            accessor.messages.createMessage({
              type: 'error',
              title: 'Error loading notification worker',
              message: err.message
            });
          });
      } else {
        notificationsSupported.value = false;
        notificationsBtnDisabled.value = true;
      }
    });

    watch(
      () => route.value.query,
      () => {
        fetch();
      }
    );

    useMeta(() => ({
      title: `Subscriptions :: ViewTube`,
      meta: [
        {
          hid: 'description',
          vmid: 'descriptionMeta',
          name: 'description',
          content: 'See your subscription feed'
        },
        {
          hid: 'ogTitle',
          property: 'og:title',
          content: 'Subscriptions - ViewTube'
        },
        {
          hid: 'ogDescription',
          property: 'og:description',
          content: 'See your subscription feed'
        }
      ]
    }));

    return {
      videos,
      loading,
      notificationsEnabled,
      notificationsBtnDisabled,
      notificationsSupported,
      subscriptionImportOpen,
      vapidKey,
      currentPage,
      currentPageTest,
      pageCount,
      hasNoSubscriptions,
      getOrderedVideoSections,
      lastRefreshTime,
      closeSubscriptionImport,
      onSubscriptionImportDone,
      subscribeToNotifications,
      getNotificationStatus
    };
  },
  head: {}
});
</script>

<style lang="scss">
.subscriptions {
  .spinner {
    z-index: 11;
  }

  &.empty,
  &.loading {
    height: 100vh;
  }
  .section-title {
    width: 100%;
    max-width: $main-width;
    margin: 0 auto;
    padding: 0 10px;
    box-sizing: border-box;

    .manage-btn-container {
      width: auto;
      position: absolute;
      right: 0;
      z-index: 11;
      height: 80px;
      display: grid;
      padding: 0 15px 0 0;
      display: flex;
      flex-direction: row;

      .badge-btn {
        margin: auto auto auto 10px;
      }
    }
  }

  .subscribe-info-container {
    position: relative;
    width: 100%;
    max-width: $main-width;
    margin: 30px auto 0 auto;
    padding: 0 10px;
    z-index: 11;
    box-sizing: border-box;

    .subscribe-info {
      display: flex;
      flex-direction: row;
      padding: 15px;
      box-sizing: border-box;
      background: var(--bgcolor-alt);
      justify-content: space-between;
      border-radius: 5px;
      box-shadow: $medium-shadow;
      box-sizing: border-box;

      @media screen and (max-width: 1000px) {
        flex-direction: column;

        .actions {
          margin: 10px 0 0 0;
        }
      }

      .info {
        display: flex;
        flex-direction: column;
      }

      .actions {
        display: flex;
        flex-direction: row;
        align-items: flex-start;

        @media screen and (max-width: $mobile-width) {
          flex-direction: column;
        }

        .switch {
          margin: 5px 0 0 0 !important;
        }
      }
    }
  }

  .no-subscriptions {
    position: relative;
    z-index: 10;
    margin: 20% 0 0 0;
    text-align: center;
  }

  .subscription-videos-container {
    .subscription-section {
      .section-videos-container {
        width: 100%;
        max-width: $main-width;
        margin: 0 auto;
        padding: 0 10px;
        box-sizing: border-box;
        z-index: 10;
        @include viewtube-grid;

        @media screen and (max-width: $mobile-width) {
          flex-direction: column;
        }
      }
    }
  }

  .feed-pagination {
    display: block;
    position: relative;
    z-index: 11;
    margin: 0 0 30px 0;
  }
}
</style>
