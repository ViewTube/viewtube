import { useMessagesStore } from '@/store/messages';
import X2js from 'x2js';

type Caption = {
  text: string;
  start: number;
  duration: number;
};

type CaptionTrack = {
  languageCode: string;
  name: string;
  captions: Caption[];
};

export type AvailableCaptionTrack = CaptionTrack & {
  active: boolean;
  baseUrl: string;
};

type CaptionTrackObject = {
  [languageCode: string]: CaptionTrack;
};

type ParsedCaptionsObject = {
  transcript: {
    text: {
      _start: string;
      _dur: string;
      __text: string;
    }[];
  };
};

export const useCaptionsState = (video: Ref<ApiDto<'VTVideoInfoDto'>>) => {
  const { textProxy } = useProxyUrls();
  const { vtFetch } = useVtFetch();
  const messagesStore = useMessagesStore();

  const downloadedCaptionTracks = ref<CaptionTrackObject>({});
  const currentTrackCode = ref<string | undefined>();

  const availableCaptionTracks = ref<AvailableCaptionTrack[]>();

  const getAvailableCaptionTracks = () => {
    const tracks = video.value.captions;

    if (!tracks) return [];

    return tracks.map(track => {
      const downloadedTrack = downloadedCaptionTracks.value[track.languageCode];

      return {
        ...track,
        captions: downloadedTrack?.captions ?? [],
        active: track.languageCode === currentTrackCode.value
      };
    });
  };

  availableCaptionTracks.value = getAvailableCaptionTracks();

  watch(
    downloadedCaptionTracks,
    () => {
      availableCaptionTracks.value = getAvailableCaptionTracks();
    },
    { deep: true }
  );

  watch(
    () => video.value.captions,
    () => {
      availableCaptionTracks.value = getAvailableCaptionTracks();
    },
    { deep: true }
  );

  watch(currentTrackCode, async newValue => {
    availableCaptionTracks.value = getAvailableCaptionTracks();

    if (newValue) {
      try {
        const track = availableCaptionTracks.value.find(
          captionTrack => captionTrack.languageCode === newValue
        );

        if (!downloadedCaptionTracks.value[track.languageCode]) {
          downloadedCaptionTracks.value[track.languageCode] = {
            languageCode: track.languageCode,
            name: track.name,
            captions: null
          };
        }

        const captionUrl = `${textProxy}${encodeURIComponent(track.baseUrl)}`;
        const captionXml = await vtFetch<string>(captionUrl);

        const x2js = new X2js();

        const captionsObject = x2js.xml2js<ParsedCaptionsObject>(captionXml);

        downloadedCaptionTracks.value[track.languageCode].captions =
          captionsObject.transcript.text.map(el => ({
            text: el.__text,
            duration: parseFloat(el._dur),
            start: parseFloat(el._start)
          }));
      } catch (error: any) {
        messagesStore.createMessage({
          type: 'error',
          title: 'Error loading captions',
          message: error.message
        });
      }
    }
  });

  const selectCaptionsTrack = (trackCode: string) => {
    currentTrackCode.value = trackCode;
  };

  return {
    availableCaptionTracks,
    downloadedCaptionTracks,
    currentTrackCode,
    selectCaptionsTrack
  };
};

export type CaptionsState = ReturnType<typeof useCaptionsState>;
