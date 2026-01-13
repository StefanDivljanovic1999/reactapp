import React, { useState } from "react";
import axios from "axios";
import { useEffect, useCallback } from "react";
import "../css/Feed.css";
import { AiFillLike } from "react-icons/ai";
import { div, input } from "framer-motion/client";

const Feed = () => {
  const auth_token = window.sessionStorage.getItem("auth_token");
  const role = window.sessionStorage.getItem("role");
  const user_id = Number(window.sessionStorage.getItem("user_id"));
  const [likedPosts, setLikedPosts] = useState([]);

  const [posts, setPosts] = useState([]);
  const [commentInput, setCommentInput] = useState(false);
  const [comment, setCommment] = useState("");

  console.log(auth_token);
  const fetchPosts = useCallback(async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/posts", {
        headers: { Authorization: "Bearer " + auth_token },
      });
      setPosts(response.data);
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [auth_token]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const getUsernameFromEmail = (email) => {
    return email.split("@")[0];
  };

  const postLike = async (postID) => {
    try {
      const formData = new FormData();
      formData.append("post_id", postID);
      formData.append("status", 1);
      const response = await axios.post(
        "http://127.0.0.1:8000/api/posts/react",
        formData,
        { headers: { Authorization: "Bearer " + auth_token } }
      );

      setLikedPosts((prev) =>
        prev.includes(postID)
          ? prev.filter((id) => id !== postID)
          : [...prev, postID]
      );

      console.log(response.data);
      fetchPosts();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchLikedPosts = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/likes", {
          headers: { Authorization: "Bearer " + auth_token },
        });
        const liked = response.data
          .filter((item) => item.user_id === user_id)
          .map((item) => item.post_id);
        setLikedPosts(liked);
        console.log(liked);
      } catch (error) {
        console.log(error);
      }
    };

    fetchLikedPosts();
    fetchPosts();
  }, []);

  const postCommenet = (comment) => {
    console.log(comment);
  };

  const handleDragStart = (e, postId) => {
    e.dataTransfer.setData("text/plain", postId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, status) => {
    const id = Number(e.dataTransfer.getData("text/plain"));
    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("status", status);
      const response = await axios.post(
        `http://127.0.0.1:8000/api/posts/approve/${id}`,
        formData,
        { headers: { Authorization: "Bearer " + auth_token } }
      );
      setPosts((prev) => prev.filter((post) => post.id !== id));
      console.log(response.data);
      alert("Post get status: " + status);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="divFeed">
      {role === "admin" && (
        <div className="dropZone" style={{ display: "flex", width: "100%" }}>
          <div
            className="archiveZone"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "rejected")}
          >
            Reject post
          </div>

          <div className="postsContainer">
            {posts
              .filter((post) => post.status === "draft")
              .map((post) => (
                <div
                  className="divPostF"
                  key={post.id}
                  draggable={role === "admin"}
                  onDragStart={(e) => handleDragStart(e, post.id)}
                >
                  <h3 className="author">
                    {getUsernameFromEmail(post.user.email)}
                  </h3>
                  <h1 className="h1Feed">{post.title}</h1>
                  <p className="textAreaFeed">{post.content}</p>
                  {post.picture && (
                    <img
                      className="imgFeed"
                      src={`http://127.0.0.1:8000/${post.picture}`}
                      alt={post.title}
                    />
                  )}
                  <p>Likes: {post.likes_count}</p>
                  <div className="reactions">
                    <button
                      className={
                        likedPosts.includes(post.id) ? "liked" : "like"
                      }
                      onClick={() => postLike(post.id)}
                    >
                      <AiFillLike />
                    </button>
                    <button onClick={() => setCommentInput(true)}>
                      Comment
                    </button>
                    {commentInput && (
                      <div>
                        <input
                          onInput={(e) => setCommment(e.target.value)}
                          value={comment}
                        />
                        <button onClick={() => postCommenet(comment)}>
                          Post comment
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>

          <div
            className="approveeZone"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "published")}
          >
            Approve post
          </div>
        </div>
      )}
      {role !== "admin" && (
        <div className="postsContainer">
          {posts
            .filter((post) => post.status != "rejected")
            .map((post) => (
              <div
                className="divPostF"
                key={post.id}
                draggable={role === "admin"}
                onDragStart={(e) => handleDragStart(e, post.id)}
              >
                <h3 className="author">
                  {getUsernameFromEmail(post.user.email)}
                </h3>
                <h1 className="h1Feed">{post.title}</h1>
                <p className="textAreaFeed">{post.content}</p>
                {post.picture && (
                  <img
                    className="imgFeed"
                    src={`http://127.0.0.1:8000/${post.picture}`}
                    alt={post.title}
                  />
                )}
                <p>Likes: {post.likes_count}</p>
                <div className="reactions">
                  <button
                    className={likedPosts.includes(post.id) ? "liked" : "like"}
                    onClick={() => postLike(post.id)}
                  >
                    <AiFillLike />
                  </button>
                  <button onClick={() => setCommentInput(true)}>Comment</button>
                  {commentInput && (
                    <div>
                      <input
                        onInput={(e) => setCommment(e.target.value)}
                        value={comment}
                      />
                      <button onClick={() => postCommenet(comment)}>
                        Post comment
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Feed;
