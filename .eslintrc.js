module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
	  project: 'tsconfig.json',
	  sourceType: 'module',
	},
	plugins: ['@typescript-eslint', 'prettier'],
	extends: [
	  'plugin:@typescript-eslint/recommended',
	  'plugin:prettier/recommended',
	],
	root: true,
	env: {
	  node: true,
	  jest: true,
	},
	rules: {
	  '@typescript-eslint/no-empty-function': 'off',
	  '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
	  '@typescript-eslint/explicit-function-return-type': 'off',
	  'prettier/prettier': ['error'],
	},
  };
  