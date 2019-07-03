import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import {terser} from "rollup-plugin-terser";
export default {
 input: 'src/index.ts', // our source file
 output: {
   file: pkg.main,
   format: 'cjs'
  },
 external: [
  ...Object.keys(pkg.dependencies)
 ],
 plugins: [
  typescript({
   typescript: require('typescript'),
  }),
  terser() // minifies generated bundles
 ]
};