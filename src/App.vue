<template>
  <div class="app">
    <router-view></router-view>
  </div>
</template>

<script setup></script>

<style>
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}

.app {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
