import axios from "axios";
import React, { useEffect, useState } from "react";
import "../css/PostCategory.css";
import { useCallback } from "react";
import { FaSearch } from "react-icons/fa";
import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";

const PostCategories = () => {
  const auth_token = window.sessionStorage.getItem("auth_token");
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContext, setEditContext] = useState("");
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const displayedCategories =
    search === ""
      ? categories
      : categories.filter((category) =>
          category.title
            .toLocaleLowerCase()
            .includes(search.toLocaleLowerCase()),
        );

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/post_categories",
        { headers: { Authorization: "Bearer " + auth_token } },
      );
      setCategories(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [auth_token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedCategories = displayedCategories
    .slice()
    .reverse()
    .slice(startIndex, startIndex + itemsPerPage);

  const handleInput = (e) => {
    if (e.target.name === "title") {
      setTitle(e.target.value);
    }
    if (e.target.name === "context") {
      setContext(e.target.value);
    }
    console.log(title + " " + context);
  };

  const addCategory = async (title, context) => {
    if (!title || !context) {
      alert("Popunite sva polja!");
      return;
    }

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/post_categories",
        {
          title,
          context,
        },
        {
          headers: {
            Authorization: "Bearer " + auth_token,
          },
        },
      );

      setTitle("");
      setContext("");
      setShowForm(false);
      fetchCategories();
      alert("Post category successfully added!");
    } catch (error) {
      alert(error.response.data.message);
      console.log(error);
    }
  };

  const deleteCategory = async (indexToDelete) => {
    console.log(indexToDelete);
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/post_categories/${indexToDelete}`,

        {
          headers: {
            Authorization: "Bearer " + auth_token,
          },
        },
      );
      alert("Post category successfully deleted!");

      fetchCategories();
    } catch (error) {
      alert(error.response.data.message);
      console.log(error);
      return;
    }
  };

  const editCategory = async (editIndex, editTitle, editContext) => {
    console.log(editTitle + " " + editContext);
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/post_categories/${editIndex}`,
        {
          _method: "PUT",
          title: editTitle,
          context: editContext,
        },
        { headers: { Authorization: "Bearer " + auth_token } },
      );
      setEditIndex(null);
      setEditTitle("");
      setEditContext("");

      alert("Post category successfully updated!");
      fetchCategories();
    } catch (error) {
      alert(error.response.data.message);
      console.log(error);
    }
  };

  return (
    <div className="categories">
      <div className="post-categories-container">
        {!showForm && (
          <button className="btnAdd" onClick={() => setShowForm(true)}>
            Add new category
          </button>
        )}
        {showForm && (
          <div>
            <input
              name="title"
              placeholder="unesite naslov nove kategorije..."
              onChange={handleInput}
            />
            <input
              name="context"
              placeholder="unesite opis kategorije..."
              onChange={handleInput}
            />

            <button onClick={() => addCategory(title, context)}>
              add new category!
            </button>

            <button onClick={() => setShowForm(false)}>cancel</button>
          </div>
        )}

        <h1 className="h1Category">Latest categories:</h1>

        {showSearch ? (
          <>
            <input
              type="text"
              placeholder="Enter search value..."
              onInput={(e) => setSearch(e.target.value)}
              value={search}
            />
            <button
              onClick={() => {
                setShowSearch(false);
                setSearch("");
              }}
            >
              cancel
            </button>
          </>
        ) : (
          <>
            <div className="searchHeader">
              <h4 className="h4Categories">Browse categories</h4>
              <button className="btnSearch" onClick={() => setShowSearch(true)}>
                search <FaSearch />
              </button>
            </div>
          </>
        )}

        {paginatedCategories.map((category) => (
          <>
            <p key={category.id}>
              {editIndex === category.id ? (
                <>
                  <input
                    value={editTitle}
                    onChange={(e) => {
                      setEditTitle(e.target.value);
                    }}
                  />

                  <input
                    value={editContext}
                    onChange={(e) => {
                      setEditContext(e.target.value);
                    }}
                  />

                  <button
                    onClick={() =>
                      editCategory(editIndex, editTitle, editContext)
                    }
                  >
                    save
                  </button>
                </>
              ) : (
                <>
                  <b>{category.title}</b> — {category.context}
                </>
              )}
            </p>
            <button
              className="btnEdit"
              onClick={() => {
                setEditIndex(category.id);
                setEditTitle(category.title);
                setEditContext(category.context);
              }}
            >
              Edit
            </button>
            <button
              className="btnDelete"
              onClick={() => deleteCategory(category.id)}
            >
              Delete
            </button>
          </>
        ))}
        <div className="pagination">
          <button
            className="btnPagination"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <GrFormPreviousLink /> Previous
          </button>
          <span className="paginationSpan">-{currentPage}-</span>
          <button
            className="btnPagination"
            disabled={startIndex + itemsPerPage >= displayedCategories.length}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next <GrFormNextLink />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCategories;
