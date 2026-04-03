// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect";

import { setupIonicReact } from "@ionic/react";

setupIonicReact();

window.matchMedia = function (query: string): MediaQueryList {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: function () {
      throw new Error("addListener is not implemented.");
    },
    removeListener: function () {
      throw new Error("removeListener is not implemented.");
    },
    addEventListener: function () {
      throw new Error("addEventListener is not implemented.");
    },
    removeEventListener: function () {
      throw new Error("removeEventListener is not implemented.");
    },
    dispatchEvent: function (): boolean {
      throw new Error("dispatchEvent is not implemented.");
    },
  };
};
