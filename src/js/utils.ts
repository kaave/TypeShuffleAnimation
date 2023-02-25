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

const lettersAndSymbols = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "!",
  "@",
  "#",
  "$",
  "&",
  "*",
  "(",
  ")",
  "-",
  "_",
  "+",
  "=",
  "/",
  "[",
  "]",
  "{",
  "}",
  ";",
  ":",
  "<",
  ">",
  ",",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
];

export function getRandomChar(): typeof lettersAndSymbols[number] {
  return lettersAndSymbols[
    Math.floor(Math.random() * lettersAndSymbols.length)
  ];
}

export function getRandomColor(): `#${string}` {
  const colors = ["#3e775d", "#61dca3", "#61b3dc"] as const;

  return colors[Math.floor(Math.random() * colors.length)];
}

declare global {
  interface Window {
    WebFont: any;
  }
}
