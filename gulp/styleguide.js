const gulp = require('gulp')
const gulpif = require('gulp-if')
const gutil = require('gulp-util')
const rename = require('gulp-rename')
const sourcemaps = require('gulp-sourcemaps')
const sass = require('gulp-sass')
const prefix = require('gulp-autoprefixer')
const csso = require('gulp-csso')
const fabricatorAssemble = require('./fabricator-assemble')
const browserSync = require('browser-sync')
const watch = require('gulp-watch')
const config = require('../gulp.config.js')

const processStyle = () => {
    return gulp
        .src(config.styleguide.entry.css)

        // Start sourcemap generation while in dev mode.
        .pipe(sourcemaps.init())

        // Preprocessing with sass
        .pipe(sass().on('error', sass.logError))

        // Run autoprefixer
        .pipe(prefix(config.toolkit.settings.css.browsers))

        // Run css optimization if in production mode
        .pipe(gulpif(!gutil.env.dev, csso()))

        // Rename to fabricator.css
        .pipe(rename('fabricator.css'))

        // Write sourcemap files if in dev mode
        .pipe(sourcemaps.write())

        // Output processed css
        .pipe(gulp.dest(config.styleguide.dist.css))
}

const assemble = () => {
    return fabricatorAssemble({
        logErrors: gutil.env.dev,
        dest: config.styleguide.settings.assembly.dest,
        layouts: config.styleguide.settings.assembly.layouts,
        layoutIncludes: config.styleguide.settings.assembly.partials,
        views: config.styleguide.settings.assembly.views,
        materials: config.styleguide.settings.assembly.materials,
    })
}

const serveAndWatch = () => {
    browserSync(config.styleguide.settings.browserSync)

    // initialize toolkit source watching
    let toolkitSrcKeys = Object.keys(config.toolkit.src)
    for (let key of toolkitSrcKeys) {
        watch(config.toolkit.src[key], () => { gulp.start(`toolkit:${key}`) })
    }

    // initialize styleguide source watching
    let styleguideSrcKeys = Object.keys(config.styleguide.src)
    for (let key of styleguideSrcKeys) {
        watch(config.styleguide.src[key], () => { gulp.start(`styleguide:${key}`) })
    }

    // add additionally configured watch assignments
    let additionalWatchAssignments = Object.keys(config.toolkit.watch)
    for (let task of additionalWatchAssignments) {
        watch(config.toolkit.watch[task], () => { gulp.start(task) })
    }

    // add watching of html files for re-assembly of styleguide
    watch(`${config.paths.base.src}/**/*.html`, () => { gulp.start('styleguide:assemble') })
}

module.exports = {
    processStyle,
    assemble,
    serveAndWatch,
}
