// define gulp plugins
import pkg from 'gulp'
import browserSyncImport from 'browser-sync'
import cache from 'gulp-cached'
import { deleteAsync } from 'del'

// import gulp tasks and source files
import { scssDev, scssBuild } from './gulp-tasks/scss.js'
import { script, scriptBuild } from './gulp-tasks/scripts.js'
import { injectString } from './gulp-tasks/injectString.js'
import spriteBuilder from './gulp-tasks/spriteBuilder.js'
import images from './gulp-tasks/image.js'
import html from './gulp-tasks/html.js'
import fonts from './gulp-tasks/fonts.js'
import favicon from './gulp-tasks/favicon.js'
import { publicSource, devSource, watchSource } from './gulp-tasks/pathSrc.js'

const { series, parallel, watch, task } = pkg

// save reference to created browser-sync instance, and save reference to the 'reload' method
const browserSync = browserSyncImport.create()
const reload = done => {
  browserSync.reload()
  done()
}

// static server + browserSync watching for all files
task('serve', () => {
  browserSync.init({
    server: {
      baseDir: devSource.browserSyncBaseDir,
    },
    notify: false,
  })
})

// compile sass into CSS dev
task('scss', cb => scssDev(devSource.scssPages, publicSource.css, browserSync, cb))

// compile sass into CSS prod
task('build-scss', cb => scssBuild(devSource.scssPages, publicSource.pathOutputCss, cb))

// compile js dev
task('js', cb => script(cb, devSource.jsPages, publicSource.js))

// compile js prod
task('build-js', cb => scriptBuild(cb, devSource.jsPages, publicSource.js))

// inject updated file name to header
task('inject-css', cb => injectString(cb, devSource.baseInputCss, publicSource.pathOutputCss, publicSource.cssBuild))

// inject updated file name to footer
task('inject-js', cb => injectString(cb, devSource.baseInputJs, publicSource.pathOutputJs, publicSource.jsBuild))

// clean generated css, js, svg-sprite in public directory && clean generated html in /templates/pages directory
const clean = async () =>
  deleteAsync([publicSource.all, publicSource.pathOutputCss, publicSource.pathOutputJs], {
    force: true,
  })

const cleanImages = () =>
  deleteAsync(publicSource.images, {
    force: true,
  })

const cleanFonts = () =>
  deleteAsync(publicSource.fonts, {
    force: true,
  })

const cleanHtml = () =>
  deleteAsync(publicSource.htmlFiles, {
    force: true,
  })

task('html', cb => html(cb, devSource.htmlSource, devSource.htmlBase, publicSource.htmlBuild))

// create image min
task('images', cb =>
  images(cb, [devSource.images, devSource.excludeSprites, devSource.excludeFavicon], publicSource.images),
)

// copy fonts
task('fonts', cb => fonts(cb, devSource.fonts, publicSource.fonts))

// create svg sprite from svg files
task('createSvgSprite', cb => spriteBuilder(devSource.svgSprite, publicSource.svgSprite, 'symbols.svg', cb))

// create favicon
task('faviconGenerator', cb => favicon(devSource.favicon, publicSource.faviconBuild, cb))

// watch any changes in html, css, js files
task('watch', () => {
  watch(watchSource.scss, series('scss', 'inject-css')).on('change', event => {
    console.log(`event happened: ${JSON.stringify(event)}`)
    if (event.type === 'deleted') {
      delete cache.caches.scss[event.path]
    }
  })
  watch(watchSource.js, series('js', 'inject-js', reload))
  watch(watchSource.html, series(cleanHtml, 'html', reload))
  watch(watchSource.fonts, series(cleanFonts, 'fonts', reload))
  watch(watchSource.svgSprite, series('createSvgSprite', reload))
  watch(
    [watchSource.images, watchSource.excludeSprites, watchSource.excludeFavicon],
    series(cleanImages, 'createSvgSprite', 'images', reload),
  )
})

// build task
task(
  'build',
  series(
    clean,
    parallel('build-scss', 'build-js'),
    'inject-js',
    'createSvgSprite',
    'fonts',
    'images',
    'faviconGenerator',
    'html',
  ),
)

// default task
task(
  'default',
  series(
    clean,
    parallel('scss', 'js'),
    'inject-css',
    'inject-js',
    'createSvgSprite',
    'fonts',
    'images',
    'faviconGenerator',
    'html',
    parallel('watch', 'serve'),
  ),
)
