import { useSettingsStore } from '@/store/settings';

export const useSponsorBlockUtils = () => {
  const settingsStore = useSettingsStore();

  const getHumanReadableCategory = (category: string) => {
    switch (category) {
      case 'sponsor':
        return 'Sponsor';
      case 'intro':
        return 'Intro';
      case 'outro':
        return 'Outro';
      case 'interaction':
        return 'Interaction reminder';
      case 'selfpromo':
        return 'Self promotion';
      case 'music_offtopic':
        return 'Non-music section';
      case 'preview':
        return 'Preview';
      case 'filler':
        return 'Filler';
    }
  };

  const getSegmentState = (category: string) => {
    switch (category) {
      case 'sponsor':
        return settingsStore.sponsorblockSegmentSponsor;
      case 'intro':
        return settingsStore.sponsorblockSegmentIntro;
      case 'outro':
        return settingsStore.sponsorblockSegmentOutro;
      case 'interaction':
        return settingsStore.sponsorblockSegmentInteraction;
      case 'selfpromo':
        return settingsStore.sponsorblockSegmentSelfpromo;
      case 'music_offtopic':
        return settingsStore.sponsorblockSegmentMusicOfftopic;
      case 'preview':
        return settingsStore.sponsorblockSegmentPreview;
      case 'filler':
        return settingsStore.sponsorblockSegmentFiller;
    }
  };

  const getSegmentColor = (category: string): string => {
    switch (category) {
      case 'sponsor':
        return '#0ec972';
      case 'intro':
        return '#07faf0';
      case 'outro':
        return '#0073e0';
      case 'interaction':
        return '#b711df';
      case 'selfpromo':
        return '#fdfb0e';
      case 'music_offtopic':
        return '#f89c06';
      case 'preview':
        return '#ef3939';
      case 'filler':
        return '#7300FF';
      default:
        return '#0fca15';
    }
  };

  return {
    getSegmentColor,
    getSegmentState,
    getHumanReadableCategory
  };
};
