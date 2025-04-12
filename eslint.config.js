const eslint = require('@easy-ui/ci-configs/eslint/eslint.config.js');

const eslintConfig = eslint(__dirname, {
    useRecommendedRule: true,
    tsConfigProject: true,
    otherConfigs: [
        {
            ignores: ['.husky/', '.vscode/', '.history/', 'dist/', 'test/'],
        },
    ],
});
module.exports = eslintConfig;
