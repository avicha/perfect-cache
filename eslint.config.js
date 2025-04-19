const eslint = require('@easy-fe/ci-configs/eslint/eslint.config.js');

const eslintConfig = eslint(__dirname, {
    useRecommendedRule: true,
    tsConfigProject: true,
    otherConfigs: [
        {
            ignores: ['.husky/', '.vscode/', '.history/', 'dist/', 'coverage/', 'test/'],
        },
    ],
});
module.exports = eslintConfig;
