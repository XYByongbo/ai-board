/* eslint 配置（legacy .eslintrc，兼容 eslint 8）
 * 团队标准：所有图标必须从 @/icons 导入，禁止直引 @ant-design/icons。
 * 见 docs/ICON_GUIDE.md 第 9 节「机器强制红线」。
 */
module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    'prettier/prettier': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
    ],
    // 🔴 红线：图标唯一入口是 @/icons，直引 @ant-design/icons 直接报错。
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@ant-design/icons',
            message:
              '禁止直接引用 @ant-design/icons，请统一从 @/icons 导入（见 docs/ICON_GUIDE.md）。',
          },
        ],
      },
    ],
  },
  ignorePatterns: ['dist', 'node_modules', 'docs', '*.config.ts', '*.config.js', '.eslintrc.cjs'],
  overrides: [
    // 唯一合法例外：@/icons 自身需要从 @ant-design/icons 再导出
    {
      files: ['src/icons/index.ts'],
      rules: { 'no-restricted-imports': 'off' },
    },
  ],
}
