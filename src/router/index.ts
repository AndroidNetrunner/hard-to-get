// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import MainPage from "@/pages/MainPage.vue";
import RoomPage from "@/pages/RoomPage.vue";

const routes = [
  {
    path: "/",
    name: "MainPage",
    component: MainPage,
  },
  {
    path: "/room/:roomId",
    name: "RoomPage",
    component: RoomPage,
    props: true, // 동적 파라미터를 컴포넌트의 props로 전달
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
