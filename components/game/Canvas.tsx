"use client";
import { useEffect, useRef } from "react";
import TickManager, { resetGames } from "./tickManager";

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const canvasHeight = window.innerHeight * 0.4;

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = document.documentElement.clientWidth;
    canvas.height = canvasHeight;
  };

  useEffect(() => {
    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <div>
      <TickManager />
      <div
        style={{
          backgroundColor: "#ffffff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "0",
          overflow: "hidden",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <canvas ref={canvasRef} id="snakeCanvas" onClick={resetGames} />
      </div>
    </div>
  );
}
