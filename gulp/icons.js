const gulp = require('gulp')
const path = require('path')
const fs = require('fs')
const through = require('through2')
const config = require('../gulp.config.js')

class SvgSprite {
    constructor() {
        this.icons = []
        let iconIncludes = fs.readFileSync(config.toolkit.settings.icons.includes, 'utf8')
        this.includes = JSON.parse(iconIncludes)
    }

    addSvgString(svgString, filePath) {
        svgString = svgString.trim()

        // Check if svg source file is actually a valid svg file.
        if (svgString.substr(0, 4) !== '<svg') {
            throw new Error('File does not start with <svg')
        }
        if (!svgString.substr(-7).match(/\<\/ ?svg\>/i)) {
            throw new Error('File ' + filePath + 'does not end with </svg>')
        }

        // Extract current icon id from filePath.
        var pathParts = filePath.split('/')
        var id = pathParts[pathParts.length - 1].split('.')[0]

        // Replace opening tag with <symbol.
        svgString = '<symbol id="' + id + '"' + svgString.substr(4)

        // Replace closing tag with </symbol>
        var closingTagLength = svgString.substr(-7).match(/\<\/ ?svg\>/i)[0].length
        svgString = svgString.substr(0, svgString.length - closingTagLength) + '</symbol>'

        // Add icon to sprite if it is added in the conifgured includes list.
        if (this.includes.indexOf(id) >= 0) this.icons.push(svgString)
    }

    generateMap() {
        return '<svg xmlns="http://www.w3.org/2000/svg" style="display: none">\n' + this.icons.map(a => '\t' + a).join("\n") + '\n</svg>'
    }
}

const generateIconPage = sprite => {
    let iconsHTML = []
    sprite.icons.map(iconSrc => {
        let icon = iconSrc.split('<symbol id="')[1].split('"')[0]
        let iconHTML = `
            <svg class="c-icon">
                <use xlink:href="#${icon}"></use>
            </svg>
        `
        iconsHTML += `
            <div style="padding: 15px 0; min-width: 100px; max-width: 160px; text-align: center;" data-clipboard-trigger data-clipboard-text='${iconHTML}'>
                ${iconHTML}
                <span style="display: block; font-size: 9px;">${icon}</span>
            </div>
        `
    })
    let iconsPageHtml = `
        <div style="display:flex;flex-wrap:wrap;justify-content:center;padding: 15px;">
            ${iconsHTML}
        </div>
    `
    fs.writeFileSync(config.toolkit.settings.icons.iconPage, iconsPageHtml, 'utf8')
}

const generateIconSprite = spriteMapName => {
    spriteMapName = spriteMapName || 'icon-sprite.svg'
    const icons = []
    let lastFile
    let sprite = new SvgSprite()

    return through.obj(function(file, encoding, callback) {
        lastFile = file
        let svgFileAsString
        if (file.isBuffer()) {
            svgFileAsString = file.contents.toString(encoding).trim()
        } else {
            throw new Error('Only buffers are supported')
        }
        sprite.addSvgString(svgFileAsString, file.path)
        callback()
    }, function(callback) {
        const file = lastFile.clone()
        file.contents = new Buffer(sprite.generateMap())
        file.path = path.join(lastFile.base, spriteMapName)
        this.push(file)
        generateIconPage(sprite)
        callback()
    })
}

const generateSprite = () => {
    return gulp.src(config.toolkit.src.icons)
        .pipe(generateIconSprite(`${config.toolkit.settings.icons.spriteName}.svg`))
        .pipe(gulp.dest(config.toolkit.dist.icons))
}

module.exports = {
    generateSprite
}
