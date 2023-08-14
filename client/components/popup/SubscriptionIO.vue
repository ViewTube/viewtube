<template>
  <div class="subscriptions-import popup">
    <div class="popup-container subscriptions-import-container">
      <VTIcon v-ripple name="mdi:close" class="close-icon" @click.stop="$emit('close')" />
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
          <FileButton
            :label="'Import'"
            @change="onImportFileChange"
          >
            <VTIcon name="mdi:import" />
          </FileButton>
        </div>
        <div
          v-if="subscriptionsToImport && subscriptionsToImport.length > 0"
          class="page-container page-2-container"
        >
          <h2>Select subscriptions to import</h2>
          <div class="list-actions">
            <div class="left">
              <BadgeButton :click="selectAll">
                <VTIcon name="mdi:select-all" />
                <p>Select all</p>
              </BadgeButton>
              <BadgeButton :click="unselectAll">
                <VTIcon name="mdi:select" />
                <p>Unselect all</p>
              </BadgeButton>
            </div>
            <div class="right">
              <BadgeButton :click="importSelected" :disabled="anySelectedChannel">
                <VTIcon name="mdi:import" />
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
                ><VTIcon name="mdi:open-in-new" />{{ subscription.author }}</a
              >
            </div>
          </div>
        </div>
        <div class="loading-overlay" :class="{ loading }">
          <Spinner />
          <p class="loading-text">This can take a while</p>
        </div>
      </div>
      <h1 v-if="!subscriptionsToImport">
        {{ loading ? 'Exporting subscriptions' : 'Export subscriptions' }}
      </h1>
      <div v-if="!subscriptionsToImport" class="pages-container" :class="{ 'page-2': page2 }">
        <div class="export-buttons">
          <BadgeButton @change="exportVT"> <VTIcon name="mdi:play" /> ViewTube </BadgeButton>
          <BadgeButton @change="exportOPML"
            ><VTIcon name="mdi:xml" /> Invidious / OPML
          </BadgeButton>
          <BadgeButton @change="exportPiped"> <VTIcon name="mdi:pipe" /> Piped </BadgeButton>
          <BadgeButton @change="exportNewPipe"
            ><VTIcon name="mdi:pipe-valve" /> NewPipe</BadgeButton
          >
        </div>
      </div>
    </div>
    <div class="settings-overlay popup-overlay" @click.stop="onTryClosePopup" />
  </div>
</template>

<script lang="ts">
import CheckBox from '@/components/form/CheckBox.vue';
import BadgeButton from '@/components/buttons/BadgeButton.vue';
import FileButton from '@/components/form/FileButton.vue';
import Spinner from '@/components/Spinner.vue';
import '@/assets/styles/popup.scss';
import { useMessagesStore } from '~/store/messages';

class ChannelDto {
  author: string;
  authorId: string;
  selected?: boolean;
}

