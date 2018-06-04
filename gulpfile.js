const gulp = require('gulp'),
    eslint = require('gulp-eslint'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    notify = require('gulp-notify'),
    pump = require('pump'),
    babel = require('gulp-babel'),
    responsive = require('gulp-responsive'),
    del = require('del'),
    runSequence = require('run-sequence');

gulp.task('default', ['watch']);

gulp.task('lint', function() {
    return gulp.src('js/*.js')
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('clean', function () {
    return del(['build']);
});

gulp.task('images', function() {
    return gulp.src('img/*.jpg')
        .pipe(responsive({
            '*': [ 
                {
                    width: 200,
                    rename:{
                        suffix: '-200px',
                        extname:'.jpg'
                    }
                },
                {
                    width: 400,
                    rename:{
                        suffix: '-400px',
                        extname:'.jpg'
                    }
                },
                {
                    width: 600,
                    rename:{
                        suffix: '-600px',
                        extname:'.jpg'
                    }
                } ,
                {
                    width: 800,
                    rename:{
                        suffix: '-800px',
                        extname:'.jpg'
                    }
                }              
            ],
        }, 
        {   // Global
            // quality: 50,
            progressive: true,
            withMetadata: false,
            errorOnEnlargement: false,
        }))
        .pipe(gulp.dest('build/img'));
});

gulp.task('build', function() {
    runSequence('clean', 'images');
} );
/*
gulp.task('build-js', function(cb) {
    pump([
        gulp.src('js/*.js')
            .pipe(babel())            
            .pipe(rename({ suffix: '.min' })),        
        uglify(),
        gulp.dest('build/js')
    ],
    cb
    );
});

gulp.task('build-css', function() {

})
*/
gulp.task('watch', function() {
    gulp.watch('js/*.js', ['lint']);
});