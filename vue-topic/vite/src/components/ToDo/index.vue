<template>
  <div>
    <input v-model="todo" type="text" />
    <button @click="addTodo">添加内容</button>
    <ul>
      <li v-for="(item, index) in todos" :key="index">{{ item }}</li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
// import { ref } from "vue";
let todo = ref("");
let todos = ref<string[]>([]);
let addTodo = () => {
  if (!todo.value) return;
  todos.value.push(todo.value);
};
</script>
