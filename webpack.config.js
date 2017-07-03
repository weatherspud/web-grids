const path = require('path');

const config = {
    entry: {
        hex_grid: './src/js/hex_grid.js'
    },
    output: {
        path: path.resolve(__dirname, 'static/js/'),
        filename: '[name].bundle.js'
    }
};

module.exports = config;
