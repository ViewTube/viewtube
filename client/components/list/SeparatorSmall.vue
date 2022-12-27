<template>
  <div class="separator-small">
    <span class="separator-line" />
    <span class="separator-small-text"><slot /></span>
    <span class="separator-line" />
  </div>
</template>

<style lang="scss">
.separator-small {
  width: 100%;
  margin: 20px 0;
  display: flex;

  .separator-small-text {
    color: var(--subtitle-color-light);
    font-size: 0.8rem;
    font-weight: 300;
  }

  .separator-line {
    content: '';
    flex: 1;
    background-color: var(--subtitle-color-light);
    height: 1px;
    margin: auto 20px;
  }
}
</style>
