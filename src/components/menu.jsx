import React from "react";
import axios from "axios";
import { useCallback } from "react";
import { useState } from "react";
import { useEffect } from "react";
import "../css/Menu.css";

const Menu = ({ editSite }) => {
  const editMode = !!editSite;

  const auth_token = window.sessionStorage.getItem("auth_token");
  //dodajemo steps zato sto zelim da kreiranje sajta bude step by step
  const [step, setStep] = useState(1);

  const [allPages, setAllPages] = useState([]);
  const [page, setPage] = useState(null);
  const [search, setSearch] = useState("");
  /*kontrolna promenljiva za dropdown listu ispod search inputa */
  const [filterPages, setFilterPages] = useState(false);
  const [numOfItems, setNumOfItems] = useState(0);
  const [title, setTitle] = useState(null);
  const [showTitle, setShowTitle] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [showNavBar, setShowNavBar] = useState(false);
  /*broj elemenata u nizu je jednak broju elemenata koje smo definisali u koraku 2 */
  /*ovo nam znaci da se pravi niz duzine numOfItems */
  /*(_,i)=>i+1 znaci da (value, index) nam vrednost ovde nije bitna, one ce se kasnije dodavati pri dropu slugova u elemente */
  const itemsArray = Array.from({ length: numOfItems }, (_, i) => i + 1);

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
          p.slug.toLowerCase().includes(search.toLocaleLowerCase()),
        );

  const handleSearch = async (slug) => {
    if (!slug) return;
    /*nalazimo  stranicu po unetom slugu i izvlacimo je iz baze pomocu get metode*/
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/pages/preview/${slug}`,
      );
      setPage(response.data);
      /*setujemo page na response iz baze */
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching page:", error);
      alert("Page not found or server error.");
    }
  };

  const handleDragStart = (e) => {
    console.log(e);
    e.dataTransfer.setData("text/plain", page.slug);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    /*preuzima se vrednost koju smo prenosili iz dragstarta */
    const slug = e.dataTransfer.getData("text/plain");

    /*nalazimo page na osnovu sluga */
    const pageForCheck = allPages.find((p) => p.slug === slug);

    /*ako na prvi element pokusavamo da dodelimo element sa drugim templteom javlja se greska */
    if (index === 0 && pageForCheck.template !== "front") {
      alert("Only front page can be dropped on element number 1!!!");
      return;
    }

    /*ako slug ispustimo na mesto koje je vec zauzeto nekim elementom javlja se greska */
    if (menuItems[index]) {
      alert("This menu postion is already taken!");
      return;
    }
    /*update vrednosti elementa niza menuItems */
    setMenuItems((prev) => {
      /*updated je kopija niza menuItems, jer u reactu nije preporucljivo direktno menjati nizove */
      const updated = [...prev];
      /*element koji smo nasli na osnovu indexa na koji smo ispustili vrednost dobija svoju vrednost */
      updated[index] = slug;
      return updated;
    });

    /*search bar za pageve se oslobadja */
    setPage(null);
  };

  const checkTitle = () => {
    if (!title || title === "") {
      alert("Title is required!!!");
      return;
    }

    if (title.length < 3) {
      alert("Incorrect title length(min 3)!!!");
      return;
    }
    setStep(2);
  };

  const checkNumOfItems = (num) => {
    /*da ne bi doslo do baga ako se num protumaci kao varchar */
    num = Number(num);
    if (num < 1 || num > 10) {
      alert("Number of items must be beetween 1 and 10!!!");
      return;
    }
    /*ako prodje verifikaciju prelazi se na korak 3 i u njemu se prikazuje taj nas navbar */
    /*odnosno meni */
    setStep(3);
    setShowNavBar(true);
  };

  useEffect(() => {
    if (editMode) {
      setTitle(editSite.title);
      setNumOfItems(editSite.items.length);
      setMenuItems(editSite.items.map((i) => i.url));
      setStep(3);
      setShowNavBar(true);
    }
  }, [editSite, editMode]);

  const handleSaveMenu = async () => {
    const filteredItems = menuItems.filter(Boolean).map((slug) => ({
      title: slug.replace("-", " "),
      url: slug,
    }));

    /*filter(Boolean) izbacuje sve null i undefined clasnove niza 
      title se cuva tako sto se izbacuju razmaci i - polja*/

    const payload = {
      title: title,
      items: filteredItems,
    };

    try {
      if (editMode) {
        const updatePayload = { _method: "PUT", ...payload };
        await axios.post(
          `http://127.0.0.1:8000/api/menus/${editSite.id}`,
          updatePayload,
          { headers: { Authorization: "Bearer " + auth_token } },
        );
        alert("Site updated!");
      } else {
        await axios.post("http://127.0.0.1:8000/api/menus", payload, {
          headers: { Authorization: "Bearer " + auth_token },
        });

        alert("Menu successfully created!");
      }
    } catch (error) {
      console.log(error);
      alert("Error careating menu...");
    }
  };

  /*na pocetku je svako mesto prazno, pa se svakom elementu dodeljuje null vrednost */
  /*ako se posle predomislimo pravi se novi niz koji ima elemente iz prethonohih+ novi koji dobijaju null, ili se brisu */
  useEffect(() => {
    setMenuItems((prev) => {
      // ako smo u edit modu i već imamo iteme – ne diraj ih
      if (editMode && prev.length > 0) return prev;

      return Array.from({ length: numOfItems }, (_, i) => prev[i] ?? null);
    });
  }, [numOfItems, editMode]);

  const handleDeleteItem = (i) => {
    /*prosledjuje se index iz niza */
    setMenuItems((prev) => {
      const updated = [...prev];
      /*pronalaskom elementa njegova vrednost postaje null i prikazuje se defaultna vrednost  */
      updated[i] = null;
      return updated;
    });
  };

  return (
    <div className="MenuContainer" style={{ padding: "100px" }}>
      <h1 className="createSiteH1Menu">Create site:</h1>
      {step === 1 && (
        <div className="MenuTitle">
          {/*na pocetku korak je 1 i u njemu korisnik unosi naslov sajta po kome ce se on kasnije pretrazivati */}

          <div className="inputSelectWrapper">
            <input
              className="menuItemsInput"
              type="text"
              value={title || ""}
              placeholder="Enter site title here: "
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <button className="btnShowTitle" onClick={() => setShowTitle(true)}>
              Select
            </button>
          </div>

          {showTitle && <h4 className="yourTitle">Your title: {title}</h4>}

          <button className="nextButtonMenu" onClick={() => checkTitle()}>
            Next
          </button>
        </div>
      )}
      {step === 2 && (
        /*u drugom koraku korsnik unosi broj elemenata menija njegovog sajta */
        <div className="numOfItemsDiv">
          <h3>Enter number of menu items: </h3>
          <input
            className="inputNumOfItems"
            type="number"
            value={numOfItems}
            placeholder="enter number between 1 and 10"
            onChange={(e) => setNumOfItems(e.target.value)}
          />

          <div>
            <button className="previousButtonMenu" onClick={() => setStep(1)}>
              Previous
            </button>
            {/*klikom na dugme next poziva se funkcija za proveru unetog broja elemenata */}
            <button
              className="nextButtonMenu"
              onClick={(e) => checkNumOfItems(numOfItems)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="dragAndDropMenu">
          {showNavBar && (
            /*prelaskom na korak 3 showNavBar postaje true i prikazuje se navbar sa brojem el definisanim
            u koraku 2 */
            <nav className="menuNavBar">
              <ul className="menuNavBarUl">
                {/*elementi nase liste postaju drop zone, gde ce se dropovati slugovi */}
                {itemsArray.map((i, index) => (
                  <li
                    key={i}
                    className="menuNavBarLi"
                    onDragOver={handleDragOver}
                  >
                    <div className="menuItemWrapper">
                      <h2
                        className="menuNavBarLiName"
                        onDragOver={handleDragOver}
                        /*ispustanjem na element, poziva se handleDrop, gde se prosledjuje event i index elementa
                        na koji je ispusten slug */
                        onDrop={(e) => handleDrop(e, index)}
                      >
                        {/*ako je item dobio slug prikazuje se slug, ako nije defualtna vvrednost */}
                        {menuItems[index] || `Element number ${i}`}
                      </h2>
                      {/*ako je element dobio vrednost, dodaje se opcija da se ona obrise i vrati na default vrednost */}
                      {menuItems[index] && (
                        <button
                          className="deleteBtn"
                          onClick={() => handleDeleteItem(index)}
                        >
                          X
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          {/*Koncept je da elementi niza budu iznad pretrazivaca stranica  */}
          <h1>Drag pages and drop them on the desired menu position.</h1>

          {/*Ako stranica nije ucitana prikazuje se input polje u koje se unosi slug
           */}
          {!page && (
            <div className="divSearchMenu">
              <h2 className="SFP">Search for pages to choose</h2>
              <h1 className="findH1Menu">Find your pages instantly.</h1>
              <div className="SearchInputWrapperMenu">
                <input
                  className="SearchInputMyPageMenu"
                  placeholder="Enter page slug"
                  /*da bi nam se posle izbor prikazao u serach baru */
                  value={search}
                  onChange={(e) => {
                    /*pri unosu u input pretraga se podesava na unos, a filter pages se podesava na true
                      sto znaci da se ispod inputa pojavljuje dropdown lista filtered pages */

                    setSearch(e.target.value);
                    setFilterPages(true);
                  }}
                />

                {filterPages && displayedPages.length > 0 && (
                  <ul className="MyPageUl">
                    {displayedPages.map((p) => (
                      <li
                        key={p.id}
                        className="MyPageLiMenu"
                        /*input se popunjava slugom na koji je kliknuto
                        dropdown lista je sakrivena */
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
                  className="searchButtonMenu"
                  /*klikom na dugme se poziva funkcija handle search
                  kojom se nalazi page sa zadatim slugom iz baze i nakon toga
                  slug postaje draggable za unos u meni */
                  onClick={() => handleSearch(search)}
                >
                  Select
                </button>
              </div>
            </div>
          )}
          {page && (
            <div className="selectedPage">
              <h2>Drag page title on position in menu!</h2>

              <div className="pageCard">
                <h3
                  className="dragSlug"
                  draggable
                  onDragStart={handleDragStart}
                >
                  {page.slug}
                </h3>

                <button
                  className="previewBtnMenu"
                  onClick={() =>
                    /*otvaranje u novoj kartici a posto
                    my page kao props prima previewSlug to dodajemo u url */
                    window.open(`/my-page?previewSlug=${page.slug}`, "_blank")
                  }
                >
                  Preview
                </button>

                <button className="deletePageBtn" onClick={() => setPage(null)}>
                  X
                </button>
              </div>
            </div>
          )}
          <h2>Items:</h2>
          {menuItems.map((mi) => (
            <h3>{mi}</h3>
          ))}
          <div>
            <button className="previousButtonMenu" onClick={() => setStep(2)}>
              Previous
            </button>
            {/*klikom na create site cuvamo nas sajt u bazi */}
            <button className="btnSaveMenu" onClick={handleSaveMenu}>
              {!editMode ? "Create site" : "Update site"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
