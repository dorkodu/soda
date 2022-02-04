import pkg from "./package.json";
import typescript from "@rollup/plugin-typescript";
import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import path from "path";

const extensions = [".js", ".ts",];
const input = "src/index.ts";
const plugins = [
  typescript({ tsconfig: "./tsconfig.json" }),
  babel({
    sourceType: "module",
    extensions,
    include: path.resolve("src", "**"),
    presets: [
      "@babel/preset-env",
      "@babel/preset-typescript"
    ]
  })
]

export default [
  {
    input,
    output: {
      file: pkg.module,
      format: "esm",
      sourcemap: true,
    },
    plugins,
  },
  {
    input,
    output: {
      file: "lib/index.min.js",
      format: "esm",
    },
    plugins: [...plugins, terser()],
  }
];