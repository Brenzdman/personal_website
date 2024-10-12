// Includes image of myself and a brief introduction
import image from "../public/images/Brenden_Bushman_Circle.jpg";
import intro from "../text/intro";

export default function TopSegment() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        backgroundColor: "#fdfdfd",
        alignItems: "center",
        padding: "20px",
        borderLeft: "5px",
        borderRight: "5px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
      }}
    >
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
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
        }}
      >
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
      </div>
    </div>
  );
}
