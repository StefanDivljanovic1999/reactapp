import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Home.css";
import axios from "axios";

const NavBar = () => {
  const navigate = useNavigate();
  function handleLogout(e) {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "http://127.0.0.1:8000/api/logout",
      headers: {
        Authorization: "Bearer " + window.sessionStorage.getItem("auth_token"),
      },
    };

    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        window.sessionStorage.setItem("auth_token", null);
        navigate("/");
      })
      .catch((error) => {
        console.log(error);
      });
  }
  return (
    <div>
      <nav className="navbar">
        <ul className="navbar-list">
          <li>
            <Link to={"home"}>Home</Link>
          </li>
          <li>
            <Link to={"feed"}>Feed</Link>
          </li>
          <li>
            <Link to={"create_post"}>Create post</Link>
          </li>
          <li>
            <Link to={"post_category"}>Post categories</Link>
          </li>
          <li>
            <Link to={"page"}>Create page</Link>
          </li>
          <li>
            <Link to={"profile"}>Profile</Link>
          </li>
          <li>
            <Link to={"my-page"}>My page</Link>
          </li>
          <li>
            <Link to={"menu"}>Create menu</Link>
          </li>
          <li>
            <Link to={"browser"}>Sites</Link>
          </li>
          <li>
            <button type="submit" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default NavBar;
