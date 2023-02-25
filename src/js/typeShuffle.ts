import "splitting/dist/splitting.css";
import "splitting/dist/splitting-cells.css";
import Splitting from "splitting";
import { randomNumber } from "./utils";

type SplittingResult = Array<{
  el: HTMLElement;
  lines: HTMLElement[][];
  words: HTMLElement[];
}>;

/**
 * Class representing one line
 */
class Line {
  position = -1;
  // cells/chars
  cells: Cell[] = [];

  constructor(linePosition: number) {
    this.position = linePosition;
  }
}

/**
 * Class representing one cell/char
 */
class Cell {
  // the char element (<span>)
  el: HTMLElement | null = null;
  // cell position
  position = -1;
  // previous cell position
  previousCellPosition = -1;
  // original innerHTML
  original: string;
  // current state/innerHTML
  state: string;
  color: string;
  originalColor: string;
  // cached values
  cache:
    | string
    | {
        state: string;
        color: string;
      } = "";

  /**
   * Constructor.
   * @param element - the char element (<span>)
   */
  constructor(
    element: HTMLElement,
    {
      position,
      previousCellPosition,
    }: { position: number; previousCellPosition: number }
  ) {
    this.el = element;
    this.original = this.el.innerHTML;
    this.state = this.original;
    this.color = this.originalColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--color-text");
    this.position = position;
    this.previousCellPosition = previousCellPosition;
  }

  set(value: string): void {
    this.state = value;

    if (this.el) {
      this.el.innerHTML = this.state;
    }
  }
}

/**
 * Class representing the TypeShuffle object
 */
export class TypeShuffle {
  // DOM elements
  el: HTMLElement | null = null;
  // array of Line objs
  lines: Line[] = [];
  // array of letters and symbols
  // effects and respective methods
  effects = {
    fx1: () => this.fx1(),
    fx2: () => this.fx2(),
    fx3: () => this.fx3(),
    fx4: () => this.fx4(),
    fx5: () => this.fx5(),
    fx6: () => this.fx6(),
  };
  totalChars = 0;
  isAnimating = false;

  /**
   * Constructor.
   * @param {Element} element - main text element
   */
  constructor(element: HTMLElement) {
    this.el = element;

    // Apply Splitting (two times to have lines, words and chars)
    const results = Splitting({
      target: this.el,
      by: "lines",
    }) as any as SplittingResult; // Note: Maybe `@types/Splitting` defined old spec types. It's current(1.0.6) type.

    results.forEach((s) => Splitting({ target: s.words }));

    // for every line
    for (const [linePosition, lineArr] of results[0].lines.entries()) {
      // create a new Line
      const line = new Line(linePosition);
      let cells = [];
      let charCount = 0;
      // for every word of each line
      for (const word of lineArr) {
        // for every character of each line
        for (const char of [...word.querySelectorAll<HTMLElement>(".char")]) {
          cells.push(
            new Cell(char, {
              position: charCount,
              previousCellPosition: charCount === 0 ? -1 : charCount - 1,
            })
          );
          ++charCount;
        }
      }
      line.cells = cells;
      this.lines.push(line);
      this.totalChars += charCount;
    }

    // TODO
    // window.addEventListener('resize', () => this.resize());
  }

  /**
   * clear all the cells chars
   */
  clearCells() {
    for (const line of this.lines) {
      for (const cell of line.cells) {
        cell.set("&nbsp;");
      }
    }
  }

  /**
   *
   * @returns {string} a random char from this.lettersAndSymbols
   */
  /**
   * Effect 1 - clear cells and animate each line cells (delays per line and per cell)
   */
  fx1() {
    // max iterations for each cell to change the current value
    const MAX_CELL_ITERATIONS = 45;

    let finished = 0;

    // clear all cells values
    this.clearCells();

    // cell's loop animation
    // each cell will change its value MAX_CELL_ITERATIONS times
    const loop = (line: Line, cell: Cell, iteration = 0) => {
      // cache the previous value
      cell.cache = cell.state;

      // set back the original cell value if at the last iteration
      if (iteration === MAX_CELL_ITERATIONS - 1) {
        cell.set(cell.original);
        ++finished;
        if (finished === this.totalChars) {
          this.isAnimating = false;
        }
      }
      // if the cell is the first one in its line then generate a random char
      else if (cell.position === 0) {
        // show specific characters for the first 9 iterations (looks cooler)
        cell.set(
          iteration < 9
            ? ["*", "-", "\u0027", "\u0022"][Math.floor(Math.random() * 4)]
            : getRandomChar()
        );
      }
      // get the cached value of the previous cell.
      // This will result in the illusion that the chars are sliding from left to right
      else if (
        typeof line.cells[cell.previousCellPosition].cache === "string"
      ) {
        cell.set(line.cells[cell.previousCellPosition].cache as string);
      }

      // doesn't count if it's an empty space
      if (cell.cache != "&nbsp;") {
        ++iteration;
      }

      // repeat...
      if (iteration < MAX_CELL_ITERATIONS) {
        setTimeout(() => loop(line, cell, iteration), 15);
      }
    };

    // set delays for each cell animation
    for (const line of this.lines) {
      for (const cell of line.cells) {
        setTimeout(() => loop(line, cell), (line.position + 1) * 200);
      }
    }
  }

  fx2() {
    const MAX_CELL_ITERATIONS = 20;
    let finished = 0;
    const loop = (line: Line, cell: Cell, iteration = 0) => {
      if (iteration === MAX_CELL_ITERATIONS - 1) {
        cell.set(cell.original);
        const { el } = cell;
        if (!el) {
          return;
        }

        el.style.opacity = String(0);

        setTimeout(() => {
          el.style.opacity = String(1);
        }, 300);

        ++finished;
        if (finished === this.totalChars) {
          this.isAnimating = false;
        }
      } else {
        cell.set(getRandomChar());
      }

      ++iteration;
      if (iteration < MAX_CELL_ITERATIONS) {
        setTimeout(() => loop(line, cell, iteration), 40);
      }
    };

    for (const line of this.lines) {
      for (const cell of line.cells) {
        setTimeout(() => loop(line, cell), (cell.position + 1) * 30);
      }
    }
  }

