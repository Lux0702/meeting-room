// 114626 123456

import { ref } from "vue";
import axios from "axios";
import { logout } from "@/utils/auth";

const loading = ref(false);
const error = ref(null);

const urlIp = `${import.meta.env.VITE_BACKEND_URL}`;

const api = axios.create({
  baseURL: `/api/`,
  timeout: 15000,
});

// GET
export async function get(url, params = {}) {
  loading.value = true;
  error.value = null;
  try {
    const Token = sessionStorage.getItem("Token");
    const res = await api.get(url, {
      params,
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });

    if (res.data.data) {
      return res.data.data;
    } else {
      if (typeof res.data === "object" && res.data.data === null) {
        return [];
      } else {
        return res.data;
      }
    }
  } catch (err) {
    error.value = err.response?.data || err.message;

    // Check for invalid token error
    if (
      err.response?.data?.error === "invalid token" ||
      (typeof err.response?.data === "string" &&
        err.response.data.includes("invalid token"))
    ) {
      logout(false);
    }
  } finally {
    loading.value = false;
  }
}

// POST
export async function  post(url, body = {}) {
  loading.value = true;
  error.value = null;
  let res;
  try {
    if (url === "register" || url === "login") {
      res = await api.post(url, body);
    } else {
      const Token = sessionStorage.getItem("Token");
      res = await api.post(url, body, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      });
    }
    return res.data.data ?? res.data;
  } catch (err) {
    error.value = err.response?.data || err.message;

    // Check for invalid token error
    if (
      err.response?.data?.error === "invalid token" ||
      (typeof err.response?.data === "string" &&
        err.response.data.includes("invalid token"))
    ) {
      logout(false);
    }
    throw err;
  } finally {
    loading.value = false;
  }
}

// PUT
export async function put(url, body = {}) {
  loading.value = true;
  error.value = null;
  try {
    const Token = sessionStorage.getItem("Token");
    const res = await api.put(url, body, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    return res.data.data ?? res.data;
  } catch (err) {
    error.value = err.response?.data || err.message;

    // Check for invalid token error
    if (
      err.response?.data?.error === "invalid token" ||
      (typeof err.response?.data === "string" &&
        err.response.data.includes("invalid token"))
    ) {
      logout(false);
    }

    throw err;
  } finally {
    loading.value = false;
  }
}

// PATCH
export async function patch(url, params = {}) {
  loading.value = true;
  error.value = null;
  try {
    const Token = sessionStorage.getItem("Token");
    const res = await api.patch(url, params, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    return res.data.data ?? res.data;
  } catch (err) {
    error.value = err.response?.data || err.message;

    // Check for invalid token error
    if (
      err.response?.data?.error === "invalid token" ||
      (typeof err.response?.data === "string" &&
        err.response.data.includes("invalid token"))
    ) {
      logout(false);
    }

    throw err;
  } finally {
    loading.value = false;
  }
}

// DELETE
export async function remove(url, params = {}) {
  loading.value = true;
  error.value = null;
  try {
    const Token = sessionStorage.getItem("Token");
    const res = await api.delete(url, {
      params,
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    return res.data.data ?? res.data;
  } catch (err) {
    error.value = err.response?.data || err.message;

    // Check for invalid token error
    if (
      err.response?.data?.error === "invalid token" ||
      (typeof err.response?.data === "string" &&
        err.response.data.includes("invalid token"))
    ) {
      logout(false);
    }

    throw err;
  } finally {
    loading.value = false;
  }
}

export { loading, error, urlIp };
