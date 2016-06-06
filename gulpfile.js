
var gulp = require('gulp');

// for css
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');

// for javascript
var gutil = require('gulp-util');
var browserify = require('browserify');
var stringify = require('stringify');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

// for server
var browserSync = require('browser-sync');
var reload = browserSync.reload;


gulp.task('js', function() {
  return browserify({
    entries: ['./app/js/index.js']
  })
  .transform(stringify, {
    appliesTo: { includeExtensions: ['.ejs'] },
  })
  .bundle()
  .on('error', console.error.bind(console))
  .pipe(source('./bundle.js'))
  // .pipe(buffer())
  // .pipe(uglify())
  .pipe(gulp.dest('./app'))
  .pipe(reload({stream: true}));
});


gulp.task('less', function () {
  return gulp.src('./app/less/styles.less')
    .pipe(less({
      paths: [ './app/less' ]
    }))
    .on('error', console.error.bind(console))
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
    .pipe(gulp.dest('./app'))
    .pipe(reload({stream: true}));
});


gulp.task('serve', ['less', 'js'], function() {
  browserSync({server: {baseDir: 'app'}});

  gulp.watch('./app/*.html').on('change', browserSync.reload);
  gulp.watch('./app/less/**/*.less', ['less']);
  gulp.watch(['./app/js/**/*.js', './app/js/**/*.ejs'], ['js']);
});

