import React from "react";

interface BorderProps {
  children: React.ReactNode;
}

export function Border({ children }: BorderProps) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #f0f0f0, #dfe9f3)",
        paddingLeft: "10rem",
        paddingRight: "10rem",
        paddingTop: "2rem",
        paddingBottom: "2rem",
      }}
    >
      {children}
    </div>
  );
}
