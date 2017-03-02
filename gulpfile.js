/**
 * For Build MeeJs
 *
 * @author Amery(子丶言)
 * @create 2017-03-02
 */

const gulp = require('gulp');
const del = require('del');
const watch = require('gulp-watch');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const rollup = require('gulp-rollup');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');

gulp.task('build', () => {
  return del(['./dist']).then(() => {
    return gulp.src('./src/**/*.js')
      .pipe(sourcemaps.init())
      .pipe(rollup({
        entry: './src/main.js',
        format: 'iife'
      }))
      .pipe(babel({
        presets: ['es2015']
      }))
      .pipe(rename('mee.js'))
      .pipe(gulp.dest('./dist'))
      .pipe(uglify())
      .pipe(rename('mee.min.js'))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('./dist'));
  });
});

gulp.task('watch', () => {
  return watch('./src/**/*.js', { ignoreInitial: false }, () => {
    return gulp.src('./src/**/*.js')
      .pipe(rollup({
        entry: './src/main.js',
        format: 'iife'
      }))
      .pipe(babel({
        presets: ['es2015']
      }))
      .pipe(rename('main.js'))
      .pipe(gulp.dest('./dist'));
  });
});

gulp.task('default', ['watch']);
