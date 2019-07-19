<template>
  <div class="header">
    <a class="logo-link" href>
      <h1 class="logo">
        <span>View</span>
        <span class="logo-colored">Tube</span>
      </h1>
      <img class="logo-small" src="images/icon-192.jpg" alt="ViewTube" />
    </a>
    <div class="search-box">
      <input type="search" name="search" id="search" placeholder="search" />
      <a href="#" class="search-btn ripple" vt-tooltip="click or press enter to search">
        <SearchIcon />
      </a>
      <div class="search-autocomplete-container"></div>
    </div>
    <div class="nav">
      <a
        href="#"
        id="open-in-yt"
        class="ripple"
        vt-tooltip="view on youtube (hold alt for invidio.us)"
      >
        <svg class="yt-logo" viewBox="0 0 71.412065 50" width="24" height="24">
          <g id="g5" transform="scale(0.58823529,0.58823529)">
            <path
              class="st0"
              d="M 118.9,13.3 C 117.5,8.1 113.4,4 108.2,2.6 98.7,0 60.7,0 60.7,0 60.7,0 22.7,0 13.2,2.5 8.1,3.9 3.9,8.1 2.5,13.3 0,22.8 0,42.5 0,42.5 0,42.5 0,62.3 2.5,71.7 3.9,76.9 8,81 13.2,82.4 22.8,85 60.7,85 60.7,85 c 0,0 38,0 47.5,-2.5 5.2,-1.4 9.3,-5.5 10.7,-10.7 2.5,-9.5 2.5,-29.2 2.5,-29.2 0,0 0.1,-19.8 -2.5,-29.3 z"
            />
            <polygon class="st1" points="80.2,42.5 48.6,24.3 48.6,60.7 " />
          </g>
        </svg>
      </a>
      <a href="#" id="reload-btn" class="ripple" vt-tooltip="hard reload">
        <RefreshIcon />
      </a>
      <a href="#" id="theme-change" class="ripple" vt-tooltip="change theme">
        <InvertColorsIcon />
      </a>
      <a href="#" id="settings-btn" class="ripple" vt-tooltip="settings">
        <SettingsIcon />
      </a>
    </div>
  </div>
</template>

<script>
import RefreshIcon from 'icons/Refresh.vue'
import InvertColorsIcon from 'icons/InvertColors.vue'
import SettingsIcon from 'icons/Settings.vue'
import SearchIcon from 'icons/Magnify.vue'

export default {
  name: 'Header',
  components: {
    RefreshIcon,
    InvertColorsIcon,
    SettingsIcon,
    SearchIcon
  }
}
</script>

<style lang="scss">
.header {
  height: $header-height;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  box-shadow: $low-shadow;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  z-index: 800;
  background-color: $header-bgcolor;

  .logo-link {
    text-decoration: none;
    margin: auto 10px auto 10px;
    box-sizing: border-box;

    .logo {
      font-family: $header-font;
      font-size: 1.5rem;
      color: $subtitle-color;

      .logo-colored {
        color: transparent;
        background-image: $theme-color-gradient;
        background-clip: text;
        -webkit-background-clip: text;
      }
    }

    .logo-small {
      display: none;
      margin: auto;
      height: calc(#{$header-height} - 20px);
    }
  }

  .search-box {
    display: flex;
    flex-direction: row;
    height: 50%;
    margin: auto;
    width: 100%;
    max-width: $search-box-width;
    justify-content: flex-end;
    background-color: rgba(128, 128, 128, 0.37);
    position: relative;

    .search-btn {
      text-decoration: none;
      color: $theme-color;
      width: 50px;
      text-align: center;
      display: flex;
      user-select: none;

      .material-design-icon {
        margin: auto;
      }
    }

    .search-autocomplete-container {
      width: 100%;
      position: absolute;
      top: 0;
      left: 0;
      margin-top: $header-height / 2;
      background-color: $header-bgcolor;
      display: flex;
      flex-direction: column;
      box-shadow: $medium-shadow;

      .search-autocomplete-entry {
        padding: 5px 0 5px 10px;
        cursor: default;
        color: $title-color;
        text-decoration: none;
        font-family: $default-font;

        &:hover,
        &.selected {
          background-color: $bgcolor-alt;
        }
      }

      &.hidden {
        display: none;
      }
    }

    #search {
      width: 100%;
      height: 100%;
      border: none;
      color: $title-color;
      font-size: 1rem;
      margin: 0 0 0 10px;
      min-width: 0px;
      visibility: visible;
      background-color: transparent;

      &:target {
        all: unset;
      }

      &:focus {
        outline: none;
      }
    }
  }

  .nav {
    margin: auto 10px auto 5px;
    color: $theme-color;
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    a {
      text-decoration: none;
      color: $theme-color;
      margin: 0 6px;
      display: flex;
      user-select: none;
      border-radius: 50%;
      padding: 3px;
      width: 24px;
      height: 24px;

      i {
        margin: auto;
        height: 100%;
      }
    }

    #open-in-yt {
      .yt-logo {
        width: 100%;
        fill: #fff;

        .st0 {
          fill: $theme-color;
        }

        .st1 {
          fill: $header-bgcolor;
        }
      }
    }
  }
}
</style>
