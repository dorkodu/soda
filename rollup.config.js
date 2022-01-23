import typescript from "@rollup/plugin-typescript";
import { babel } from "@rollup/plugin-babel";

export default [
  {
    input: "./src/index.tsx",
    output: {
      dir: "./lib",
      format: "es",
      sourcemap: false
    },
    preserveModules: true,
    plugins: [
      typescript({tsconfig: "./tsconfig.json"}),
      babel({
        "presets": ["@babel/preset-env","@babel/preset-typescript", [
          "@babel/preset-react",{
            "runtime":"classic"
          }
        ]],
        "comments": false
      })
    ] 
  }, 
  {
    input: "./src/index.tsx",
    output: {
      file: "./lib/lucid.js",
      format: "es",
      sourcemap: true
    },
    plugins: [
      typescript({tsconfig: "./tsconfig.json", declaration: true, declarationDir: "./types"}),
      babel({
        "presets": ["@babel/preset-env","@babel/preset-typescript", [
          "@babel/preset-react",{
            "runtime":"classic"
          }
        ]],
        "comments": false
      })
    ] 
  }
]