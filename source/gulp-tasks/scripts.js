import pkg from 'gulp'
import sourcemaps from 'gulp-sourcemaps'
import uglify from 'gulp-uglify'
import browserify from 'browserify'
import hash from 'gulp-hash-filename'
import babelify from 'babelify'
import source from 'vinyl-source-stream'
import buffer from 'vinyl-buffer'
import glob from 'glob'
import pump from 'pump'

const { dest } = pkg

// build one pipeline per entry file and call done once every pipeline has finished
const runPerFile = (inputJs, buildPipeline, done) => {
  glob(inputJs, (err, files) => {
    if (err) {
      return done(err)
    }
    return Promise.all(
      files.map(
        entry =>
          new Promise((resolve, reject) => {
            pump(buildPipeline(entry), err2 => (err2 ? reject(err2) : resolve()))
          }),
      ),
    ).then(() => done(), done)
  })
}

export function script(done, inputJs, outputJs) {
  runPerFile(
    inputJs,
    entry => [
      browserify({ entries: [entry] }).transform(babelify).bundle(),
      source(entry.slice(entry.lastIndexOf('/') + 1)),
      buffer(),
      sourcemaps.init(),
      sourcemaps.write('./'),
      dest(outputJs),
    ],
    done,
  )
}

export function scriptBuild(done, inputJs, outputJs) {
  runPerFile(
    inputJs,
    entry => [
      browserify({ entries: [entry] }).transform(babelify).bundle(),
      source(entry.slice(entry.lastIndexOf('/') + 1)),
      buffer(),
      hash({
        format: '{name}_{hash}{ext}',
      }),
      uglify(),
      dest(outputJs),
    ],
    done,
  )
}
