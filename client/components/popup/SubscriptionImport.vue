<template>
  <div class="subscriptions-import popup">
    <div class="popup-container subscriptions-import-container">
      <CloseIcon class="close-icon" @click.stop="$emit('close')" />
      <h1>Import subscriptions</h1>
      <div class="pages-container" :class="{ 'page-2': page2 }">
        <div class="page-container page-1-container">
          <h2><YoutubeIcon />Import from Youtube</h2>
          <ol>
            <li class="links">
              Go to
              <a target="_blank" rel="noreferrer noopener" :href="youtubeSubscriptionUrl">{{
                youtubeSubscriptionUrl
              }}</a
              >.
            </li>
            <li>You may be asked to login.</li>
            <li>Download the file with the name "subscription_manager".</li>
            <li>Upload it here.</li>
          </ol>
          <input
            id="youtube-file-upload"
            type="file"
            name="file-upload"
            multiple="false"
            @change="onYoutubeSubscriptionFileChange"
          />
          <p>Also supports invidious opml exports.</p>
        </div>
        <div
          v-if="subscriptionsToImport && subscriptionsToImport.length > 0"
          class="page-container page-2-container"
        >
          <h2>Select subscriptions to import</h2>
          <div class="list-actions">
            <div class="left">
              <BadgeButton :click="selectAll">
                <SelectAllIcon />
                <p>Select all</p>
              </BadgeButton>
              <BadgeButton :click="unselectAll">
                <UnselectAllIcon />
                <p>Unselect all</p>
              </BadgeButton>
            </div>
            <div class="right">
              <BadgeButton :click="importSelected" :disabled="anySelectedChannel">
                <ImportIcon />
                <p>Import</p>
              </BadgeButton>
            </div>
          </div>
          <div class="subscription-channels-container">
            <div
              v-for="channel in subscriptionsToImport"
              :key="channel.authorId"
              class="subscription"
            >
              <CheckBox
                :value="channel.selected"
                :label="channel.author"
                @valuechange="e => channelCheckBoxChanged(e, channel.authorId)"
              />
            </div>
          </div>
        </div>
        <div class="loading-overlay" :class="{ loading }">
          <Spinner />
        </div>
      </div>
    </div>
    <div class="settings-overlay popup-overlay" @click.stop="onTryClosePopup" />
  </div>
</template>

<script>
import CloseIcon from 'vue-material-design-icons/Close';
import YoutubeIcon from 'vue-material-design-icons/Youtube';
import ImportIcon from 'vue-material-design-icons/Import';
import SelectAllIcon from 'vue-material-design-icons/SelectAll';
import UnselectAllIcon from 'vue-material-design-icons/Select';
import CheckBox from '@/components/form/CheckBox';
import BadgeButton from '@/components/buttons/BadgeButton';
import SubscriptionConverter from '@/plugins/services/subscriptionConverter';
import Spinner from '@/components/Spinner';
import Commons from '@/plugins/commons';
import '@/assets/styles/popup.scss';

export default {
  name: 'SubscriptionsImport',
  components: {
    CloseIcon,
    YoutubeIcon,
    CheckBox,
    BadgeButton,
    ImportIcon,
    SelectAllIcon,
    UnselectAllIcon,
    Spinner
  },
  data() {
    return {
      youtubeSubscriptionUrl: 'https://www.youtube.com/subscription_manager?action_takeout=1',
      page2: false,
      subscriptionsToImport: null,
      commons: Commons,
      loading: false
    };
  },
  computed: {
    selectedChannels() {
      return this.subscriptionsToImport.filter(e => e.selected);
    },
    anySelectedChannel() {
      return !(this.selectedChannels.length > 0);
    }
  },
  methods: {
    onTryClosePopup() {
      if (this.page2) {
      } else {
        this.$emit('close');
      }
    },
    onYoutubeSubscriptionFileChange(e) {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        this.subscriptionsToImport = SubscriptionConverter.convertFromYoutubeOPMLToJson(
          fileReader.result
        )
          .sort((a, b) => a.author.localeCompare(b.author))
          .map(({ author, authorId }) => ({
            author,
            authorId,
            selected: true
          }));
        this.page2 = true;
      };
      fileReader.readAsText(e.target.files[0]);
    },
    channelCheckBoxChanged(newValue, channelId) {
      this.subscriptionsToImport.find(e => e.authorId === channelId).selected = newValue;
    },
    selectAll() {
      this.subscriptionsToImport.forEach(el => {
        el.selected = true;
      });
    },
    unselectAll() {
      this.subscriptionsToImport.forEach(el => {
        el.selected = false;
      });
    },
    importSelected() {
      this.loading = true;
      const subscriptions = this.selectedChannels;
      const subscriptionIds = subscriptions.map(e => e.authorId);
      this.$axios
        .post(
          `${this.$store.getters['environment/apiUrl']}user/subscriptions/multiple`,
          {
            channels: subscriptionIds
          },
          {
            withCredentials: true
          }
        )
        .then(response => {
          this.loading = false;
          this.$store.dispatch('messages/createMessage', {
            type: 'info',
            title: 'Import successful',
            message: 'Imported your subscriptions'
          });
          this.$emit('close');
        });
    }
  }
};
</script>

<style lang="scss">
.subscriptions-import {
  .subscriptions-import-container {
    .pages-container {
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      position: relative;
      box-sizing: border-box;
      margin: 0;

      .loading-overlay {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: 11;
        background-color: var(--bgcolor-alt);
        opacity: 0;
        pointer-events: none;
        transition: opacity 300ms $intro-easing;

        .spinner {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        &.loading {
          opacity: 1;
        }
      }

      .page-container {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: hidden scroll;
        background-color: var(--bgcolor-alt);
      }

      // .page-1-container {
      // }
      .page-2-container {
        pointer-events: none;
        user-select: none;
        opacity: 0;
        transform: translateX(10px);
        transition: transform 300ms $overshoot-easing, opacity 300ms $intro-easing;

        .list-actions {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
        }

        h2 {
          padding: 10px 0;
        }

        .subscription-channels-container {
          display: flex;
          flex-direction: column;

          .subscription {
            display: flex;
            flex-direction: row;
            margin: 10px 0;

            .checkbox {
              width: 100%;

              .label {
                flex-grow: 1;
                text-align: start;
              }
            }
          }
        }
      }

      &.page-2 {
        .page-2-container {
          pointer-events: auto;
          user-select: auto;
          transform: translateX(0);
          opacity: 1;
        }
      }
    }
  }
}
</style>
