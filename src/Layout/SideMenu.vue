<template>
  <el-menu
    :collapse="collapse"
    router
    :default-active="activeMenu"
    class="el-menu-vertical"
    @select="handleSelect"
  >
    <!-- <el-menu-item index="/">
      <el-icon><Calendar /></el-icon>
      <span>My Calendar</span>
    </el-menu-item> -->

    <el-menu-item index="/">
      <el-icon><House /></el-icon>
      <span>Create Room</span>
    </el-menu-item>

    <el-menu-item index="/booking-meeting">
      <el-icon><OfficeBuilding /></el-icon>
      <span>Booking Meeting</span>
    </el-menu-item>
    <el-sub-menu index="language">
      <template #title>
        <div style="display: flex; align-items: center">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              fill="currentColor"
              d="m18.5 10l4.4 11h-2.155l-1.201-3h-4.09l-1.199 3h-2.154L16.5 10zM10 2v2h6v2h-1.968a18.2 18.2 0 0 1-3.62 6.301a15 15 0 0 0 2.335 1.707l-.75 1.878A17 17 0 0 1 9 13.725a16.7 16.7 0 0 1-6.201 3.548l-.536-1.929a14.7 14.7 0 0 0 5.327-3.042A18 18 0 0 1 4.767 8h2.24A16 16 0 0 0 9 10.877a16.2 16.2 0 0 0 2.91-4.876L2 6V4h6V2zm7.5 10.885L16.253 16h2.492z"
            />
          </svg>
        </div>
        <span style="margin-left: 8px">Language</span>
      </template>

      <el-menu-item @click="changeLanguage('vi')">Tiếng Việt</el-menu-item>
      <el-menu-item @click="changeLanguage('en')">English</el-menu-item>
      <el-menu-item @click="changeLanguage('zh')">日本語</el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<script setup>
import { Calendar, OfficeBuilding, House } from "@element-plus/icons-vue";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
const { locale } = useI18n();

const route = useRoute();

const activeMenu = computed(() => route.path);

const emit = defineEmits(["menu-click"]);
const changeLanguage = (lang) => {
  locale.value = lang;
  console.log("🚀 ~ changeLanguage ~ locale.value:", locale.value)
  localStorage.setItem("lang", lang);
  console.log("🚀 ~ changeLanguage ~ localStorage.lang:", localStorage.getItem("lang"));
  
};
const handleSelect = () => {
  emit("menu-click");
};

defineProps({
  collapse: Boolean,
});
</script>

<style scoped>
.el-menu-vertical {
  border-right: none;
}
</style>
