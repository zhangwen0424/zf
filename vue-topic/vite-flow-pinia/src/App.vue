<template>
  <router-link to="/home">home</router-link>&nbsp;
  <router-link to="/about">about</router-link>
  <router-view></router-view>
  <Todo></Todo>
  <Counter></Counter>
</template>

<script lang="ts" setup>
import Todo from "@/components/ToDo/index.vue";
import Counter from "@/components/Counter/index.vue";
</script>
