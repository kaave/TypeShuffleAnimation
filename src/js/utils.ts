// Preload images
export function preloadFonts(id: string) {
  return new Promise((resolve) =>
    window.WebFont.load({
      typekit: { id },
      active: resolve,
    })
  );
}

export function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

declare global {
  interface Window {
    WebFont: any;
  }
}
