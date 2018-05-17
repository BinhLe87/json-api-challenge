const path = require('path');
const WebpackShellPlugin = require('webpack-shell-plugin');
const WebpackCopyPlugin = require('copy-webpack-plugin');

var plugins = [];
plugins.push(new WebpackShellPlugin({
    onBuildStart: ['echo "Starting"'],
    onBuildEnd: ['nodemon ./dist/bundle.js']
}));

// plugins.push(new WebpackCopyPlugin([
//     { from: './assets', to: 'assets'}
// ]));

module.exports = {
    entry: './server.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    target: 'node',
    watch: true,
    plugins: plugins,
    node: {
        __dirname: false,  //giữ nguyên the regular Node.js __dirname behavior
        __filename: false
    }
}