import { jsx } from 'react/jsx-runtime';

class Lucid {
}
const lucid = new Lucid();
/** @jsx createElement */
const element = jsx("div", { children: "Hello world" }, void 0);
console.log(element);

export { lucid };
//# sourceMappingURL=lucid.js.map
