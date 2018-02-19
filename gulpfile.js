
/**
 *
 *
 * IMPORTS
 *
`*/

// utilities
const gulp = require('gulp')
const del = require('del')
const gutil = require('gulp-util')
const gulpif = require('gulp-if')
const rename = require('gulp-rename')
const runSequence = require('run-sequence')
const assemble = require('fabricator-assemble')
const browserSync = require('browser-sync')
const reload = browserSync.reload

// style processing
const sourcemaps = require('gulp-sourcemaps')
const tailwindcss = require('tailwindcss')
const sass = require('gulp-sass')
const stylelint = require('gulp-stylelint')
const prefix = require('gulp-autoprefixer')
const csso = require('gulp-csso')
const purgecss = require('gulp-purgecss')
const postcss = require('gulp-postcss')
const objectfit = require('postcss-object-fit-images')

// image processing
const imagemin = require('gulp-imagemin')

// script processing
const webpack = require('webpack')



/**
 *
 *
 * CONFIG
 *
`*/

const config = {
    dev: gutil.env.dev,
    fabricator: {
        templates: {
            layouts: 'src/views/fabricator/*',
            partials: 'src/views/fabricator/partials/*',
            views: [
                'src/views/**/*', 
                '!src/views/+(fabricator)/**'
            ]
        },
        styles: {
            src: 'src/assets/fabricator/styles/fabricator.scss',
            dest: 'dist/assets/fabricator/styles',
            watch: 'src/assets/fabricator/styles/**/*.scss',
        },
        scripts: {
            src: './src/assets/fabricator/scripts/fabricator.js',
            dest: 'dist/assets/fabricator/scripts',
            watch: 'src/assets/fabricator/scripts/**/*',
        },
    },
    toolkit: {
        styles: {
            browsers: 'last 2 versions',
            src: 'src/assets/toolkit/styles/toolkit.scss',
            tailwind: './tailwind.config.js',
            dest: 'dist/assets/toolkit/styles',
            watch: [
                'src/assets/toolkit/styles/**/*.scss',
                './tailwind.config.js',
            ],
            lint: [
                'src/assets/toolkit/styles/**/*.scss',
            ],
        },
        scripts: {
            src: './src/assets/toolkit/scripts/toolkit.js',
            dest: 'dist/assets/toolkit/scripts',
            watch: 'src/assets/toolkit/scripts/**/*',
        },
        images: {
            src: 'src/assets/toolkit/images/**/*',
            dest: 'dist/assets/toolkit/images',
            watch: 'src/assets/toolkit/images/**/*',
        },
        favicon: {
            src: 'src/favicon.ico',
            dest: 'dist/assets/toolkit/images/favicons'
        },
        icons: {
            src: 'src/assets/toolkit/images/icons/sprite.svg'
        },
        fonts: {
            src: ['src/assets/toolkit/fonts/**/*'],
            dest: 'dist/assets/toolkit/fonts',
            watch: 'src/assets/toolkit/fonts/**/*',
        },
        materials: {
            src: 'src/materials/**/*',
            watch: 'src/**/*.{html,md,json,yml}',
        },
    },
    dest: 'dist',
}

const webpackConfig = require('./webpack.config')(config)

console.log(config.toolkit.styles.tailwind)

/**
 *
 *
 * TASKS - UTILITY
 *
`*/

// clean
gulp.task('utility:clean', del.bind(null, [config.dest]))


/**
 *
 *
 * TASKS - SCRIPTS
 * TODO: expand, remove webpack
 */

// webpack
gulp.task('webpack', (done) => {
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
})



/**
 *
 *
 * TASKS - TOOLKIT STYLES
 *
`*/

// style processing
gulp.task('toolkit:styles:process', () => {
    return gulp
        .src(config.toolkit.styles.src)
        .pipe(gulpif(config.dev, sourcemaps.init()))
        .pipe(sass({
            includePaths: './node_modules',
        }).on('error', sass.logError))
        .pipe(postcss([
            tailwindcss('./tailwind.config.js'),
            objectfit(),
        ]).on('error', function(error) {
            // if you want details of the error in the console
            console.log(error.toString())
            this.emit('end')
        }))
        .pipe(prefix(config.toolkit.styles.browsers))
        .pipe(gulpif(!config.dev, csso()))
        .pipe(gulpif(config.dev, sourcemaps.write()))
        .pipe(gulp.dest(config.toolkit.styles.dest))
})

