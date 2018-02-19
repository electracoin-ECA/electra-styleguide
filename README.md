# Electra Styleguide

**Important note**: Please dont start working with this repo until the correct style settings are applied by Thomas. He will add the spectrum of available styles (margins/paddings/borders/shadows etc.) in `tailwind.config.js`. The font to use, the main logo variation, some colors and font awesome pro icon set (as svg sprite) are already included. 

## Why do we need this? 

This styleguide has two major purposes. On the one hand, it serves as a single point of truth/reference in UI development and design processes. applying tailwindcss and its utility-first approach to styling templates, we can ensure that there will be no deviations from agreed upon design guidelines. On the other hand, developers can use this repo as an evolving pattern library, to enable a fast process of developing UI components.

## How does it work? 

This is a fork of the Fabricator UI kit with the following customizations/improvements:
- Build process (Gulp workflow) was refactored and made more efficient, tailwindcss and purgecss processing was added
- UI design was improved and simplified

To understand how to work with this repo, it is important to understand the following concepts: 
- Styleguide structure and development workflow ([Fabricator Documentation](http://fbrctr.github.io/docs/))
- Utility-first, functional CSS [TailwindCSS](https://tailwindcss.com)
- CSS Classes Naming Convention [BEM](http://getbem.com/introduction/)

The underlying functionality and look of the fabricator styleguide is still a work in progress. Please don't modify the code found in `src/assets/fabricator/` and `src/views/fabricator/`.

## What is the result?
Working on this styleguide, you create two important things: 
- Assets (images, fonts, bundled CSS/JS) which will be used in all HTML/CSS-based user interfaces (`dist/assets/toolkit`). 
- Templates which you can drop anywhere in the code (e.g. during the upcoming desktop wallet development)

## Development

### Prerequisites:

- node
- npm / yarn

### Install:

```
npm i
```

### Start a web server with browser sync and watching for changes: 

```
npm run dev
``` 

Note: Browser sync is deliberately configured to **not** open a browser window upon starting. Simply visit or reload `localhost:3000` (port may vary but is stated in the CLI output) to access the live view.

### Build minified assets:

```
npm run build
``` 

## Notes/Conventions: 

### Magic numbers 

Tailwind ensures that we use only the style settings (colors, paddings, margins, shadow styles etc) which are specified in `tailwind.config.js`. Please don't introduce additional so-called 'magic numbers' (e.g. setting a 17px pixel margin or a 13px font size manually without the provided utility classes). This way we won't end up with lots of different sizes and spacing in the final UI. 

### Creating elements and components 

Components are specified using BEM-style classnames and prefixed with 'c-' (e.g. `c-card`) but it is optional to set a classname because sometimes tailwind utility classes are sufficient to style a component. Adding new component classes makes sense if you need to add additional styles which are not available as a utility class or if the markup will be used repetitively later on (e.g. card component).

Elements are usually styled directly via their equivalent tag selectors (e.g. `p` for paragraph element or `a` for links).

### Sass

Styles are specified in [SASS](https://sass-lang.com/) (SCSS). Adjust styles and add new ones in `src/assets/toolkit/styles`. Classes can be applied directly in the template or within the SCSS files using `@apply .CLASSNAME;`. Also, [mappy-breakpoints](https://github.com/zellwk/mappy-breakpoints) and `create-separate-selectors` helpers are available. 

### PurgeCSS

PurgeCSS is used to remove all unused CSS. Upon building the final CSS is minified dramatically by [PurgeCSS](https://www.purgecss.com/). PurgeCSS parses the destination CSS for any string contained in any file type and location defined in `content` in the `purgecss` task. Utility styles that have been applied to components using the `@apply` rule will be kept while the original utilities classes they were based off are stripped (if not used directly in templates). To keep selectors in the rendered CSS although they're not being used inside templates it's sufficient to create a HTML file that contains all the selectors. They don't need to be used as actual attributes but only be available as string.