 /**
 * ChargeMate Root ESLint Configuration
 * Applies to all services
 * Author: Suju (HE39012) – QA & Automation Engineer
 */

module.exports = {
 env: {
   node: true,
   es2021: true,
   jest: true,
   browser: true
 },
 extends: ['eslint:recommended'],
 parserOptions: {
   ecmaVersion: 2021,
   sourceType: 'module'
 },
 rules: {
   // Code quality rules
   'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
   'no-console': 'off',
   'no-undef': 'error',
   'no-duplicate-case': 'error',
   'no-empty': 'warn',

   // Style rules
   'semi': ['error', 'always'],
   'quotes': ['warn', 'single', { avoidEscape: true }],
   'indent': ['warn', 2, { SwitchCase: 1 }],
   'comma-dangle': ['warn', 'never'],
   'no-trailing-spaces': 'warn',
   'eol-last': ['warn', 'always'],

   // Best practices
   'eqeqeq': ['error', 'always'],
   'no-var': 'error',
   'prefer-const': 'warn',
   'no-return-await': 'warn'
 },
 ignorePatterns: [
   'node_modules/',
   '.next/',
   'coverage/',
   'dist/',
   'build/'
 ]
};
