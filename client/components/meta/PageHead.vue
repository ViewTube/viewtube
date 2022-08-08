<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  image?: string;
  video?: string;
}>();
</script>

<template>
  <Head>
    <Title>{{ title }}</Title>
    <Meta property="og:title" :content="title" />
    <Meta name="description" :content="description" />
    <Meta property="og:description" :content="description" />
    <Meta property="og:title" :content="title" />
    <Meta v-if="image" property="og:image" :content="image" />
    <Meta v-if="video" property="og:video" :content="video" />
  </Head>
</template>
