class Lucid {
}

export const lucid = new Lucid();

interface LucidElement {
  tag: string;
  attrs?: [key: any];
  children?: string[] | LucidElement[];
}

function createElement(type: any, config: any, ...args: any) {
  const props = Object.assign({}, config);
  const hasChildren = args.length > 0;
  props.children = hasChildren ? [].concat(...args) : [];
  return { type, props };
}

/** @jsx createElement */
const element = <div>Hello world</div>
console.log(element);