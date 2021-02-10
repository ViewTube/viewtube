<template>
  <div class="themeContainer">
    <div class="actions">
      <h2>Manage Themes</h2>
      <BadgeButton :click="() => (cloneTheme = true)">
        <CopyIcon />
        <p>Clone Theme</p>
      </BadgeButton>
    </div>
    <CustomThemeSelector></CustomThemeSelector>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import CustomThemeSelector from '@/components/themes/CustomThemeSelector.vue';
import BadgeButton from '@/components/buttons/BadgeButton.vue';
import CopyIcon from 'vue-material-design-icons/ContentCopy.vue';
export default Vue.extend({ components: { CustomThemeSelector, CopyIcon, BadgeButton } });
</script>
<style lang="scss" scoped>
.themeContainer {
  margin-top: $header-height;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.actions {
  display: flex;
  flex-direction: row;
}
</style>
