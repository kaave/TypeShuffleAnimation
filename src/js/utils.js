// Preload images
export const preloadFonts = (id) => {
  return new Promise((resolve) =>
    WebFont.load({
      typekit: { id },
      active: resolve,
    })
  );
};

export const randomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
