const gulp = require('gulp'),
    eslint = require('gulp-eslint');
    uglify = require('gulp-uglify');
    pump = require('pump');



gulp.task('default', ['watch']);

gulp.task('lint', function() {
    return gulp.src('js/*.js')
        .pipe(eslint())
        .pipe(eslint.format());
});

gulp.task('build', ['build-js', 'build-css']);

gulp.task('build-js', function() {
    pump([
        gulp.src('js/*.js'),
        uglify(),
        gulp.dest('dist')
    ]);
});

gulp.task('build-css', function() {

})

gulp.task('watch', function() {
    gulp.watch('js/*.js', ['lint']);
});