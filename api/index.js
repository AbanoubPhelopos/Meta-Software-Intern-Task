const { buildApp } = require('../dist/app');
const app = buildApp();

module.exports = app;
module.exports.default = app;
