import React from "react";
import "../css/Home.css";

const Home = ({ username }) => {
  return (
    <div className="home-page">
      <p className="welcomeParagraph">Welcome,{username}!</p>
      <p className="sub-text">Whats up today?</p>
    </div>
  );
};

export default Home;
