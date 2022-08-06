<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  image?: string;
}>();
</script>

<template>
  <Head>
    <Title>{{ title }}</Title>
    <Meta property="og:title" :content="title" />
    <Meta name="description" :content="description" />
    <Meta property="og:description" :content="description" />
    <Meta property="og:title" :content="title" />
    <Meta property="og:image" :content="image" />
  </Head>
</template>
