import React from "react";
import "../css/SitePage.css";

const SitePage = ({ page }) => {
  if (!page) return null;

  return (
    <div className="sitePage">
      <h1 className="sitePageTitle">{page.title}</h1>

      {page.template === "blog" &&
        page.layout.map((el, index) => (
          <div key={index} className="sitePageItem">
            {el.type === "h1" && <h1>{el.value}</h1>}
            {el.type === "h2" && <h2>{el.value}</h2>}
            {el.type === "p" && <p>{el.value}</p>}
            {el.type === "img" && (
              <img
                src={el.src}
                alt=""
                style={{
                  width: el.width || "auto",
                  height: el.height || "auto",
                }}
              />
            )}
          </div>
        ))}

      {page.template === "landing" && (
        <>
          <section className="hero">
            {page.layout.hero?.map((el) => (
              <div key={el.id}>
                {el.type === "h1" && <h1>{el.value}</h1>}
                {el.type === "p" && <p>{el.value}</p>}
                {el.type === "button" && (
                  <button className="ctaBtn">{el.value}</button>
                )}
                {el.type === "img" && (
                  <img src={el.image || el.src} alt="hero" />
                )}
              </div>
            ))}
          </section>

          <section className="features">
            <h2>Features</h2>
            {page.layout.features?.map((f) => (
              <div key={f.id} className="feature">
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </section>

          <section className="cta">
            <h2>{page.layout.cta?.heading}</h2>
            <p>{page.layout.cta?.text}</p>
            <button className="ctaBtn">{page.layout.cta?.button}</button>
          </section>
        </>
      )}

      {page && page.template === "front" && (
        <div
          className="PageDivFront"
          style={{
            backgroundImage: page.layout.background
              ? `url(${page.layout.background})`
              : "none",
          }}
        >
          <h1
            className="frontPageTitle"
            style={{
              color: page.layout.frontTitleStyle.color,
              fontSize: `${page.layout.frontTitleStyle.fontSize}px`,
              textAlign: page.layout.frontTitleStyle.textAlign,
            }}
          >
            {page.layout.title || page.title}
          </h1>

          <div className="frontPageElements">
            {page.layout.elements.map((el, index) => {
              const style = {
                marginBottom: "24px",
                color: el.style.color,
                textAlign: el.style.textAlign,
              };

              return (
                <div
                  key={el.id}
                  style={{
                    position: "relative",
                    padding: "8px",
                    border: "none",
                  }}
                >
                  <>
                    {el.type === "h1" && <h1 style={style}>{el.value}</h1>}
                    {el.type === "h2" && <h2 style={style}>{el.value}</h2>}
                    {el.type === "p" && <p style={style}>{el.value}</p>}
                  </>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SitePage;