  fx3() {
    const MAX_CELL_ITERATIONS = 10;
    let finished = 0;
    this.clearCells();

    const loop = (line: Line, cell: Cell, iteration = 0) => {
      if (iteration === MAX_CELL_ITERATIONS - 1) {
        cell.set(cell.original);
        ++finished;
        if (finished === this.totalChars) {
          this.isAnimating = false;
        }
      } else {
        cell.set(getRandomChar());
      }

      ++iteration;
      if (iteration < MAX_CELL_ITERATIONS) {
        setTimeout(() => loop(line, cell, iteration), 80);
      }
    };

    for (const line of this.lines) {
      for (const cell of line.cells) {
        setTimeout(() => loop(line, cell), randomNumber(0, 2000));
      }
    }
  }

  fx4() {
    const MAX_CELL_ITERATIONS = 30;
    let finished = 0;
    this.clearCells();

    const loop = (line: Line, cell: Cell, iteration = 0) => {
      cell.cache = cell.state;

      if (iteration === MAX_CELL_ITERATIONS - 1) {
        cell.set(cell.original);

        ++finished;
        if (finished === this.totalChars) {
          this.isAnimating = false;
        }
      } else if (cell.position === 0) {
        cell.set(["*", ":"][Math.floor(Math.random() * 2)]);
      } else if (
        typeof line.cells[cell.previousCellPosition].cache === "string"
      ) {
        cell.set(line.cells[cell.previousCellPosition].cache as string);
      }

      if (cell.cache != "&nbsp;") {
        ++iteration;
      }

      if (iteration < MAX_CELL_ITERATIONS) {
        setTimeout(() => loop(line, cell, iteration), 15);
      }
    };

    for (const line of this.lines) {
      for (const cell of line.cells) {
        setTimeout(
          () => loop(line, cell),
          Math.abs(this.lines.length / 2 - line.position) * 400
        );
      }
    }
  }

  fx5() {
    // max iterations for each cell to change the current value
    const MAX_CELL_ITERATIONS = 30;
    let finished = 0;
    this.clearCells();

    const loop = (line: Line, cell: Cell, iteration = 0) => {
      cell.cache = { state: cell.state, color: cell.color };

      if (iteration === MAX_CELL_ITERATIONS - 1) {
        cell.color = cell.originalColor;
        if (cell.el) {
          cell.el.style.color = cell.color;
        }
        cell.set(cell.original);

        ++finished;
        if (finished === this.totalChars) {
          this.isAnimating = false;
        }
      } else if (cell.position === 0) {
        cell.color = ["#3e775d", "#61dca3", "#61b3dc"][
          Math.floor(Math.random() * 3)
        ];
        if (cell.el) {
          cell.el.style.color = cell.color;
        }
        cell.set(
          iteration < 9
            ? ["*", "-", "\u0027", "\u0022"][Math.floor(Math.random() * 4)]
            : getRandomChar()
        );
      } else {
        const cache = line.cells[cell.previousCellPosition];

        if (typeof cache !== "string") {
          cell.set(cache.state);
          cell.color = cache.color;
        }

        if (cell.el) {
          cell.el.style.color = cell.color;
        }
      }

      if (cell.cache.state != "&nbsp;") {
        ++iteration;
      }

      if (iteration < MAX_CELL_ITERATIONS) {
        setTimeout(() => loop(line, cell, iteration), 10);
      }
    };

    for (const line of this.lines) {
      for (const cell of line.cells) {
        setTimeout(() => loop(line, cell), (line.position + 1) * 200);
      }
    }
  }

  fx6() {
    // max iterations for each cell to change the current value
    const MAX_CELL_ITERATIONS = 15;
    let finished = 0;
    const loop = (line: Line, cell: Cell, iteration = 0) => {
      cell.cache = { state: cell.state, color: cell.color };

      if (iteration === MAX_CELL_ITERATIONS - 1) {
        cell.set(cell.original);

        cell.color = cell.originalColor;
        if (cell.el) {
          cell.el.style.color = cell.color;
        }

        ++finished;
        if (finished === this.totalChars) {
          this.isAnimating = false;
        }
      } else {
        cell.set(getRandomChar());

        cell.color = ["#2b4539", "#61dca3", "#61b3dc"][
          Math.floor(Math.random() * 3)
        ];

        if (cell.el) {
          cell.el.style.color = cell.color;
        }
      }

      ++iteration;
      if (iteration < MAX_CELL_ITERATIONS) {
        setTimeout(() => loop(line, cell, iteration), randomNumber(30, 110));
      }
    };

    for (const line of this.lines) {
      for (const cell of line.cells) {
        setTimeout(() => loop(line, cell), (line.position + 1) * 80);
      }
    }
  }

  /**
   * call the right effect method (defined in this.effects)
   * @param effect - effect type
   */
  trigger(effect = "fx1") {
    if (!effectIsValid(effect) || this.isAnimating) return;
    this.isAnimating = true;
    this.effects[effect]();
  }
}

function effectIsValid(effect: string): effect is keyof TypeShuffle["effects"] {
  return ["fx1", "fx2", "fx3", "fx4", "fx5", "fx6"].includes(effect);
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

function getRandomChar() {
  return lettersAndSymbols[
    Math.floor(Math.random() * lettersAndSymbols.length)
  ];
}
