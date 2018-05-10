const gulp = require('gulp')
const fs = require('fs')
const glob = require('glob')
const newfile = require('gulp-file')
const prompt = require('gulp-prompt')
const config = require('../gulp.config.js')

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
        fs.readdir(`${config.scaffolding.src.materials}/`, (error, folders) => {
            if (error) reject(error)
            let targetFolder = ''
            let targetName = ''
            folders.forEach((folder, index) => {
                if (folder.indexOf(materialType) > -1) targetFolder = folder
            })
            if (targetFolder !== '' && context === 'material') {
                glob('*.html', { cwd: `${config.scaffolding.src.materials}/${targetFolder}/`}, (err, files) => {
                    if (err) reject(err)
                    if (files.length > 0) {
                        files.forEach((file, index) => {
                            let fileName = file.split([])
                            if (index === files.length - 1) {
                                targetIndex = parseInt(file.substr(0, 2)) + 1
                                let indexPrefix = targetIndex.toString()
                                if (indexPrefix.length === 1) indexPrefix = `0${indexPrefix}`
                                targetName = `${indexPrefix}-${materialName}.html`
                                resolve({targetName, targetFolder})
                            }
                        })
                    } else {
                        targetName = `01-${materialName}.html`
                        resolve({targetName, targetFolder})
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

const setup = () => {
    return gulp
        .src('package.json', { read: false })
        .pipe(
            prompt.prompt([
                {
                    type: 'input',
                    name: 'title',
                    message: 'Title: '
                },
                {
                    type: 'input',
                    name: 'color',
                    message: 'Accent color: '
                },
            ], function(res){
                if (res.title !== '' && res.color !== '') {
                    const styleguideName = res.title
                    const styleguideColor = res.color
                    fs.writeFileSync(config.scaffolding.injectionTargets.title, styleguideName, 'utf8')
                    let newAccentColorCSS = `$color--accent: ${styleguideColor}`
                    fs.writeFileSync(config.scaffolding.injectionTargets.accentColor, newAccentColorCSS, 'utf8')
                } else {
                    console.log('Please insert a title and a color')
                }
            })
        )
}

const generateMaterial = () => {
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
                                .pipe(gulp.dest(`${config.scaffolding.src.materials}/${targetFolder}`))
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
                                    .pipe(gulp.dest(`${config.scaffolding.injectionTargets.cssEntryFolder}/${targetFolder}`))

                                let toolkitSass = fs.readFileSync(config.scaffolding.injectionTargets.cssEntry, 'utf8')
                                const toolkitSassParts = toolkitSass.split(`/* INJECT:${materialType} */`)
                                const newToolkitSassCss = toolkitSassParts[0] + `@import '${materialType}s/${materialName}';\n` + `/* INJECT:${materialType} */` + toolkitSassParts[1]
                                fs.writeFileSync(config.scaffolding.injectionTargets.cssEntry, newToolkitSassCss, 'utf8')
                            })
                            .catch(error => {
                                console.log(error)
                            })
                    }
                }
            })
        )
}

const generateScript = () => {
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
                    const scriptTarget = `${config.scaffolding.injectionTargets.jsEntryFolder}/${res.location}`
                    newfile(scriptName, scriptContents)
                        .pipe(gulp.dest(scriptTarget))

                    fs.readFile(`${config.scaffolding.injectionTargets.jsEntryFolder}/toolkit-${res.location}.js`, "utf8", (err, data) => {
                        const newContents = `${data}
import './${res.location}/${res.title}'`
                        newfile(`toolkit-${res.location}.js`, newContents)
                            .pipe(gulp.dest(config.scaffolding.injectionTargets.jsEntryFolder))
                    })
                }
            })
        )
}

module.exports = {
    setup,
    generateMaterial,
    generateScript,
}
