// PoemInline.js
import { ACCENT } from "@/components/colors";
import React from "react";

const IntroPoem = () => {
  const containerStyle: React.CSSProperties = {
    fontFamily: "'Merriweather', serif",
    lineHeight: "1.6",
    fontSize: "1.2rem",
    color: "#333",
    maxWidth: "800px",
    margin: "50px auto",
    padding: "30px",
    backgroundColor: "#fdfdfd",
    borderLeft: `5px solid ${ACCENT}`,
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: "'Roboto', sans-serif",
    textAlign: "left",
    marginBottom: "30px",
    fontSize: "2rem",
    color: ACCENT,
  };

  const paragraphStyle: React.CSSProperties = {
    marginBottom: "1.5em",
  };

  const highlightStyle: React.CSSProperties = {
    fontWeight: "700",
    color: ACCENT,
  };

  return (
    <div style={containerStyle}>
      <p style={titleStyle}>Hi, I'm Brenden.</p>
      <p style={paragraphStyle}>
        Throughout my life, I have found that <br />
        embracing our differences is the greatest thing <br />
        that we can do for each other.
      </p>
      <p style={paragraphStyle}>
        For each individual view of the world
        <br />
        and each individual idea of how to solve its problems <br />
        lends us a new identity from which we can more clearly see <br />
        not only the true complexity of the problems themselves
        <br />
        but also the beauty that can be found within us all.
      </p>
      <p style={paragraphStyle}>
        So wherever you lay on the political spectrum,
        <br />
        wherever you were born, and whatever you believe,
        <br />
        <span style={highlightStyle}>
          you matter, and you belong in the conversation.
        </span>
      </p>
    </div>
  );
};

export default IntroPoem;
