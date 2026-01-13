import React, { useState } from "react";
import { nanoid } from "nanoid";
import { useEffect } from "react";
import FeatureCard from "./FeatureCard";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";

const LandingTemplate = ({
  onChange,
  preview,
  handleDragStart,
  handleResize,
}) => {
  const HERO_ALLOWED = ["h1", "p", "button", "img"];
  const [hero, setHero] = useState([]);
  const [features, setFeatures] = useState([]);
  const [title, setTitle] = useState("");
  const [cta, setCta] = useState({
    heading: "CTA heading",
    text: "CTA description",
    button: "CTA button",
  });

  useEffect(() => {
    if (onChange) {
      onChange({
        title,
        hero,
        features,
        cta,
      });
    }
  }, [title, hero, features, cta]);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleHeroDrop = (e) => {
    e.preventDefault();

    const type = e.dataTransfer.getData("text/plain");

    if (!HERO_ALLOWED.includes(type)) {
      alert("This element is not allowed in hero...");
      return;
    }

    const newElement = {
      id: nanoid(),
      type: type,
      value: type === "img" ? null : "Edit text",
      image: type === "img" ? preview : null,
    };

    setHero((prev) => [...prev, newElement]);
  };

  const handleHeroSet = (value, id) => {
    setHero((prev) =>
      prev.map((heroEl) =>
        heroEl.id === id ? { ...heroEl, value: value } : heroEl
      )
    );
  };

  const addFeature = () => {
    setFeatures((prev) => [
      ...prev,
      {
        id: nanoid(),
        title: "Feature title",
        text: "Feature description",
      },
    ]);
  };

  const handleFeatureSet = (id, field, value) => {
    setFeatures((prev) =>
      prev.map((feature) =>
        feature.id === id ? { ...feature, [field]: value } : feature
      )
    );
  };

  const handleDeleteFeature = (id) => {
    setFeatures((prev) => prev.filter((feature) => feature.id !== id));
  };

  const handleCtaSet = (field, value) => {
    setCta((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="landing">
      <section
        className="landing-hero"
        onDragOver={handleDragOver}
        onDrop={handleHeroDrop}
      >
        <h2>Hero section</h2>
        {hero.length === 0 && (
          <div className="landing-box">Drop hero elements here</div>
        )}

        <h1
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => setTitle(e.target.innerText)}
        >
          Enter page title here...
        </h1>

        {hero.map((el) => (
          <div key={el.id} className="hero-element">
            {el.type === "h1" && (
              <h1
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleHeroSet(e.target.innerText, el.id)}
              >
                {el.value}
              </h1>
            )}

            {el.type === "p" && (
              <p
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleHeroSet(e.target.innerText, el.id)}
              >
                {el.value}
              </p>
            )}

            {el.type === "button" && (
              <button
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleHeroSet(e.target.innerText, el.id)}
              >
                {el.value || "click me!"}
              </button>
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
              onClick={() =>
                setHero((prev) => prev.filter((x) => x.id !== el.id))
              }
            >
              X
            </button>
          </div>
        ))}
      </section>

      <section className="landing-features">
        <h2>Features section</h2>

        <button onClick={addFeature}>Add feature + </button>

        {features.length === 0 && <p>No features yet...</p>}
        <div className="features-box">
          {features.map((feature) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              handleFeatureSet={handleFeatureSet}
              handleDeleteFeature={handleDeleteFeature}
            />
          ))}
        </div>
      </section>

      <section className="landing-CTA">
        <h2>CTA</h2>
        <div className="cta-box">
          <h3
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleCtaSet("heading", e.target.innerText.trim())}
          >
            {cta.heading}
          </h3>

          <p
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleCtaSet("text", e.target.innerText.trim())}
          >
            {cta.text}
          </p>

          <button
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleCtaSet("button", e.target.innerText.trim())}
          >
            {cta.button}
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingTemplate;
