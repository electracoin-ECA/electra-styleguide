const path = require('path');
const webpack = require('webpack');

module.exports = (isDev, config) => {
    const plugins = [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.DefinePlugin({}),
    ];

    if (isDev) {
        plugins.push(new webpack.NoEmitOnErrorsPlugin());
    }

    return {
        mode: isDev ? 'development' : 'production',
        optimization: {
            minimize: !isDev
        },
        entry: Object.assign({}, config.toolkit.entry.js, config.styleguide.entry.js),
        output: {
            path: path.resolve(__dirname, config.paths.base.dist, 'assets'),
            filename: '[name].js',
        },
        devtool: 'source-map',
        resolve: {
            extensions: ['.js'],
        },
        plugins: plugins,
        module: {
            rules: [{
                test: /(\.js)\$/,
                exclude: /(node_modules(?!\/@nimius))/,
                loaders: ['babel-loader'],
            }, {
                test: /(\.jpg|\.png)$/,
                loader: 'url-loader?limit=10000',
            }]
        },
    };
};
