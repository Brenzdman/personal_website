"use client";

// src/components/LinkSegment.tsx
import React, { useState } from "react";

// Importing images
import githubIcon from "../public/images/github-icon.png";
import linkedinIcon from "../public/images/linkedin-icon.png";
import terminalIcon from "../public/images/terminal-icon.png";
import emailIcon from "../public/images/email-icon.png";

const LinkSegment = () => {
  // Define the links for each platform
  const links = [
    {
      href: "https://github.com/Brenzdman",
      imgSrc: githubIcon,
      alt: "GitHub",
      isEmail: false,
    },
    {
      href: "https://www.linkedin.com/in/brenden-bushman-b915a5332/",
      imgSrc: linkedinIcon,
      alt: "LinkedIn",
      isEmail: false,
    },
    {
      href: "mailto:brenden.bushman@gmail.com", // This href will not be used for the email icon
      imgSrc: emailIcon,
      alt: "Email",
      isEmail: true,
      email: "brenden.bushman@gmail.com",
    },
    {
      href: "https://cmdterminal.vercel.app",
      imgSrc: terminalIcon,
      alt: "Terminal",
      isEmail: false,
    },
  ];

  // Inline styles
  const containerStyle = {
    display: "flex",
    justifyContent: "right",
    alignItems: "center",
    gap: "20px",
    padding: "20px",
    margin: "0 auto",
  };

  const linkStyle = {
    display: "inline-block",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
    position: "relative" as "relative", // Required for the popup positioning
  };

  const imgStyle = {
    width: "2em",
    height: "2em",
  };

  const popupStyle: React.CSSProperties = {
    position: "absolute" as "absolute",
    top: "3em",
    left: "50%",
    transform: "translateX(-50%)",
    color: "#000000",
      width: "10em",
    backgroundColor: "#ffffff",
    borderRadius: "5px",
    textAlign: "center",
    fontSize: "0.8em",
    opacity: 0.5,
    pointerEvents: "none",
  };

  // Handle hover effect using React state
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState<boolean>(false);

  // Function to copy email to clipboard
  const handleCopyToClipboard = async (email: string | undefined) => {
    try {
      await navigator.clipboard.writeText(email || "Error loading email");
      setShowPopup(true);

      // Hide the popup after 2 seconds
      setTimeout(() => {
        setShowPopup(false);
      }, 1000);
    } catch (error) {
      console.error("Failed to copy email to clipboard:", error);
    }
  };

  return (
    <div style={containerStyle}>
      {links.map((link, index) => (
        <a
          key={index}
          href={!link.isEmail ? link.href : undefined}
          target={!link.isEmail ? "_blank" : undefined}
          rel={!link.isEmail ? "noopener noreferrer" : undefined}
          style={{
            ...linkStyle,
            transform: hoveredIndex === index ? "scale(1.05)" : "scale(1)",
          }}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={
            link.isEmail ? () => handleCopyToClipboard(link.email) : undefined
          }
        >
          <img src={link.imgSrc.src} alt={link.alt} style={imgStyle} />
          {link.isEmail && showPopup && (
            <div style={popupStyle}>Copied to clipboard</div>
          )}
        </a>
      ))}
    </div>
  );
};

export default LinkSegment;
