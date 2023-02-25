import "splitting/dist/splitting.css";
import "splitting/dist/splitting-cells.css";
import Splitting from "splitting";
import { getRandomChar, getRandomColor, randomNumber } from "./utils";

type SplittingResult = [
  {
    el: HTMLElement;
    lines: HTMLElement[][];
    words: HTMLElement[];
  }
];

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
  el: HTMLElement;
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

  /** @param element - the char element (<span>) */
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
    this.el.innerHTML = this.state;
  }
}

/**
 * Class representing the TypeShuffle object
 */
export class TypeShuffle {
  // DOM elements
  el: HTMLElement;
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
    const [result] = Splitting({
      target: this.el,
      by: "lines",
    }) as any as SplittingResult; // Note: Maybe `@types/Splitting` defined old spec types. It's current(1.0.6) type.

    Splitting({ target: result.words });

    // for every line
    result.lines.forEach((element, i) => {
      // create a new Line
      const line = new Line(i);
      let cells: Cell[] = [];
      let charCount = 0;

      element.forEach((word) => {
        // for every character of each line
        word.querySelectorAll<HTMLElement>(".char").forEach((char) => {
          cells.push(
            new Cell(char, {
              position: charCount,
              previousCellPosition: charCount === 0 ? -1 : charCount - 1,
            })
          );

          ++charCount;
        });
      });

      line.cells = cells;
      this.lines.push(line);

      this.totalChars += charCount;
    });

    // for every line
    // result.lines.forEach((element, i) => {
    //   // create a new Line
    //   const line = new Line(i);

    //   const cells = element
    //     .map((word, i) =>
    //       // for every character of each line
    //       Array.from(word.querySelectorAll<HTMLElement>(".char")).map(
    //         (char, j) =>
    //           new Cell(char, {
    //             position: i + j,
    //             previousCellPosition: i + j === 0 ? -1 : i + j - 1,
    //           })
    //       )
    //     )
    //     .flat();

    //   line.cells = cells;
    //   this.lines.push(line);

    //   this.totalChars = cells.length;
    // });
  }

  /** clear all the cells chars */
  clearCells() {
    this.lines.forEach((line) =>
      line.cells.forEach((cell) => cell.set("&nbsp;"))
    );
  }

  fx1(maxCellIterations = 45) {
    let currentIndex = 0;
    this.clearCells();

    function isLastIteration(iteration: number): boolean {
      return iteration === maxCellIterations - 1;
    }

    const loop = (line: Line, cell: Cell, iteration = 0) => {
      // cache the previous value
      cell.cache = cell.state;

      // set back the original cell value if at the last iteration
      if (isLastIteration(iteration)) {
        cell.set(cell.original);

        currentIndex += 1;
        if (currentIndex === this.totalChars) {
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
      const nextIteration = iteration + (cell.cache !== "&nbsp;" ? 1 : 0);

      // repeat...
      if (nextIteration < maxCellIterations) {
        setTimeout(() => loop(line, cell, nextIteration), 15);
      }
    };

    // simple top-left to bottom-right animation.
    this.start(loop, ({ position }) => (position + 1) * 200);
  }

  fx2(maxCellIterations = 20, speed = 1) {
    let currentIndex = 0;

    const loop = (line: Line, cell: Cell, iteration = 0) => {
      if (iteration === maxCellIterations - 1) {
        cell.set(cell.original);
        const { el } = cell;

        el.style.opacity = String(0);
        setTimeout(() => (el.style.opacity = String(1)), 300);

        currentIndex += 1;
        this.isAnimating = currentIndex !== this.totalChars;
      } else {
        cell.set(getRandomChar());
      }

      if (iteration < maxCellIterations - 1) {
        setTimeout(() => loop(line, cell, iteration + 1), 40);
      }
    };

    // left to right animation.
    // vertical position is not used.
    this.start(loop, (_, { position }) => (position + 1) * (30 / speed));
  }

  fx3(maxCellIterations = 10) {
    let currentIndex = 0;
    this.clearCells();

    const loop = (line: Line, cell: Cell, iteration = 0) => {
      if (iteration === maxCellIterations - 1) {
        cell.set(cell.original);

        currentIndex += 1;
        if (currentIndex === this.totalChars) {
          this.isAnimating = false;
        }
      } else {
        cell.set(getRandomChar());
      }

      if (iteration < maxCellIterations - 1) {
        setTimeout(() => loop(line, cell, iteration + 1), 80);
      }
    };

    // random animation.
    this.start(loop, () => randomNumber(0, 2000));
  }

  fx4(maxCellIterations = 30) {
    let currentIndex = 0;
    this.clearCells();

    const loop = (line: Line, cell: Cell, iteration = 0) => {
      cell.cache = cell.state;

      if (iteration === maxCellIterations - 1) {
        cell.set(cell.original);

        currentIndex += 1;
        this.isAnimating = currentIndex !== this.totalChars;
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

      if (iteration < maxCellIterations) {
        setTimeout(() => loop(line, cell, iteration), 15);
      }
    };

    // center to top and bottom animation.
    this.start(
      loop,
      ({ position }) => Math.abs(this.lines.length / 2 - position) * 400
    );
  }

  fx5(maxCellIterations = 30) {
    let currentIndex = 0;
    this.clearCells();

    const loop = (line: Line, cell: Cell, iteration = 0) => {
      cell.cache = { state: cell.state, color: cell.color };

      if (iteration === maxCellIterations - 1) {
        cell.color = cell.originalColor;
        cell.el.style.color = cell.color;
        cell.set(cell.original);

        currentIndex += 1;
        this.isAnimating = currentIndex !== this.totalChars;
      } else if (cell.position === 0) {
        cell.color = getRandomColor();
        cell.el.style.color = cell.color;
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

        cell.el.style.color = cell.color;
      }

      if (cell.cache.state != "&nbsp;") {
        ++iteration;
      }

      if (iteration < maxCellIterations) {
        setTimeout(() => loop(line, cell, iteration), 10);
      }
    };

    this.start(loop, ({ position }) => (position + 1) * 200);
  }

  fx6(maxCellIterations = 15) {
    let currentIndex = 0;
    const loop = (line: Line, cell: Cell, iteration = 0) => {
      cell.cache = { state: cell.state, color: cell.color };

      if (iteration === maxCellIterations - 1) {
        cell.set(cell.original);

        cell.color = cell.originalColor;
        cell.el.style.color = cell.color;

        currentIndex += 1;
        this.isAnimating = currentIndex !== this.totalChars;
      } else {
        cell.set(getRandomChar());
        cell.color = getRandomColor();
        cell.el.style.color = cell.color;
      }

      if (iteration < maxCellIterations - 1) {
        setTimeout(
          () => loop(line, cell, iteration + 1),
          randomNumber(30, 110)
        );
      }
    };

    this.start(loop, ({ position }) => (position + 1) * 80);
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

  start(
    loop: (line: Line, cell: Cell) => void,
    calcTimeoutMs: (line: Line, cell: Cell) => number
  ): void {
    this.lines.forEach((line) =>
      line.cells.forEach((cell) => {
        setTimeout(() => loop(line, cell), calcTimeoutMs(line, cell));
      })
    );
  }
}

function effectIsValid(effect: string): effect is keyof TypeShuffle["effects"] {
  return ["fx1", "fx2", "fx3", "fx4", "fx5", "fx6"].includes(effect);
}
