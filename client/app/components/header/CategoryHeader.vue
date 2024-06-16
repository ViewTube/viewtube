<template>
  <div class="category-header">
    <div class="text"><slot /></div>
    <div class="line" />
  </div>
</template>

<style lang="scss" scoped>
.category-header {
  padding: 4px 15px;
  display: flex;
  flex-direction: row;
  gap: 10px;
  opacity: 0.9;

  .text {
    color: var(--subtitle-color-light);
    font-size: 0.8rem;
    margin: auto 0;
  }

  .line {
    margin: auto 0;
    width: 100%;
    height: 1px;
    background-color: var(--subtitle-color-light);
  }
}
</style>
