import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AiImageHall from "./app/AiImageHall";
import "./app/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AiImageHall />
  </StrictMode>,
);
