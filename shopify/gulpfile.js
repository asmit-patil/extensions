var gulp = require('gulp'),
  inline = require('gulp-inline'),
  uglify = require('gulp-uglify'),
  minifyCss = require('gulp-minify-css'),
  babel = require('gulp-babel')


gulp.task('build', function () {
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