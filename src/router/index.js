import { isLogin } from "@/utils/Account";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      component: () => import("@/views/Login.vue"),
      beforeEnter: (to, from, next) => {
        if (isLogin()) {
          next("/create-room");
        } else {
          next();
        }
      },
    },
    {
      path: "/register",
      component: () => import("@/views/Register.vue"),
    },
    {
      path: "/",
      name: "layout",
      component: () => import("@/Layout/index.vue"),
      children: [
        // {
        //   path: "/",
        //   component: () => import("@/views/Calendar"),
        // },
        {
          path: "/create-room",
          component: () => import("@/views/CreateRoom.vue"),
        },
        {
          path: "/",
          component: () => import("@/views/RoomMeeting"),
        },
      ],

      beforeEnter: (to, from, next) => {
        if (isLogin()) {
          next();
        } else {
          next("/login");
        }
      },
    },
    {
      path: "/test",
      component: () => import("@/components/web/RoomCardWeb.vue"),
    }
  ],
});

export default router;
