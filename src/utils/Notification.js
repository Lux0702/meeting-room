import { ElNotification } from "element-plus";

const Success = (message) => {
  ElNotification({
    title: "Success",
    message: typeof message === "string" ? message : message.toString(),
    type: "success",
  });
};

const Warning = (message) => {
  ElNotification({
    title: "Warning",
    message: typeof message === "string" ? message : message.toString(),
    type: "warning",
  });
};

const Info = (message) => {
  ElNotification({
    title: "Info",
    message: typeof message === "string" ? message : message.toString(),
    type: "info",
  });
};

const Error = (message) => {
  ElNotification({
    title: "Error",
    message: typeof message === "string" ? message : message.toString(),
    type: "error",
  });
};

export { Success, Warning, Info, Error };
