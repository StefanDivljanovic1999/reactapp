import React, { useState } from "react";
import { useCallback } from "react";
import axios from "axios";
import { useEffect } from "react";
import Post from "./Post";
import "../css/MyPosts.css";
import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";

const MyPosts = () => {
  const auth_token = window.sessionStorage.getItem("auth_token");
  /*potrebno da bi se ucitali nasi postovi*/
  const user_id = Number(window.sessionStorage.getItem("user_id"));
  const [myPosts, setMyPosts] = useState([]);
  const [editingPostID, setEditingPostID] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  /* dodacemo opcije za paginaciju*/
  const [currentPage, setCurrentPage] = useState(1);
  /*broj postova po stranici je 5 */
  const itemsPerPage = 5;
  /*pocetni indeks na svakoj stranici se racuna po seldecoj formuli */
  const startIndex = (currentPage - 1) * itemsPerPage;

  /*vise necemo prikazivati sve nase postove nego cemo ih nazvati paginatedPosts */
  const paginatedPosts = myPosts
    .slice()
    .reverse()
    .slice(startIndex, startIndex + itemsPerPage);
  /*slice() nam prestavlja kopiju niza myposts */

  const fetchPosts = useCallback(async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/posts", {
        /*postove mogu da vide samo ulogovani korisnici */
        headers: { Authorization: "Bearer " + auth_token },
      });
      /*korisniku se prikazujju samo postovi koje je on i kreirao */
      setMyPosts(response.data.filter((post) => post.user.id === user_id));
    } catch (error) {
      console.log(error);
    }
  }, [auth_token, user_id]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDragStart = (e, postID) => {
    e.dataTransfer.setData("text/plain", postID);
  };

  const handleEdit = (e) => {
    const postID = Number(e.dataTransfer.getData("text/plain"));
    /*nalazimo post sa zadatiim idjem*/
    const post = myPosts.find((p) => p.id === postID);
    if (!post) return;
    /*da bi nam pocetne vrednosti koje menjamo ostale iste koje su bile */
    setEditingPostID(post.id);
    setEditTitle(post.title);
    setEditContent(post.content);
  };

  const updatePost = async (post) => {
    if (editTitle.length < 2) {
      alert("Title must have at least 2 characters!!!");
      return;
    }

    if (editContent.length < 2) {
      alert("Content must have at least 2 characters!!!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("user_id", user_id);
      formData.append("title", editTitle);
      formData.append("content", editContent);
      const response = await axios.post(
        `http://127.0.0.1:8000/api/posts/${post.id}`,
        formData,
        {
          headers: { Authorization: "Bearer " + auth_token },
        }
      );
      alert("Post successfully updated!");
      setEditingPostID(null);
      /*osvezavamo sa novim podacima i edit index vracamo na null */
      fetchPosts();
      console.log(response);
    } catch (error) {
      console.log(error);
      alert("Error updating post!");
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    const postId = Number(e.dataTransfer.getData("text/plain"));

    const confrimDelete = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (!confrimDelete) return;

    try {
      const response = await axios.delete(
        `http://127.0.0.1:8000/api/posts/${postId}`,
        { headers: { Authorization: "Bearer " + auth_token } }
      );
      alert("Post successfully deleted!");
      setMyPosts((prev) => prev.filter((post) => post.id !== postId));
      console.log(response.data);
    } catch (error) {
      alert("Error deleting post.Check console data...");
      console.log(error);
    }
  };

  return (
    <div className="myPostsDiv">
      <div
        className="editMyPostsZone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleEdit}
      >
        DROP POST HERE TO EDIT!
      </div>

      <div className="MyPostsZone">
        <h1>My posts</h1>
        {paginatedPosts.map((post) => (
          <div key={post.id}>
            {/*omogucava da svaki post postane draggable */}
            <Post
              post={post}
              draggable
              onDragStart={(e) => handleDragStart(e, post.id)}
            />
            {/*ako je korisnik prevukao post na edit zonu */}
            {editingPostID === post.id && (
              <div className="editForm">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Edit title"
                />

                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Edit content"
                />

                <button onClick={() => updatePost(post)}>Save changes</button>

                <button onClick={() => setEditingPostID(null)}>Cancel</button>
              </div>
            )}
          </div>
        ))}
        <div className="paginationButtons">
          <button
            className="previousButton"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            <GrFormPreviousLink /> Previous
          </button>
          <span className="postSpan">{currentPage}</span>
          <button
            className="nextButton"
            disabled={currentPage * itemsPerPage >= myPosts.length}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next <GrFormNextLink />
          </button>
        </div>
      </div>

      <div
        className="deleteMyPostZone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDelete}
      >
        DROP HERE TO DELETE POST!
      </div>
    </div>
  );
};

export default MyPosts;
