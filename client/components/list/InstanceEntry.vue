<template>
  <tr>
    <td>{{ instance.url }}</td>
    <td>{{ instance.health }}</td>
    <td v-if="!selected" align="right">
      <a
        v-tippy="'Select Instance'"
        href="#"
        class="ripple tooltip btn"
        @click.self.prevent="chooseInstance"
      >
        <CheckBoxBlank />
        <p>Select</p>
      </a>
    </td>
    <td v-else align="right">
      <a
        v-tippy="'Select Instance'"
        href="#"
        class="ripple tooltip btn selected"
        @click.self.prevent="chooseInstance"
      >
        <CheckBoxMarked />
        <p>Current</p>
      </a>
    </td>
  </tr>
</template>

<script lang="ts">
import CheckBoxBlank from 'vue-material-design-icons/CheckboxBlankOutline.vue';
import CheckBoxMarked from 'vue-material-design-icons/CheckboxMarkedOutline.vue';
import Vue from 'vue';

export default Vue.extend({
  name: 'InstanceEntry',
  components: {
    CheckBoxBlank,
    CheckBoxMarked
  },
  props: {
    instance: {
      type: Object,
      default() {
        return { url: '', health: null };
      }
    }
  },
  computed: {
    selected() {
      if (this.$store.getters['instances/currentInstance'] === this.instance.url) {
        return true;
      } else {
        return false;
      }
    }
  },
  methods: {
    chooseInstance() {
      this.$store.commit('instances/changeInstance', this.instance.url);
    }
  }
});
</script>

<style lang="scss">
a.btn {
  width: fit-content;
  border-radius: 0;
  margin: 0;
  justify-self: center;
  align-self: stretch;
  display: flex;
  border-radius: 5px;
  transition: box-shadow 300ms $intro-easing, border 300ms $intro-easing;
  border: 2px solid transparent;
  flex-direction: row;
  align-items: center;

  &:hover,
  &:active,
  &:focus {
    box-shadow: $low-shadow;
    border: 2px solid var(--theme-color);
  }

  span {
    margin-right: 0.5vw;
    width: 28px;
    height: 28px;

    svg {
      width: 28px;
      height: 28px;
    }
  }

  p {
    margin-right: 0.5vw;
  }
}
.selected {
  color: var(--theme-color);
}
</style>
