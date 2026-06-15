<script setup>
import LogoutIcon from '@iconify-vue/material-symbols/logout';
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessageBox } from "element-plus";
import { Menu, ArrowDown } from "@element-plus/icons-vue";
import SideMenu from "./SideMenu.vue";
import { isCollapse } from "@/hooks/useSidebar";
const router = useRouter();

const isMobile = ref(false);
const mobileDrawer = ref(false);
const userName = ref("");

onMounted(() => {
  checkScreen();
  window.addEventListener("resize", checkScreen);
  loadUserData();
});

const userInitial = computed(() => {
  const name = userName.value || "User";
  return name.charAt(0).toUpperCase();
})

const getRandomColor = () => {
  const colors = [
    '#f56a00', '#7265e6', '#ffbf00', '#00a2ae',
    '#1890ff', '#52c41a', '#eb2f96'
  ];

  return colors[Math.floor(Math.random() * colors.length)];
}
const avatarBgColor = ref(getRandomColor());

const loadUserData = () => {
  const storedName = sessionStorage.getItem("UserName");
  if (storedName) {
    userName.value = storedName;
  }
};

const handleCommand = (command) => {
  if (command === "logout") {
    handleLogout();
  } else if (command === "profile") {
    router.push("/profile");
  }
};

const handleLogout = () => {
  ElMessageBox.confirm("Are you sure you want to logout?", "Confirm Logout", {
    confirmButtonText: "Logout",
    cancelButtonText: "Cancel",
    type: "warning",
  })
    .then(() => {
      sessionStorage.removeItem("UserID");
      sessionStorage.removeItem("UserName");
      sessionStorage.removeItem("Token");
      router.push("/login");
    })
    .catch(() => {});
};

const checkScreen = () => {
  isMobile.value = window.innerWidth < 768;
  if (!isMobile.value) {
    mobileDrawer.value = false;
  }
};

const toggleMenu = () => {
  if (isMobile.value) {
    mobileDrawer.value = true;
  } else {
    isCollapse.value = !isCollapse.value;
  }
};
onUnmounted(() => {
  window.removeEventListener("resize", checkScreen);
});
</script>

<template>
  <el-container class="layout-container">
    <!-- HEADER -->
    <el-header class="layout-header">
      <div class="header-left">
        <el-icon size="22" class="menu-icon" @click="toggleMenu">
          <Menu />
        </el-icon>
        <span class="logo" v-show="!isMobile && !isCollapse">
          Meeting Room
        </span>
      </div>

      <div class="header-right">
        <el-dropdown placement="bottom-end" @command="handleCommand" trigger="click" popper-class="header-account">
          <span class="el-dropdown-link user-info">
            <span class="username">{{ userName || "User" }}</span>
            <div class="w-8 h-8 flex items-center justify-center rounded-full font-bold text-white text-sm" :style="{ backgroundColor: avatarBgColor }">
              {{ userInitial }}
            </div>
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">
                <LogoutIcon height="20px"/>
                {{ $t('common.btnLogout') }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-container>
      <!-- DESKTOP SIDEBAR -->
      <el-aside
        v-if="!isMobile"
        :width="isCollapse ? '64px' : '260px'"
        class="layout-aside"
      >
        <SideMenu :collapse="isCollapse" />
      </el-aside>

      <!-- MOBILE SIDEBAR (DRAWER) -->
      <el-drawer
        v-else
        v-model="mobileDrawer"
        direction="ltr"
        size="220px"
        :with-header="false"
      >
        <SideMenu :collapse="false" @menu-click="mobileDrawer = false" />
      </el-drawer>

      <!-- CONTENT -->
      <el-main class="layout-content">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-container {
  height: 100%;
}

.layout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #1f2937;
  color: #fff;
  padding: 0 16px;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-icon {
  cursor: pointer;
}

.logo {
  font-size: 18px;
  font-weight: bold;
}

.layout-aside {
  background: #fff;
  border-right: 1px solid #ebeef5;
  transition: width 0.2s;
  height: calc(100% - 60px);
  overflow: hidden;
}

.layout-content {
  background: #f5f7fa;
  padding: 20px;
  overflow: auto;
  position: relative;
}

/* User info styles */
.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #fff;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.3s;
  gap: 6px;
}

.user-info:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.username {
  margin-right: 8px;
  font-weight: 500;
}

/* Transition effects */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
  position: absolute;
  width: 100%;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .logo {
    display: none;
  }

  .layout-content {
    padding: 15px;
  }
}

</style>

<style>
.header-account {
  --el-dropdown-menuItem-hover-fill: transparent !important;
  border-radius: 10px !important;
  right: 20px !important;
  width: 180px !important;
}
</style>
