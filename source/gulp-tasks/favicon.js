import pkg from 'gulp'
import pump from 'pump'
import favicons from 'gulp-favicons'

const { src, dest } = pkg

export default function favicon(inputFavicon, outputFavicons, cb) {
  return pump(
    [
      src(inputFavicon),
      favicons({
        icons: {
          android: false,
          appleIcon: true,
          favicons: true,
          appleStartup: false,
          windows: false,
          yandex: false,
        },
      }),
      dest(outputFavicons),
    ],
    cb,
  )
}
