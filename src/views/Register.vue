<template>
  <div class="register-page">
    <el-form
      ref="registerForm"
      :model="Account"
      :rules="rules"
      @submit.prevent="handleRegister"
      class="register-card"
      label-position="top"
      hide-required-asterisk
    >
      <img src="/logo.png" alt="logo" class="logo" />
      <h1 class="title">YIH SHUO - TY THAC</h1>
      <p class="subtitle">{{ $t('subtitleRegister') }}</p>

      <el-form-item prop="name">
        <el-input
          v-model="Account.name"
          :placeholder="$t('placeholderRegisterName')"
          size="large"
          class="input"
          :disabled="loading"
        />
      </el-form-item>

      <el-form-item prop="employee_id">
        <el-input
          v-model="Account.employee_id"
          :placeholder="$t('placeholderID')"
          size="large"
          class="input"
          :disabled="loading"
        />
      </el-form-item>

      <el-form-item prop="email">
        <el-input
          v-model="Account.email"
          :placeholder="$t('placeholderRegisterEmail')"
          size="large"
          class="input"
          :disabled="loading"
        />
      </el-form-item>

      <el-form-item prop="password">
        <div class="password-wrapper">
          <input
            type="text"
            v-model="Account.password"
            :placeholder="$t('placeholderRegisterPassword')"
            :class="{ 'masked-password': !isPasswordVisible }"
            class="password-input"
            autocomplete="new-password"
            :disabled="loading"
          />
          <span class="toggle-password" @click="isPasswordVisible = !isPasswordVisible">
            <el-icon v-if="isPasswordVisible"><Hide /></el-icon>
            <el-icon v-else><View /></el-icon>
          </span>
        </div>
      </el-form-item>

      <el-form-item prop="confirmPassword">
        <div class="password-wrapper">
          <input
            type="text"
            v-model="Account.confirmPassword"
            :placeholder="$t('placeholderRegisterConfirmPassword')"
            :class="{ 'masked-password': !isConfirmPasswordVisible }"
            class="password-input"
            autocomplete="new-password"
            :disabled="loading"
          />
          <span class="toggle-password" @click="isConfirmPasswordVisible = !isConfirmPasswordVisible">
            <el-icon v-if="isConfirmPasswordVisible"><Hide /></el-icon>
            <el-icon v-else><View /></el-icon>
          </span>
        </div>
      </el-form-item>

      <el-button
        class="register-btn"
        type="primary"
        size="large"
        :loading="loading"
        :disabled="loading"
        native-type="submit"
      >
        {{ $t('common.btnSignUp') }}
      </el-button>

      <span class="mt-2 text-[14px] text-gray-500">
        {{ $t('noticeRegister') }}
        <a href="/login" class="text-blue-500 hover:underline">{{ $t('common.btnLogin') }}</a>
      </span>
      <p class="footer">© 2025 Meeting Room - TyThac. All rights reserved.</p>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { View, Hide } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { post, loading } from '@/api/api'
import { Error, Success } from '@/utils/Notification'
import router from '@/router'

const registerForm = ref(null)
const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)

// Payload đăng ký (role được set cứng mặc định là 'user')
const Account = reactive({
  name: '',
  employee_id: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'user' 
})

// Custom validator cho Confirm Password
const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('Please input the password again'))
  } else if (value !== Account.password) {
    callback(new Error("Two inputs don't match!"))
  } else {
    callback()
  }
}

// Rules kiểm tra dữ liệu đầu vào
const rules = reactive({
  name: [{ required: true, message: 'Please enter your Full Name', trigger: 'blur' }],
  employee_id: [{ required: false, message: 'Please enter your Employee ID', trigger: 'blur' }],
  email: [
    { required: true, message: 'Please enter your email', trigger: 'blur' },
    { type: 'email', message: 'Please input correct email address', trigger: ['blur', 'change'] }
  ],
  password: [
    { required: true, message: 'Please enter your password', trigger: 'blur' },
    { min: 6, message: 'Password length must be at least 6 characters', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass2, trigger: 'blur' }
  ]
})

const handleRegister = async () => {
  if (!registerForm.value) return
  
  await registerForm.value.validate(async (valid) => {
    if (valid) {
      try {
        await post('register', Account)

        Success('Registration successful! Please log in.');
        router.push('/login');
      } catch (error) {
        Error('Registration failed. Please try again.')
      }
      
    } else {
      Error('Please check the form for errors and try again.')
      return false
    }
  })
}
</script>

<style scoped>
/* Masked Password Font */
@font-face {
  font-family: "text-security-disc";
  src: url("@/assets/font/text-security-disc.woff2") format("woff2");
}

.masked-password {
  font-family: "text-security-disc" !important;
  -webkit-text-security: disc;
}

.password-input::placeholder {
  -webkit-text-security: none !important;
  color: #c0c4cc;
  opacity: 1;
}

/* Layout */
.register-page {
  width: 100%;
  min-height: 100vh; /* Dùng min-height để tránh lỗi cuộn nếu màn hình quá thấp */
  background-color: #f1f5f9;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
}

/* Card - Mở rộng chiều rộng một chút so với Login vì form dài hơn */
.register-card {
  width: 340px;
  background-color: #ffffff;
  padding: 32px 40px;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
}

@media (min-width: 768px) {
  .register-card {
    width: 400px;
  }
}

/* Logo & Text */
.logo {
  height: 60px; /* Thu nhỏ logo một chút để cân đối với form dài */
  margin-bottom: 16px;
  opacity: 0.8;
}

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
  margin-bottom: 18px;
}

:deep(.el-form-item__content) {
  line-height: normal;
}

:deep(.el-form-item__error) {
  margin-top: 4px;
  font-size: 12px;
  color: #f56c6c;
  line-height: 1.4;
  display: block;
  padding-top: 2px;
  animation: fadeIn 0.3s ease-in-out;
}

/* Standard Inputs */
.input {
  width: 100%;
}

:deep(.el-input__inner) {
  color: #2c3e50 !important;
  font-size: 14px;
  line-height: 44px;
}

/* Custom Password Input Wrapper */
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

.password-input:disabled {
  background-color: #f5f7fa;
  cursor: not-allowed;
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

/* Button & Footer */
.register-btn {
  width: 100%;
  margin-top: 8px;
  height: 44px;
}

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
.register-btn > span {
  height: 100% !important;
}
</style>

```