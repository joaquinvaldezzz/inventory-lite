import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./app";

import "./lib/dark-mode";

const container = document.getElementById("root");

if (container == null) {
  throw new Error("Root container missing in the DOM");
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
