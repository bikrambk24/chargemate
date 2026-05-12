/** 
* Booking Service ESLint Config 
*/ 
 
module.exports = { 
 env: { 
   node: true, 
   es2021: true, 
   jest: true 
 }, 
 extends: ['eslint:recommended'], 
 parserOptions: { 
   ecmaVersion: 2021 
 }, 
 rules: { 
   'no-unused-vars': ['warn', { argsIgnorePattern: '^_|next' }], 
   'no-console': 'off', 
   'semi': ['error', 'always'], 
   'quotes': ['warn', 'single'], 
   'prefer-const': 'warn', 
   'no-var': 'error', 
   'eqeqeq': 'error' 
 }, 
 ignorePatterns: ['node_modules/', 'coverage/'] 
}; 
