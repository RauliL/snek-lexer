import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';

export default {
  input: './src/index.ts',
  output: [
    {
      file: 'dist/snek-lexer.js',
      format: 'cjs',
    },
    {
      file: 'dist/snek-lexer.mjs',
      format: 'es',
    },
    {
      file: 'dist/snek-lexer.iife.js',
      format: 'iife',
      name: 'SnekLexer',
    },
  ],
  plugins: [typescript(), terser()],
};
