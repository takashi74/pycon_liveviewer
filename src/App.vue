<template>
  <h1>{{ msg }}</h1>
</template>

<script setup>
import { ref } from 'vue'

const msg = ref('Hello, World!')
</script>

<style scoped>
h1 {
  text-align: center;
  color: #333;
  margin-top: 100px;
}
</style>