export default defineComponent({
  name: 'SubscriptionsImport',
  components: {
    CheckBox,
    BadgeButton,
    FileButton,
    Spinner
  },
emits: ['done', 'close'],
  setup(_, { emit }) {
    const messagesStore = useMessagesStore();
    const { apiUrl } = useApiUrl();
    const { vtFetch } = useVtFetch();

    const youtubeSubscriptionUrl = ref('https://takeout.google.com');
    const page2 = ref(false);
    const page3 = ref(false);
    const subscriptionsToImport = ref(null);
    const loading = ref(false);
    const importedSubscriptions = ref(null);

    const selectedChannels = computed((): Array<ChannelDto> => {
      return subscriptionsToImport.value.filter((e: { selected: any }) => e.selected);
    });
    const anySelectedChannel = computed((): boolean => {
      return !(selectedChannels.value.length > 0);
    });

    const successfulMergedImports = computed((): Array<ChannelDto> => {
      if (importedSubscriptions.value && importedSubscriptions.value.successful) {
        return importedSubscriptions.value.successful.map((el: { channelId: any }) => {
          const authorObj = subscriptionsToImport.value.find(
            (val: { authorId: any }) => val.authorId === el.channelId
          );
          return {
            authorId: el.channelId,
            author: authorObj ? authorObj.author : null
          };
        });
      }
      return [];
    });

    const existingMergedImports = computed((): Array<ChannelDto> => {
      if (importedSubscriptions.value && importedSubscriptions.value.existing) {
        return importedSubscriptions.value.existing.map(el => {
          const authorObj = subscriptionsToImport.value.find(val => val.authorId === el.channelId);
          return {
            authorId: el.channelId,
            author: authorObj ? authorObj.author : null
          };
        });
      }
      return [];
    });

    const failedMergedImports = computed((): Array<ChannelDto> => {
      if (importedSubscriptions.value && importedSubscriptions.value.failed) {
        return importedSubscriptions.value.failed.map((el: { channelId: any }) => {
          const authorObj = subscriptionsToImport.value.find(
            (val: { authorId: any }) => val.authorId === el.channelId
          );
          return {
            authorId: el.channelId,
            author: authorObj ? authorObj.author : null
          };
        });
      }
      return [];
    });

    const onTryClosePopup = () => {
      if (!(page2.value || page2.value)) {
        emit('close');
      }
    };

    const onImportFileChange = (e: any) => {
      const extension = e.target.files[0].name.split('.').pop();
      switch (extension) {
        case 'csv':
          onYTTakeoutFileChange(e);
          break;
        case 'json':
          onJSONPipedFileChange(e);
          break;
        case 'opml':
        case 'xml':
        default:
          onOPMLFileChange(e);
          break;
      }
    };

    const onJSONPipedFileChange = (e:any) => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        if (e.target.files[0].name.includes('.json')) {
          subscriptionsToImport.value = convertJSONPipedToInternal(fileReader.result as string);
        }
        if (subscriptionsToImport.value === undefined) {
          messagesStore.createMessage({
            type: 'error',
            title: 'Invalid or Empty JSON',
            message: 'Please check your file'
          });
        } else {
          subscriptionsToImport.value
            .sort((a: { author: string }, b: { author: string }) =>
              a.author.localeCompare(b.author)
            )
            .map(({ author, authorId }) => ({
              author,
              authorId,
              selected: true
            }));

          page2.value = true;
        }
        loading.value = false;
      };
      loading.value = true;
      fileReader.readAsText(e.target.files[0]);
    };

    const onYTTakeoutFileChange = (e: any) => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        if (e.target.files[0].name.includes('.csv')) {
          subscriptionsToImport.value = convertFromCSVToJson(fileReader.result as string);
        }
        if (subscriptionsToImport.value === undefined) {
          messagesStore.createMessage({
            type: 'error',
            title: 'Invalid or Empty CSV',
            message: 'Please check your file'
          });
        } else {
          subscriptionsToImport.value
            .sort((a: { author: string }, b: { author: string }) =>
              a.author.localeCompare(b.author)
            )
            .map(({ author, authorId }) => ({
              author,
              authorId,
              selected: true
            }));

          page2.value = true;
        }
        loading.value = false;
      };
      loading.value = true;
      fileReader.readAsText(e.target.files[0]);
    };

    const onOPMLFileChange = (e: any) => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        subscriptionsToImport.value = convertFromOPMLToJson(fileReader.result as string);
        if (subscriptionsToImport.value === undefined) {
          messagesStore.createMessage({
            type: 'error',
            title: 'Invalid or Empty OPML',
            message: 'Please check your file'
          });
        } else {
          subscriptionsToImport.value
            .sort((a: { author: string }, b: { author: string }) =>
              a.author.localeCompare(b.author)
            )
            .map(({ author, authorId }) => ({
              author,
              authorId,
              selected: true
            }));

          page2.value = true;
        }
      };
      fileReader.readAsText(e.target.files[0]);
    };

    const exportVT = () => {};
    const exportOPML = () => {};
    const exportPiped = () => {};
    const exportNewPipe = () => {};

    const channelCheckBoxChanged = (newValue: any, channelId: any) => {
      console.log(subscriptionsToImport.value)
      subscriptionsToImport.value.find(
        (e: { authorId: string }) => e.authorId === channelId
      ).selected = newValue;
    };

    const selectAll = () => {
      subscriptionsToImport.value.forEach((el: { selected: boolean }) => {
        el.selected = true;
      });
    };

    const unselectAll = () => {
      subscriptionsToImport.value.forEach((el: { selected: boolean }) => {
        el.selected = false;
      });
    };

    const importSelected = () => {
      loading.value = true;
      const subscriptions = selectedChannels.value;
      const subscriptionIds = subscriptions.map(e => e.authorId);
      console.log(subscriptionIds);
      vtFetch(`${apiUrl.value}user/subscriptions/multiple`, {
        method: 'POST',
        body: {
          channels: subscriptionIds
        },
        credentials: 'include'
      }).then(response => {
        page2.value = false;
        page3.value = true;
        loading.value = false;
        importedSubscriptions.value = response;
        emit('done');
      });
    };

    return {
      youtubeSubscriptionUrl,
      page2,
      page3,
      subscriptionsToImport,
      loading,
      importedSubscriptions,
      selectedChannels,
      anySelectedChannel,
      successfulMergedImports,
      existingMergedImports,
      failedMergedImports,
      exportVT,
      exportOPML,
      exportPiped,
      exportNewPipe,
      onTryClosePopup,
      onImportFileChange,
      onYTTakeoutFileChange,
      onOPMLFileChange,
      channelCheckBoxChanged,
      selectAll,
      unselectAll,
      importSelected
    };
  }
});
</script>

<style lang="scss">
.subscriptions-import {
  .subscriptions-import-container {
    .export-buttons {
      display: flex;
      flex-direction: row;
      justify-content: center;
      a {
        margin-left: 10px;
        margin-right: 10px;
      }
    }
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
        transition:
          transform 300ms $overshoot-easing,
          opacity 300ms $intro-easing;

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
