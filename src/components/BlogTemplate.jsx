import React from "react";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";

const BlogTemplate = ({
  title,
  setTitle,
  elements,
  aboutElements,
  handleDrop,
  handleDragOver,
  handleSet,
  handleDelete,
  handleResize,
  previewMode,
}) => {
  return (
    <div className="divDrop">
      <div className="divHeader">
        {previewMode ? (
          <h1>{title || "Set page title"}</h1>
        ) : (
          <h1
            contentEditable
            suppressContentEditableWarning={true}
            onBlur={(e) => setTitle(e.target.innerText)}
          >
            {title || "Set page title"}
          </h1>
        )}

        <div
          className="headerAbout"
          onDragOver={!previewMode ? handleDragOver : undefined}
          onDrop={!previewMode ? (e) => handleDrop(e, "about") : undefined}
        >
          {aboutElements.length === 0 && <p>Add about page</p>}
          {aboutElements.map((el) =>
            previewMode ? (
              <p key={el.id}>{el.value}</p>
            ) : (
              <p
                contentEditable
                suppressContentEditableWarning={true}
                onBlur={(e) => handleSet(e.target.innerText, el.id, "about")}
              >
                {el.value}
              </p>
            )
          )}
        </div>
      </div>
      <div
        className="divContent"
        onDragOver={!previewMode ? handleDragOver : undefined}
        onDrop={!previewMode ? (e) => handleDrop(e, "content") : undefined}
      >
        {elements.length === 0 && <p>Add page content...</p>}

        {elements.map((el) => {
          return (
            <div key={el.id} className="elementWrapper">
              {el.type === "h1" &&
                (previewMode ? (
                  <h1>{el.value}</h1>
                ) : (
                  <h1
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      handleSet(e.target.innerText, el.id, "content")
                    }
                  >
                    {el.value}
                  </h1>
                ))}

              {el.type === "h2" &&
                (previewMode ? (
                  <h2>{el.value}</h2>
                ) : (
                  <h2
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      handleSet(e.target.innerText, el.id, "content")
                    }
                  >
                    {el.value}
                  </h2>
                ))}

              {el.type === "p" &&
                (previewMode ? (
                  <p>{el.value}</p>
                ) : (
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      handleSet(e.target.innerText, el.id, "content")
                    }
                  >
                    {el.value}
                  </p>
                ))}

              {el.type === "img" &&
                (previewMode ? (
                  <img
                    src={el.preview || el.image}
                    alt="slika"
                    style={{ width: el.width, height: el.height }}
                  />
                ) : (
                  <ResizableBox
                    width={el.width}
                    height={el.height}
                    minConstraints={[100, 100]}
                    maxConstraints={[800, 600]}
                    onResizeStop={(e, data) =>
                      handleResize(el.id, data.size.width, data.size.height)
                    }
                  >
                    <img
                      src={el.preview || el.image}
                      alt="slika"
                      style={{ width: "100%", height: "100%" }}
                    />
                  </ResizableBox>
                ))}
              {previewMode ? (
                ""
              ) : (
                <button
                  className="deleteButton"
                  onClick={() => handleDelete(el.id, "content")}
                >
                  X
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BlogTemplate;
