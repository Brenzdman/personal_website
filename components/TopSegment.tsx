// Includes image of myself and a brief introduction
import image from "../public/images/Brenden_Bushman_Circle.jpg";

export default function TopSegment() {
  return (
    <div
      style={{
        display: "flex",
              justifyContent: "space-between", 
        border: "1px solid black",
      }}
    >
      <h1 style={{ textAlign: "left" }}>Hi, my name is Brenden Bushman and I am studying Computer Science at the University of Wisconsin Madison.</h1>
      <img
        style={{
          borderRadius: "50%",
          width: "25vw",
          height: "25vw",
        }}
        src={image.src}
        alt="Brenden Bushman"
      />
    </div>
  );
}
