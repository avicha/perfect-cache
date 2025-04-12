const eslint = require('@easy-ui/ci-configs/eslint-config/eslint.config.js');

const eslintConfig = eslint(__dirname, {
    useRecommendedRule: true,
    tsConfigProject: true,
    otherConfigs: [
        {
            ignores: [
                '.husky/',
                '.vscode/',
                '.history/',
                'dist/',               
            ],
        },
    ],
});
module.exports = eslintConfig;
