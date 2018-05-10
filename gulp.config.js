// main paths
const paths = {
    base: {
        src: './src',
        dist: './dist',
    },
    assets: {
        toolkit: 'assets/toolkit',
        styleguide: 'assets/fabricator',
    },
    config: {
        icons: './icons.config.json',
        tailwind: './tailwind.config.js',
    }
}

// export config object so tasks can import them
module.exports = {
    paths: paths,

    // toolkit configuration (styleguide assets)
    toolkit: {
        // build entry files
        entry: {
            // js entry for webpack
            js: {
                'toolkit/scripts/toolkit-header': `${paths.base.src}/${paths.assets.toolkit}/scripts/toolkit-header.js`,
                'toolkit/scripts/toolkit-footer': `${paths.base.src}/${paths.assets.toolkit}/scripts/toolkit-footer.js`
            },

            // css entry for sass
            css: `${paths.base.src}/${paths.assets.toolkit}/styles/toolkit.scss`,
        },

        // build source files
        src: {
            fonts: `${paths.base.src}/${paths.assets.toolkit}/fonts/**/*`,
            icons: `${paths.base.src}/${paths.assets.toolkit}/icons/**/*.svg`,
            images: `${paths.base.src}/${paths.assets.toolkit}/images/**/*`,
            favicons: `${paths.base.src}/${paths.assets.toolkit}/favicons/*`,
            css: `${paths.base.src}/${paths.assets.toolkit}/styles/**/*.scss`,
            js: `${paths.base.src}/${paths.assets.toolkit}/scripts/**/*.js`,
        },

        // build output destination
        dist: {
            fonts: `${paths.base.dist}/${paths.assets.toolkit}/fonts`,
            icons: `${paths.base.dist}/${paths.assets.toolkit}/icons`,
            images: `${paths.base.dist}/${paths.assets.toolkit}/images`,
            favicons: `${paths.base.dist}/${paths.assets.toolkit}/favicons`,
            js: './dist',
            css: `${paths.base.dist}/${paths.assets.toolkit}/styles`,
        },

        // build task settings
        settings: {
            icons: {
                spriteName: 'icon-sprite',
                includes: paths.config.icons,
                iconPage: `${paths.base.src}/views/pages/icon-variations.html`,
            },
            css: {
                tailwind: paths.config.tailwind,
                browsers: 'last 2 versions', // for autoprefixer
                purgecss: {
                    content: [
                        `${paths.base.dist}/*.html`,
                        `${paths.base.dist}/pages/**/*.html`,
                        `${paths.base.dist}/${paths.assets.toolkit}/scripts/toolkit-footer.js`,
                        `${paths.base.dist}/${paths.assets.toolkit}/scripts/toolkit-header.js`,
                    ],
                }
            }
        },

        // additional files that need to be watched and are not included in the source configuration
        watch: {
            'toolkit:icons': [paths.config.icons],
            'toolkit:css': [paths.config.tailwind],
        },
    },

    // styleguide configuration (fabricator etc)
    styleguide: {
        // build entry files
        entry: {
            // js entry for webpack
            js: {
                'fabricator/scripts/fabricator': `${paths.base.src}/${paths.assets.styleguide}/scripts/fabricator.js`,
            },

            // css entry for sass
            css: `${paths.base.src}/${paths.assets.styleguide}/styles/fabricator.scss`,
        },

        // build source files
        src: {
            js: `${paths.base.src}/${paths.assets.styleguide}/scripts/**/*.js`,
            css: `${paths.base.src}/${paths.assets.styleguide}/styles/**/*.scss`,
        },

        // build output destination
        dist: {
            js: `${paths.base.dist}`,
            css: `${paths.base.dist}/${paths.assets.styleguide}/styles`,
        },

        // build task settings
        settings: {
            // options to pass to fabricator-assemble
            assembly: {
                layouts: `${paths.base.src}/views/fabricator/*`,
                partials: `${paths.base.src}/views/fabricator/partials/*`,
                materials: `${paths.base.src}/materials/**/*`,
                views: [
                    `${paths.base.src}/views/**/*`,
                    `!${paths.base.src}/views/+(fabricator)/**`,
                ],
            },

            // options to pass to browsersync
            browserSync: {
                server: {
                    baseDir: `${paths.base.dist}`,
                },
                open: false,
                notify: false,
                logPrefix: 'FABRICATOR',
                files: [ `${paths.base.dist}/**/*` ],
            },
        }
    },

    // settings for scaffolding tasks
    scaffolding: {
        src: {
            materials: `${paths.base.src}/materials`,
        },
        injectionTargets: {
            title: `${paths.base.src}/views/fabricator/partials/f-title.html`,
            accentColor: `${paths.base.src}/${paths.assets.styleguide}/styles/_accent-color.scss`,
            cssEntryFolder: `${paths.base.src}/${paths.assets.toolkit}/styles`,
            cssEntry: `${paths.base.src}/${paths.assets.toolkit}/styles/toolkit.scss`,
            jsEntryFolder: `${paths.base.src}/${paths.assets.toolkit}/scripts`,
        },
    },
}
