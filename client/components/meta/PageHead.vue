<script setup lang="ts">
type ConditionalPropType = string | undefined | null;

const props = defineProps<{
  title: ConditionalPropType;
  description: ConditionalPropType;
  image?: ConditionalPropType;
  video?: ConditionalPropType;
}>();

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
</script>

<template>
  <Head>
    <Title>{{ titleString }}</Title>
    <Meta property="og:title" :content="titleString" />
    <Meta name="description" :content="descriptionString" />
    <Meta property="og:description" :content="descriptionString" />
    <Meta v-if="imageString" property="og:image" :content="imageString" />
    <Meta v-if="videoString" property="og:video" :content="videoString" />
  </Head>
</template>
