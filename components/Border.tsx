"use client";

import React, { useEffect } from "react";

interface BorderProps {
  children: React.ReactNode;
}

export function Border({ children }: BorderProps) {
  useEffect(() => {
    const resizeBorder = () => {
      let borderWidth = document.documentElement.clientWidth * 0.1;
      if (window.innerHeight * 1.3 > window.innerWidth) {
        borderWidth = 0;
      }

      const border = document.getElementById("border");
      if (!border) return;

      border.style.paddingLeft = `${borderWidth}px`;
      border.style.paddingRight = `${borderWidth}px`;
    };

    resizeBorder();

    window.addEventListener("resize", resizeBorder);

    return () => {
      window.removeEventListener("resize", resizeBorder);
    };
  });

  return (
    <div
      id="border"
      style={{
        background: "linear-gradient(135deg, #f0f0f0, #dfe9f3)",
        paddingLeft: "10rem",
        paddingRight: "10rem",
        paddingBottom: "2rem",
      }}
    >
      {children}
    </div>
  );
}
