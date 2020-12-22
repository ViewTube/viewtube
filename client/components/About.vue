<template>
  <div class="about popup">
    <div class="about-container popup-container">
      <CloseIcon class="close-icon" @click.stop="$emit('close')" />
      <h1>About ViewTube</h1>
      <div class="logo-about">
        <img class="logo-about-img" src="@/assets/icon.svg" alt="ViewTube" />
      </div>
      <h2>ViewTube by Maurice Oegerli</h2>
      <h3>{{ description }}</h3>
      <div class="links-about">
        <BadgeButton :href="'https://github.com/mauriceoegerli/viewtube-vue'">
          <GithubIcon />ViewTube
        </BadgeButton>
        <BadgeButton :href="'https://github.com/iv-org/invidious'">
          <GithubIcon />
          <p>Invidious</p>
        </BadgeButton>
        <BadgeButton :href="'https://invidio.us'">
          <ExternalIcon />
          <p>Invidious</p>
        </BadgeButton>
      </div>
      <div v-if="invidousStats" class="invidious-stats">
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
            <td>
              {{ new Date(invidousStats.metadata.updatedAt).toUTCString() }}
            </td>
          </tr>
        </table>
      </div>
      <div class="sponsorblock links">
        <img
          class="sponsorblock-image"
          src="@/assets/icons/sponsorblock.png"
          alt="Sponsorblock icon"
        />
        <p>
          This project uses the SponsorBlock database and/or API licensed under
          <a
            href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
            target="_blank"
            rel="noreferrer noopener"
            >CC BY-NC-SA 4.0</a
          >. More details can be found at
          <a href="https://sponsor.ajay.app/" target="_blank" rel="noreferrer noopener">
            https://sponsor.ajay.app/</a
          >.
        </p>
      </div>
      <h2>Invidious License</h2>
      <InvidiousLicense />
    </div>
    <div class="about-overlay popup-overlay" @click.stop="$emit('close')" />
  </div>
</template>

<script lang="ts">
import CloseIcon from 'vue-material-design-icons/Close.vue';
import GithubIcon from 'vue-material-design-icons/Github.vue';
import ExternalIcon from 'vue-material-design-icons/OpenInNew.vue';
import Commons from '@/plugins/commons.ts';
import BadgeButton from '@/components/buttons/BadgeButton.vue';
import InvidiousLicense from '@/components/licenses/Invidious.vue';
import Vue from 'vue';

export default Vue.extend({
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
    };
  },
  mounted() {
    const me = this;
    fetch(`${this.$store.getters['environment/apiUrl']}stats`, {
      cache: 'force-cache',
      method: 'GET'
    })
      .then(response => response.json())
      .then(data => {
        me.invidousStats = data;
      })
      .catch(error => {
        console.error(error);
      });
  }
});
</script>

<style lang="scss">
.sponsorblock {
  margin: 10px 0 0 0 !important;
  display: flex;

  .sponsorblock-image {
    width: 36px;
    height: 36px;
  }
  p {
    margin: 0 0 0 10px;
  }
}
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
.links-about {
  margin: 10px 0 0 0 !important;

  a {
    line-height: 24px;
    span {
      margin: -1px 10px 0 0;
    }
  }
}

.about-container {
  overflow-y: auto;
}

.logo-about {
  padding: 40px 0 0 0;
  margin: 0 auto 0 auto !important;
  width: 150px;
  height: 150px;

  .logo-about-img {
    width: 100%;
    transform-origin: top left;
    animation: float-around 10s $dynamic-easing infinite;
    @keyframes float-around {
      0% {
        transform: translate(0, 0);
      }
      50% {
        transform: translate(-10%, -10%) scale(1.2);
      }
      100% {
        transform: translate(0, 0);
      }
    }
  }
}
</style>
