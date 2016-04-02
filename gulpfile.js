/**
 * This class requires the modules {@link gulp} and
 * {@link module:gulp}.
 */
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

/** task to indentify Javascrip errors. */
gulp.task('lint', function() {
    return gulp.src('src/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

/** Task to concatenet and mimify the javascript files. */
gulp.task('scripts', function() {
    return gulp.src('src/*.js')
        .pipe(concat('all.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename('all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

/** Watch Files For Changes. */
gulp.task('watch', function() {
    gulp.watch('src/*.js', ['lint', 'scripts']);
});

/** Run tasks. */
gulp.task('default', ['lint', 'scripts', 'watch']);