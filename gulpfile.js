/**
 * For Build MeeJs
 *
 * @namespace Gulp
 * @auhor Amery
 */

var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    jshint = require('gulp-jshint');

gulp.task('build', function () {
    'use strict';
    gulp.src(['./src/*'])
        .pipe(concat('mee.js'))
        .pipe(gulp.dest('./'))
        .pipe(uglify())
        .pipe(rename('mee.min.js'))
        .pipe(gulp.dest('./'));
});

gulp.task('check', ['build'], function () {
    'use strict';
    gulp.src('./mee.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('default', ['check']);
