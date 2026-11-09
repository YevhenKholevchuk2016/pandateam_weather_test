import pkg from 'gulp'
import pump from 'pump'
import svgSprite from 'gulp-svg-sprite'
import glob from 'glob'
import fs from 'fs'

const { src, dest } = pkg

export default function spriteBuilder(inputSvg, outputSvg, svgSymbols, cb) {
  const objectUrl = fs.readdirSync(inputSvg).map(elem => ({
    input: `${inputSvg}${elem}/**/*.svg`,
    output: `${outputSvg}${elem}/svg/`,
  }))

  glob(inputSvg, err => {
    if (err) {
      return cb(err)
    }
    // one pipeline per sprite folder; call cb once all of them have finished
    return Promise.all(
      objectUrl.map(
        elem =>
          new Promise((resolve, reject) => {
            pump(
              [
                src(elem.input),
                svgSprite({
                  shape: {
                    id: {
                      generator: name => `icon-${name.slice(4, -4)}`,
                    },
                  },
                  mode: {
                    symbol: {
                      dest: '.',
                      sprite: svgSymbols,
                      example: true,
                    },
                  },
                  transform: [
                    {
                      svgo: {
                        plugins: [
                          {
                            removeViewBox: false,
                          },
                          {
                            removeTitle: true,
                          },
                        ],
                      },
                    },
                  ],
                }),
                dest(elem.output),
              ],
              err2 => (err2 ? reject(err2) : resolve()),
            )
          }),
      ),
    ).then(() => cb(), cb)
  })
}
