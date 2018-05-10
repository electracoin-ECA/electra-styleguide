const gulp = require('gulp')
const gulpif = require('gulp-if')
const gutil = require('gulp-util')
const sourcemaps = require('gulp-sourcemaps')
const tailwindcss = require('tailwindcss')
const sass = require('gulp-sass')
const prefix = require('gulp-autoprefixer')
const csso = require('gulp-csso')
const postcss = require('gulp-postcss')
const objectfit = require('postcss-object-fit-images')
const purgecss = require('gulp-purgecss')
const config = require('../gulp.config.js')

// Prevent Gulp from shutting down on errors
function swallowError(error) {
    // If you want details of the error in the console
    console.log(error.toString())
    this.emit('end')
}

class TailwindExtractor {
    static extract(content) {
        return content.match(/[A-z0-9-:\/]+/g) || []
    }
}

const purge = () => {
    return gulp
        .src(config.toolkit.dist.css)
        .pipe(
            purgecss({
                content: config.toolkit.settings.css.purgecss.content,
                extractors: [
                    {
                        extractor: TailwindExtractor,

                        // Specify the file extensions to include when scanning for
                        // class names.
                        extensions: ['js', 'html'],
                    },
                ],
            })
        )
        .pipe(gulp.dest(config.toolkit.dist.css))
}

const process = () => {
    return gulp
        .src(config.toolkit.entry.css)

        // Start sourcemap generation while in dev mode.
        .pipe(gulpif(gutil.env.dev, sourcemaps.init()))

        // Preprocessing with sass
        .pipe(sass({
            includePaths: '../node_modules',
        }).on('error', sass.logError))

        // Postprocessing with postcss
        .pipe(postcss([
            tailwindcss(config.toolkit.settings.css.tailwind),
            objectfit(),
        ]).on('error', swallowError))

        // Run autoprefixer
        .pipe(prefix(config.toolkit.settings.css.browsers))

        // Run css optimization if in production mode
        .pipe(gulpif(!gutil.env.dev, csso()))

        // Write sourcemap files if in dev mode
        .pipe(gulpif(gutil.env.dev, sourcemaps.write()))

        // Output processed css
        .pipe(gulp.dest(config.toolkit.dist.css))
}

module.exports = {
    process,
    purge
}
