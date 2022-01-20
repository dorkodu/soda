import typescript from "@rollup/plugin-typescript";

export default [
  {
    input: "./src/index.ts",
    output: {
      dir: "./lib",
      format: "es",
      sourcemap: false
    },
    preserveModules: true,
    plugins: [
      typescript({tsconfig: "./tsconfig.json"})
    ]
  }, 
  {
    input: "./src/index.ts",
    output: {
      file: "./lib/lucid.js",
      format: "es",
      sourcemap: true
    },
    plugins: [
      typescript({tsconfig: "./tsconfig.json", declaration: true, declarationDir: "./types"})
    ]
  }
]