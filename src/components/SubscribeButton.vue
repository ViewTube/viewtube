<template>
  <div class="subscribe-button"></div>
</template>

<script>
export default {
  name: 'SubscribeButton'
}
</script>

<style lang="scss">
.subscribe-button {
  width: 120px;
  height: 32px;
  border-radius: 5px;
  position: relative;
  background: transparent;
  cursor: pointer;
  line-height: 12px;
}

.subscribe-button:before {
  content: "";
  z-index: 1;
  position: absolute;
  display: block;
  width: 80%;
  height: 70%;
  top: 15%;
  left: 10%;
  transition: 0.3s opacity ease-in-out;
  filter: blur(20px);
  opacity: 0;
  background: $theme-color-primary-gradient;
}

.subscribe-button:hover:before {
  opacity: 1;
  transition: 0.3s opacity ease-in-out;
  filter: blur(20px);
  background: $theme-color-primary-gradient;
}

.subscribe-button:after {
  content: "SUBSCRIBE";
  text-align: center;
  line-height: 32px;
  font-size: 15px;
  color: rgba(235, 235, 235, 1);
  font-family: "Verdana";
  font-weight: bold;
  z-index: 5;
  position: absolute;
  display: block;
  border-radius: 5px;
  width: 100%;
  height: 100%;
  top: 0%;
  left: 0%;
  background: $theme-color-primary-gradient;
}
</style>
