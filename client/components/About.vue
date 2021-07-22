<template>
  <div class="about popup">
    <div class="about-container popup-container">
      <CloseIcon class="close-icon" @click.stop="$emit('close')" />
      <h1>About ViewTube</h1>
      <div class="logo-about">
        <img class="logo-about-img" src="@/assets/icon.svg" alt="ViewTube" />
      </div>
      <h2>ViewTube by Maurice Oegerli</h2>
      <h5>Version {{ version }}</h5>
      <h4>{{ description }}</h4>
      <div class="links-about">
        <BadgeButton :href="'https://github.com/viewtube/viewtube-vue'">
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
      <div v-if="invidiousStatsError" class="invidious-error" v-html="invidiousStatsError" />
      <div v-if="invidiousStats" class="invidious-stats">
        <table>
          <tr>
            <td>Invidious instance</td>
            <td>{{ currentInstance }}</td>
          </tr>
          <tr>
            <td>Version</td>
            <td>{{ invidiousStats.software.version }}</td>
          </tr>
          <tr>
            <td>Last update</td>
            <td>
              {{ new Date(invidiousStats.metadata.updatedAt).toUTCString() }}
            </td>
          </tr>
        </table>
      </div>
      <div class="sponsorblock-container">
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
import packageJson from '@/../package.json';
import BadgeButton from '@/components/buttons/BadgeButton.vue';
import InvidiousLicense from '@/components/licenses/Invidious.vue';
import { computed, defineComponent, onMounted, ref } from '@nuxtjs/composition-api';
import { useAccessor } from '@/store';
import { useAxios } from '@/plugins/axiosPlugin';

export default defineComponent({
  name: 'About',
  components: {
    CloseIcon,
    GithubIcon,
    ExternalIcon,
    BadgeButton,
    InvidiousLicense
  },
  setup() {
    const accessor = useAccessor();
    const axios = useAxios();

    const description = ref('');
    const version = ref('');
    const invidiousStats = ref(null);
    const invidiousStatsError = ref(null);

    const currentInstance = computed(() => accessor.instances.currentInstance);

    onMounted(() => {
      axios
        .get(`${accessor.environment.apiUrl}stats`)
        .then(response => {
          invidiousStats.value = response.data;
        })
        .catch(_ => {
          invidiousStatsError.value = `Error loading invidious stats. The instance <span class="monospace">${currentInstance.value}</span> might be unavailable`;
        });
    });

    description.value = packageJson.description;
    version.value = packageJson.version;

    return {
      description,
      invidiousStats,
      invidiousStatsError,
      currentInstance,
      version
    };
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
.invidious-error {
  margin: 20px 0 20px 0 !important;
  color: var(--error-color-red);
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
.sponsorblock-container {
  margin: 0 !important;
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
