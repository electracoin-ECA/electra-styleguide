
/**
 *
 *
 * IMPORTS
 *
`*/

// utility
const del = require('del')
const fs = require('fs')
const gulp = require('gulp')
const path = require('path')
const through = require('through2')
const gutil = require('gulp-util')
const gulpif = require('gulp-if')
const watch = require('gulp-watch')
const rename = require('gulp-rename')
const newfile = require('gulp-file')
const prompt = require('gulp-prompt')
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

const mainPaths = {
    src: {
        assets: './src/assets',
        views: './src/views',
        materials: './src/materials',
    },
    dest: {
        assets: './dist/assets',
        views: './dist/views',
    },
}

const config = {
    dev: gutil.env.dev,
    fabricator: {
        templates: {
            layouts: `${mainPaths.src.views}/fabricator/*`,
            partials: `${mainPaths.src.views}/fabricator/partials/*`,
            views: [
                `${mainPaths.src.views}/**/*`,
                `!${mainPaths.src.views}/+(fabricator)/**`,
            ],
        },
        styles: {
            src: `${mainPaths.src.assets}/fabricator/styles/fabricator.scss`,
            dest: `${mainPaths.dest.assets}/fabricator/styles`,
            watch: `${mainPaths.src.assets}/fabricator/styles/**/*.scss`,
        },
        scripts: {
            src: `${mainPaths.src.assets}/fabricator/scripts/fabricator.js`,
            dest: `${mainPaths.dest.assets}/fabricator/scripts`,
            watch: `${mainPaths.src.assets}/fabricator/scripts/**/*`,
        },
    },
    toolkit: {
        styles: {
            browsers: 'last 2 versions',
            src: `${mainPaths.src.assets}/toolkit/styles/toolkit.scss`,
            tailwind: './tailwind.config.js',
            dest: `${mainPaths.dest.assets}/toolkit/styles`,
            watch: [
                `${mainPaths.src.assets}/toolkit/styles/**/*.scss`,
                './tailwind.config.js',
            ],
            lint: [
                `${mainPaths.src.assets}/toolkit/styles/**/*.scss`,
            ],
        },
        scripts: {
            src: [
                `${mainPaths.src.assets}/toolkit/scripts/toolkit-header.js`,
                `${mainPaths.src.assets}/toolkit/scripts/toolkit-footer.js`,
            ],
            srcHeader: `${mainPaths.src.assets}/toolkit/scripts/toolkit-header.js`,
            srcFooter: `${mainPaths.src.assets}/toolkit/scripts/toolkit-footer.js`,
            srcFolder: `${mainPaths.src.assets}/toolkit/scripts`,
            dest: `${mainPaths.dest.assets}/toolkit/scripts`,
            watch: `${mainPaths.src.assets}/toolkit/scripts/**/*`,
        },
        images: {
            src: `${mainPaths.src.assets}/toolkit/images/**/*`,
            dest: `${mainPaths.dest.assets}/toolkit/images`,
        },
        favicons: {
            src: `${mainPaths.src.assets}/toolkit/favicons/*`,
            dest: `${mainPaths.dest.assets}/toolkit/favicons`,
        },
        icons: {
            src: [
                `${mainPaths.src.assets}/toolkit/icons/fa-brands.svg`,
                `${mainPaths.src.assets}/toolkit/icons/fa-regular.svg`,
                `${mainPaths.src.assets}/toolkit/icons/fa-solid.svg`,
            ],
            dest: `${mainPaths.dest.assets}/toolkit/icons`,
            includes: './icons.config.json',
        },
        htaccess: {
            src: [
                'src/.htaccess',
                'src/.htpasswd'
            ],
        },
        fonts: {
            src: `${mainPaths.src.assets}/toolkit/fonts/**/*`,
            dest: `${mainPaths.dest.assets}/toolkit/fonts`,
        },
        materials: {
            src: `${mainPaths.src.materials}/**/*`,
            watch: 'src/**/*.{html,md,json,yml}',
        },
    },
    dest: 'dist',
}

const iconIncludes = require(config.toolkit.icons.includes)

/**
 *
 *
 * UTILITY
 *
`*/

// Prevent Gulp from shutting down on errors
function swallowError(error) {
    // If you want details of the error in the console
    console.log(error.toString())
    this.emit('end')
}

const generateIconSprite = spriteName => {
    spriteName = spriteName || 'icon-sprite.svg'
    let bundleString = ''
    let lastFile
    return through.obj(function(file, encoding, callback) {
        lastFile = file
        let fileAsString
        if (file.isBuffer()) {
            fileAsString = file.contents.toString(encoding).trim()
        } else {
            throw new Error('Only buffers are supported')
        }
        bundleString += fileAsString
        callback()
    }, function(callback) {
        let symbols = []
        bundleString.split('<symbol id=').map((piece, index) => {
            iconIncludes.map(icon => {
                if (piece.indexOf(`"${icon}"`) >= 0) symbols.push(`<symbol id=${piece}`)
            })
        })
        let formattedSymbols = symbols.join('').replace('\n', '')
        let iconSprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display: none">${formattedSymbols}</svg>`
        const file = lastFile.clone()
        file.contents = new Buffer(iconSprite)
        file.path = path.join(lastFile.base, spriteName)
        this.push(file)
        callback()
    })
}

