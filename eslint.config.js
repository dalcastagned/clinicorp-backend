const js = require('@eslint/js')
const globals = require('globals')
const { defineConfig } = require('eslint/config')

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node, // ⬅️ Aqui está a correção principal
    },
  },
])
