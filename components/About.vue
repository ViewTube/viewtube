<template>
  <div class="about popup">
    <div class="about-container popup-container">
      <CloseIcon
        class="close-icon"
        @click.stop="$emit('close')"
      />
      <h1>About ViewTube</h1>
      <div class="logo-about">
        <img
          class="logo-about-img"
          src="@/assets/icon.svg"
          alt="ViewTube"
        >
      </div>
      <h2>ViewTube by Maurice Oegerli</h2>
      <h3>{{ description }}</h3>
      <div class="links-about">
        <BadgeButton :href="'https://github.com/mauriceoegerli/viewtube-vue'">
          <GithubIcon />ViewTube
        </BadgeButton>
        <BadgeButton :href="'https://github.com/omarroth/invidious'">
          <GithubIcon />
          <p>Invidious</p>
        </BadgeButton>
        <BadgeButton :href="'https://invidio.us'">
          <ExternalIcon />
          <p>Invidious</p>
        </BadgeButton>
      </div>
      <div
        v-if="invidousStats"
        class="invidious-stats"
      >
        <table>
          <tr>
            <td>Invidious instance</td>
            <td>{{ currentInstance }}</td>
          </tr>
          <tr>
            <td>Version</td>
            <td>{{ invidousStats.software.version }}</td>
          </tr>
          <tr>
            <td>Last update</td>
            <td>{{ new Date(invidousStats.metadata.updatedAt).toUTCString() }}</td>
          </tr>
        </table>
      </div>
      <h2>Invidious License</h2>
      <InvidiousLicense />
    </div>
    <div
      class="about-overlay popup-overlay"
      @click.stop="$emit('close')"
    />
  </div>
</template>

<script>
import CloseIcon from 'vue-material-design-icons/Close'
import GithubIcon from 'vue-material-design-icons/Github'
import ExternalIcon from 'vue-material-design-icons/OpenInNew'
import Commons from '@/plugins/commons.js'
import BadgeButton from '@/components/buttons/BadgeButton'
import InvidiousLicense from '@/components/licenses/invidious'

export default {
  name: 'About',
  components: {
    CloseIcon,
    GithubIcon,
    ExternalIcon,
    BadgeButton,
    InvidiousLicense
  },
  data() {
    return {
      description: Commons.description,
      invidousStats: null,
      currentInstance: this.$store.getters.currentInstance
    }
  },
  mounted() {
    const me = this
    fetch(`${Commons.getApiUrl()}stats`, {
      cache: 'force-cache',
      method: 'GET'
    })
      .then(response => response.json())
      .then((data) => {
        me.invidousStats = data
      })
      .catch((error) => {
        console.error(error)
      })
  }
}
</script>

<style lang="scss">
.invidious-stats {
  margin: 0 !important;

  table {
    border-collapse: collapse;
    table-layout: auto;
    width: 100%;
    margin: 10px 0 0 0;

    tr {
      td {
        padding: 5px 10px 5px 0;
        &:nth-of-type(1) {
          color: var(--theme-color);
        }
      }
    }
  }
}
.invidious-license {
  width: 100%;
  margin: 10px 0 !important;
  height: 400px;
  overflow-y: scroll;
  background-color: var(--bgcolor-main);
}
.links-about {
  margin: 10px 0 0 0 !important;

  a {
    line-height: 24px;
    span {
      margin: -1px 10px 0 0;
    }
  }
}

.logo-about {
  margin: 20px auto 0 auto !important;
  clip-path: polygon(
    18% 4%,
    95% 50%,
    95% 50%,
    95% 50%,
    95% 50%,
    95% 50%,
    18% 96%
  );
  width: 200px;
  height: 200px;

  .logo-about-img {
    transform-origin: top left;
    animation: float-around 10s $dynamic-easing infinite;
    width: 100%;
  }
}

@keyframes float-around {
  0% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(-30%, -30%) scale(1.5) rotate(5deg);
  }
  100% {
    transform: translate(0, 0);
  }
}
</style>
