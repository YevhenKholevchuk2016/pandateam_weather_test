import pkg from 'gulp'
import pump from 'pump'

const { src, dest } = pkg

// fonts are binary: disable vinyl-fs text decoding (encoding: false), otherwise the bytes are corrupted
export default function fonts(cb, inputFonts, outputFonts) {
  return pump([src(inputFonts, { encoding: false }), dest(outputFonts)], cb)
}
