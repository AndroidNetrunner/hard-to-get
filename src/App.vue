<template>
  <v-app>
    <v-main>
      <router-view />
      <!-- 현재 라우트에 따라 컴포넌트가 여기에 렌더링됩니다 -->
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "App",
});
</script>
