<template>
  <div>
    <input v-model="todo" type="text" />
    <button @click="addTodo">添加内容</button>
    <!-- <ul>
      <li v-for="(item, index) in todos" :key="index">{{ item }}</li>
    </ul> -->
  </div>
  <TodoList :todos="todos"></TodoList>
</template>

<script lang="ts" setup>
// import { ref } from "vue";
import TodoList from "./todo-list";
const todo = ref("");
const todos = ref<string[]>([]);
const addTodo = () => {
  if (!todo.value) return;
  todos.value.push(todo.value);
};
</script>
