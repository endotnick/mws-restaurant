const gulp = require('gulp');
const rename = require('gulp-rename');
const notify = require('gulp-notify');
const responsive = require('gulp-responsive');
const del = require('del');
const webp = require('gulp-webp');
const lint = require('gulp-eslint');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const gutil = require('gulp-util');
const pump = require('pump');
const babel = require('gulp-babel');

gulp.task('default', ['build', 'watch']);
gulp.task('clean', () =>
  del(['build']));

gulp.task('images', () =>
  gulp.src('img/*.jpg')
    .pipe(webp())
    .pipe(responsive(
      {
        '*': [
          {
            width: 200,
            rename: {
              suffix: '-200px',
              extname: '.webp',
            },
          },
          {
            width: 400,
            rename: {
              suffix: '-400px',
              extname: '.webp',
            },
          },
          {
            width: 600,
            rename: {
              suffix: '-600px',
              extname: '.webp',
            },
          },
          {
            width: 800,
            rename: {
              suffix: '-800px',
              extname: '.webp',
            },
          },
        ],
      },
      { // Global
        // quality: 50,
        progressive: true,
        withMetadata: false,
        errorOnEnlargement: false,
      },
    ))
    .pipe(gulp.dest('build/img')));

gulp.task('lint', () =>
  gulp.src(['*.js'])
    .pipe(lint())
    .pipe(lint.format()));
// .pipe(lint.failOnError()));

gulp.task('scripts', () =>
  gulp.src(['js/*.js'])
    /*
    .pipe(babel({
      presets: ['env'],
    }))
    */
    .pipe(concat('all.js'))
    .pipe(gulp.dest('build/js')));

gulp.task('scripts-dist', () =>
  gulp.src(['js/*.js'])
    /*
    .pipe(babel({
      presets: ['env'],
    }))
    */
    .pipe(concat('all.js'))
    /*
    .pipe(uglify())
    .on('error', (err) => { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
    */
    .pipe(gulp.dest('build/js')));

/*
gulp.task('uglify-error-debugging', (cb) => {
  pump([
    gulp.src('js/*.js'),
    uglify(),
    gulp.dest('dist/js'),
  ], cb);
});
*/

gulp.task('transpile', (src) => {
  src.pipe(babel({
    presets: ['es2015'],
  }));
});

gulp.task('dev', ['clean', 'lint', 'scripts', 'images']);

gulp.task('dist', ['clean', 'lint', 'scripts-dist', 'images']);

gulp.task('watch', () =>
  gulp.watch('js/*.js', ['lint']));
