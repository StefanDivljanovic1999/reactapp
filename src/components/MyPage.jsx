import axios from "axios";
import React, { useState } from "react";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import { useEffect } from "react";
import { useCallback } from "react";
import "../css/MyPage.css";
import { FaSearch } from "react-icons/fa";

const MyPage = () => {
  const auth_token = window.sessionStorage.getItem("auth_token");
  const [allPages, setAllPages] = useState([]);
  const [page, setPage] = useState(null);
  const [search, setSearch] = useState("");
  const [enableEdit, setEnableEdit] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [filterPages, setFilterPages] = useState(false);

  const fetchPages = useCallback(async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/pages", {
        headers: { Authorization: "Bearer " + auth_token },
      });
      setAllPages(response.data);
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [auth_token]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const displayedPages =
    search === ""
      ? allPages
      : allPages.filter((p) =>
          p.slug.toLowerCase().includes(search.toLocaleLowerCase())
        );

  const handleSearch = async (slug) => {
    if (!slug) return;
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/pages/preview/${slug}`
      );
      setPage(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching page:", error);
      alert("Page not found or server error.");
    }
  };

  const handleEdit = async () => {
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/pages/${page.id}`,
        {
          _method: "PUT",
          layout: page.layout,
        },
        {
          headers: {
            Authorization: "Bearer " + auth_token,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response.data);
      alert("Page successfully updated!");
    } catch (error) {
      alert("Error editing page...");
      console.log(error);
    }
  };

  const handleDeletePage = async () => {
    const confrimDelete = window.confirm(
      "Are you sure you want to delete this page?"
    );
    if (!confrimDelete) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/pages/${page.id}`, {
        headers: {
          Authorization: "Bearer " + auth_token,
          "Content-Type": "application/json",
        },
      });

      alert("Page : " + page.title + " successfully deleted!");
      window.location.href = "/my-page";
    } catch (error) {
      alert("Error deleting page...");
      console.log(error);
    }
  };

  const handleSaveText = (index) => {
    if (page.layout[index].type === "img") return;

    const newLayout = [...page.layout];
    newLayout[index].value = editValue;
    setPage({ ...page, layout: newLayout });
    setEditIndex(null);
  };

  const handleResizable = (index, size) => {
    const newLayout = [...page.layout];
    newLayout[index].width = size.width;
    newLayout[index].height = size.height;
    setPage({ ...page, layout: newLayout });
  };

  const handleImage = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/upload-image",
        formData,
        {
          headers: {
            Authorization: "Bearer " + auth_token,
          },
        }
      );

      const newLayout = [...page.layout];
      newLayout[index].src = response.data.url;
      setPage({ ...page, layout: newLayout });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="divMyPage">
      {!page && (
        <div className="divSearch">
          <h1 className="findH1">
            Find your pages instantly. Edit them effortlessly.
          </h1>
          <div className="SearchInputWrapper">
            <input
              className="SearchInputMyPage"
              placeholder="Enter page slug"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setFilterPages(true);
              }}
            />

            {filterPages && displayedPages.length > 0 && (
              <ul className="MyPageUl">
                {displayedPages.map((p) => (
                  <li
                    key={p.id}
                    className="MyPageLi"
                    onClick={() => {
                      setSearch(p.slug);
                      setFilterPages(false);
                    }}
                  >
                    {p.slug}
                  </li>
                ))}
              </ul>
            )}
            <button
              className="searchButton"
              onClick={() => handleSearch(search)}
            >
              <FaSearch />
            </button>
          </div>
        </div>
      )}

      {page && page.template === "blog" && (
        <div className="PageDiv" style={{ padding: "100px" }}>
          <button onClick={() => setPage(null)}>Back to My pages</button>
          {enableEdit === false ? (
            <button onClick={() => setEnableEdit(true)}>Edit page</button>
          ) : (
            <div>
              <button onClick={() => setEnableEdit(false)}>Stop editing</button>
              <button onClick={handleEdit}>Update page!</button>
            </div>
          )}

          <button onClick={handleDeletePage}>Delete page</button>
          <h1>{page.title}</h1>

          {page.layout.map((el, index) => {
            return (
              <div
                key={index}
                style={{
                  position: "relative",
                  marginBottom: "16px",
                  padding: "8px",
                  border: enableEdit ? "1px dashed #ccc" : "none",
                }}
              >
                {enableEdit && (
                  <button
                    onClick={() => {
                      setEditIndex(index);
                      setEditValue(el.value);
                    }}
                  >
                    Edit
                  </button>
                )}
                {editIndex === index ? (
                  <div>
                    {(el.type === "h1" || el.type === "h2") && (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                      />
                    )}

                    {el.type === "p" && (
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                      />
                    )}

                    {el.type === "img" && editIndex === index && (
                      <div>
                        <ResizableBox
                          width={el.width}
                          height={el.height}
                          minConstraints={[100, 100]}
                          maxConstraints={[800, 600]}
                          onResizeStop={(e, data) =>
                            handleResizable(index, data.size)
                          }
                        >
                          <img
                            src={el.src}
                            alt="slika"
                            style={{ width: "100%", height: "100%" }}
                          />
                        </ResizableBox>

                        <input
                          type="file"
                          onChange={(e) => handleImage(e, index)}
                        />
                        <button onClick={() => setEditIndex(null)}>Done</button>
                      </div>
                    )}
                    {el.type === "img" && editIndex !== index && (
                      <img
                        src={el.src}
                        alt="slika"
                        style={{
                          width: el.width || "auto",
                          height: el.height || "auto",
                        }}
                      />
                    )}

                    {el.type !== "img" && (
                      <button onClick={() => handleSaveText(index)}>
                        Save
                      </button>
                    )}
                    <button onClick={() => setEditIndex(null)}>Cancel</button>
                  </div>
                ) : (
                  <>
                    {el.type === "h1" && <h1>{el.value}</h1>}
                    {el.type === "h2" && <h2>{el.value}</h2>}
                    {el.type === "p" && <p>{el.value}</p>}
                    {el.type === "img" && (
                      <img
                        src={el.src}
                        alt="slika"
                        style={{
                          width: el.width || "auto",
                          height: el.height || "auto",
                        }}
                      />
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {page && page.template === "landing" && (
        <div className="PageDiv" style={{ padding: "100px" }}>
          <button onClick={() => setPage(null)}>Back to My pages</button>
          <h1>{page.title}</h1>

          {page.layout.hero?.map((el) => (
            <div key={el.id}>
              {el.type === "h1" && <h1>{el.value}</h1>}
              {el.type === "p" && <p>{el.value}</p>}
              {el.type === "button" && <button>{el.value}</button>}
              {el.type === "img" && (
                <img
                  src={el.image || el.src}
                  alt="hero"
                  style={{ width: "100%", height: "auto" }}
                />
              )}
            </div>
          ))}

          <h2>Features</h2>
          {page.layout.features?.map((feature) => (
            <div key={feature.id}>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </div>
          ))}

          <h2>CTA</h2>
          <h3>{page.layout.cta?.heading}</h3>
          <p>{page.layout.cta?.text}</p>
          <button>{page.layout.cta?.button}</button>
        </div>
      )}
    </div>
  );
};

export default MyPage;