// style linting
gulp.task('toolkit:styles:lint', () => {
    return gulp
        .src(config.toolkit.styles.lint)
        .pipe(stylelint({
            reporters: [
                { formatter: 'string', console: true },
            ],
        }))
})

// style optimization 
gulp.task('toolkit:styles', ['toolkit:styles:lint', 'toolkit:styles:process'], () => {
    // class TailwindExtractor {
    //     static extract(content) {
    //         return content.match(/[A-z0-9-:\/]+/g)
    //     }
    // }

    // gulp
    //     .src([config.toolkit.styles.dest + '/toolkit.css'])
    //     .pipe(
    //         purgecss({
    //             content: [ config.dest + '/*.html', config.dest + '/pages/**/*.html' ],
    //             extractors: [
    //                 {
    //                     extractor: TailwindExtractor,

    //                     // Specify the file extensions to include when scanning for
    //                     // class names.
    //                     extensions: ['html'],
    //                 },
    //             ],
    //         })
    //     )
    //     .pipe(gulp.dest(config.toolkit.styles.dest))
})

/**
 *
 *
 * TASKS - TOOLKIT IMAGES
 *
`*/

// copy favicon
gulp.task('toolkit:favicon', () => {
    return gulp
        .src(config.toolkit.favicon.src)
        .pipe(gulp.dest(config.toolkit.favicon.dest))
})

// copy icon sprite
// gulp.task('toolkit:icons', () => {
//     return gulp
//         .src(config.toolkit.icons.src)
//         .pipe(gulp.dest(config.dest))
// })

// image optimization
gulp.task('toolkit:images', ['toolkit:favicon'], () => {
    return gulp
        .src(config.toolkit.images.src)
        // Don't run svgo as it destroys teaser icons
        .pipe(imagemin([
            imagemin.jpegtran(),
            imagemin.optipng(),
        ]))
        .pipe(gulp.dest(config.toolkit.images.dest))
})


/**
 *
 *
 * TASKS - TOOLKIT FONTS
 *
`*/

// Copy fonts to dist
gulp.task('toolkit:fonts', () => {
    return gulp
        .src(config.toolkit.fonts.src)
        .pipe(gulp.dest(config.toolkit.fonts.dest))
})



/**
 *
 *
 * TASKS - FABRICATOR
 *
`*/

// style processing
gulp.task('fabricator:styles', () => {
    gulp
        .src(config.fabricator.styles.src)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(prefix(config.toolkit.styles.browsers))
        .pipe(gulpif(!config.dev, csso()))
        .pipe(rename('fabricator.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(config.fabricator.styles.dest))
        // .pipe(gulpif(config.dev, reload({ stream: true })))
})

// assembly
gulp.task('fabricator:assemble', () => {
    return assemble({
        logErrors: config.dev,
        dest: config.dest,
        layouts: config.fabricator.templates.layouts,
        layoutIncludes: config.fabricator.templates.partials,
        views: config.fabricator.templates.views,
        materials: config.toolkit.materials.src,
    })
})

// server
gulp.task('fabricator:serve', () => {
  browserSync({
    server: {
      baseDir: config.dest,
    },
    open: false,
    notify: false,
    logPrefix: 'FABRICATOR',
    files: [ config.dest + '/**/*' ]
  })

  gulp.watch([config.toolkit.scripts.watch, config.fabricator.scripts.watch], ['webpack'])
  gulp.watch(config.toolkit.styles.watch, ['toolkit:styles'])
  gulp.watch(config.toolkit.images.watch, ['toolkit:images'])
  gulp.watch(config.toolkit.fonts.watch, ['toolkit:fonts'])
  gulp.watch(config.toolkit.materials.watch, ['fabricator:assemble'])
  gulp.watch(config.fabricator.styles.watch, ['fabricator:styles'])
})


/**
 *
 *
 * TASK SEQUENCE
 *
`*/

// default build task
gulp.task('default', ['utility:clean'], () => {
    runSequence(
        'webpack',
        'toolkit:styles',
        'toolkit:images',
        'toolkit:fonts',
        'fabricator:styles',
        'fabricator:assemble',
        'fabricator:serve',
    )
})