const getTemplates = {
    material: () =>
`---
notes: |
    @todo
---

`,
    style: (selector)  =>
`
${selector} {

}

`
}

const getFileTarget = (context, materialType, materialName) => {
    return new Promise((resolve, reject) => {
        fs.readdir(`${mainPaths.src.materials}/`, (error, folders) => {
            if (error) reject(error)
            let targetFolder = ''
            let targetName = ''
            folders.forEach((folder, index) => {
                if (folder.indexOf(materialType) > -1) targetFolder = folder
            })
            if (targetFolder !== '' && context === 'material') {
                fs.readdir(`${mainPaths.src.materials}/${targetFolder}/`, (err, files) => {
                    let targetIndex = 1
                    if (files.length > 0) {
                        files.forEach((file, index) => {
                            if (index === files.length - 1) {
                                targetIndex = parseInt(file.substr(0, 2)) + 1
                                let indexPrefix = targetIndex.toString()
                                if (indexPrefix.length === 1) indexPrefix = `0${indexPrefix}`
                                targetName = `${indexPrefix}-${materialName}.html`
                                resolve({targetName, targetFolder})
                            }
                        })
                    }
                })
            } else if (targetFolder !== '' && context === 'style') {
                targetName = `_${materialName}.scss`
                targetFolder = `${materialType}s`
                resolve({targetName, targetFolder})
            } else {
                reject('No folder for material type found')
            }
        })
    })
}

const webpackConfig = require('./webpack.config')(config)

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
            tailwindcss(config.toolkit.styles.tailwind),
            objectfit(),
        ]).on('error', swallowError))
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
            failAfterError: false,
            reporters: [
                { formatter: 'string', console: true },
            ],
        }))
})

// style tasks
gulp.task('toolkit:styles', ['toolkit:styles:lint', 'toolkit:styles:process'])

/**
 *
 *
 * TASKS - TOOLKIT IMAGES
 *
`*/

// copy favicon
gulp.task('toolkit:favicons', () => {
    return gulp
        .src(config.toolkit.favicons.src)
        .pipe(gulp.dest(config.toolkit.favicons.dest))
})

// generate icon sprite
gulp.task('toolkit:icons', () => {
    return gulp.src(config.toolkit.icons.src)
        .pipe(generateIconSprite('icon-sprite.svg'))
        .pipe(gulp.dest(config.toolkit.icons.dest))
})

