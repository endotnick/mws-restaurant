const gulp = require('gulp');
const responsive = require('gulp-responsive');
const del = require('del');
const webp = require('gulp-webp');
const lint = require('gulp-eslint');
const runSequence = require('run-sequence');
const babelify = require('babelify');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const merge = require('merge-stream');

gulp.task('default', ['dev', 'watch']);

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

gulp.task('compile', () =>
  runSequence('browserify', 'cp_sw', 'del_artifacts'));

gulp.task('browserify', () => {
  const streams = merge();
  const files = [
    'main.js',
    'restaurant_info.js',
    'sw.js',
  ];

  files.map(entry =>
    streams.add(browserify({
      entries: [`./src/js/${entry}`],
      debug: true,
      transform: [babelify.configure({
        presets: ['env'],
      })],
    })
      .bundle()
      .pipe(source(entry))
      .pipe(gulp.dest('./build/js/'))));
  return streams;
});

gulp.task('cp_sw', () =>
  gulp.src('./build/js/sw.js')
    .pipe(gulp.dest('./')));

gulp.task('del_artifacts', () =>
  del(['./build/js/sw.js']));

gulp.task('dev', ['clean', 'lint', 'compile', 'images']);

gulp.task('prod', ['clean', 'compile', 'images']);

gulp.task('watch', () =>
  gulp.watch('src/js/*.js', ['lint', 'compile']));
