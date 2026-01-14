import axios from "axios";

import React, { useEffect, useState } from "react";
import { useCallback } from "react";
import "../css/Post.css";
import { MdDelete } from "react-icons/md";
import { IoIosSend } from "react-icons/io";
import {
  FaArrowAltCircleLeft,
  FaArrowAltCircleRight,
  FaArrowCircleRight,
} from "react-icons/fa";

const CreatePost = () => {
  const auth_token = window.sessionStorage.getItem("auth_token");
  const user_id = window.sessionStorage.getItem("user_id");
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragOverDelete, setIsDragOverDelete] = useState(false);
  const [isDragOverSubmit, setIsDragOverSubmit] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/post_categories",
        { headers: { Authorization: "Bearer " + auth_token } }
      );
      setCategories(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [auth_token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filterCategories = categories.filter((category) =>
    category.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleImage = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handlePost = async () => {
    try {
      const formData = new FormData();
      formData.append("user_id", user_id);
      formData.append("category_id", selected.id);
      formData.append("title", title);
      formData.append("content", content);
      if (image) formData.append("picture", image);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/posts",
        formData,
        {
          headers: { Authorization: "Bearer " + auth_token },
        }
      );

      alert("Post created successfully!");
      console.log(response.data);
    } catch (error) {
      console.log(error);
      alert("Post wasn't created! Check console for error...");
    }
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", "post");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const clearForm = () => {
    setTitle("");
    setContent("");
    setImage(null);
    setPreview(null);
    setSelected(null);
    setSearch("");
    alert("Form cleared");
  };

  return (
    <div className="postWrapper">
      <div
        className="deleteZone"
        onDragOver={handleDragOver}
        onDragEnter={() => setIsDragOverDelete(true)}
        onDragLeave={() => setIsDragOverDelete(false)}
        onDrop={(e) => {
          e.preventDefault();
          clearForm();
          setIsDragOverDelete(false);
        }}
        style={{
          backgroundColor: isDragOverDelete
            ? "rgba(255,0,0,0.3)"
            : "transparent",
        }}
      >
        <p className="deleteP">
          <MdDelete />
        </p>
      </div>
      <div className="postDiv" draggable onDragStart={handleDragStart}>
        <p>Izaberite kategoriju: </p>

        <div className="postDropdown">
          <input
            className="postInput"
            placeholder="Enter category name here: "
            onInput={(e) => {
              setSearch(e.target.value);
              setOpen(true);
              setSelected(null);
            }}
            value={search}
          />

          {open && search !== "" && (
            <ul className="postUl">
              {filterCategories.length > 0 ? (
                filterCategories.map((category) => (
                  <li
                    key={category.id}
                    className="postLi"
                    onClick={() => {
                      setSearch(category.title);
                      setOpen(false);
                      setSelected(category);
                    }}
                  >
                    {category.title}
                  </li>
                ))
              ) : (
                <li className="postLi">No results</li>
              )}
            </ul>
          )}
        </div>

        {selected && (
          <p className="postP">
            You selected: <b>{selected.title}</b>
          </p>
        )}

        <p>Enter title: </p>
        <input
          className="postInput"
          type="text"
          placeholder="title..."
          onInput={(e) => setTitle(e.target.value)}
        />

        <p>Enter content: </p>
        <textarea
          className="postInput"
          type="text"
          placeholder="content..."
          onInput={(e) => setContent(e.target.value)}
        />

        <p>Add picture: </p>
        <input
          className="postInput"
          type="file"
          placeholder="select image"
          onChange={handleImage}
        />

        {preview && (
          <img src={preview} alt="preview" className="previewImage" />
        )}

        <h3 className="postH3">
          <FaArrowAltCircleLeft />
          Drag left to discard, drag right do post! <FaArrowCircleRight />
        </h3>
      </div>

      <div
        className="submitZone"
        onDragOver={handleDragOver}
        onDragEnter={() => setIsDragOverSubmit(true)}
        onDragLeave={() => setIsDragOverSubmit(false)}
        onDrop={(e) => {
          e.preventDefault();
          handlePost();
          setIsDragOverSubmit(false);
        }}
        style={{
          backgroundColor: isDragOverSubmit
            ? "rgba(0, 255, 55, 0.3)"
            : "transparent",
        }}
      >
        <p className="submitP">
          <IoIosSend />
        </p>
      </div>
    </div>
  );
};

export default CreatePost;
