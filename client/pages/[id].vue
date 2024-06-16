<script setup lang="ts">
definePageMeta({
  path: '/:id([a-zA-Z0-9_-]{11})',
  redirect: to => `/watch?v=${to.params.id}`
});
</script>
