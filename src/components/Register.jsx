import React, { useState } from "react";
import axios from "axios";
import "../css/Register.css";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const Register = ({ setname }) => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  function handleInput(e) {
    setUserData({ ...userData, [e.target.name]: [e.target.value] });
  }

  function handleImage(e) {
    console.log(e);
    const file = e.target.files[0];
    setImage(file);

    setPreview(URL.createObjectURL(file));
  }

  const handleBack = (e) => {
    navigate("/");
  };

  function handleRegister(e) {
    e.preventDefault();
    const data = new FormData();
    data.append("name", userData.name);

    data.append("email", userData.email);
    data.append("password", userData.password);
    data.append("role", userData.role);
    if (image != null) {
      data.append("profile_picture", image);
    }
    axios
      .post("http://127.0.0.1:8000/api/register", data)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        alert("User registered successfully!");
        navigate("/");
      })
      .catch((error) => {
        console.log(error);
        alert("Registration failed!");
      });
    console.log(userData.name, " ", userData.email, " ", userData.password);
  }

  return (
    <div className="registerPage">
      <button className="btnBackRegister" onClick={handleBack}>
        <IoMdArrowRoundBack /> Back
      </button>
      <h2 className="create-text">Create your account for free</h2>
      <form className="registerForm" onSubmit={handleRegister}>
        <label>Enter your name:</label>
        <input
          type="text"
          name="name"
          placeholder="e.g. Peter..."
          required
          onInput={handleInput}
        />
        <label>Enter valid email adress:</label>
        <input
          type="email"
          name="email"
          placeholder="e.g. Peter..."
          required
          onInput={handleInput}
        />
        <label>Enter new password:</label>
        <input
          type="password"
          name="password"
          placeholder="min 5 characters..."
          required
          onInput={handleInput}
        />
        <label>Select your role:</label>
        <select
          className="selectRegister"
          name="role"
          value={userData.role}
          onChange={handleInput}
          required
        >
          <option value="reader">Reader</option>
          <option value="author">Author</option>
          <option value="admin">Admin</option>
        </select>
        <label>Add your profile picture:</label>
        <input type="file" name="profile_picture" onChange={handleImage} />
        {preview && (
          <img src={preview} alt="preview" className="preview-image" />
        )}
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
