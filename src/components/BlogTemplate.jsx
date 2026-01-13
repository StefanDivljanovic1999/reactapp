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
}) => {
  return (
    <div className="divDrop">
      <div className="divHeader">
        <h1
          contentEditable
          suppressContentEditableWarning={true}
          onBlur={(e) => setTitle(e.target.innerText)}
        >
          Set page title
        </h1>

        <div
          className="headerAbout"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "about")}
        >
          {aboutElements.length === 0 && <p>Add about page</p>}
          {aboutElements.map((el) => (
            <p
              contentEditable
              suppressContentEditableWarning={true}
              onBlur={(e) => handleSet(e.target.innerText, el.id, "about")}
            >
              {el.value}
            </p>
          ))}
        </div>
      </div>
      <div
        className="divContent"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, "content")}
      >
        {elements.length === 0 && <p>Add page content...</p>}

        {elements.map((el) => {
          return (
            <div key={el.id} className="elementWrapper">
              {el.type === "h1" && (
                <h1
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    handleSet(e.target.innerText, el.id, "content")
                  }
                >
                  {el.value}
                </h1>
              )}

              {el.type === "h2" && (
                <h2
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    handleSet(e.target.innerText, el.id, "content")
                  }
                >
                  {el.value}
                </h2>
              )}

              {el.type === "p" && (
                <p
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    handleSet(e.target.innerText, el.id, "content")
                  }
                >
                  {el.value}
                </p>
              )}

              {el.type === "img" && (
                <ResizableBox
                  width={300}
                  height={200}
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
              )}

              <button
                className="deleteButton"
                onClick={() => handleDelete(el.id, "content")}
              >
                X
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BlogTemplate;
