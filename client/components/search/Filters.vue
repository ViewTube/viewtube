<template>
  <div class="filters">
    <details class="filter-details">
      <summary class="filter-summary">Filters</summary>
      <div class="filter-form">
        <div v-for="(filter, i) in filters" :key="i" class="filter">
          <p class="filter-title">{{ filter.filterType }}</p>
          <nuxt-link
            v-for="(filterValue, index) in filter.filterValues"
            :key="index"
            :to="getFilterUrl(filter.filterType, filterValue.name)"
            class="filter-value"
            :class="{ disabled: isDisabled(filterValue.name) }"
          >
            <label class="radio-container">
              <input
                :id="filterValue.name.replaceAll(' ', '-')"
                type="radio"
                :name="filter.filterType"
                :value="filterValue.name"
                :checked="
                  filterValue.active || $route.query[filter.filterType] === filterValue.name
                "
              />
              <label
                v-tippy="filterValue.description"
                class="check"
                :for="filterValue.name.replaceAll(' ', '-')"
              />
              <p>{{ filterValue.name }}</p>
            </label>
          </nuxt-link>
        </div>
        <div class="control-btns">
          <nuxt-link :to="`/results?search_query=${searchValue}`" class="reset-btn btn"
            >Reset</nuxt-link
          >
        </div>
      </div>
    </details>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  name: 'Filters',
  props: {
    filters: Array
  },
  data() {
    return {
      searchValue: ''
    };
  },
  fetch() {
    if (this.$route.query.search_query) {
      this.searchValue = this.$route.query.search_query;
    }
  },
  watch: {
    '$route.query': '$fetch'
  },
  methods: {
    onFilterApply(e) {
      const formData = new FormData(e.target);
      // FormData in URLSearchParams is supported in all major browsers
      const searchParams = new URLSearchParams(formData as any);
      const queryString = searchParams.toString();
      this.$router.push(`/results?${queryString}`);
    },
    getFilterUrl(filterName: string, filterValue: string): string {
      const newUrlParams = new URLSearchParams(this.$route.query);
      newUrlParams.set(filterName, filterValue);
      return `/results?${newUrlParams.toString()}`;
    },
    isDisabled(filterValue: string): boolean {
      const urlSearchParams = new URLSearchParams(this.$route.query);
      if (
        urlSearchParams.get('Upload date') ||
        urlSearchParams.get('Features') ||
        urlSearchParams.get('Duration')
      ) {
        if (filterValue === 'Channel' || filterValue === 'Playlist' || filterValue === 'Show') {
          return true;
        }
      }
      if (urlSearchParams.get('Type') === 'Channel') {
        if (
          filterValue !== 'Relevance' &&
          filterValue !== 'Upload date' &&
          filterValue !== 'View count' &&
          filterValue !== 'Rating' &&
          filterValue !== 'Channel'
        ) {
          return true;
        } else {
          return false;
        }
      }
      return false;
    }
  }
});
</script>

<style lang="scss">
.filters {
  z-index: 11;

  .filter-details {
    width: 100%;

    .filter-summary {
      margin: 0;
      cursor: pointer;
      font-weight: bold;
    }

    .filter-form {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      position: relative;
      padding: 15px 0 45px 0;

      @media screen and (max-width: $mobile-width) {
        flex-wrap: wrap;

        .filter {
          margin: 0 20px 15px 0;
        }
      }

      #search-query {
        display: none;
      }

      .control-btns {
        position: absolute;
        top: -30px;
        left: 80px;

        .btn {
          background-color: var(--bgcolor-alt);
          text-decoration: none;
          color: var(--title-color);
          margin: 2px 5px 2px 0;
          border-radius: 3px;
          padding: 2px 10px;
          display: inline-block;
          transition: background-color 200ms $intro-easing, border 200ms $intro-easing;
          border: 2px solid var(--theme-color-translucent);
          width: auto;
          white-space: nowrap;
          cursor: pointer;
        }
        .reset-btn {
        }
        .apply-btn {
        }
      }

      .filter {
        .filter-title {
          font-weight: bold;
        }
        .filter-value {
          margin: 6px 0;
          position: relative;
          display: block;

          &.disabled {
            pointer-events: none;
            filter: grayscale(0);
            opacity: 0.6;
          }

          .radio-container {
            display: block;
            position: relative;
            padding: 0 0 0 25px;
            cursor: pointer;
            pointer-events: none;
            user-select: none;

            input {
              position: absolute;
              opacity: 0;
              cursor: pointer;
              pointer-events: none;
            }

            p {
              transition: color 300ms $intro-easing;
            }

            input:checked ~ p {
              color: var(--theme-color);
            }

            input:checked ~ .check {
              border: solid 3px var(--theme-color);
              background-color: var(--theme-color);
            }

            .check {
              position: absolute;
              top: 2px;
              left: 0;
              height: 14px;
              width: 14px;
              border: solid 3px var(--subtitle-color);
              border-radius: 50%;
              transition: border 300ms $intro-easing, background-color 300ms $intro-easing;
            }
          }
        }
      }
    }
  }
}
</style>
