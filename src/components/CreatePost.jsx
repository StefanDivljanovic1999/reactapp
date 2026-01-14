import axios from "axios";

import React, { useEffect, useState } from "react";
import { useCallback } from "react";
import "../css/Post.css";
import { MdDelete } from "react-icons/md";
import { IoIosSend } from "react-icons/io";
import { FaArrowAltCircleLeft, FaArrowCircleRight } from "react-icons/fa";

const CreatePost = () => {
  /*Create post je funkcionalnost koja nasem korisniku omogucava da kreira post, ako ima ulogu admin ili author */
  const auth_token = window.sessionStorage.getItem("auth_token");
  const user_id = window.sessionStorage.getItem("user_id");
  /*kategorije su nam neophodne da bi korisnik kreirao post, on mora izabrati kategoriju */
  const [categories, setCategories] = useState([]);
  /*predstavlja pretragu korsniku u inputu za pretrgu kategorija */
  const [search, setSearch] = useState("");
  /*koristi se da korisnik izabere item(kategoriju) iz liste koja izlazi ispod inputa dok korisnik kuca */
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragOverDelete, setIsDragOverDelete] = useState(false);
  const [isDragOverSubmit, setIsDragOverSubmit] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/post_categories",
        { headers: { Authorization: "Bearer " + auth_token } }
      );
      setCategories(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [auth_token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /*vraca one kategorije koje se poklapaju sa unosom korinika */
  const filterCategories = categories.filter((category) =>
    /*poredi unos i title kategorija tako sto zanemaruje velika slova */
    category.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleImage = (e) => {
    /*image koji se salje u bazu se setuje na izabrani fajl */
    const file = e.target.files[0];
    if (!file) return;
    if (preview) URL.revokeObjectURL(preview);
    setImage(file);
    /*setuje se i lokalni preview*/
    setPreview(URL.createObjectURL(file));
  };

  const handlePost = async () => {
    /*funkcija za kreiranje posta, odnsno za slanje posta u bazu preko axiosa metodom POST */
    if (!title || !content) {
      alert("All fields are required!");
      return;
    }
    if (!selected) {
      alert("You didn't select category or category doens't exists...");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("user_id", user_id);
      formData.append("category_id", selected.id);
      formData.append("title", title);
      formData.append("content", content);
      if (image) formData.append("picture", image);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/posts",
        formData,
        {
          headers: { Authorization: "Bearer " + auth_token },
        }
      );

      alert("Post created successfully!");
      clearForm();

      console.log(response.data);
    } catch (error) {
      console.log(error);
      alert("Post wasn't created! Check console for error...");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const clearForm = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setTitle("");
    setContent("");
    setImage(null);
    setPreview(null);
    setSelected(null);
    setSearch("");
    alert("Form cleared");
  };

  return (
    <div className="postWrapper">
      <div
        className="deleteZone"
        onDragOver={handleDragOver}
        onDragEnter={() => setIsDragOverDelete(true)}
        onDragLeave={() => setIsDragOverDelete(false)}
        onDrop={(e) => {
          e.preventDefault();
          /*ispustanjem u ovu zonu brise sve sa post forme! */
          clearForm();
          setIsDragOverDelete(false);
        }}
        style={{
          backgroundColor: isDragOverDelete
            ? "rgba(255,0,0,0.3)"
            : "transparent",
        }}
      >
        <p className="deleteP">
          <MdDelete />
        </p>
      </div>
      <div className="postDiv" draggable>
        <p>Izaberite kategoriju: </p>

        <div className="postDropdown">
          <input
            className="postInput"
            placeholder="Enter category name here: "
            onInput={(e) => {
              /*dok korisnik kuca pretraga se setuje na vrednost unetu u input */
              setSearch(e.target.value);
              /*omogucava da se lista rezultata otvori kada se unese nesto u input za pretragu */
              setOpen(true);
              /*ako korisnik opet trazi kategoriju stara sacuvana se postavlja na null */
              setSelected(null);
            }}
            value={search}
          />

          {open && search !== "" && (
            <ul className="postUl">
              {filterCategories.length > 0 ? (
                /*ako je doslo do poklapanja sa unosom, prikazuje se lista titlova  */
                filterCategories.map((category) => (
                  <li
                    key={category.id}
                    className="postLi"
                    onClick={() => {
                      /*klikom na element iz liste se placeholder pretrage podesava na izabranu kategoriju */
                      setSearch(category.title);
                      /*lista nestaje*/
                      setOpen(false);
                      /*kategorija se setuje na izabranu */
                      setSelected(category);
                    }}
                  >
                    {category.title}
                  </li>
                ))
              ) : (
                /*ako nema poklapanja */
                <li className="postLi">No results</li>
              )}
            </ul>
          )}
        </div>

        {selected && (
          /*podsetnik za korisnika */
          <p className="postP">
            You selected: <b>{selected.title}</b>
          </p>
        )}

        <p>Enter title: </p>
        <input
          className="postInput"
          type="text"
          placeholder="title..."
          value={title}
          /*vrednost titla se cuva kao vrednost unosa */
          onInput={(e) => setTitle(e.target.value)}
        />

        <p>Enter content: </p>
        <textarea
          className="postInput"
          type="text"
          placeholder="content..."
          onInput={(e) => setContent(e.target.value)}
          value={content}
        />

        <p>Add picture: </p>
        <input
          className="postInput"
          type="file"
          placeholder="select image"
          /*dodavanjem slike se poziva funkcija handleImage */
          onChange={handleImage}
        />

        {preview && (
          /*lokalni preview da bi se korisnik odlucio da li je siguran da zeli da prilozi i sliku */
          <img src={preview} alt="preview" className="previewImage" />
        )}

        {/*uputstvo korisniku kako da pomocu drag&dropa kreira ili izbrise post */}
        <h3 className="postH3">
          <FaArrowAltCircleLeft />
          Drag left to discard, drag right do post! <FaArrowCircleRight />
        </h3>
      </div>

      <div
        /*zona u koju se post "ispusta" kada zeli da postuje objavu */
        className="submitZone"
        onDragOver={handleDragOver}
        /*ako je post usao u zonu kasnije ce se menjati boja pozadine */
        onDragEnter={() => setIsDragOverSubmit(true)}
        onDragLeave={() => setIsDragOverSubmit(false)}
        /*kada se post ispusti u zonu poziva se funkcija handlePost */
        onDrop={(e) => {
          e.preventDefault();
          handlePost();
          setIsDragOverSubmit(false);
        }}
        style={{
          backgroundColor: isDragOverSubmit
            ? "rgba(0, 255, 55, 0.3)"
            : "transparent",
        }}
      >
        <p className="submitP">
          <IoIosSend />
        </p>
      </div>
    </div>
  );
};

export default CreatePost;
