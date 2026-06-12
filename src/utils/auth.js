import router from "@/router";
import { ElMessage } from "element-plus";

export const logout = (showMessage = true) => {
  sessionStorage.removeItem("UserID");
  sessionStorage.removeItem("UserName");
  sessionStorage.removeItem("Token");

  if (showMessage) {
    ElMessage.warning("Your session has expired. Please log in again.");
  }

  // Only redirect if not already on the login page
  if (router.currentRoute.value.path !== "/login") {
    router.push("/login");
  }
};
