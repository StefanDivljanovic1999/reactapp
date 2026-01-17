import React, { useState } from "react";
import "../css/Page.css";
import axios from "axios";
import "react-resizable/css/styles.css";
import BlogTemplate from "./BlogTemplate";
import LandingTemplate from "./LandingTemplate";
import Elements from "./Elements";
import FrontPage from "./FrontPage";

const Page = () => {
  const [elements, setElements] = useState([]);
  const [aboutElements, setAboutElements] = useState([]);
  const [template, setTemplate] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState(null);
  const auth_token = window.sessionStorage.getItem("auth_token");
  const [landingData, setLandingData] = useState(null);
  /*dodajemo mogucnost da korsnik moze da vidi preview svoje stranice */
  const [previewMode, setPreviewMode] = useState(false);

  /*dodajemo elemente za front page */
  const [frontTitle, setFrontTitle] = useState(null);
  const [frontElements, setFrontElements] = useState([]);
  const [frontTitleStyle, setFrontTitleStyle] = useState({
    color: "#000000",
    fontSize: 48,
    textAlign: "center",
  });
  const [frontBackground, setFrontBackground] = useState(null);

  const handleDragStart = (e, type) => {
    e.dataTransfer.setData("text/plain", type);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, zone) => {
    e.preventDefault();

    const type = e.dataTransfer.getData("text/plain");

    if (zone === "about" && type !== "p") {
      alert("About section accepts only text!");
      return;
    }

    const newElement = {
      id: Date.now(),
      type: type,
    };

    if (type === "img") {
      newElement.preview = preview;
      newElement.image = image;
      newElement.width = 300;
      newElement.height = 200;
    } else {
      newElement.value = "editTexts";
    }

    if (zone === "about") {
      setAboutElements([...aboutElements, newElement]);
    } else {
      setElements([...elements, newElement]);
    }
  };

  const handleSet = (value, id, zone) => {
    if (zone === "about") {
      setAboutElements((prev) =>
        prev.map((el) => (el.id === id ? { ...el, value } : el)),
      );
    } else {
      setElements((prev) =>
        prev.map((el) => (el.id === id ? { ...el, value } : el)),
      );
    }
  };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setPreview(previewURL);

    const fd = new FormData();
    fd.append("image", file);

    const res = await axios.post("http://127.0.0.1:8000/api/upload-image", fd, {
      headers: { Authorization: "Bearer " + auth_token },
    });

    setImage(res.data.url);
  };

  const handleDelete = (id, zone) => {
    if (zone === "about") {
      setAboutElements((prev) => prev.filter((el) => el.id !== id));
    } else {
      setElements((prev) => prev.filter((el) => el.id !== id));
    }
  };

  const handleResize = (id, width, height) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, width, height } : el)),
    );
  };

  const handleCreatePage = async () => {
    let payload;

    if (template === "blog") {
      payload = {
        title,
        template,
        layout: elements.map((el) => {
          if (el.type === "img") {
            return {
              type: "img",
              src: el.image,
              width: el.width,
              height: el.height,
            };
          } else {
            return {
              type: el.type,
              value: el.value || "",
            };
          }
        }),
      };
    }

    if (template === "landing") {
      if (!landingData) {
        alert("Landing page is empty!");
        return;
      }

      payload = {
        title: landingData.title,
        template,
        layout: landingData,
      };
    }

    if (template === "front") {
      if (!frontTitle)
        alert("Front page title is empty! Using default title...");
      payload = {
        title: frontTitle,
        template: template,
        layout: {
          title: frontTitle,
          frontTitleStyle: frontTitleStyle,
          background: frontBackground,
          elements: frontElements,
        },
      };
    }

    try {
      await axios.post("http://127.0.0.1:8000/api/pages", payload, {
        headers: {
          Authorization: "Bearer " + auth_token,
          "Content-Type": "application/json",
        },
      });

      alert("Page successfully saved!");
    } catch (error) {
      alert("Failed to create page...");
      console.log(error);
    }
  };

  return (
    <div className="divPage">
      {!previewMode && (
        <>
          {" "}
          <div className="divElements">
            {/*div koji se nalazi sa leve strane i u kome se nalaze nasi elementi */}
            <div className="divTemplate">
              <h3>Choose template: </h3>
              {/*u zavisnosti od izbora templatea drop zona se menja */}
              <button onClick={() => setTemplate("front")}>Front page</button>
              <button onClick={() => setTemplate("blog")}>Blog</button>
              <button onClick={() => setTemplate("landing")}>Landing</button>

              {template && (
                <p>
                  You choose: <b>{template}</b>
                </p>
              )}
            </div>
            <hr style={{ width: "100%", border: "1px solid black" }} />
            {template && (
              /*ako je zavisno od templatea pojavljuju se elementi */
              /*elements su nasa komponenta u kojoj se nalaze dole navedeni elementi */
              <Elements
                allowedElements={
                  template === "blog"
                    ? ["h1", "h2", "p", "img"]
                    : template === "landing"
                      ? ["h1", "p", "button", "img"]
                      : ["h1", "h2", "p"]
                }
                /*drop dobija informaciju koji tip elementa smo prevukli */
                handleDragStart={handleDragStart}
                /*pregled kako izgleda nasa slika na browseru */
                preview={preview}
                handleImage={handleImage}
              />
            )}
          </div>
          <div className="EditButtons">
            <button onClick={handleCreatePage}>Create page!</button>
            <button onClick={() => setPreviewMode((prev) => !prev)}>
              {/*Svaki put kada se klikne menja se stanje, pa se menja i tekst dugmeta*/}
              {previewMode ? "Back to edit" : "Preview"}
            </button>
            <button>Discard all</button>
          </div>
          {template === "blog" && (
            /*komponenta blog template u ovom slucaju predstavlja drop zonu i opisuje njeno ponasanje u zavisnosti od toga koji 
              je element dropovan na nju */
            /*ona je podljena na about deo i elements deo, omoguceno je resizovanje slika */
            <BlogTemplate
              title={title}
              setTitle={setTitle}
              elements={elements}
              aboutElements={aboutElements}
              handleDrop={handleDrop}
              handleDragOver={handleDragOver}
              handleSet={handleSet}
              handleDelete={handleDelete}
              handleResize={handleResize}
              preview={preview}
              handleDragStart={handleDragStart}
              previewMode={previewMode}
            />
          )}
          {template === "landing" && (
            <LandingTemplate
              onChange={setLandingData}
              preview={preview}
              handleDragStart={handleDragStart}
              handleResize={handleResize}
              previewMode={previewMode}
            />
          )}
          {template === "front" && (
            <FrontPage
              title={frontTitle}
              setTitle={setFrontTitle}
              frontTitleStyle={frontTitleStyle}
              setFrontTitleStyle={setFrontTitleStyle}
              frontBackground={frontBackground}
              setFrontBackground={setFrontBackground}
              frontElements={frontElements}
              setFrontElements={setFrontElements}
              handleDragStart={handleDragStart}
            />
          )}
        </>
      )}

      {/* Fullscreen preview */}
      {previewMode && (
        <div className="previewOverlay">
          <div className="previewHeader">
            <button onClick={() => setPreviewMode(false)}>Back to edit</button>
          </div>

          {template === "blog" && (
            <BlogTemplate
              previewMode={true}
              title={title}
              elements={elements}
              aboutElements={aboutElements}
            />
          )}

          {template === "landing" && (
            <LandingTemplate previewMode={true} data={landingData} />
          )}

          {template === "front" && (
            <FrontPage
              previewMode={true}
              title={frontTitle}
              frontTitleStyle={frontTitleStyle}
              frontBackground={frontBackground}
              frontElements={frontElements}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Page;
