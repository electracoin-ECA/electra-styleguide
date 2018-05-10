const gulp = require('gulp')
const config = require('../gulp.config.js')

const copyAssets = () => {
    return gulp
        .src(config.toolkit.src.favicons)
        .pipe(gulp.dest(config.toolkit.dist.favicons))
}

module.exports = {
    copyAssets
}
