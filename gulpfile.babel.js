const webpack = require('webpack-stream');
const gulp = require('gulp');

const pug = require('gulp-pug');

const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const csso = require('gulp-csso');
const autoprefixer = require('autoprefixer');
const smoothscroll = require('postcss-smoothscroll-anchor-polyfill');
const normalize = require('node-normalize-scss');
const sourcemaps = require('gulp-sourcemaps');

const del = require('del');
const rename = require('gulp-rename');

const imagemin = require('gulp-imagemin');
const imageminPngquant = require('imagemin-pngquant');
const svgstore = require('gulp-svgstore');
const webp = require('gulp-webp');

const plumber = require('gulp-plumber');
const browserSync = require('browser-sync');
const webpackConfig = require('./webpack.config');
const uglify = require('gulp-uglify-es');
const gcmq = require('gulp-group-css-media-queries');

const server = browserSync.create();

const pug = () => gulp.src('source/pug/pages/*.pug')
  .pipe(plumber())
  .pipe(pug({
    pretty: true,
  }))
  .pipe(gulp.dest('build'));

exports.pug = pug;

const css = () => gulp.src('source/sass/style.scss')
  .pipe(plumber())
  .pipe(sourcemaps.init())
  .pipe(sass({
    includePaths: normalize.includePaths,
  }))
  .pipe(gcmq())
  .pipe(postcss([
    autoprefixer({
      browsers: [
        'last 2 versions',
        'IE 11',
      ],
    }),
    smoothscroll(),
  ]))
  .pipe(csso())
  .pipe(sourcemaps.write(''))
  .pipe(gulp.dest('build/css'))
  .pipe(server.stream());

exports.css = css;

const clean = () => del('build');

exports.clean = clean;

const copy = () => gulp.src([
  'source/fonts/**/*.{woff,woff2}',
  'source/img/**/*',
  // 'source/json/**/*',
  '!source/img/sprite/*',
  '!source/img/sprite',
  // 'source/favicon.ico',
], {
  base: 'source',
})
  .pipe(gulp.dest('build'));

exports.copy = copy;

const sprite = () => gulp.src('source/img/sprite/*.svg')
  .pipe(svgstore({
    inlineSvg: true,
  }))
  .pipe(rename('sprite.svg'))
  .pipe(gulp.dest('build/img'));

exports.sprite = sprite;

const js = () => gulp.src('source/js/index.js')
  .pipe(webpack(webpackConfig))
  .pipe(gulp.dest('build/js'));

exports.js = js;

const server = () => {
  server.init({
    server: 'build/',
    // online: true,
    // tunnel: 'tunnel',
    port: 8080,
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch('source/sass/**/*.{scss,sass}', gulp.series('css', 'refresh'));
  gulp.watch('source/**/*.pug', gulp.series('pug', 'refresh'));
  gulp.watch('source/img/**/*', gulp.series('copy', 'sprite', 'pug', 'refresh'));
  gulp.watch('source/js/**/*', gulp.series('js', 'refresh'));
};

exports.server = server;

const refresh = (done) => {
  server.reload();
  done();
};

exports.refresh = refresh;

// Таски для отпимизации изображений
const images = () => gulp.src('build/img/**/*.{png,jpg,svg,webp}')
  .pipe(imagemin([
    imageminPngquant({ quality: [0.6, 0.8] }),
    imagemin.jpegtran({ progressive: true }),
    imagemin.svgo({
      plugins: [
        { removeViewBox: false },
      ],
    }),
  ]))
  .pipe(gulp.dest('build/img'));

exports.images = images;

const svg = () => gulp.src('source/img/sprite/*.svg')
  .pipe(imagemin([
    imagemin.svgo({
      plugins: [
        { removeViewBox: false },
      ],
    }),
  ]))
  .pipe(gulp.dest('source/img/sprite'));

exports.svg = svg;

// Конвертация изображений в формат .webp
const webp = () => gulp.src('build/img/**/*.{png,jpg}')
  .pipe(webp({ quality: 90 }))
  .pipe(gulp.dest('build/img'));

exports.webp = webp;

const build = () => {
  gulp.series(
    clean,
    gulp.parallel(
      copy,
      css,
    ),
    gulp.parallel(
      sprite,
      images,
      webp,
    ),
    gulp.parallel(
      pug,
      js,
    ),
  )
};

exports.build = build;

const start = () => {
  gulp.series(
    clean,
    gulp.parallel(
      copy,
      css,
    ),
    // gulp.parallel(
    //   'sprite',
    //   'images',
    //   'webp',
    // ),
    gulp.parallel(
      pug,
      js,
    ),
    server,
  )
};

exports.start = start;
