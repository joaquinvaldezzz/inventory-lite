import path from 'path'
import { includeIgnoreFile } from '@eslint/compat'
import jseslint from '@eslint/js'
import eslintPluginQuery from '@tanstack/eslint-plugin-query'
import love from 'eslint-config-love'
// @ts-expect-error -- eslint-plugin-prettier does not have types
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended'
import eslintPluginReact from 'eslint-plugin-react'
import tseslint, { type Config } from 'typescript-eslint'

const config: Config = tseslint.config(
  // Ignore files in .gitignore
  includeIgnoreFile(path.resolve('.gitignore')),
  { ignores: ['android/**', 'ios/**', '**/vite-env.d.ts'] },

  // Rules for all files
  {
    files: ['**/*.{js,jsx,cjs,mjs,ts,tsx,cts,mts}'],
    extends: [
      jseslint.configs.recommended,
      tseslint.configs.recommended,
      love,
      eslintPluginPrettier,
      eslintConfigPrettier,
    ],
    rules: {
      '@typescript-eslint/no-magic-numbers': 'off',
    },
  },

  // Rules for files within the src folder
  {
    files: ['src/**'],
    extends: [
      eslintPluginReact.configs.flat.recommended,
      eslintPluginQuery.configs['flat/recommended'],
      // eslintPluginTailwind.configs['flat/recommended'], eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- ignore
    ],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/prefer-destructuring': 'off',
      'react/react-in-jsx-scope': 'off',
    },
    settings: {
      react: { version: 'detect' },
    },
  },
)

export default config
