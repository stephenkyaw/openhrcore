import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { StoreProvider } from "@/data/store";
import { App } from "@/App";
import "@/styles/globals.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element #root was not found.");
}

createRoot(root).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
);
