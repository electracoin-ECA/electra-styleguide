const gulp = require('gulp')
const imagemin = require('gulp-imagemin')
const config = require('../gulp.config.js')

const process = () => {
    return gulp
        .src(config.toolkit.src.images)
        // Don't run svgo as it destroys teaser icons
        .pipe(imagemin([
            imagemin.jpegtran(),
            imagemin.optipng(),
        ]))
        .pipe(gulp.dest(config.toolkit.dist.images))
}

module.exports = {
    process
}
