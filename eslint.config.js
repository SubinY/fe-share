import antfu from '@antfu/eslint-config'
import prettierPlugin from 'eslint-plugin-prettier'

export default antfu({
  vue: true,
  plugins: {
    prettier: prettierPlugin,
  },
  rules: {
    // 让缩进由 Prettier 负责，避免与 ESLint 冲突
    'style/indent': 'off',
    'no-console': 'off',
    'style/arrow-parens': 'off',
    'style/brace-style': 'warn',
    'unicorn/prefer-node-protocol': 'off',
  },
  formatters: {
    css: true,
    // markdown: true,
    // slidev: {
    //   files: [
    //     '*/src/slides.md',
    //   ],
    // },
  },
})
