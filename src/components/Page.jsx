import React, { useState } from "react";
import "../css/Page.css";
import axios from "axios";
import "react-resizable/css/styles.css";
import BlogTemplate from "./BlogTemplate";
import LandingTemplate from "./LandingTemplate";
import Elements from "./Elements";
import FrontPage from "./FrontPage";
import { useEffect } from "react";

const Page = ({ mode = "create", initialPage = null }) => {
  /*ova komponenta je namenjena kreiranju stranica koje je dozvoljeno adminu i autoru.Korisnik sa datim ulogama ima
  mogucnost da stranicu kreira na 3 nacina(3 templatea), a to su blog, landing i front. Prvo je implementirano kreiranje blog stranice
  pa je komponenta dalje sirena za landing i front */

  /*dodati propsi da bi korisnik mogao i da edituje stranicu iz edit mda */

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

  useEffect(() => {
    if (mode !== "edit" || !initialPage) return;

    setTemplate(initialPage.template);
    setTitle(initialPage.title);

    if (initialPage.template === "blog") {
      setElements(
        initialPage.layout.map((el) => ({
          id: Date.now() + Math.random(),
          ...el,
          image: el.src || null,
        })),
      );
    }

    if (initialPage.template === "landing") {
      setLandingData(initialPage.layout);
    }

    if (initialPage.template === "front") {
      setFrontTitle(initialPage.layout.title);
      setFrontTitleStyle(initialPage.layout.frontTitleStyle);
      setFrontBackground(initialPage.layout.background);
      setFrontElements(initialPage.layout.elements);
    }
  }, [mode, initialPage]);

  const handleDragStart = (e, type) => {
    e.dataTransfer.setData("text/plain", type);
  };

  const handleDragOver = (e) => {
    /*funkcija bez koje drag&drop ne bi mogao da radi */
    e.preventDefault();
  };

  const handleDrop = (e, zone) => {
    e.preventDefault();
    /*kada se element ispusti u drop zonu, prima informacija o kom se elementu radi */
    const type = e.dataTransfer.getData("text/plain");

    if (zone === "about" && type !== "p") {
      /*about zona blog templatea prima samo tekst */
      alert("About section accepts only text!");
      return;
    }

    const newElement = {
      /*odmah se kreira novi element sa id i sacuvanim typeom,a vrednost se kasnije edituje */
      id: Date.now(),
      type: type,
    };

    if (type === "img") {
      /*za sliku se cuvaju i duzina i sirina i to se salje u bazu */
      newElement.preview = preview;
      newElement.image = image;
      newElement.width = 300;
      newElement.height = 200;
    } else {
      /*pocetna vrednost koju korisnik kasnije menja */
      newElement.value = "editTexts";
    }

    if (zone === "about") {
      /*elementi se dodaju u niz */
      setAboutElements([...aboutElements, newElement]);
    } else {
      setElements([...elements, newElement]);
    }
  };

  const handleSet = (value, id, zone) => {
    /*funkcija kojom se menja vrednost tesktualnih dropovanih elemenata  */
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
    const file = e.target.files?.[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setPreview(previewURL);

    const fd = new FormData();
    fd.append("image", file);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/upload-image",
        fd,
        {
          headers: {
            Authorization: "Bearer " + auth_token,
          },
        },
      );

      setImage(res.data.url);
    } catch (error) {
      console.error("Image upload error:", error.response?.data || error);
      alert("Image upload failed");
    }
  };

  const handleDelete = (id, zone) => {
    /*funkcija kojom se sve napravljene promene discarduju */
    if (zone === "about") {
      setAboutElements((prev) => prev.filter((el) => el.id !== id));
    } else {
      setElements((prev) => prev.filter((el) => el.id !== id));
    }
  };

  const handleResize = (id, width, height) => {
    /*funkcija koja trazi sliku po idu i ako smo toj slici dodelili novu vrednost, nju cuva */
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, width, height } : el)),
    );
  };

  const handleSubmitPage = async () => {
    let payload;

    if (!template) {
      alert("Template is missing!");
      return;
    }

    if (template === "blog") {
      payload = {
        title,
        template,
        layout: elements.map((el) =>
          el.type === "img"
            ? {
                type: "img",
                src: el.image,
                width: el.width,
                height: el.height,
              }
            : {
                type: el.type,
                value: el.value || "",
              },
        ),
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
      payload = {
        title: frontTitle,
        template,
        layout: {
          title: frontTitle,
          frontTitleStyle,
          background: frontBackground,
          elements: frontElements,
        },
      };
    }

    try {
      const url =
        mode === "edit"
          ? `http://127.0.0.1:8000/api/pages/${initialPage.id}`
          : "http://127.0.0.1:8000/api/pages";

      const method = mode === "edit" ? "put" : "post";

      await axios({
        method,
        url,
        data: payload,
        headers: {
          Authorization: "Bearer " + auth_token,
          "Content-Type": "application/json",
        },
      });

      alert(mode === "edit" ? "Page updated successfully!" : "Page created!");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Server error");
    }
  };

  const handleDiscardAll = () => {
    if (!window.confirm("Discard all changes?")) return;
    setTemplate(null);

    //za blog template
    setElements([]);
    setAboutElements([]);
    setTitle(null);
    setImage(null);
    setPreview(null);

    // landing
    setLandingData(null);

    // front
    setFrontTitle(null);
    setFrontElements([]);
    setFrontBackground(null);
    setFrontTitleStyle({
      color: "#000000",
      fontSize: 48,
      textAlign: "center",
    });

    setPreviewMode(false);
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
                /*funkcija kojom se slike prikazuju i cuvaju u bazi */
                handleImage={handleImage}
              />
            )}
          </div>
          <div className="EditButtons">
            {/*sredisnji div koji se koristi za kreiranje, pregled ili brisajne svih izmena napravljenih na stranici */}
            <button onClick={handleSubmitPage}>
              {mode === "edit" ? "Update page!" : "Create page!"}
            </button>

            <button onClick={() => setPreviewMode((prev) => !prev)}>
              {/*Svaki put kada se klikne menja se stanje, pa se menja i tekst dugmeta*/}
              {previewMode ? "Back to edit" : "Preview"}
            </button>
            <button onClick={handleDiscardAll}>Discard all</button>
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
