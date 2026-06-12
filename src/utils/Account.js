const isLogin = () => {
  const Email = sessionStorage.getItem("Email");
  const UserName = sessionStorage.getItem("UserName");
  const Token = sessionStorage.getItem("Token");
  return Email && UserName && Token;
};

export { isLogin };
