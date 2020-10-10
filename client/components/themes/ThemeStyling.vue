<template>
  <style v-html="getThemeCssString()"></style>
</template>

<script>
export default {
  methods: {
    getTheme() {
      return this.$accessor.theme.themeVariables;
    },
    getThemeCssString() {
      let themeCssString = ':root {';
      this.getTheme().forEach(element => {
        themeCssString += '--' + element.variableKey + ': ' + element.variableValue + ';';
      });
      themeCssString += '}';
      return themeCssString;
    }
  }
};
</script>
