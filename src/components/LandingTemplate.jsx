import React, { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import FeatureCard from "./FeatureCard";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";

const LandingTemplate = ({ onChange, preview, handleResize, previewMode }) => {
  const HERO_ALLOWED = ["h1", "p", "button", "img"];

  const [title, setTitle] = useState("");
  const [hero, setHero] = useState([]);
  const [features, setFeatures] = useState([]);
  const [cta, setCta] = useState({
    heading: "CTA heading",
    text: "CTA description",
    button: "CTA button",
  });

  useEffect(() => {
    onChange?.({ title, hero, features, cta });
  }, [title, hero, features, cta, onChange]);

  const handleDragOver = (e) => {
    if (!previewMode) e.preventDefault();
  };

  const handleHeroDrop = (e) => {
    if (previewMode) return;
    e.preventDefault();

    const type = e.dataTransfer.getData("text/plain");
    if (!HERO_ALLOWED.includes(type)) return;

    setHero((prev) => [
      ...prev,
      {
        id: nanoid(),
        type,
        value: type === "img" ? null : "Edit text",
        src: type === "img" ? preview : null,
        width: 300,
        height: 200,
      },
    ]);
  };

  const handleHeroSet = (id, value) => {
    setHero((prev) => prev.map((el) => (el.id === id ? { ...el, value } : el)));
  };

  const handleHeroResize = (id, width, height) => {
    setHero((prev) =>
      prev.map((el) => (el.id === id ? { ...el, width, height } : el))
    );
  };

  const handleHeroDelete = (id) => {
    setHero((prev) => prev.filter((el) => el.id !== id));
  };

  const addFeature = () => {
    setFeatures((prev) => [
      ...prev,
      { id: nanoid(), title: "Feature title", text: "Feature description" },
    ]);
  };

  const handleFeatureSet = (id, field, value) => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  const handleDeleteFeature = (id) => {
    setFeatures((prev) => prev.filter((f) => f.id !== id));
  };

  const handleCtaSet = (field, value) => {
    setCta((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className={`landing ${previewMode ? "preview" : ""}`}>
      <section
        className="landing-hero"
        onDragOver={handleDragOver}
        onDrop={handleHeroDrop}
      >
        <h2>Hero section</h2>

        {previewMode ? (
          <h1>{title}</h1>
        ) : (
          <h1
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => setTitle(e.currentTarget.innerText)}
          >
            {title || "Enter page title here..."}
          </h1>
        )}

        {hero.length === 0 && !previewMode && (
          <div className="landing-box">Drop hero elements here</div>
        )}

        {hero.map((el) => (
          <div key={el.id} className="hero-element">
            {["h1", "p", "button"].includes(el.type) &&
              (previewMode
                ? React.createElement(el.type, {}, el.value)
                : React.createElement(el.type, {
                    contentEditable: true,
                    suppressContentEditableWarning: true,
                    onBlur: (e) =>
                      handleHeroSet(el.id, e.currentTarget.innerText),
                    children: el.value,
                  }))}

            {el.type === "img" &&
              (previewMode ? (
                <img
                  src={el.src}
                  alt="hero"
                  style={{ width: "100%", height: "auto" }}
                />
              ) : (
                <ResizableBox
                  width={el.width}
                  height={el.height}
                  minConstraints={[100, 100]}
                  maxConstraints={[800, 600]}
                  onResizeStop={(e, data) =>
                    handleHeroResize(el.id, data.size.width, data.size.height)
                  }
                >
                  <img
                    src={el.src}
                    alt="hero"
                    style={{ width: "100%", height: "100%" }}
                  />
                </ResizableBox>
              ))}

            {!previewMode && (
              <button
                className="deleteButton"
                onClick={() => handleHeroDelete(el.id)}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </section>

      <section className="landing-features">
        <h2>Features section</h2>

        {!previewMode && <button onClick={addFeature}>Add feature +</button>}

        {features.length === 0 && <p>No features yet...</p>}

        <div className="features-box">
          {features.map((feature) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              handleFeatureSet={handleFeatureSet}
              handleDeleteFeature={handleDeleteFeature}
              previewMode={previewMode}
            />
          ))}
        </div>
      </section>

      <section className="landing-CTA">
        <h2>CTA</h2>

        <div className="cta-box">
          {previewMode ? (
            <>
              <h3>{cta.heading}</h3>
              <p>{cta.text}</p>
              <button>{cta.button}</button>
            </>
          ) : (
            <>
              <h3
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) =>
                  handleCtaSet("heading", e.currentTarget.innerText)
                }
              >
                {cta.heading}
              </h3>

              <p
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleCtaSet("text", e.currentTarget.innerText)}
              >
                {cta.text}
              </p>

              <button
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) =>
                  handleCtaSet("button", e.currentTarget.innerText)
                }
              >
                {cta.button}
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default LandingTemplate;
