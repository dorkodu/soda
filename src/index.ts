import { number } from "./dep";

export function logger() {
  console.log(number + " update");
  return number;
}
