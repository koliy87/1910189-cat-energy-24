import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import squoosh from 'gulp-libsquoosh';
import del from 'del';
import svgo from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import htmlmin from 'gulp-htmlmin';

// Styles

const styles = () => {
  return gulp.src('source/less/style.less', { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// Images

const optimizeImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
    .pipe(squoosh())
    .pipe(gulp.dest('build/img'))
}
const copyImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
    .pipe(gulp.dest('build/img'))
}

//WebP

const createWebP = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
    .pipe(squoosh({
      webp:{}
    }))
    .pipe(gulp.dest('build/img'))
}

//Svg

const svg = () => {
  return gulp.src(['source/img/**/*.svg', '!source/img/icons/*.svg'])
    .pipe(svgo())
    .pipe(gulp.dest('build/img'))
}

const sprite = () => {
  return gulp.src('source/img/icons/*.svg')
    .pipe(svgo())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));
}

//Html

const html = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true}))
    .pipe(gulp.dest('build'));
}

// Copy

const copy = (done) => {
  gulp.src([
    'source/fonts/*.{woff,woff2}',
    'source/*.ico'
  ], {
    base: 'source'
  })
    .pipe(gulp.dest('build'))
  done();
}

//Clean

const clean = () => {
  return del('build');
};

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
    browser: "google chrome",
  });
  done();
}

// Reload

const reload = (done) => {
  browser.reload();
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/*.html', gulp.series(html,reload));
}

//Build

const build = gulp.series (
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    createWebP,
    svg,
    sprite
  ),
);

//Default

export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    createWebP,
    svg,
    sprite
  ),
  gulp.series(
    server,
    watcher
  )
);
