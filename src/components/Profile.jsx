import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/Profile.css";

const Profile = () => {
  const [data, SetData] = useState(null);
  const auth_token = window.sessionStorage.getItem("auth_token");

  useEffect(() => {
    const fetchData = async () => {
      let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: "http://127.0.0.1:8000/api/profile",
        headers: {
          Authorization: "Bearer " + auth_token,
        },
      };

      try {
        const response = await axios.request(config);
        SetData(response.data);
        console.log(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [auth_token]);

  if (!data) return <p>Loading...</p>;

  return (
    <div className="profile">
      <div className="profile-div">
        <h2 className="profile-h2">Your profile</h2>
        {data.data.profile_picture && (
          <img
            className="profile-img"
            src={data.data.profile_picture}
            alt="profile-pic"
          />
        )}
        <h2>Name: {data.data.name}</h2>
        <h2>Email: {data.data.email} </h2>
        <h2>Role: {data.data.role}</h2>
      </div>
    </div>
  );
};

export default Profile;
