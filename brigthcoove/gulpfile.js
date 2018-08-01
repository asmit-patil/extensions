var gulp = require('gulp'),
  inline = require('gulp-inline'),
  uglify = require('gulp-uglify'),
  es2015 = require('babel-preset-es2015');
  minifyCss = require('gulp-minify-css'),
  babel = require('gulp-babel')


gulp.task('brightcoove', function () {
  return gulp.src('./source/index.html')
    .pipe(inline({
      js: [babel({
        presets: ['es2015']
      }), uglify],
      css: [minifyCss],
      disabledTypes: ['svg', 'img']
    }))
    .pipe(gulp.dest('./'));
});