"use client";
import { useEffect, useRef } from "react";
import TickManager, { canvasClick } from "./tickManager";
import SpanningTree from "./Snake/spanningTree";

export function SnakeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = document.documentElement.clientWidth;
    canvas.height = window.innerHeight * 0.4;
  };

  useEffect(() => {
    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <SpanningTree width={50} height={10} />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none", // Allow clicks to pass through
        }}
      >
        <TickManager />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "0",
            overflow: "hidden",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <canvas ref={canvasRef} id="snakeCanvas" onClick={canvasClick} />
        </div>
      </div>
    </div>
  );
}
