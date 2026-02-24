import { moveLeft, moveRight } from "./player.js";


window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") {
    console.log("LEFT pressed");
    moveLeft();
  }
  if (e.key === "ArrowRight") {
    console.log("RIGHT pressed");
    moveRight();
  }
});