import pkg from 'gulp'
import orderedReadStreams from 'ordered-read-streams'
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

// bundle every entry file, merge the streams in order, and write them all through one dest
export function script(done, inputJs, outputJs) {
  glob(inputJs, (err, files) => {
    if (err) {
      return done(err)
    }
    const streams = files.map(entry =>
      browserify({ entries: [entry] })
        .transform(babelify)
        .bundle()
        .pipe(source(entry.slice(entry.lastIndexOf('/') + 1)))
        .pipe(buffer())
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.write('./')),
    )
    return pump([orderedReadStreams(streams), dest(outputJs)], done)
  })
}

export function scriptBuild(done, inputJs, outputJs) {
  glob(inputJs, (err, files) => {
    if (err) {
      return done(err)
    }
    const streams = files.map(entry =>
      browserify({ entries: [entry] })
        .transform(babelify)
        .bundle()
        .pipe(source(entry.slice(entry.lastIndexOf('/') + 1)))
        .pipe(buffer())
        .pipe(hash({ format: '{name}_{hash}{ext}' }))
        .pipe(uglify()),
    )
    return pump([orderedReadStreams(streams), dest(outputJs)], done)
  })
}
