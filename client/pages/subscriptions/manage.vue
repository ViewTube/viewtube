<template>
  <div class="manage-subscriptions">
    <GradientBackground :color="'green'" />
    <SectionTitle :title="'Manage subscriptions'" />
    <div class="channels-container">
      <div v-for="channel in subscriptionChannels" :key="channel.authorId" class="channel-entry">
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
    <div class="manage-pagination">
      <Pagination :currentPage="currentPage" :pageCount="pageCount" :pageCountKnown="true" />
    </div>
  </div>
</template>

<script>
import GradientBackground from '@/components/GradientBackground';
import SectionTitle from '@/components/SectionTitle';
import Commons from '@/plugins/commons';
import Pagination from '@/components/pagination/Pagination';
// import BadgeButton from '@/components/buttons/BadgeButton';

export default {
  name: 'ManageSubscriptions',
  components: {
    GradientBackground,
    SectionTitle,
    Pagination
  },
  async fetch() {
    if (process.browser) {
      // window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    const apiUrl = this.$store.getters['environment/apiUrl'];
    const limit = 30;
    if (this.$route.query && this.$route.query.page) {
      this.currentPage = parseInt(this.$route.query.page);
    }
    const start = (this.currentPage - 1) * 30;
    await this.$axios
      .get(`${apiUrl}user/subscriptions/channels?limit=${limit}&start=${start}&sort=author:1`, {
        withCredentials: true
      })
      .then(response => {
        this.subscriptionChannels = response.data.channels;
        this.pageCount = Math.ceil(response.data.channelCount / 30);
      })
      .catch(error => {
        console.log(error);
      });
  },
  data() {
    return {
      commons: Commons,
      subscriptionChannels: [],
      currentPage: 1,
      pageCount: 0
    };
  },
  watch: {
    '$route.query': '$fetch'
  },
  methods: {
    changePage(page) {
      this.$router.push(`/subscriptions/manage?page=${page}`);
      this.currentPage = page;
    },
    channelNameToImgString(name) {
      let initials = '';
      name.split(' ').forEach(e => {
        initials += e.charAt(0);
      });
      return initials;
    },
    unsubscribe(channel) {
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
  }
};
</script>

<style lang="scss">
.manage-subscriptions {
  // overflow-y: scroll;
  overflow: hidden;
  width: 100%;

  .section-title {
    max-width: $main-width;
    margin: 0 auto;
    .title {
      margin: 0 0 0 15px;
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

    .channel-entry {
      display: flex;
      flex-direction: row;
      width: calc(100% - 20px);
      justify-content: space-between;
      padding: 0 5px;
      margin: 0 10px;
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
