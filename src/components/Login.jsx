import React, { useState } from "react";
import "../css/Login.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = ({ SetUsername }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    email: "",
    password: "",
  });
  function handleInput(e) {
    console.log(e);
    const newData = userData;
    newData[e.target.name] = e.target.value;
    setUserData(newData);
  }

  function handleLogin(e) {
    e.preventDefault();
    axios
      .post("http://127.0.0.1:8000/api/login", userData)
      .then((res) => {
        console.log(res.data);
        if (res.data.status === "success") {
          window.sessionStorage.setItem("auth_token", res.data.data.token);
          window.sessionStorage.setItem("role", res.data.data.role);
          window.sessionStorage.setItem("user_id", res.data.data.user_id);
          SetUsername(userData.email);
          console.log(SetUsername);
          navigate("/home");
        }
      })
      .catch((e) => {
        alert("Wrong email or password!");
        console.log(e);
      });
  }

  function handleRegister(e) {
    navigate("/register");
  }

  return (
    <div className="login-page">
      <div className="login">
        <h1>Welcome back! </h1>
        <p className="welcome-login">
          Enter your credentials to access your account and continue creating
          pages, adding posts, or tracking activity.
        </p>
        <form onSubmit={handleLogin}>
          <label className="label-login">Enter your username: </label>
          <input
            type="email"
            name="email"
            placeholder="ex. steven99@gmail.com"
            required
            onInput={handleInput}
          />
          <br />

          <label className="label-login">Enter your password: </label>
          <input
            type="password"
            name="password"
            required
            onInput={handleInput}
          />
          <br />
          <button type="submit">Log in</button>
        </form>
        <p className="signup-p-login">
          Don’t have an account yet? You can sign up here and start working
          right away.
          <button onClick={handleRegister}>Sign up</button>
        </p>
      </div>
    </div>
  );
};

export default Login;
