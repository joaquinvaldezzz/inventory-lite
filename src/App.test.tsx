import { render } from "@testing-library/react";
import { expect, test } from "vitest";

import App from "./app";

test("renders without crashing", () => {
  const { baseElement } = render(<App />);
  expect(baseElement).toBeDefined();
});
