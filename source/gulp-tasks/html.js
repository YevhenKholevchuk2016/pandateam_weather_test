import pkg from 'gulp'
import pump from 'pump'
import plumber from 'gulp-plumber'
import fileinclude from 'gulp-file-include'
import notify from 'gulp-notify'

const { src, dest } = pkg

// assemble html parts
export default function html(cb, inputHtml, basepath, outputHtml) {
  return pump(
    [
      src(inputHtml),
      plumber({
        errorHandler: notify.onError('Error: <%= error.message %>'),
      }),
      fileinclude({
        prefix: '@@',
        basepath,
        context: {
          images_common_path__: 'assets/images/pages/common/',
          fonts_poppins__: 'assets/fonts/poppins/',
          sprites_common__: 'assets/images/sprites/common/svg/symbols.svg#icon-',
        },
      }),
      dest(outputHtml),
    ],
    cb,
  )
}
