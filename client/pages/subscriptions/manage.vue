<template>
  <div class="manage-subscriptions">
    <GradientBackground :color="'green'" />
    <SectionTitle class="page-title" :title="'Manage subscriptions'" :line="false" />
    <SmallSearchBox v-model="searchTerm" :label="'Filter'" />
    <div class="channels-container">
      <div v-for="(channelGroup, i) in orderedChannels" :key="i" class="channel-group">
        <SectionTitle :title="channelGroup.letter" />
        <div v-for="channel in channelGroup.channels" :key="channel.authorId" class="channel-entry">
          <nuxt-link
            v-if="
              (!channel.authorThumbnails || channel.authorThumbnails.length == 0) &&
              !channel.authorThumbnailUrl
            "
            :to="`/channel/${channel.authorId}`"
            class="fake-thmb"
          >
            <h3>
              {{ channelNameToImgString(channel.author) }}
            </h3>
          </nuxt-link>
          <nuxt-link
            v-if="
              channel.authorThumbnailUrl ||
              (channel.authorThumbnails && channel.authorThumbnails.length > 0)
            "
            :to="`/channel/${channel.authorId}`"
            class="channel-image-container"
          >
            <img
              :src="
                imgProxyUrl +
                (channel.authorThumbnailUrl
                  ? `${$accessor.environment.apiUrl}${channel.authorThumbnailUrl}`
                  : channel.authorThumbnails[2].url)
              "
              class="channel-image"
              alt="Channel profile image"
            />
          </nuxt-link>
          <div v-tippy="channel.author" class="channel-title">
            <nuxt-link :to="`/channel/${channel.authorId}`">{{ channel.author }}</nuxt-link>
          </div>
          <a
            v-tippy="`Unsubscribe from ${channel.author}`"
            v-ripple
            href="#"
            class="channel-unsubscribe-btn"
            @click.prevent="() => unsubscribe(channel)"
          >
            ✕
          </a>
        </div>
      </div>
    </div>
    <div class="manage-pagination">
      <Pagination :currentPage="currentPage" :pageCount="pageCount" />
    </div>
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
} from '@nuxtjs/composition-api';
import GradientBackground from '@/components/GradientBackground.vue';
import SectionTitle from '@/components/SectionTitle.vue';
import Pagination from '@/components/pagination/Pagination.vue';
import { useAccessor } from '@/store';
import { useAxios } from '@/plugins/axiosPlugin';
import SmallSearchBox from '@/components/SmallSearchBox.vue';
import { useImgProxy } from '@/plugins/proxy';