// image optimization
gulp.task('toolkit:images', () => {
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
 * TASKS - TOOLKIT OPTIMIZATION
 *
`*/

// Copy ht protection for preview to dist (luckily, browser-sync webserver is not affected by this)
gulp.task('toolkit:htaccess', () => {
    return gulp.src(config.toolkit.htaccess.src)
    .pipe(gulp.dest(config.dest))
})

// purge css
gulp.task('toolkit:styles:purgecss', () => {
    class TailwindExtractor {
        static extract(content) {
            return content.match(/[A-z0-9-:\/]+/g)
        }
    }

    gulp
        .src([config.toolkit.styles.dest + '/toolkit.css'])
        .pipe(
            purgecss({
                content: [
                    config.dest + '/*.html',
                    config.dest + '/pages/**/*.html',
                    config.dest + '/assets/toolkit/scripts/toolkit-footer.js',
                    config.dest + '/assets/toolkit/scripts/toolkit-header.js',
                ],
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
        .pipe(gulp.dest(config.toolkit.styles.dest))
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

  watch([config.toolkit.scripts.watch, config.fabricator.scripts.watch], () => { gulp.start('webpack') })
  watch(config.toolkit.styles.watch, () => { gulp.start('toolkit:styles') })
  watch(config.toolkit.images.src, () => { gulp.start('toolkit:images') })
  watch(config.toolkit.favicons.src, () => { gulp.start('toolkit:favicons') })
  watch(config.toolkit.icons.includes, () => { gulp.start('toolkit:icons') })
  watch(config.toolkit.fonts.src, () => { gulp.start('toolkit:fonts') })
  watch(config.toolkit.htaccess.src, () => { gulp.start('toolkit:htaccess') })
  watch(config.toolkit.materials.watch, () => { gulp.start('fabricator:assemble') })
  watch(config.fabricator.styles.watch, () => { gulp.start('fabricator:styles') })
})



/**
 *
 *
 * TASKS - SCAFFOLDING
 *
`*/

// generate material files
gulp.task('scaffold:material', () => {
    return gulp
        .src('package.json', { read: false })
        .pipe(
            prompt.prompt([
                {
                    type: 'list',
                    name: 'materialType',
                    message:'Material type?',
                    choices: ['element','object','component'],
                    pageSize: '3'
                },
                {
                    type: 'input',
                    name: 'title',
                    message: 'Component name (like this: example-component): '
                },
                {
                    type:'list',
                    name: 'style',
                    message: 'Generate sass file?',
                    choices: ['yes','no'],
                    pageSize: '2'
                },
            ], function(res){
                if (res.title !== '') {
                    const materialType = res.materialType
                    const materialName = res.title
                    const createStyle = res.style === 'yes'

                    getFileTarget('material', materialType, materialName)
                        .then(({ targetName, targetFolder }) => {
                            // create material file
                            const materialContents = getTemplates.material()
                            newfile(targetName, materialContents)
                                .pipe(gulp.dest(`src/materials/${targetFolder}`))
                        })
                        .catch(error => {
                            console.log(error)
                        })

                    if (createStyle) {
                        // create sass file
                        getFileTarget('style', materialType, materialName)
                            .then(({ targetName, targetFolder }) => {
                                let classPrefix = ''
                                switch (materialType) {
                                    case 'element':
                                        classPrefix = ''
                                        break
                                    case 'object':
                                        classPrefix = 'o-'
                                        break
                                    case 'component':
                                        classPrefix = 'c-'
                                        break
                                    default:
                                        classPrefix = ''
                                        break
                                }

                                let selector = ''
                                let addSelector = true
                                if (classPrefix === '') addSelector = false
                                selector = classPrefix !== '' ? '.' + classPrefix + materialName : materialName
                                if (materialType === 'element') {
                                    switch (materialName) {
                                        case 'heading':
                                        case 'headings':
                                        case 'headline':
                                        case 'headlines':
                                            selector = 'h1'
                                            break
                                        case 'paragraph':
                                        case 'paragraphs':
                                            selector = 'p'
                                            break
                                        case 'link':
                                        case 'links':
                                        case 'anchor':
                                            selector = 'a'
                                            break
                                        case 'horizontal-ruler':
                                            selector = 'hr'
                                            break
                                        case 'list':
                                        case 'lists':
                                            selector = 'ul'
                                            break
                                        case 'image':
                                        case 'images':
                                            selector = 'img'
                                            break
                                    }
                                }
                                const sassContents = getTemplates.style(selector)

                                newfile(targetName, sassContents)
                                    .pipe(gulp.dest(`src/assets/toolkit/styles/${targetFolder}`))

                                let toolkitSass = fs.readFileSync('src/assets/toolkit/styles/toolkit.scss', 'utf8')
                                const toolkitSassParts = toolkitSass.split(`/* INJECT:${materialType} */`)
                                const newToolkitSassCss = toolkitSassParts[0] + `@import '${materialType}s/${materialName}';\n` + `/* INJECT:${materialType} */` + toolkitSassParts[1]
                                fs.writeFileSync('src/assets/toolkit/styles/toolkit.scss', newToolkitSassCss, 'utf8')
                            })
                            .catch(error => {
                                console.log(error)
                            })
                    }
                }
            })
        )
})

// generate scripts
gulp.task('scaffold:script', () => {
    return gulp
        .src('package.json', { read: false })
        .pipe(
            prompt.prompt([
                {
                    type: 'input',
                    name:'title',
                    message:'Name:'
                },
                {
                    type:'list',
                    name:'location',
                    message:'Import location:',
                    choices: ['footer','header'],
                    pageSize:'2'
                },
            ], function(res){
                if (res.title !== '') {
                    // create script file
                    const scriptContents = ``
                    const scriptName = `${res.title}.js`
                    const scriptTarget = `${config.toolkit.scripts.srcFolder}/${res.location}`
                    newfile(scriptName, scriptContents)
                        .pipe(gulp.dest(scriptTarget))

                    fs.readFile(`${config.toolkit.scripts.srcFolder}/toolkit-${res.location}.js`, "utf8", (err, data) => {
                        const newContents = `${data}
import './${res.location}/${res.title}'`
                        newfile(`toolkit-${res.location}.js`, newContents)
                            .pipe(gulp.dest(`${config.toolkit.scripts.srcFolder}`))
                    })
                }
            })
        )
})



/**
 *
 *
 * TASK SEQUENCES
 *
`*/

// tasks
gulp.task('develop', ['utility:clean'], () => {
    runSequence(
        'webpack',
        'toolkit:styles',
        'toolkit:images',
        'toolkit:favicons',
        'toolkit:fonts',
        'toolkit:icons',
        'toolkit:htaccess',
        'fabricator:styles',
        'fabricator:assemble',
        'fabricator:serve',
    )
})

gulp.task('build', ['utility:clean'], () => {
    runSequence(
        'webpack',
        'toolkit:styles',
        'toolkit:images',
        'toolkit:favicons',
        'toolkit:fonts',
        'toolkit:icons',
        'fabricator:styles',
        'fabricator:assemble',
        'toolkit:htaccess',
        'toolkit:styles:purgecss',
    )
})

gulp.task('default', ['develop'])
