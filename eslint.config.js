const eslint = require('@easy-fe/ci-configs/eslint/eslint.config.js');

const eslintConfig = eslint(__dirname, {
    useRecommendedRule: true,
    tsConfigProject: ['tsconfig.app.json', 'tsconfig.node.json'],
    otherConfigs: [
        {
            ignores: ['.husky/', '.vscode/', '.history/', 'dist/', 'coverage/'],
        },
    ],
});
module.exports = eslintConfig;