export default defineComponent({
  name: 'ManageSubscriptions',
  components: {
    GradientBackground,
    SectionTitle,
    Pagination,
    SmallSearchBox
  },
  setup() {
    const accessor = useAccessor();
    const route = useRoute();
    const axios = useAxios();
    const router = useRouter();
    const imgProxy = useImgProxy();

    const subscriptionChannels = ref([]);
    const currentPage = ref(1);
    const pageCount = ref(0);
    const searchTerm = ref(null);
    const searchTimeout = ref(null);

    const orderedChannels = computed((): Array<string> => {
      const lettersArray = [];
      let i = 0;
      subscriptionChannels.value.forEach(channel => {
        const channelLetter = channel.author.charAt(0);
        const possibleIndex = lettersArray.findIndex(el => el.letter === channelLetter);
        if (possibleIndex !== -1) {
          lettersArray[possibleIndex].channels.push(channel);
        } else {
          lettersArray.push({ letter: channelLetter, channels: [channel], id: i++ });
        }
      });
      return lettersArray;
    });

    const { fetch } = useFetch(async () => {
      const apiUrl = accessor.environment.apiUrl;
      const limit = 30;
      if (route.value.query && route.value.query.page) {
        currentPage.value = parseInt(route.value.query.page as string);
      }
      let filterString = '';
      if (searchTerm.value) {
        filterString = `&filter=${searchTerm.value}`;
      }
      const start = (currentPage.value - 1) * 30;
      await axios
        .get(
          `${apiUrl}user/subscriptions/channels?limit=${limit}&start=${start}&sort=author:1${filterString}`,
          {
            withCredentials: true
          }
        )
        .then(response => {
          subscriptionChannels.value = response.data.channels;
          pageCount.value = Math.ceil(response.data.channelCount / 30);
        })
        .catch(_ => {
          accessor.messages.createMessage({
            type: 'error',
            title: 'Error loading subscriptions',
            message: 'Error loading subscriptions'
          });
        });
    });

    const changePage = (page: any): void => {
      router.push(`/subscriptions/manage?page=${page}`);
      currentPage.value = page;
    };
    const channelNameToImgString = (name: string): string => {
      let initials = '';
      name.split(' ').forEach(e => {
        initials += e.charAt(0);
      });
      return initials;
    };
    const unsubscribe = (channel: { authorId: any; author: any }): void => {
      axios
        .delete(`${accessor.environment.apiUrl}user/subscriptions/${channel.authorId}`, {
          withCredentials: true
        })
        .then(response => {
          if (!response.data.isSubscribed) {
            fetch();
            accessor.messages.createMessage({
              type: 'error',
              title: `Unsubscribed from ${channel.author}`,
              message: 'Click to undo',
              clickAction: () => {
                axios
                  .put(
                    `${accessor.environment.apiUrl}user/subscriptions/${channel.authorId}`,
                    {},
                    {
                      withCredentials: true
                    }
                  )
                  .then(() => {
                    fetch();
                  });
              }
            });
          }
        });
    };

    if (process.browser) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    watch(
      () => route.value.query,
      () => {
        fetch();
      }
    );

    watch(searchTerm, (newVal, oldVal): void => {
      if (searchTimeout.value) clearTimeout(searchTimeout.value);
      searchTimeout.value = setTimeout(() => {
        if (newVal !== null && newVal !== oldVal) {
          fetch();
        }
      }, 400);
    });

    useMeta(() => ({
      title: `Manage subscriptions :: ViewTube`,
      meta: [
        {
          hid: 'description',
          vmid: 'descriptionMeta',
          name: 'description',
          content: 'Manage your subscriptions'
        },
        {
          hid: 'ogTitle',
          property: 'og:title',
          content: 'Manage subscriptions - ViewTube'
        },
        {
          hid: 'ogDescription',
          property: 'og:description',
          content: 'Manage your subscriptions'
        }
      ]
    }));

    return {
      subscriptionChannels,
      currentPage,
      pageCount,
      searchTerm,
      searchTimeout,
      orderedChannels,
      changePage,
      channelNameToImgString,
      unsubscribe,
      imgProxyUrl: imgProxy.url
    };
  },
  head: {}
});
</script>

<style lang="scss">
.manage-subscriptions {
  // overflow-y: scroll;
  overflow: hidden;
  width: 100%;

  .section-title {
    max-width: $main-width;
    margin: 0 auto;
  }

  .page-title {
    .title {
      margin: 0 0 0 15px !important;
    }
  }

  .channels-container {
    width: 100%;
    max-width: $main-width;
    margin: 0 auto;
    z-index: 11;
    display: flex;
    flex-direction: column;
    position: relative;
    padding: 15px;
    box-sizing: border-box;

    .channel-entry {
      display: flex;
      flex-direction: row;
      width: calc(100% - 20px);
      justify-content: space-between;
      margin: 0;
      box-sizing: border-box;
      height: 50px;
      text-align: start;
      position: relative;
      align-items: center;

      .channel-image-container {
        width: 36px;
        height: 36px;
        box-shadow: $low-shadow;

        .channel-image {
          width: 100%;
        }
      }

      .fake-thmb {
        overflow: hidden;
        background-color: var(--theme-color);
        height: 36px;
        width: 36px;
        display: flex;
        box-shadow: $low-shadow;

        h3 {
          font-size: 1.8rem;
          white-space: normal;
          text-align: center;
          margin: auto;
        }
      }

      .channel-title {
        flex: 1;
        line-height: 36px;
        margin: 0 0 0 10px;
        font-size: 1.2rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .channel-unsubscribe-btn {
        width: 30px;
        height: 30px;
        line-height: 30px;
        border-radius: 25px;
        text-align: center;
        user-select: none;
        cursor: pointer;
      }
    }
  }

  .manage-pagination {
    display: block;
    position: relative;
    z-index: 11;
    margin: 0 0 30px 0;
  }
}
</style>
