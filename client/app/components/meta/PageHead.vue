<script setup lang="ts">
import destr from 'destr';

type ConditionalPropType = string | undefined | null;

const props = withDefaults(
  defineProps<{
    title?: ConditionalPropType;
    description?: ConditionalPropType;
    image?: ConditionalPropType;
    video?: ConditionalPropType;
    url?: ConditionalPropType;
  }>(),
  {
    title: 'ViewTube',
    description: 'ViewTube is an alternative YouTube frontend.',
    image: 'https://viewtube.io/icon-192.png',
    video: undefined,
    url: undefined
  }
);

const runtimeConfig = useRuntimeConfig();

const safelyReturn = (prop: ConditionalPropType, returnValue: string | null = ''): string => {
  if (
    prop !== null &&
    prop !== undefined &&
    prop.length > 0 &&
    prop !== 'undefined' &&
    prop !== 'null'
  ) {
    return prop;
  }
  return returnValue;
};

const titleString = computed(() => safelyReturn(props.title));

const descriptionString = computed(() => safelyReturn(props.description));

const imageString = computed(() => safelyReturn(props.image, null));

const videoString = computed(() => safelyReturn(props.video, null));

useHead(destr(runtimeConfig.public.additionalMeta));
</script>

<template>
  <Html lang="en">
    <Head>
      <Title>{{ titleString }}</Title>

      <Meta v-if="url" property="og:url" :content="url" />

      <Meta property="og:title" :content="titleString" />
      <Meta property="twitter:title" :content="titleString" />

      <Meta name="description" :content="descriptionString" />
      <Meta property="og:description" :content="descriptionString" />
      <Meta property="twitter:description" :content="descriptionString" />

      <Meta v-if="imageString" property="og:image" :content="imageString" />
      <Meta v-if="imageString" property="twitter:image" :content="imageString" />

      <Meta v-if="videoString" property="og:video" :content="videoString" />

      <Meta name="theme-color" content="#121212" />

      <Meta property="twitter:card" content="summary_large_image" />

      <Meta property="og:locale" content="en_US" />
      <Meta property="og:site_name" content="ViewTube" />
      <Link
        rel="search"
        type="application/opensearchdescription+xml"
        title="Search ViewTube"
        href="/viewtubesearch.xml"
      />
      <Link rel="manifest" href="/manifest.json" />
      <Link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <Link rel="icon" type="image/x-icon" href="/favicon.ico" />
    </Head>
  </Html>
</template>
