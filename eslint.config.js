const eslint = require('@easy-fe/ci-configs/eslint/eslint.config.js');

const eslintConfig = eslint(__dirname, {
    useRecommendedRule: true,
    tsConfigProject: ['tsconfig.src.json', 'tsconfig.test.json'],
    otherConfigs: [
        {
            ignores: ['.husky/', '.vscode/', '.history/', 'dist/', 'coverage/'],
        },
    ],
});
module.exports = eslintConfig;
