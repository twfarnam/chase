
var gulp = require('gulp');

// for css
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var cssmin = require('gulp-cssmin');

// for javascript
var gutil = require('gulp-util');
var browserify = require('browserify');
var stringify = require('stringify');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

// to turn articles into html
var markdown = require('gulp-markdown');
var frontMatter = require('gulp-front-matter');
var layout = require('gulp-layout');


// for server
var browserSync = require('browser-sync');
var reload = browserSync.reload;


// makes minified JS / CSS
gulp.task('build', function() {

  browserify({entries: ['./app/js/index.js']})
    .transform(stringify, {
      appliesTo: { includeExtensions: ['.ejs'] },
    })
    .bundle()
    .on('error', console.error.bind(console))
    .pipe(source('./bundle.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./build'));

  gulp.src('./app/styles.less')
    .pipe(less({paths: [ './app' ]}))
    .on('error', console.error.bind(console))
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
    .pipe(cssmin())
    .pipe(gulp.dest('./build'))
    .pipe(reload({stream: true}));

});

gulp.task('html', function () {
  return gulp.src('./app/index.html')
    .pipe(gulp.dest('./build'))
    .pipe(reload({stream: true}));
});

gulp.task('markdown', function () {
  return gulp.src('./app/markdown/*.md')
    .pipe(frontMatter())
    .pipe(markdown())
    .pipe(layout(function(file) {
      return Object.assign(
        {layout: './app/layout.ejs'},
        file.frontMatter
      );
    }))
    .pipe(gulp.dest('./build'))
    .pipe(reload({stream: true}));
});

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
  .pipe(gulp.dest('./build'))
  .pipe(reload({stream: true}));
});


gulp.task('less', function () {
  return gulp.src('./app/styles.less')
    .pipe(less({paths: [ './app' ]}))
    .on('error', console.error.bind(console))
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
    .pipe(gulp.dest('./build'))
    .pipe(reload({stream: true}));
});


gulp.task('serve', ['html', 'markdown', 'less', 'js'], function() {
  browserSync({server: {baseDir: 'build'}});

  gulp.watch('./app/index.html', ['html']);
  gulp.watch('./app/**/*.less', ['less']);
  gulp.watch(['./app/layout.ejs','./app/markdown/**/*.md'], ['markdown']);
  gulp.watch(['./app/js/**/*.js', './app/js/**/*.ejs'], ['js']);
});

