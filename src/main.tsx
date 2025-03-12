import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./app";
import { Loading } from "./components/loading";

const container = document.getElementById("root");

if (container == null) {
  throw new Error("Root container missing in the DOM");
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <Suspense fallback={<Loading />}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Suspense>
  </StrictMode>,
);
