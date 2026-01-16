import React from "react";
import { CiImageOn } from "react-icons/ci";

const Elements = ({
  allowedElements,
  handleDragStart,
  preview,
  handleImage,
}) => {
  return (
    <div className="elements">
      <h1>Elements</h1>
      {allowedElements.includes("h1") && (
        <h1
          className="headingE"
          draggable
          onDragStart={(e) => handleDragStart(e, "h1")}
        >
          Text heading
        </h1>
      )}

      {allowedElements.includes("h2") && (
        <h2
          className="subheadingE"
          draggable
          onDragStart={(e) => handleDragStart(e, "h2")}
        >
          Subheading
        </h2>
      )}

      {allowedElements.includes("p") && (
        <p
          className="paragraphE"
          draggable
          onDragStart={(e) => handleDragStart(e, "p")}
        >
          Text heading
        </p>
      )}

      {allowedElements.includes("img") && (
        <>
          <input type="file" onChange={handleImage} />
          <CiImageOn />
          {preview && (
            <img
              src={preview}
              alt="preview"
              draggable
              onDragStart={(e) => handleDragStart(e, "img")}
              style={{ width: 180 }}
            />
          )}
        </>
      )}

      {allowedElements.includes("backgroundImg") && (
        <>
          <input type="file" onChange={handleImage} />
          <CiImageOn />
          {preview && (
            <img
              alt="preview"
              draggable
              onDragStart={(e) => handleDragStart(e, "backgroundImg")}
              style={{
                border: "1px dashed black",
                padding: "10px",
                marginTop: "10px",
                cursor: "grab",
              }}
            />
          )}
        </>
      )}

      {allowedElements.includes("button") && (
        <button
          className="buttonE"
          draggable
          onDragStart={(e) => handleDragStart(e, "button")}
        >
          Button
        </button>
      )}
    </div>
  );
};

export default Elements;
