import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Guangdang from "./app/Guangdang";
import "./app/guangdang.css";
import "./app/cyber.css";
import "./app/mobile-first.css";
import "./app/product-pages.css";
import "./app/editorial-pages.css";
import "./app/lightfield.css";
import "./app/cinema-theme.css";
import "./app/cinema-home.css";
import "./app/cinema-typography.css";
import "./app/mobile-editorial.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Guangdang />
  </StrictMode>,
);
