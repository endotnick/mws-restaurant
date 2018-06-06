const gulp = require('gulp'),
    rename = require('gulp-rename'),
    notify = require('gulp-notify'),
    pump = require('pump'),
    responsive = require('gulp-responsive'),
    del = require('del'),
    runSequence = require('run-sequence'),
    webp = require('gulp-webp');

gulp.task('default', ['watch']);

gulp.task('clean', function () {
    return del(['build']);
});

gulp.task('images', function() {
    return gulp.src('img/*.jpg')
        .pipe(webp())
        .pipe(responsive({
            '*': [ 
                {
                    width: 200,
                    rename:{
                        suffix: '-200px',
                        extname:'.webp'
                    }
                },
                {
                    width: 400,
                    rename:{
                        suffix: '-400px',
                        extname:'.webp'
                    }
                },
                {
                    width: 600,
                    rename:{
                        suffix: '-600px',
                        extname:'.webp'
                    }
                } ,
                {
                    width: 800,
                    rename:{
                        suffix: '-800px',
                        extname:'.webp'
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

gulp.task('watch', function() {
    gulp.watch('js/*.js', ['lint']);
});