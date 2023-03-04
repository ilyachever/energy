import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgo';
import { deleteAsync } from 'del';
import svgstore from 'gulp-svgstore';
import autoprefixer from 'autoprefixer';
import postcss from 'gulp-postcss';
import browser from 'browser-sync';

// Styles

export const styles = () => {
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

// html

const html = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('build'))
}

// js

const scripts = () => {
  return gulp.src('source/js/*.js')
    .pipe(terser())
    .pipe(gulp.dest('build/js'))
}

// images

const images = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
    .pipe(squoosh())
    .pipe(gulp.dest('build/img'))
}

const copyImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
    .pipe(gulp.dest('build/img'))
}

// webp

const webp = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
    .pipe(squoosh({ webp: true }))
    .pipe(gulp.dest('build/img'))
}

// svg

const svg = () => {
  return gulp.src(['source/img/**/*.svg', '!source/img/sprite/**/*.svg'])
    .pipe(svgo())
    .pipe(gulp.dest('build/img'))
}

// sprite

const sprite = () => {
  return gulp.src('source/img/sprite/**/*.svg')
    .pipe(svgo())
    .pipe(svgstore({ inlineSvg: true }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img/sprite'))
}

// copy

const copy = (done) => {
  gulp.src([
  'source/fonts/*.{woff2,woff}',
  'source/*.ico',
  'source/*.webmanifest',
  ], {
  base: 'source'
  })
  .pipe(gulp.dest('build'))
  done();
  }


// clean

export const clean = () => {
  return deleteAsync('build');
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
  gulp.watch('source/js/*.js', gulp.series(scripts));
  gulp.watch('source/*.html', gulp.series(html, reload));
}


// build

export const build = gulp.series(
clean,
copy,
images,
  gulp.parallel(
  styles,
  html,
  scripts,
  svg,
  sprite,
  webp),
);

// Default

export default gulp.series(
clean,
copy,
copyImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    sprite,
    webp),
gulp.series(
server,
watcher
));
