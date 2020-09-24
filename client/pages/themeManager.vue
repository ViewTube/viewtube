<template>
  <div>
    <h1>Dummy</h1>
  </div>
</template>

<script>
export default {
  name: 'ThemeManager',
  components: {},
  async fetch() {
    await this.$axios
      .get(`${this.$store.getters['environment/apiUrl']}user/themes`, {
        withCredentials: true
      })
      .then(response => {
        this.themes = response.data;
        this.loading = false;
      })
      .catch(error => {
        console.log(error);
      });
  },
  data: () => ({
    themes: [],
    loading: true
  }),
  computed: {
    userAuthenticated() {
      return this.$store.getters['user/isLoggedIn'];
    }
  },
  head() {
    return {
      title: `Theme Manager :: ViewTube`,
      meta: [] // TODO: find out what would be needed
    };
  }
};
</script>
