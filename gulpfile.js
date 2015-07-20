var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var coffee = require('gulp-coffee');
var coffeeify = require('coffeeify');
var del = require('del');
var gutil = require('gulp-util');
var gulp = require('gulp');
var less = require('gulp-less');
var livereload = require('gulp-livereload');
var minifyCSS = require('gulp-minify-css');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');

var config = {production: true};

function onError (error) {
  console.log(error.toString());
  this.emit('end');
}

gulp.task('set-development', function() {
  config.production = false;
});

gulp.task('clean', function(cb) {
  del([
    'dist/app.js',
    'css/**/*.css'
  ], cb);
});

gulp.task('scripts', function() {
  var b = browserify({
    entries: 'app.coffee',
    paths: './src',
    debug: config.production,
    transform: [coffeeify],
    extensions: ['.coffee']
  });
  
  if(config.production) {
    return b.bundle()
      .on('error', onError)
      .pipe(source('app.js'))
      .pipe(buffer())
      .pipe(uglify())
      .pipe(gulp.dest('./dist'));
  } else {
    return b.bundle()
      .on('error', onError)
      .pipe(source('app.js'))
      .pipe(gulp.dest('./dist'))
      .pipe(livereload());
  }
});

gulp.task('less', function() {
  if(config.production) {
    gulp
      .src('./less/**/*.less')
      .pipe(less({compress: true}))
      .on('error', onError)
      .pipe(minifyCSS({keepBreaks: false}))
      .pipe(gulp.dest('./css'));
  } else {
    gulp
      .src('./less/**/*.less')
      .pipe(less())
      .on('error', onError)
      .pipe(gulp.dest('./css'))
      .pipe(livereload());
  }
});

gulp.task('watch', function() {
  livereload.listen();
  gulp.watch(['src/**/*.coffee'], ['set-development', 'scripts']);
  gulp.watch(['less/**/*.less'], ['set-development', 'less']);
});
 
gulp.task('prod', ['clean', 'scripts', 'less']);
gulp.task('dev', ['set-development', 'clean', 'scripts', 'less']);

gulp.task('default', ['prod']);
