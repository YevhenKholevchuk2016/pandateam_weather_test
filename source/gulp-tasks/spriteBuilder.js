import pkg from 'gulp'
import pump from 'pump'
import orderedReadStreams from 'ordered-read-streams'
import { Writable } from 'stream'
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
    // one pipeline per sprite folder; each ends in its own dest, which passes files through
    const sprites = objectUrl.map(elem =>
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
        err2 => err2 && cb(err2),
      ),
    )
    // discard the merged output; cb is called once every sprite folder has been written
    const discard = new Writable({
      objectMode: true,
      write(file, encoding, next) {
        next()
      },
    })
    return pump([orderedReadStreams(sprites), discard], cb)
  })
}
