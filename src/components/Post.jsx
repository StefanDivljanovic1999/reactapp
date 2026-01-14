import React from "react";
import { AiFillLike } from "react-icons/ai";

const Post = ({ post, liked, onLike, draggable = false, onDragStart }) => {
  return (
    <div
      className="divPostF"
      key={post.id}
      draggable={draggable}
      onDragStart={onDragStart ? (e) => onDragStart(e, post.id) : undefined}
    >
      <h3 className="author">{post.user.email.split("@")[0]}</h3>
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
        {onLike && (
          <button
            className={liked ? "liked" : "like"}
            onClick={() => onLike(post.id)}
          >
            <AiFillLike />
          </button>
        )}
      </div>
    </div>
  );
};

export default Post;
