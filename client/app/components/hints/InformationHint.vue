<template>
  <div class="information-hint"><slot /><VTIcon name="mdi:information" /></div>
</template>


<style lang="scss">
.information-hint {
  border: 2px solid #4caf4f5e;
  background-color: #4caf4f1e;
  padding: 8px;
  display: flex;
  border-radius: 5px;
  justify-content: space-between;

  .vt-icon {
    justify-self: flex-end;
    padding: 0 10px 0 0;
  }
}
</style>
