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
    addListener: function (listener: (e: MediaQueryListEvent) => void) {
      console.warn("addListener is not implemented.");
    },
    removeListener: function (listener: (e: MediaQueryListEvent) => void) {
      console.warn("removeListener is not implemented.");
    },
    addEventListener: function (type: string, listener: (e: Event) => void) {
      console.warn("addEventListener is not implemented.");
    },
    removeEventListener: function (type: string, listener: (e: Event) => void) {
      console.warn("removeEventListener is not implemented.");
    },
    dispatchEvent: function (event: Event): boolean {
      console.warn("dispatchEvent is not implemented.");
      return false;
    },
  };
};
