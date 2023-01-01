<script setup lang="ts">
import DatePicker from 'vue-datepicker-next';

defineProps<{ modelValue: [Date, Date] }>();
const emit = defineEmits<{ (e: 'update:modelValue', value: [Date, Date]): void }>();

const onDatePickerUpdate = (value: [Date, Date]) => {
  emit('update:modelValue', value);
};
</script>

<template>
  <DatePicker
    :model-value="modelValue"
    range
    type="date"
    placeholder="Select date range to delete"
    @update:model-value="onDatePickerUpdate"
  />
</template>
