import React from "react";
import axios from "axios";
import { useCallback } from "react";
import { useState } from "react";
import { useEffect } from "react";
import "../css/Menu.css";

const Menu = () => {
  const auth_token = window.sessionStorage.getItem("auth_token");
  const [allPages, setAllPages] = useState([]);
  const [page, setPage] = useState(null);
  const [search, setSearch] = useState("");
  const [filterPages, setFilterPages] = useState(false);
  const [numOfItems, setNumOfItems] = useState(0);
  const [title, setTitle] = useState(null);
  const [showTitle, setShowTitle] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [showNavBar, setShowNavBar] = useState(false);
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
          p.slug.toLowerCase().includes(search.toLocaleLowerCase())
        );

  const handleSearch = async (slug) => {
    if (!slug) return;
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/pages/preview/${slug}`
      );
      setPage(response.data);
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
    const slug = e.dataTransfer.getData("text/plain");

    if (menuItems[index]) {
      alert("This menu postion is already taken!");
      return;
    }

    setMenuItems((prev) => {
      const updated = [...prev];
      updated[index] = slug;
      return updated;
    });

    setPage(null);
  };

  const checkNumOfItems = (num) => {
    console.log(num);
    if (num < 1 || num > 10) {
      alert("Number of items must be beetween 1 and 10!!!");
      return;
    }
    setShowNavBar(true);
  };

  const handleSaveMenu = async () => {
    const filteredItems = menuItems.filter(Boolean).map((slug) => ({
      title: slug.replace("-", " "),
      url: slug,
    }));

    const payload = {
      title: title,
      items: filteredItems,
    };

    try {
      await axios.post("http://127.0.0.1:8000/api/menus", payload, {
        headers: { Authorization: "Bearer " + auth_token },
      });

      alert("Menu successfully created!");
    } catch (error) {
      console.log(error);
      alert("Error careating menu...");
    }
  };

  useEffect(() => {
    setMenuItems(Array(numOfItems).fill(null));
  }, [numOfItems]);

  const handleDeleteItem = (i) => {
    setMenuItems((prev) => {
      const updated = [...prev];
      updated[i] = null;
      return updated;
    });
  };

  return (
    <div className="MenuContainer" style={{ padding: "100px" }}>
      <h1>Create site:</h1>

      <div className="MenuTitle">
        <input
          className="menuItemsInput"
          type="text"
          placeholder="Enter site title here: "
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <button className="btnShowTitle" onClick={() => setShowTitle(true)}>
          Select
        </button>
      </div>

      {showTitle && <h4>Your title: {title}</h4>}

      <h3>Enter number of menu items: </h3>
      <div className="numOfItemsDiv">
        <input
          className="inputNumOfItems"
          type="number"
          placeholder="enter number between 1 and 10"
          onInput={(e) => setNumOfItems(e.target.value)}
        />
        <button
          className="btnCheckNum"
          onClick={() => checkNumOfItems(numOfItems)}
        >
          Select
        </button>
      </div>
      {showNavBar && (
        <nav className="menuNavBar">
          <ul className="menuNavBarUl">
            {itemsArray.map((i, index) => (
              <div>
                <li
                  key={i}
                  className="menuNavBarLi"
                  onDragOver={handleDragOver}
                >
                  <h2
                    className="menuNavBarLiName"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    {menuItems[index] || `Element number ${i}`}
                  </h2>
                </li>
                <button onClick={() => handleDeleteItem(index)}>X</button>
              </div>
            ))}
          </ul>
        </nav>
      )}
      <h2>Available pages</h2>

      {!page && (
        <div className="divSearchMenu">
          <h1 className="findH1Menu">
            Find your pages instantly. Edit them effortlessly.
          </h1>
          <div className="SearchInputWrapperMenu">
            <input
              className="SearchInputMyPageMenu"
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
                    className="MyPageLi"
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
              className="searchButton"
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
          <h3 className="dragSlug" draggable onDragStart={handleDragStart}>
            {page.slug}
          </h3>
        </div>
      )}

      <h2>Items:</h2>
      {menuItems.map((mi) => (
        <h3>{mi}</h3>
      ))}

      <button className="btnSaveMenu" onClick={handleSaveMenu}>
        Create site
      </button>
    </div>
  );
};

export default Menu;
