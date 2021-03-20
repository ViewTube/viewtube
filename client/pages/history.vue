<template>
  <div class="history">
    <SectionTitle :title="'History'" />
    <HistoryList :history="history" />
    <div class="history-pagination">
      <Pagination :currentPage="currentPage" :pageCount="pageCount" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, useFetch, useRoute, useRouter, watch } from '@nuxtjs/composition-api';
import SectionTitle from '@/components/SectionTitle.vue';
import Pagination from '@/components/pagination/Pagination.vue';
import HistoryList from '@/components/history/HistoryList.vue';
import { useAxios } from '@/plugins/axios';
import { useAccessor } from '@/store';

export default defineComponent({
  name: 'History',
  components: {
    SectionTitle,
    HistoryList,
    Pagination
  },
  setup() {
    const axios = useAxios();
    const router = useRouter();
    const accessor = useAccessor();
    const route = useRoute();

    const history = ref([]);
    const currentPage = ref(1);
    const pageCount = ref(0);
    const searchTerm = ref(null);
    const searchTimeout = ref(null);

    const { fetch } = useFetch(async () => {
      if (accessor.user.isLoggedIn) {
        const limit = 30;
        if (route.value.query && route.value.query.page) {
          currentPage.value = parseInt(route.value.query.page as string);
        }
        let filterString = '';
        if (searchTerm.value) {
          filterString = `&filter=${searchTerm.value}`;
        }
        const start = (currentPage.value - 1) * 30;
        const apiUrl = accessor.environment.apiUrl;
        await axios
          .get(`${apiUrl}user/history?limit=${limit}&start=${start}${filterString}`)
          .then((result: { data: any }) => {
            if (result) {
              history.value = result.data.videos;
              pageCount.value = Math.ceil(result.data.videoCount / 30);
            }
          })
          .catch((_: any) => {
            accessor.messages.createMessage({
              type: 'error',
              title: 'Error loading history',
              message: 'Try logging out and in again'
            });
          });
      } else {
        router.push('/login');
      }
    });

    watch(
      () => route.value.query,
      () => {
        fetch();
      }
    );

    return {
      history,
      currentPage,
      pageCount,
      searchTerm
    };
  }
});
</script>

<style lang="scss">
.history {
  width: 100%;
  max-width: 800px;
  padding-top: $header-height;
  margin: 0 auto;
}
</style>
