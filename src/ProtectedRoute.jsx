import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = window.sessionStorage.getItem("auth_token");
  console.log(token);

  if (token == "null") {
    return <Navigate to="/" replace />;
  } else {
    return children;
  }
};

export default ProtectedRoute;
