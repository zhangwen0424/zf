<template>
  <div class="home">首页</div>
  <router-link to="/a">a页面</router-link>
  <router-link to="/b">b页面</router-link>
  <router-view></router-view>
</template>

<script>
// @ is an alias to /src
import HelloWorld from "@/components/HelloWorld.vue";

export default {
  name: "HomeView",
  components: {
    HelloWorld,
  },
};
</script>
