import "./App.css";
import Login from "./components/Login";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./components/Home";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./ProtectedRoute";
import Register from "./components/Register";
import { useState } from "react";
import Profile from "./components/Profile";
import PostCategories from "./components/PostCategories";
import Feed from "./components/Feed";
import Page from "./components/Page";
import MyPage from "./components/MyPage";
import Menu from "./components/menu";
import SiteBrowser from "./components/SiteBrowser";
import CreatePost from "./components/CreatePost";
import MyPosts from "./components/MyPosts";

function AppContent() {
  const location = useLocation();
  const [username, SetUsername] = useState();

  const hideNavBar =
    location.pathname === "/" || location.pathname === "/register";
  return (
    <>
      {!hideNavBar && <NavBar />}
      <Routes>
        <Route path="/" element={<Login SetUsername={SetUsername} />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home username={username} />
            </ProtectedRoute>
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/post_category" element={<PostCategories />} />
        <Route path="/create_post" element={<CreatePost />} />
        <Route path="/my-posts" element={<MyPosts />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/page" element={<Page />} />
        <Route path="/my-page" element={<MyPage />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/browser" element={<SiteBrowser />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </div>
  );
}

export default App;
