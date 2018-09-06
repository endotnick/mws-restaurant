const gulp = require('gulp');
const responsive = require('gulp-responsive');
const del = require('del');
const webp = require('gulp-webp');
const lint = require('gulp-eslint');
const webpack = require('webpack-stream');
const webpackConfig = require('./webpack.config');
const runSequence = require('run-sequence')

gulp.task('default', ['dev', 'watch']);

gulp.task('del_compiledSW', () =>
  del(['build/js/sw.js']));

gulp.task('clean', () =>
  del(['build', './sw.js']));

gulp.task('images', () =>
  gulp.src('src/img/*.jpg')
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
  gulp.src(['src/js/*.js'])
    .pipe(lint())
    .pipe(lint.format()));

gulp.task('pack', () =>
  webpack(webpackConfig)
    .pipe(gulp.dest('build/js/')));

gulp.task('cp_sw', () =>
  gulp.src('./build/js/sw.js')
    .pipe(gulp.dest('./')));

gulp.task('compile', () =>
  runSequence('pack', 'cp_sw', 'del_compiledSW'));

gulp.task('dev', ['clean', 'lint', 'compile', 'images']);

gulp.task('prod', ['clean', 'compile', 'images']);

gulp.task('watch', () =>
  gulp.watch('src/js/*.js', ['lint', 'compile']));
