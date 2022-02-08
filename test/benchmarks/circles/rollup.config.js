import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import { uglify } from "rollup-plugin-uglify";
import commonjs from "rollup-plugin-commonjs";
import progress from "rollup-plugin-progress";

let pluginOptions = [
  //resolve(),
  //commonjs(),
  //progress(),
  babel({
    exclude: "node_modules/**",
    presets: [
    ],
    plugins: [
      ["@babel/plugin-transform-react-jsx", { pragma: "soda.createElement" }],
    ]
  }),
  //uglify(),
  terser({
    ecma: "6",
    compress: true,
    mangle: true,
  })
];

export default [
  {
    input: "./index.jsx",
    output: {
      file: "dist/soda.js",
      format: "iife",
      sourcemap: false
    },
    plugins: pluginOptions,
  }
];