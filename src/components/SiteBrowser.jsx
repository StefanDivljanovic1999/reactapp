import React, { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { useCallback } from "react";
import "../css/Browser.css";
import SitePage from "./SitePage";
import { IoMdArrowRoundBack } from "react-icons/io";
import Menu from "./menu";

const SiteBrowser = () => {
  const auth_token = window.sessionStorage.getItem("auth_token");
  const [allSites, setAllSites] = useState([]);
  const [site, setSite] = useState(null);
  const [search, setSearch] = useState("");
  const [filterSites, setFilterSites] = useState(false);
  const [page, setPage] = useState(null);

  const [editSite, setEditSite] = useState(null);

  const fetchSites = useCallback(async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/menus", {
        headers: { Authorization: "Bearer " + auth_token },
      });
      setAllSites(response.data);
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [auth_token]);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  const displayedSites =
    search === ""
      ? allSites
      : allSites.filter((s) =>
          s.slug.toLowerCase().includes(search.toLocaleLowerCase()),
        );

  const handleSearch = async (slug) => {
    if (!slug) return;
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/menus/preview/${slug}`,
        {
          headers: { Authorization: "Bearer " + auth_token },
        },
      );
      setSite(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching site:", error);
      alert("Site not found or server error.");
    }
  };

  const handlePage = async (e, url) => {
    console.log(url);
    if (!url) return;
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/pages/preview/${url}`,
      );
      console.log(response.data);
      setPage(response.data);
    } catch (error) {
      console.error("Error fetching page:", error);
      alert("Page not found or server error.");
    }
  };

  const handleDeleteSite = async () => {
    console.log(site.id);
    const confrimDelete = window.confirm(
      "Are you sure you want to delete this site?",
    );
    if (!confrimDelete) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/menus/${site.id}`, {
        headers: {
          Authorization: "Bearer " + auth_token,
          "Content-Type": "application/json",
        },
      });

      alert("Site : " + site.title + " successfully deleted!");
      window.location.href = "/browser";
    } catch (error) {
      alert(error.response.data.message);
      console.log(error);
    }
  };

  useEffect(() => {
    if (site && site.items.length > 0) {
      const firstItem = site.items[0];
      handlePage(null, firstItem.url);
    }
  }, [site]);

  return (
    <div className="siteBrowser">
      {!site && (
        <div className="divSearchBrowser">
          <h1 className="findH1">Find your sites instantly.</h1>
          <div className="SearchInputWrapperBrowser">
            <input
              className="SearchInputMySite"
              placeholder="Enter site slug"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setFilterSites(true);
              }}
            />

            {filterSites && displayedSites.length > 0 && (
              <ul className="MySiteUl">
                {displayedSites.map((s) => (
                  <li
                    key={s.id}
                    className="MySiteLi"
                    onClick={() => {
                      setSearch(s.slug);
                      setFilterSites(false);
                    }}
                  >
                    {s.slug}
                  </li>
                ))}
              </ul>
            )}
            <button
              className="searchButton"
              onClick={() => handleSearch(search)}
            >
              <FaSearch />
            </button>
          </div>
        </div>
      )}

      {site && !editSite && (
        <div>
          <button onClick={() => setEditSite(site)}>Edit site</button>
          <button onClick={handleDeleteSite}>Delete site</button>
          <nav className="browserNavbar">
            <button className="backButton1" onClick={() => setSite(null)}>
              <IoMdArrowRoundBack />
              Back
            </button>

            {site.items.map((s) => (
              <li className="browserLi" onClick={(e) => handlePage(e, s.url)}>
                {s.title}
              </li>
            ))}
          </nav>
          {page && <SitePage page={page} />}
        </div>
      )}

      {editSite && <Menu editSite={editSite} />}
    </div>
  );
};

export default SiteBrowser;
