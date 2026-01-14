import React, { useState } from "react";
import axios from "axios";
import { useEffect, useCallback } from "react";
import "../css/Feed.css";
import Post from "./Post";

const Feed = () => {
  /*feed nam je stranica koju korisnici u zavisnosti od uloge koriste za pregled i ostavljanje reakcija na postove, dok admin 
  za sve to plus dodela statusa postu*/
  /*na pocetku ucitavamo sve neophodne podatke pomocu kojih ce nas feed uspesno raditi*/
  /*auth_token nam je neophodan da bismo mogli da bi admin mogao da izmeni status postova i da bi svaki korisnik mogao
  da ostavi reakciju */
  const auth_token = window.sessionStorage.getItem("auth_token");
  /*role nam je neophodan da bi diferencirali indterfejs u zavisnosti da li je korisnik admin ili drugi */
  const role = window.sessionStorage.getItem("role");
  /*potrebno da bi se ostavila reakcija*/
  const user_id = Number(window.sessionStorage.getItem("user_id"));

  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);

  /*ucitavamo postove iz baze podataka preko axiosa  i komponentu posts setujemo da bi smo posle mogli lepo da ih prikazemo na stranici*/
  /*useCallback cuva funkciju da je useeffect moze koristiti bez nepotrebnog kreiranja funkcije svaki put*/
  const fetchPosts = useCallback(async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/posts", {
        /*postove mogu da vide samo ulogovani korisnici */
        headers: { Authorization: "Bearer " + auth_token },
      });
      setPosts(response.data);
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [auth_token]);

  /*svaki put osvezava stanje nase stranice kada se promeni auth token, odnosno kada se stranica pokrene */
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  /*svi korisnici imaju pravo na lajk posta */
  /*u formu za slanje backendu se unose id posta koji se lajkuje i status(1-like) , a user_id je id ulogovanog usera */
  const postLike = async (postID) => {
    try {
      const formData = new FormData();
      formData.append("post_id", postID);
      formData.append("status", 1);
      const response = await axios.post(
        "http://127.0.0.1:8000/api/posts/react",
        formData,
        { headers: { Authorization: "Bearer " + auth_token } }
      );

      /*radi  vizuelnog prikaza broja lajkova i da li je ulogovani korisnik dao reakciju na post */
      setLikedPosts((prev) =>
        prev.includes(postID)
          ? prev.filter((id) => id !== postID)
          : [...prev, postID]
      );

      console.log(response.data);
      /*da bi se osvezilo stanje sa lajkovima */
      fetchPosts();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchLikedPosts = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/likes", {
          headers: { Authorization: "Bearer " + auth_token },
        });
        const liked = response.data
          .filter((item) => item.user_id === user_id)
          .map((item) => item.post_id);
        setLikedPosts(liked);
        console.log(liked);
      } catch (error) {
        console.log(error);
      }
    };

    fetchLikedPosts();
    fetchPosts();
  }, []);

  /*prenos idja posta kome ce admin dodeliti status */
  const handleDragStart = (e, postId) => {
    e.dataTransfer.setData("text/plain", postId);
  };
  /*neophodan da bi  bio uspesan drop(onemogucuje defualt stanje) */
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  /*kada admin dodeli status post nestaje iz njegovog feed-a */
  const handleDrop = async (e, status) => {
    const id = Number(e.dataTransfer.getData("text/plain"));
    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("status", status);
      const response = await axios.post(
        `http://127.0.0.1:8000/api/posts/approve/${id}`,
        formData,
        { headers: { Authorization: "Bearer " + auth_token } }
      );
      setPosts((prev) => prev.filter((post) => post.id !== id));
      console.log(response.data);
      alert("Post get status: " + status);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="divFeed">
      {role === "admin" && (
        <div className="dropZone" style={{ display: "flex", width: "100%" }}>
          <div
            className="archiveZone"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "rejected")}
          >
            Reject post
          </div>

          <div className="postsContainer">
            {posts
              .filter((post) => post.status === "draft")
              .map((post) => (
                <Post
                  key={post.id}
                  post={post}
                  liked={likedPosts.includes(post.id)}
                  onLike={postLike}
                  draggable
                  onDragStart={handleDragStart}
                />
              ))}
          </div>

          <div
            className="approveeZone"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "published")}
          >
            Approve post
          </div>
        </div>
      )}
      {role !== "admin" && (
        <div className="postsContainer">
          {posts
            .filter((post) => post.status !== "rejected")
            .map((post) => (
              <Post
                key={post.id}
                post={post}
                liked={likedPosts.includes(post.id)}
                onLike={postLike}
                draggable={false}
                onDragStart={handleDragStart}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default Feed;
