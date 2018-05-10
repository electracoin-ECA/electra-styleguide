const gulp = require('gulp')
const gutil = require('gulp-util')
const webpack = require('webpack')
const config = require('../gulp.config.js')

const webpackConfig = require('../webpack.config')(gutil.env.dev, config)

const process = done => {
    webpack(webpackConfig, (err, stats) => {
        if (err) {
            gutil.log(gutil.colors.red(err()))
        }
        const result = stats.toJson()
        if (result.errors.length) {
            result.errors.forEach((error) => {
                gutil.log(gutil.colors.red(error))
            })
        }
        done()
    })
}

module.exports = {
    process: done => process(done)
}
