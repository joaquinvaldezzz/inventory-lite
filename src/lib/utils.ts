import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges multiple class names into a single string.
 *
 * This function takes any number of class name inputs, processes them using `clsx`, and then merges
 * them using `twMerge` to ensure that Tailwind CSS classes are combined correctly.
 *
 * @param inputs The class names to merge. These can be strings, arrays, or objects.
 * @returns The merged class names as a single string.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a given number as a currency string in Philippine Peso (PHP).
 *
 * @param int The number to format as currency.
 * @returns A string representing the formatted currency.
 */
export function formatAsCurrency(int: number): string {
  const PHP = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  });

  return PHP.format(int);
}

/**
 * Updates the theme of the application by adding the corresponding class to the document's root
 * element.
 *
 * @param theme The theme to be applied. Can be "light", "dark", or "system".
 * @todo Implement system theme detection, and save the selected theme to local storage.
 */
export function updateTheme(theme: "light" | "dark" | "system" | null) {
  const classList = document.documentElement.classList;

  classList.remove("ion-palette-dark", "light", "dark", "system");

  if (theme === "light") {
    classList.add("light");
    localStorage.setItem("theme", "light");
  } else if (theme === "dark") {
    classList.add("ion-palette-dark", "dark");
    localStorage.setItem("theme", "dark");
  } else {
    classList.add("system");
    localStorage.setItem("theme", "system");
  }
}
