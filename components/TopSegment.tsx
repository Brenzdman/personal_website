"use client";
import { useState, useEffect } from "react";
import image from "../public/images/Brenden_Bushman_Circle.jpg";
import intro from "../text/intro";

export default function TopSegment() {
  const [isVertical, setIsVertical] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsVertical(window.innerHeight * 1.3 > window.innerWidth);
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const imageElement = () => {
    return (
      <img
        style={{
          borderRadius: "50%",
          width: "25vw",
          height: "25vw",
          boxShadow: "0 6px 10px rgba(0, 0, 0, 0.15)",
        }}
        src={image.src}
        alt="Brenden Bushman"
      />
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isVertical ? "column" : "row", // Switch between vertical and horizontal layout
        justifyContent: "space-between",
        backgroundColor: "#fdfdfd",
        alignItems: "center",
        padding: "20px",
        borderLeft: "5px",
        borderRight: "5px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Render the image first when vertical */}
      {isVertical && (
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px", // Add spacing between image and text when in vertical mode
          }}
        >
          {imageElement()}
        </div>
      )}

      <div
        style={{
          flex: 1,
          padding: "20px",
          color: "#333",
          fontSize: "1.2rem",
          lineHeight: "1.6",
        }}
      >
        {intro()}
      </div>

      {/* Render the image last when horizontal */}
      {!isVertical && (
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
          }}
        >
          {imageElement()}
        </div>
      )}
    </div>
  );
}
