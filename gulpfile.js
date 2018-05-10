
/**
 *
 *
 * IMPORTS
 *
 */

// utility
const gulp = require('gulp')
const del = require('del')
const runSequence = require('run-sequence')

// tasks
const scriptTasks = require('./gulp/scripts')
const styleTasks = require('./gulp/styles')
const imageTasks = require('./gulp/images')
const faviconTasks = require('./gulp/favicons')
const iconTasks = require('./gulp/icons')
const fontTasks = require('./gulp/fonts')
const styleguideTasks = require('./gulp/styleguide')
const scaffoldingTasks = require('./gulp/scaffolding')


/**
 *
 *
 * TASKS - UTILITY
 *
 */

// clean
gulp.task('utility:clean', del.bind(null, ['./dist']))


/**
 *
 *
 * TASKS - SCRIPTS
 *
 */

// webpack
gulp.task('toolkit:js', done => scriptTasks.process(done))


/**
 *
 *
 * TASKS - TOOLKIT STYLES
 *
 */

// style processing
gulp.task('toolkit:css:process', styleTasks.process)

// style tasks
gulp.task('toolkit:css', ['toolkit:css:process'])

// purge css
gulp.task('toolkit:css:purge', styleTasks.purge)


/**
 *
 *
 * TASKS - TOOLKIT IMAGES
 *
 */

// generate icon sprite
gulp.task('toolkit:icons', iconTasks.generateSprite)

// image optimization
gulp.task('toolkit:images', imageTasks.process)

// copy favicon
gulp.task('toolkit:favicons', faviconTasks.copyAssets)


/**
 *
 *
 * TASKS - TOOLKIT FONTS
 *
 */

// Copy fonts to dist
gulp.task('toolkit:fonts', fontTasks.copyAssets)


/**
 *
 *
 * TASKS - FABRICATOR
 *
 */

// style processing
gulp.task('styleguide:css', styleguideTasks.processStyle)

// assembly
gulp.task('styleguide:assemble', styleguideTasks.assemble)

// server
gulp.task('styleguide:serve', styleguideTasks.serveAndWatch)

// link styleguide:js to toolkit:js as both are handled together by webpack
gulp.task('styleguide:js', ['toolkit:js'])


/**
 *
 *
 * TASKS - SCAFFOLDING
 *
 */

// run project setup (set title and styleguide accent color)
gulp.task('scaffold:setup', scaffoldingTasks.setup)

// generate material files
gulp.task('scaffold:material', scaffoldingTasks.generateMaterial)

// generate scripts
gulp.task('scaffold:script', scaffoldingTasks.generateScript)


/**
 *
 *
 * TASK SEQUENCES
 *
 */

// tasks
gulp.task('develop', ['utility:clean'], () => {
    runSequence(
        'toolkit:js',
        'toolkit:css',
        'toolkit:images',
        'toolkit:favicons',
        'toolkit:fonts',
        'toolkit:icons',
        'styleguide:css',
        'styleguide:assemble',
        'styleguide:serve',
    )
})

gulp.task('build', ['utility:clean'], () => {
    runSequence(
        'toolkit:js',
        'toolkit:css',
        'toolkit:images',
        'toolkit:favicons',
        'toolkit:fonts',
        'toolkit:icons',
        'styleguide:css',
        'styleguide:assemble',
        'toolkit:css:purge',
    )
})

gulp.task('default', ['develop'])
