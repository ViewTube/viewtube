import { getterTree, mutationTree } from 'nuxt-typed-vuex';

type segmentOption = 'skip' | 'ask' | 'none';

export const state = () => ({
  miniplayer: true as boolean,
  chapters: true as boolean,
  sponsorblock: {
    enabled: true,
    sponsor: 'skip' as segmentOption,
    intro: 'ask' as segmentOption,
    outro: 'ask' as segmentOption,
    interaction: 'skip' as segmentOption,
    selfpromo: 'skip' as segmentOption,
    music_offtopic: 'skip' as segmentOption
  }
});

export const getters = getterTree(state, {
  miniplayer: state => state.miniplayer,
  chapters: state => state.chapters,
  sponsorblock: state => state.sponsorblock.enabled,
  sponsorblock_sponsor: state => state.sponsorblock.sponsor,
  sponsorblock_intro: state => state.sponsorblock.intro,
  sponsorblock_outro: state => state.sponsorblock.outro,
  sponsorblock_interaction: state => state.sponsorblock.interaction,
  sponsorblock_selfpromo: state => state.sponsorblock.selfpromo,
  sponsorblock_music_offtopic: state => state.sponsorblock.music_offtopic
});

export const mutations = mutationTree(state, {
  setMiniplayer(state, enabled) {
    state.miniplayer = enabled;
  },
  setChapters(state, enabled) {
    state.chapters = enabled;
  },
  setSponsorblock(state, enabled) {
    state.sponsorblock.enabled = enabled;
  },
  setSponsorblockCategoryStatus(state, { category, status }) {
    if (state.sponsorblock[category]) {
      if (status === 'skip' || status === 'ask' || status === 'none') {
        state.sponsorblock[category] = status;
      }
    }
  }
});
