import { preloadFonts } from "./utils";
import { TypeShuffle } from "./typeShuffle";

preloadFonts("biu0hfr").then(() => {
  document.body.classList.remove("loading");

  const textElement = document.querySelector<HTMLElement>(".content");

  if (!textElement) return;

  const ts = new TypeShuffle(textElement);
  ts.trigger("fx1");

  Array.from(
    document.querySelectorAll<HTMLButtonElement>(".effects > button")
  ).forEach((button) => {
    button.addEventListener("click", () => {
      ts.trigger(`fx${button.dataset.fx}`);
    });
  });
});
