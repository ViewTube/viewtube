<template>
  <div class="home">
    <vue-headful
      title="Home - ViewTube"
      :description="commons.description"
      image="https://viewtube.eu/images/icon-256.png"
      lang="en"
    />
    <Spinner class="centered" v-if="loading"></Spinner>
    <div class="section-title">
      <div class="background">
        <span class="background-shadow"></span>
      </div>
      <tabs>
        <tab name="Popular videos">
          <div class="home-videos-container">
            <VideoEntry
              v-for="video in videos.popular"
              :key="video.videoId"
              :video="video"
              @changed="tabPopularChanged"
            ></VideoEntry>
          </div>
        </tab>
        <tab name="Trending Gaming">
          <div class="home-videos-container">
            <VideoEntry
              v-for="video in videos.trendingGaming"
              :key="video.videoId"
              :video="video"
              @changed="tabGamingChanged"
            ></VideoEntry>
          </div>
        </tab>
        <tab name="Trending Music">
          <div class="home-videos-container">
            <VideoEntry
              v-for="video in videos.trendingMusic"
              :key="video.videoId"
              :video="video"
              @changed="tabMusicChanged"
            ></VideoEntry>
          </div>
        </tab>
        <tab name="Trending News">
          <div class="home-videos-container">
            <VideoEntry
              v-for="video in videos.trendingNews"
              :key="video.videoId"
              :video="video"
              @changed="tabNewsChanged"
            ></VideoEntry>
          </div>
        </tab>
        <tab name="Trending Movies">
          <div class="home-videos-container">
            <VideoEntry
              v-for="video in videos.trendingMovies"
              :key="video.videoId"
              :video="video"
              @changed="tabMoviesChanged"
            ></VideoEntry>
          </div>
        </tab>
      </tabs>
    </div>
    <BottomNavigation />
  </div>
</template>

<script>
import Commons from '@/commons.js'
import VideoEntry from '@/components/list/VideoEntry'
import Spinner from '@/components/Spinner'
import BottomNavigation from '@/components/BottomNavigation'

export default {
  name: 'home',
  components: {
    VideoEntry,
    Spinner,
    BottomNavigation
  },
  data: function () {
    return {
      videos: {
        popular: [],
        trendingGaming: [],
        trendingMusic: [],
        trendingNews: [],
        trendingMovies: []
      },
      loading: true,
      commons: Commons
    }
  },
  mounted: function () {
  },
  methods: {
    loadData (data) {
      this.videos.popular = data
      this.loading = false
      this.$Progress.finish()
    },
    tabGamingChanged () {
      let me = this
      this.fetchFromApi('trending', 'gaming')
        .then((data) => {
          me.videos.trendingGaming = data
        }, (error) => {
          console.log(error)
        })
    },
    tabMusicChanged () {
      let me = this
      this.fetchFromApi('trending', 'music')
        .then((data) => {
          me.videos.trendingGaming = data
        }, (error) => {
          console.log(error)
        })
    },
    tabNewsChanged () {
      let me = this
      this.fetchFromApi('trending', 'news')
        .then((data) => {
          me.videos.trendingGaming = data
        }, (error) => {
          console.log(error)
        })
    },
    tabMoviesChanged () {
      let me = this
      this.fetchFromApi('trending', 'movies')
        .then((data) => {
          me.videos.trendingGaming = data
        }, (error) => {
          console.log(error)
        })
    },
    fetchFromApi (url, param) {
      return new Promise((resolve, reject) => {
        fetch(`${Commons.apiUrl}${url}?type=${param}`, {
          cache: 'force-cache',
          method: 'GET'
        })
          .then(response => response.json())
          .then(data => {
            resolve(data)
          })
          .catch(error => {
            console.error(error)
            reject(error)
          })
      })
    }
  },
  beforeRouteEnter: function (to, from, next) {
    fetch(`${Commons.apiUrl}popular`, {
      cache: 'force-cache',
      method: 'GET'
    })
      .then(response => response.json())
      .then(data => {
        next(vm => vm.loadData(data))
      })
      .catch(error => {
        console.error(error)
        next(vm => vm.$Progress.fail())
      })
  },
  beforeRouteUpdate: function (to, from, next) {
    this.$Progress.start()
    fetch(`${Commons.apiUrl}top`, {
      cache: 'force-cache',
      method: 'GET'
    })
      .then(response => response.json())
      .then(data => {
        this.loadData(data)
        next()
      })
      .catch(error => {
        console.error(error)
        this.$Progress.fail()
        next()
      })
  }
}
</script>

<style lang="scss">
.home {
  .section-title {
    height: 80px;
    overflow: visible;
    position: relative;
    z-index: 9;

    .background {
      height: 400px;
      position: relative;

      background: linear-gradient(
        to top left,
        $theme-color-alt 0%,
        $theme-color-light 120%
      );

      .background-shadow {
        position: absolute;
        left: 0;
        bottom: 0;
        height: 400px;
        width: 100%;
        background: linear-gradient(to bottom, transparent, $bgcolor-main);
      }
    }

    .title {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      max-width: $main-width;
      margin: 0 auto;
      line-height: 80px;
      font-size: 2rem;
      text-align: start;
      padding: 0 0 0 10px;
      color: $title-color;
      box-sizing: border-box;
    }
  }

  .home-videos-container {
    width: 100%;
    max-width: $main-width;
    margin: 0 auto;
    z-index: 10;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly;

    @media screen and (max-width: $mobile-width) {
      flex-direction: column;
    }
  }
}
</style>
