import React from "react";

interface BorderProps {
  children: React.ReactNode;
}

export function Border({ children }: BorderProps) {
  return (
    <div
      style={{
        padding: "3rem",
        margin: "1rem",
      }}
    >
      {children}
    </div>
  );
}
