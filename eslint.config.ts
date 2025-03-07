import path from 'path'
import { includeIgnoreFile } from '@eslint/compat'
import jseslint from '@eslint/js'
import eslintPluginQuery from '@tanstack/eslint-plugin-query'
import love from 'eslint-config-love'
import eslintConfigPrettier from 'eslint-config-prettier'
import jsdoc from 'eslint-plugin-jsdoc'
import eslintPluginPerfectionist from 'eslint-plugin-perfectionist'
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
      jsdoc.configs['flat/recommended-typescript'],
      jsdoc.configs['flat/stylistic-typescript'],
    ],
    plugins: {
      perfectionist: eslintPluginPerfectionist,
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/prefer-destructuring': 'off',
      'react/react-in-jsx-scope': 'off',
      'jsdoc/tag-lines': 'off',
      'jsdoc/check-line-alignment': 'off',
      'perfectionist/sort-jsx-props': [
        'error',
        {
          type: 'natural',
          order: 'asc',
          ignoreCase: true,
          ignorePattern: [],
          groups: [
            'className',
            'style',
            'id',
            'name',
            'data',
            'src',
            'for',
            'type',
            'placeholder',
            'href',
            'value',
            'title',
            'alt',
            'role',
            'aria',
            'tabIndex',
            'unknown',
            'callback',
            'shorthand',
            'multiline',
          ],
          customGroups: {
            className: 'className',
            id: 'id',
            name: 'name',
            data: '^data-.+',
            src: 'src',
            for: 'for',
            type: 'type',
            placeholder: 'placeholder',
            href: 'href',
            value: 'value',
            title: 'title',
            alt: 'alt',
            role: 'role',
            aria: '^aria-.+',
            tabIndex: 'tabIndex',
            style: 'style',
            callback: '^on.+',
          },
        },
      ],
    },
    settings: {
      react: { version: 'detect' },
    },
  },
)

export default config
