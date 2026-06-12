<template>
  <div class="login-page">
    <el-form
      ref="loginForm"
      :model="Account"
      @submit.prevent="handleLogin"
      class="login-card"
      label-position="top"
      hide-required-asterisk
    >
      <img src="/logo.png" alt="logo" class="logo" />
      <h1 class="title">YIH SHUO - TY THAC</h1>
      <p class="subtitle">Welcome back! Please enter your credentials.</p>
      <!-- User ID Field -->
      <el-form-item prop="EMAIL">
        <el-input
          v-model="Account.EMAIL"
          placeholder="Please enter your Outlook Email"
          size="large"
          class="input"
          :disabled="loading"
        />
      </el-form-item>
      <!-- Password Field -->
      <el-form-item prop="PWD">
        <div class="password-wrapper">
          <input
            ref="passwordInput"
            type="text"
            v-model="Account.PWD"
            placeholder="Please enter your Password"
            @keyup.enter="handleLogin"
            :class="{ 'masked-password': !isPasswordVisible }"
            class="password-input"
            autocomplete="new-password"
          />

          <span class="toggle-password" @click="togglePassword">
            <el-icon v-if="isPasswordVisible">
              <Hide />
            </el-icon>
            <el-icon v-else>
              <View />
            </el-icon>
          </span>
        </div>
      </el-form-item>
      <el-button
        class="login-btn"
        type="primary"
        size="large"
        :loading="loading"
        :disabled="loading"
        native-type="submit"
      >
        Sign In
      </el-button>
      <span class="mt-1.5 text-[14px] text-gray-500">Do you have an account? <a href="/register" class="text-blue-500 hover:underline">Sign up</a></span>
      <p class="footer">© 2025 Meeting Room - TyThac . All rights reserved.</p>
    </el-form>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref, nextTick } from "vue";
import { post } from "@/api/api";
import { Error as Error, Success } from "@/utils/Notification";
import router from "@/router";
import type { FormInstance, FormRules } from "element-plus";
import { View, Hide } from "@element-plus/icons-vue";
const loginForm = ref<FormInstance>();
const loading = ref(false);
const isPasswordVisible = ref(false);
const passwordInput = ref<HTMLInputElement | null>(null);
const passwordDisplay = ref("");
const Account = reactive({
  EMAIL: "",
  PWD: "",
});
// Validation rules
const rules: FormRules = {
  EMAIL: [
    { required: true, message: "Please enter your EMAIL", trigger: "blur" },
    {
      min: 3,
      message: "EMAIL must have at least 3 characters",
      trigger: "blur",
    },
  ],
  PWD: [
    { required: true, message: "Please enter your password", trigger: "blur" },
    {
      min: 3,
      message: "Password must have at least 3 characters",
      trigger: "blur",
    },
  ],
};
const togglePassword = () => {
  isPasswordVisible.value = !isPasswordVisible.value;
  if (isPasswordVisible.value) {
    // When showing password, sync the display with actual password
    passwordDisplay.value = Account.PWD;
  } else {
    // When hiding, show masked version
    passwordDisplay.value = "•".repeat(Account.PWD.length);
  }
  nextTick(() => {
    if (passwordInput.value) {
      passwordInput.value.focus();
      // Move cursor to the end
      const length = passwordDisplay.value.length;
      passwordInput.value.setSelectionRange(length, length);
    }
  });
};
const handleLogin = async () => {
  if (!loginForm.value) return;
  
  try {
    await loginForm.value.validate();
    loading.value = true;

    const loginData = {
      email: Account.EMAIL,
      password: Account.PWD,
    };

    const response = await post("login", loginData);
    if (response) {
      const user = response;
      sessionStorage.setItem("UserID", user.id);
      sessionStorage.setItem("Email", user.email);
      sessionStorage.setItem("UserName", user.name);
      sessionStorage.setItem("Role", user.role);
      sessionStorage.setItem("Token", user.token);
      Success("Log in successfully!");
      router.push("/");
    }
  } catch (error: any) {
    console.error("Login error:", error);
    // Show error message from server response if available
    const errorMessage =
      error.response?.data?.message || "Log in failed. Please try again.";

    Error(errorMessage);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Layout */

@font-face {
  font-family: "text-security-disc";
  src: url("@/assets/font/text-security-disc.woff2") format("woff2");
}

/* Masked class */
.masked-password {
  font-family: "text-security-disc" !important;
  -webkit-text-security: disc;
  /* Fallback for WebKit browsers */
}

/* Ensure placeholder text is always normal */
.password-input::placeholder {
  /* font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif !important;  */
  -webkit-text-security: none !important;
  color: #c0c4cc;
  opacity: 1;
}

.login-page {
  width: 100%;
  height: 100vh;
  background-color: #f1f5f9;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
  width: 320px;
  background-color: #ffffff;
  padding: 32px 40px;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.password-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}
.password-input {
  width: 100%;
  height: 40px;
  padding: 10px 40px 10px 16px;
  font-size: 14px;
  line-height: 1.5;
  color: #2c3e50;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: border-color 0.3s, box-shadow 0.3s;
  outline: none;
  box-sizing: border-box;
}
.password-input:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}
.toggle-password {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #c0c4cc;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s;
}
.toggle-password:hover {
  color: #606266;
  background-color: #f5f7fa;
}

@media (min-width: 768px) {
  .login-card {
    width: 380px;
  }
}

/* Logo */
.logo {
  height: 80px;
  margin-bottom: 16px;
  opacity: 0.8;
}

/* Text */
.title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  color: #6b7280;
  text-align: center;
  margin-bottom: 24px;
}

/* Form Items */
:deep(.el-form-item) {
  width: 100%;
  margin-bottom: 20px;
}

:deep(.el-form-item__content) {
  line-height: normal;
}

:deep(.el-form-item__error) {
  margin-top: 6px;
  font-size: 12px;
  color: #f56c6c;
  line-height: 1.4;
  display: block;
  padding-top: 2px;
}

/* Inputs */
.input {
  width: 100%;
}

:deep(.el-input__inner) {
  color: #2c3e50 !important;
  font-size: 14px;
  line-height: 44px;
}

/* Button */
.login-btn {
  width: 100%;
  margin-top: 8px;
  height: 44px;
}

/* Footer */
.footer {
  margin-top: 24px;
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
}

/* UX */
* {
  user-select: none;
}

/* Animation for error messages */
:deep(.el-form-item__error) {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

<style>
.login-btn > span {
  height: 100% !important;
}

</style>
