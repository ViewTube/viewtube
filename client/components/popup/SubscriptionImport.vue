<template>
  <div class="subscriptions-import popup">
    <div class="popup-container subscriptions-import-container">
      <CloseIcon class="close-icon" @click.stop="$emit('close')" />
      <h1>
        {{
          loading
            ? 'Importing subscriptions'
            : page3
            ? 'Imported subscriptions'
            : 'Import subscriptions'
        }}
      </h1>
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
        <div v-if="importedSubscriptions" class="page-container page-3-container">
          <h2>Import results</h2>
          <h3 v-if="successfulMergedImports.length > 0">
            {{ successfulMergedImports.length }} successful import{{
              successfulMergedImports.length !== 1 ? 's' : ''
            }}
          </h3>
          <div v-if="successfulMergedImports.length > 0" class="import-area">
            <div class="import-list">
              <p v-for="subscription in successfulMergedImports" :key="subscription.authorId">
                {{ subscription.author }}
              </p>
            </div>
          </div>
          <h3 v-if="existingMergedImports.length > 0">
            {{ existingMergedImports.length }} already existing subscription{{
              existingMergedImports.length !== 1 ? 's' : ''
            }}
          </h3>
          <div v-if="existingMergedImports.length > 0" class="import-area">
            <div class="import-list">
              <p v-for="subscription in existingMergedImports" :key="subscription.authorId">
                {{ subscription.author }}
              </p>
            </div>
          </div>
          <h3 v-if="failedMergedImports.length > 0">
            {{ failedMergedImports.length }} failed import{{
              failedMergedImports.length !== 1 ? 's' : ''
            }}
          </h3>
          <div v-if="failedMergedImports.length > 0" class="import-area">
            <div class="import-list">
              <a
                v-for="subscription in failedMergedImports"
                :key="subscription.authorId"
                :href="`/channel/${subscription.authorId}`"
                target="_blank"
                ><ExternalIcon />{{ subscription.author }}</a
              >
            </div>
          </div>
        </div>
        <div class="loading-overlay" :class="{ loading }">
          <Spinner />
          <p class="loading-text">This can take a while</p>
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
import ExternalIcon from 'vue-material-design-icons/OpenInNew';
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
    Spinner,
    ExternalIcon
  },
  data() {
    return {
      youtubeSubscriptionUrl: 'https://www.youtube.com/subscription_manager?action_takeout=1',
      page2: false,
      subscriptionsToImport: null,
      commons: Commons,
      loading: false,
      importedSubscriptions: null
    };
  },
  computed: {
    selectedChannels() {
      return this.subscriptionsToImport.filter(e => e.selected);
    },
    anySelectedChannel() {
      return !(this.selectedChannels.length > 0);
    },
    successfulMergedImports() {
      if (this.importedSubscriptions && this.importedSubscriptions.successful) {
        return this.importedSubscriptions.successful.map(el => {
          const authorObj = this.subscriptionsToImport.find(val => val.authorId === el.channelId);
          return {
            authorId: el.channelId,
            author: authorObj ? authorObj.author : null
          };
        });
      }
      return [];
    },
    existingMergedImports() {
      if (this.importedSubscriptions && this.importedSubscriptions.existing) {
        return this.importedSubscriptions.existing.map(el => {
          const authorObj = this.subscriptionsToImport.find(val => val.authorId === el.channelId);
          return {
            authorId: el.channelId,
            author: authorObj ? authorObj.author : null
          };
        });
      }
      return [];
    },
    failedMergedImports() {
      if (this.importedSubscriptions && this.importedSubscriptions.failed) {
        return this.importedSubscriptions.failed.map(el => {
          const authorObj = this.subscriptionsToImport.find(val => val.authorId === el.channelId);
          console.log(authorObj);
          return {
            authorId: el.channelId,
            author: authorObj ? authorObj.author : null
          };
        });
      }
      return [];
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
          this.page2 = false;
          this.page3 = true;
          this.loading = false;
          this.importedSubscriptions = response.data;
          // this.$store.dispatch('messages/createMessage', {
          //   type: 'info',
          //   title: 'Import successful',
          //   message: 'Imported your subscriptions'
          // });
          // this.$emit('done');
          // this.$emit('close');
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

        .loading-text {
          position: absolute;
          top: 55%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .spinner {
          position: absolute;
          top: 40%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        &.loading {
          opacity: 1;
          pointer-events: all;
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

      .page-3-container {
        display: flex;
        flex-direction: column;
        height: 100%;

        .import-area {
          flex-grow: 1;
          height: 100%;
          overflow: hidden auto;
          background-color: var(--bgcolor-main);

          .import-list {
            font-size: 0.9rem;

            a {
              display: block;
              span {
                width: 16px;
                height: 16px;
                svg {
                  width: 16px;
                  height: 16px;
                }
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
