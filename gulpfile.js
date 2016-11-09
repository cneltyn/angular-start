// gulp
const gulp = require('gulp');

// plugins
const connect = require('gulp-connect');
const jshint = require('gulp-jshint');
const uglify = require('gulp-uglify');
const minifyCSS = require('gulp-minify-css');
const clean = require('gulp-clean');
const browserify = require('gulp-browserify');
const concat = require('gulp-concat');
const runSequence = require('run-sequence');
const sass = require('gulp-sass');
const del = require('del');
const gulpIf = require('gulp-if');
const browserSync = require('browser-sync').create();
const sourcemaps = require('gulp-sourcemaps');

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

// tasks
gulp.task('lint', function() {
  gulp.src(['./app/**/*.js', '!./app/bower_components/**'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});
gulp.task('clean', function() {
  return del('dist');
});
gulp.task('styles', function() {
  return gulp.src('app/styles/main.sass')
      .pipe(gulpIf(isDevelopment, sourcemaps.init()))
      .pipe(sass().on('error', sass.logError))
      .pipe(minifyCSS())
      .pipe(gulpIf(isDevelopment, sourcemaps.write()))
      .pipe(gulp.dest('./dist/styles'))
      .pipe(browserSync.stream());
});
gulp.task('minify-js', function() {
  gulp.src(['./app/**/*.js', '!./app/bower_components/**'])
    .pipe(uglify({
      // inSourceMap:
      // outSourceMap: "app.js.map"
    }))
    .pipe(gulp.dest('./dist/'));
});
gulp.task('copy-bower-components', function () {
  gulp.src('./app/bower_components/**')
    .pipe(gulp.dest('dist/bower_components'));
});
gulp.task('copy-html-files', function () {
  gulp.src('./app/**/*.html')
    .pipe(gulp.dest('dist/'));
});
gulp.task('connect', function () {
  connect.server({
    root: 'app/',
    port: 8888
  });
});
// gulp.task('connectDist', function () {
//   connect.server({
//     root: 'dist/',
//     port: 9999
//   });
// });
gulp.task('browserify', function() {
  gulp.src(['app/js/main.js'])
  .pipe(browserify({
    insertGlobals: true,
    debug: true
  }))
  .pipe(concat('bundled.js'))
  .pipe(gulp.dest('./app/js'));
});
gulp.task('browserifyDist', function() {
  gulp.src(['app/js/main.js'])
  .pipe(browserify({
    insertGlobals: true,
    debug: true
  }))
  .pipe(concat('bundled.js'))
  .pipe(gulp.dest('./dist/js'));
});

// *** default task *** //
gulp.task('default', function() {
  runSequence(
    ['clean'],
    ['lint', 'browserify', 'connect']
  );
});

// *** build task *** //
gulp.task('build', function() {
  runSequence(
    ['clean'],
    ['serve','lint', 'styles', 'browserifyDist', 'copy-html-files', 'copy-bower-components']
  );
});

gulp.task('serve', ['styles'], function() {

    browserSync.init({
          server: 'dist'
    });

    gulp.watch("app/styles/*.sass", ['styles']);
    gulp.watch("app/*.html",['copy-html-files']).on('change', browserSync.reload);
});





