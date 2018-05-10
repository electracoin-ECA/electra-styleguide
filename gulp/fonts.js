const gulp = require('gulp')
const config = require('../gulp.config.js')

const copyAssets = () => {
    return gulp
        .src(config.toolkit.src.fonts)
        .pipe(gulp.dest(config.toolkit.dist.fonts))
}

module.exports = {
    copyAssets
}
