import React, { useState } from "react";
import "../css/Page.css";
import axios from "axios";

const FrontPage = ({
  title,
  setTitle,
  frontElements,
  setFrontElements,
  frontTitleStyle,
  setFrontTitleStyle,
  frontBackground,
  setFrontBackground,
  handleDragStart,
  previewMode,
}) => {
  const auth_token = window.sessionStorage.getItem("auth_token");

  const handleDrop = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("text/plain");
    if (!type) return;

    const newEl = {
      id: Date.now(),
      type,
      value: "Edit me",
      style: { color: "#000000", textAlign: "left" },
    };

    setFrontElements([...frontElements, newEl]);
  };
  const [preview, setPreview] = useState(null);

  const handleBackgroundImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setPreview(previewURL);

    const fd = new FormData();
    fd.append("image", file);

    const res = await axios.post("http://127.0.0.1:8000/api/upload-image", fd, {
      headers: { Authorization: "Bearer " + auth_token },
    });

    setFrontBackground(res.data.url);
  };

  return (
    <div
      className="frontPageDiv"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      style={{
        minHeight: "100vh",

        padding: "50px",
        backgroundImage: preview
          ? `url(${preview})`
          : frontBackground
            ? `url(${frontBackground})`
            : "none",

        backgroundSize: "cover",
        backgroundPosition: "center",
        flexWrap: "wrap",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {!previewMode && (
        <div style={{ marginBottom: "20px" }}>
          <h3>Choose background:</h3>
          <input type="file" onChange={handleBackgroundImage} />
        </div>
      )}
      {/* Title */}
      <div style={{ marginBottom: "30px" }}>
        {previewMode ? (
          <h1
            style={{
              color: frontTitleStyle.color || "black",
              fontSize: `${frontTitleStyle.fontSize || 48}px`,
              textAlign: frontTitleStyle.textAlign || "left",
            }}
          >
            {title || "Front Page Title"}
          </h1>
        ) : (
          <>
            {" "}
            <h1
              contentEditable
              suppressContentEditableWarning
              style={{
                color: frontTitleStyle.color || "black",
                fontSize: `${frontTitleStyle.fontSize || 48}px`,
                textAlign: frontTitleStyle.textAlign || "left",
              }}
              onBlur={(e) => setTitle(e.target.innerText)}
            >
              {title || "Front Page Title"}
            </h1>
            <input
              type="color"
              value={frontTitleStyle.color}
              onChange={(e) =>
                setFrontTitleStyle({
                  ...frontTitleStyle,
                  color: e.target.value,
                })
              }
            />
            <div style={{ marginTop: "10px", marginBottom: "20px" }}>
              <label>Font size: {frontTitleStyle.fontSize}px</label>
              <input
                type="range"
                min="20"
                max="250"
                value={frontTitleStyle.fontSize}
                onChange={(e) =>
                  setFrontTitleStyle({
                    ...frontTitleStyle,
                    fontSize: parseInt(e.target.value),
                  })
                }
              />
            </div>
            {/* Title alignment */}
            <select
              value={frontTitleStyle.textAlign}
              onChange={(e) =>
                setFrontTitleStyle({
                  ...frontTitleStyle,
                  textAlign: e.target.value,
                })
              }
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </>
        )}
      </div>

      {/* Elements drag & drop */}
      {!previewMode && (
        <div
          className="frontDropDiv"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <h3>Drop elements here:</h3>
          {frontElements.map((el) => (
            <div key={el.id} style={{ marginBottom: "15px" }}>
              {el.type === "h1" && (
                <h1
                  contentEditable
                  suppressContentEditableWarning
                  style={{
                    color: el.style.color,
                    textAlign: el.style.textAlign,
                  }}
                  onBlur={(e) => {
                    const value = e.target.innerText;
                    setFrontElements((prev) =>
                      prev.map((item) =>
                        item.id === el.id ? { ...item, value } : item,
                      ),
                    );
                  }}
                >
                  {el.value}
                </h1>
              )}
              {el.type === "h2" && (
                <h2
                  contentEditable
                  suppressContentEditableWarning
                  style={{
                    color: el.style.color,
                    textAlign: el.style.textAlign,
                  }}
                  onBlur={(e) => {
                    const value = e.target.innerText;
                    setFrontElements((prev) =>
                      prev.map((item) =>
                        item.id === el.id ? { ...item, value } : item,
                      ),
                    );
                  }}
                >
                  {el.value}
                </h2>
              )}
              {el.type === "p" && (
                <p
                  contentEditable
                  suppressContentEditableWarning
                  style={{
                    color: el.style.color,
                    textAlign: el.style.textAlign,
                  }}
                  onBlur={(e) => {
                    const value = e.target.innerText;
                    setFrontElements((prev) =>
                      prev.map((item) =>
                        item.id === el.id ? { ...item, value } : item,
                      ),
                    );
                  }}
                >
                  {el.value}
                </p>
              )}

              {/* Element color */}
              <input
                type="color"
                value={el.style.color}
                onChange={(e) =>
                  setFrontElements((prev) =>
                    prev.map((item) =>
                      item.id === el.id
                        ? {
                            ...item,
                            style: { ...item.style, color: e.target.value },
                          }
                        : item,
                    ),
                  )
                }
              />

              {/* Element alignment */}
              <select
                value={el.style.textAlign}
                onChange={(e) =>
                  setFrontElements((prev) =>
                    prev.map((item) =>
                      item.id === el.id
                        ? {
                            ...item,
                            style: { ...item.style, textAlign: e.target.value },
                          }
                        : item,
                    ),
                  )
                }
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          ))}
        </div>
      )}

      {previewMode && (
        <div
          className="frontDropDiv"
          style={{ maxWidth: "100%", boxSizing: "border-box" }}
        >
          {frontElements.map((el) => (
            <div key={el.id} style={{ marginBottom: "15px" }}>
              {el.type === "h1" && (
                <h1
                  style={{
                    color: el.style.color,
                    textAlign: el.style.textAlign,
                  }}
                >
                  {el.value}
                </h1>
              )}
              {el.type === "h2" && (
                <h2
                  style={{
                    color: el.style.color,
                    textAlign: el.style.textAlign,
                  }}
                >
                  {el.value}
                </h2>
              )}
              {el.type === "p" && (
                <p
                  style={{
                    color: el.style.color,
                    textAlign: el.style.textAlign,
                  }}
                >
                  {el.value}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FrontPage;
