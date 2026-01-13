import React from "react";

const FeatureCard = ({ feature, handleFeatureSet, handleDeleteFeature }) => {
  return (
    <div className="feature-card">
      <h3
        contentEditable
        suppressContentEditableWarning={true}
        onBlur={(e) =>
          handleFeatureSet(feature.id, "title", e.target.innerText)
        }
      >
        {feature.title}
      </h3>

      <p
        contentEditable
        suppressContentEditableWarning={true}
        onBlur={(e) => handleFeatureSet(feature.id, "text", e.target.innerText)}
      >
        {feature.text}
      </p>

      <button onClick={() => handleDeleteFeature(feature.id)}>X</button>
    </div>
  );
};

export default FeatureCard;
