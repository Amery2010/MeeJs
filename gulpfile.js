/**
 * For Build SugarJs
 *
 * @namespace Gulp
 * @auhor Amery
 */

var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    jshint = require('gulp-jshint');

gulp.task('uglify', function () {
    'use strict';
    gulp.src(['./src/sugar.js'])
        .pipe(concat('sugar.js'))
        .pipe(gulp.dest('./'))
        .pipe(uglify())
        .pipe(rename('sugar.min.js'))
        .pipe(gulp.dest('./'));
});

gulp.task('check', ['uglify'], function () {
    'use strict';
    gulp.src('./sugar.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('default', ['check']);
