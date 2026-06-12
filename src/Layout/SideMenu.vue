<template>
  <el-menu :collapse="collapse" router :default-active="activeMenu" class="el-menu-vertical" @select="handleSelect">
    <!-- <el-menu-item index="/">
      <el-icon><Calendar /></el-icon>
      <span>My Calendar</span>
    </el-menu-item> -->

    <el-menu-item index="/create-room">
      <el-icon><House /></el-icon>
      <span>Create Room</span>
    </el-menu-item>

    <el-menu-item index="/">
      <el-icon><OfficeBuilding /></el-icon>
      <span>Booking Meeting</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { Calendar, OfficeBuilding, House } from "@element-plus/icons-vue";
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const activeMenu = computed(() => route.path);

const emit = defineEmits(["menu-click"]);

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
