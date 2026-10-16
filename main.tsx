import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Guangdang from "./app/Guangdang";
import "./app/guangdang.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Guangdang />
  </StrictMode>,
);
