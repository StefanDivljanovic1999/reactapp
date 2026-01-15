import React from "react";

const FeatureCard = ({
  feature,
  handleFeatureSet,
  handleDeleteFeature,
  previewMode,
}) => {
  return (
    <div className="feature-card">
      {previewMode ? (
        <>
          <h3>{feature.title}</h3>
          <p>{feature.text}</p>
        </>
      ) : (
        <>
          <h3
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) =>
              handleFeatureSet(feature.id, "title", e.currentTarget.innerText)
            }
          >
            {feature.title}
          </h3>

          <p
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) =>
              handleFeatureSet(feature.id, "text", e.currentTarget.innerText)
            }
          >
            {feature.text}
          </p>

          <button onClick={() => handleDeleteFeature(feature.id)}>✕</button>
        </>
      )}
    </div>
  );
};

export default FeatureCard;
