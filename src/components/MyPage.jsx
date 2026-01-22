import axios from "axios";
import React, { useState } from "react";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import { useEffect } from "react";
import { useCallback } from "react";
import "../css/MyPage.css";
import { FaSearch } from "react-icons/fa";

import { useLocation } from "react-router-dom";

const MyPage = ({ pageSlug }) => {
  const auth_token = window.sessionStorage.getItem("auth_token");
  const role = window.sessionStorage.getItem("role");
  const user_id = window.sessionStorage.getItem("user_id");
  const [allPages, setAllPages] = useState([]);
  const [page, setPage] = useState(null);
  const [search, setSearch] = useState("");
  const [enableEdit, setEnableEdit] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [filterPages, setFilterPages] = useState(false);
  /*dodajemo opciju za prikaz draftova da bi admin mogao da stranicama dodeli status */
  const [showDrafts, setShowDrafts] = useState(false);

  const location = useLocation();
  //hook koji vraca obj sa info o trenutnim URL(path, query parametri...)
  const query = new URLSearchParams(location.search);
  const pageSlugFromQuery = query.get("previewSlug");

  useEffect(() => {
    const slugToSearch = pageSlug || pageSlugFromQuery;
    if (slugToSearch) {
      setSearch(slugToSearch);
      setFilterPages(false);
      handleSearch(slugToSearch);
    }
  }, [pageSlug, pageSlugFromQuery]);

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

  /*U kodu ispod je navedeno da se div gde se prikazuju draftovi mogu videti samo admini */
  /*ako je admin cekirao da vidi samo draftove prikazace se samo slugovi stranica sa stranice
  u dropdown listi */
  /*Ako je search prazan prikazuju se svi, ako je nesto uneto izlaze poklapanja */
  const displayedPages = showDrafts
    ? search === ""
      ? allPages.filter((p) => p.status === "draft")
      : allPages.filter(
          (p) =>
            p.status === "draft" &&
            p.slug.toLowerCase().includes(search.toLowerCase()),
        )
    : search === ""
      ? allPages.filter(
          (p) => p.status === "published" || p.user_id === Number(user_id),
        )
      : allPages.filter(
          (p) =>
            (p.status === "published" || p.user_id === Number(user_id)) &&
            p.slug.toLowerCase().includes(search.toLowerCase()),
        );

  const handleSearch = async (slug) => {
    if (!slug) return;
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/pages/preview/${slug}`,
      );
      setPage(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching page:", error);
      alert("Page not found or server error.");
    }
  };

  const handleEdit = async () => {
    if (Number(user_id) !== page.user_id && role !== "admin") {
      alert("Only page CREATOR can edit their page!!!");
      return;
    }

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
        },
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
      "Are you sure you want to delete this page?",
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
      alert(error.response.data.message);
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
        },
      );

      const newLayout = [...page.layout];
      newLayout[index].src = response.data.url;
      setPage({ ...page, layout: newLayout });
    } catch (error) {
      console.log(error);
    }
  };

  const handleApprovePage = async (status) => {
    console.log(status);
    console.log(page.id);
    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("status", status);
      const response = await axios.post(
        `http://127.0.0.1:8000/api/pages/approve/${page.id}`,
        formData,
        { headers: { Authorization: "Bearer " + auth_token } },
      );
      console.log(response.data);

      /*da bi nam vizuleno odmah nestao h1 koji kaze da stranica nije dobila submit */
      setPage((prev) => ({
        ...prev,
        status: status,
      }));
      alert("Page got status: " + status);
    } catch (error) {
      console.log(error.response.data.message);
    }

    /*da nam u search baru ne bi opet izlazila stranica ciji je status vec submitted */
    setAllPages((prevPages) =>
      prevPages.map((p) => (p.id === page.id ? { ...p, status: status } : p)),
    );
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
                    className={`MyPageLi ${p.status === "draft" ? "draftItem" : ""}`}
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

            <div style={{ marginTop: "8px" }}>
              {window.sessionStorage.getItem("role") === "admin" && (
                <label className="showDraftsLabel">
                  <input
                    className="showDraftInput"
                    type="checkbox"
                    checked={showDrafts}
                    onChange={(e) => setShowDrafts(e.target.checked)}
                  />
                  Show drafts
                </label>
              )}
            </div>

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
          <div className="pageActions">
            <button className="BackToMyPages" onClick={() => setPage(null)}>
              Back to My pages
            </button>
            {enableEdit === false ? (
              <button
                className="EditMyPage"
                onClick={() => setEnableEdit(true)}
              >
                Edit page
              </button>
            ) : (
              <div>
                <button
                  className="StopEditingMyPage"
                  onClick={() => setEnableEdit(false)}
                >
                  Stop editing
                </button>
                <button className="UpdateMyPage" onClick={handleEdit}>
                  Update page!
                </button>
              </div>
            )}

            <button className="DeleteMyPage" onClick={handleDeletePage}>
              Delete page
            </button>
          </div>

          {page.status === "draft" && (
            <h1 className="DraftPageInfo">
              Page status is draft! Waiting od admin approval...
            </h1>
          )}
          {page.status === "draft" && role === "admin" && (
            <div className="approveDiv">
              <button
                className="PublishButton"
                onClick={() => handleApprovePage("published")}
              >
                Approve page
              </button>
              <button
                className="rejectButton"
                onClick={() => handleApprovePage("rejected")}
              >
                Reject page
              </button>
            </div>
          )}
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

          {page.status === "draft" && (
            <h1 className="DraftPageInfo">
              Page status is draft! Waiting od admin approval...
            </h1>
          )}
          {page.status === "draft" && role === "admin" && (
            <div className="approveDiv">
              <button
                className="PublishButton"
                onClick={() => handleApprovePage("published")}
              >
                Approve page
              </button>
              <button
                className="rejectButton"
                onClick={() => handleApprovePage("rejected")}
              >
                Reject page
              </button>
            </div>
          )}

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

      {page && page.template === "front" && (
        <div
          className="PageDivFront"
          style={{
            backgroundImage: page.layout.background
              ? `url(${page.layout.background})`
              : "none",
          }}
        >
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

          <h1
            className="frontPageTitle"
            contentEditable={enableEdit}
            suppressContentEditableWarning
            style={{
              color: page.layout.frontTitleStyle.color,
              fontSize: `${page.layout.frontTitleStyle.fontSize}px`,
              textAlign: page.layout.frontTitleStyle.textAlign,
            }}
            onBlur={(e) =>
              enableEdit &&
              setPage({
                ...page,
                layout: {
                  ...page.layout,
                  title: e.target.innerText,
                },
              })
            }
          >
            {page.layout.title || page.title}
          </h1>

          <div className="frontPageElements">
            {page.layout.elements.map((el, index) => {
              const style = {
                marginBottom: "24px",
                color: el.style.color,
                textAlign: el.style.textAlign,
              };

              return (
                <div
                  key={el.id}
                  style={{
                    position: "relative",
                    padding: "8px",
                    border:
                      enableEdit && editIndex === index
                        ? "1px dashed #ccc"
                        : "none",
                  }}
                >
                  {enableEdit && editIndex === index ? (
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
                      <button
                        onClick={() => {
                          const newElements = [...page.layout.elements];
                          newElements[index] = {
                            ...newElements[index],
                            value: editValue,
                          };
                          setPage({
                            ...page,
                            layout: { ...page.layout, elements: newElements },
                          });
                          setEditIndex(null);
                        }}
                      >
                        Save
                      </button>
                      <button onClick={() => setEditIndex(null)}>Cancel</button>
                    </div>
                  ) : (
                    <>
                      {el.type === "h1" && <h1 style={style}>{el.value}</h1>}
                      {el.type === "h2" && <h2 style={style}>{el.value}</h2>}
                      {el.type === "p" && <p style={style}>{el.value}</p>}

                      {enableEdit && el.type !== "img" && (
                        <button
                          style={{ marginTop: "8px" }}
                          onClick={() => {
                            setEditIndex(index);
                            setEditValue(el.value);
                          }}
                        >
                          Edit
                        </button>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPage;
