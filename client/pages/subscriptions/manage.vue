<template>
  <div class="manage-subscriptions">
    <GradientBackground :color="'green'" />
    <SectionTitle class="page-title" :title="'Manage subscriptions'" :line="false" />
    <div class="channel-search" :class="{ value: searchTerm && searchTerm.length > 0 }">
      <label for="channel-search-box">Filter</label>
      <input
        id="channel-search-box"
        v-model="searchTerm"
        class="channel-search-box"
        name="channel-search-box"
        type="text"
      />
    </div>
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
                channel.authorThumbnailUrl
                  ? `${$store.getters['environment/apiUrl']}${channel.authorThumbnailUrl}`
                  : channel.authorThumbnails[2].url
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
import GradientBackground from '@/components/GradientBackground.vue';
import SectionTitle from '@/components/SectionTitle.vue';
import Commons from '@/plugins/commons.ts';
import Pagination from '@/components/pagination/Pagination.vue';
// import BadgeButton from '@/components/buttons/BadgeButton';
import Vue from 'vue';

export default Vue.extend({
  name: 'ManageSubscriptions',
  components: {
    GradientBackground,
    SectionTitle,
    Pagination
  },
  data() {
    return {
      commons: Commons,
      subscriptionChannels: [],
      currentPage: 1,
      pageCount: 0,
      searchTerm: null,
      searchTimeout: null
    };
  },
  async fetch() {
    if (process.browser) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    const apiUrl = this.$store.getters['environment/apiUrl'];
    const limit = 30;
    if (this.$route.query && this.$route.query.page) {
      this.currentPage = parseInt(this.$route.query.page);
    }
    let filterString = '';
    if (this.searchTerm) {
      filterString = `&filter=${this.searchTerm}`;
    }
    const start = (this.currentPage - 1) * 30;
    await this.$axios
      .get(
        `${apiUrl}user/subscriptions/channels?limit=${limit}&start=${start}&sort=author:1${filterString}`,
        {
          withCredentials: true
        }
      )
      .then(response => {
        this.subscriptionChannels = response.data.channels;
        this.pageCount = Math.ceil(response.data.channelCount / 30);
      })
      .catch(error => {
        console.log(error);
      });
  },
  head() {
    return {
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
    };
  },
  computed: {
    orderedChannels(): Array<string> {
      const lettersArray = [];
      let i = 0;
      this.subscriptionChannels.forEach(channel => {
        const channelLetter = channel.author.charAt(0);
        const possibleIndex = lettersArray.findIndex(el => el.letter === channelLetter);
        if (possibleIndex !== -1) {
          lettersArray[possibleIndex].channels.push(channel);
        } else {
          lettersArray.push({ letter: channelLetter, channels: [channel], id: i++ });
        }
      });
      return lettersArray;
    }
  },
  watch: {
    '$route.query': '$fetch',
    searchTerm(newVal, oldVal): void {
      if (this.searchTimeout) clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        if (newVal !== null && newVal !== oldVal) {
          this.$fetch();
        }
      }, 400);
    }
  },
  methods: {
    changePage(page): void {
      this.$router.push(`/subscriptions/manage?page=${page}`);
      this.currentPage = page;
    },
    channelNameToImgString(name): string {
      let initials = '';
      name.split(' ').forEach(e => {
        initials += e.charAt(0);
      });
      return initials;
    },
    unsubscribe(channel): void {
      this.$axios
        .delete(
          `${this.$store.getters['environment/apiUrl']}user/subscriptions/${channel.authorId}`,
          {
            withCredentials: true
          }
        )
        .then(response => {
          if (!response.data.isSubscribed) {
            this.$fetch();
            this.$store.dispatch('messages/createMessage', {
              type: 'error',
              title: `Unsubscribed from ${channel.author}`,
              message: 'Click to undo',
              clickAction: () => {
                this.$axios
                  .put(
                    `${this.$store.getters['environment/apiUrl']}user/subscriptions/${channel.authorId}`,
                    {},
                    {
                      withCredentials: true
                    }
                  )
                  .then(() => {
                    this.$fetch();
                  });
              }
            });
          }
        });
    }
  }
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
      margin: 0 0 0 15px;
    }
  }

  .channel-search {
    width: 100%;
    display: flex;
    max-width: $main-width;
    margin: 0 auto;
    z-index: 11;
    position: relative;
    padding: 0 15px;
    box-sizing: border-box;

    &.value {
      .channel-search-box {
        border-color: var(--theme-color);
      }

      label {
        opacity: 0;
      }
    }

    label {
      font-size: 1rem;
      padding: 4px 5px;
      position: absolute;
      user-select: none;
      transition: opacity 300ms $intro-easing;
    }
    .channel-search-box {
      all: unset;
      border-bottom: solid 3px var(--theme-color-translucent);
      padding: 4px 5px;
      width: 100%;
      max-width: $mobile-width;
      transition: border 300ms $intro-easing;

      &:focus {
        border-color: var(--theme-color);
      }
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
