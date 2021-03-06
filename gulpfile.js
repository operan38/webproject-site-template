let dist = 'dist';
let source = 'src';

let fs = require('fs');

let path = {
	build: {
		html: dist+'/',
		css: dist+'/css/',
		js: dist+'/js/',
		img: dist+'/img/',
		fonts: dist+'/fonts/',
	},
	src: {
		html: [source+'/*.html', '!' + source + '/_*.html'],
		css: source+'/scss/style.scss',
		js: source+'/js/**/*.js',
		img: source+'/img/**/*.{jpg,png,svg,gif,ico,webp}',
		fonts: source+'/fonts/*.ttf',
	},
	watch: {
		html: source+'/**/*.html',
		css: source+'/scss/**/*.scss',
		js: source+'/js/**/*.js',
		img: source+'/img/**/*.{jpg,png,svg,gif,ico,webp}',
	},
	clean: './' + dist + '/'
}

let { src, dest, } = require('gulp'),
	gulp = require('gulp'),
	browserSync = require('browser-sync').create(),
	fileInclude = require('gulp-file-include'), // Подключение html файлов
	del = require('del'), // Удаление
	scss = require('gulp-sass'), // Компиляция scss
	autoprefixer = require('gulp-autoprefixer'), // Автопрефиксы css для браузеров
	groupMedia = require('gulp-group-css-media-queries'), // Перенос css media запросов
	cleanCss = require('gulp-clean-css'), // Сжатие css файла
	rename = require('gulp-rename'), // Переименование файла
	uglify = require('gulp-uglify-es').default, // Сжатие js файла
	imageMin = require('gulp-imagemin'), // Сжатие картинок
	ttf2woff = require('gulp-ttf2woff'), // Конвертер шрифтов woff
	ttf2woff2 = require('gulp-ttf2woff2'), // Конвертер шрифтов woff2
	fonter = require('gulp-fonter'), // Конвертер шрифтов
	concat = require('gulp-concat'),
	babel = require('gulp-babel'),
	sourceMaps = require('gulp-sourcemaps');

function browserSyncFunc() {
	browserSync.init({
		server: {
			baseDir: './' + dist + '/'
		},
		port: 3000,
		notify: false
	})
}

// Очистка dist от неиспользуемых файлов

function cleanFunc() {
	return del(path.clean);
}

// Сборка html файлов в один index.html

function htmlFunc() {
	return src(path.src.html)
		.pipe(fileInclude())
		.pipe(dest(path.build.html))
		.pipe(browserSync.stream())
}

// Сборка scss файлов в style.css и style.min.css

function cssFunc() {
	return src(path.src.css, { sourcemaps: true })
		.pipe(
			scss({
				outputStyle: "expanded"
			})
		)
		.pipe(groupMedia())
		.pipe(
			autoprefixer({
				overrideBrowserslist: ['last 5 versions'],
				cascade: true
			})
		)
		//.pipe(dest(path.build.css)) // Выгрузка не сжатого css файла
		.pipe(cleanCss())
		.pipe(
			rename({
				extname: '.min.css'
			})
		)
		.pipe(dest(path.build.css, { sourcemaps: '.' })) // Выгрузка сжатого css файла
		.pipe(browserSync.stream())
}

// Сборка js файлов в script.js

function jsFunc() {
	return src(path.src.js)
		.pipe(sourceMaps.init())
		.pipe(babel({
            presets: ['@babel/env']
		}))
		.pipe(concat('bundle.js'))
		//.pipe(dest(path.build.js)) // Выгрузка не сжатого js файла
		.pipe(uglify())
		.pipe(
			rename({
				extname: '.min.js'
			})
		)
		.pipe(sourceMaps.write('.'))
		.pipe(dest(path.build.js)) // Выгрузка сжатого js файла
		.pipe(browserSync.stream())
}

// Оптиимизация изображений

function imgFunc() {
	return src(path.src.img)
		.pipe(src(path.src.img))
		.pipe(
			imageMin({
				progressive: true,
				svgoPlugins: [{ removeViewBox: false }],
				interlaced: true,
				optimizationLevel: 3 // 0 - 7
			})
		)
		.pipe(dest(path.build.img)) // Выгрузить изображения
		.pipe(browserSync.stream())
}

// Конвертация шрифтов

function fontFunc() {
	src(path.src.fonts)
		.pipe(ttf2woff())
		.pipe(dest(path.build.fonts));
	return src(path.src.fonts)
		.pipe(ttf2woff2())
		.pipe(dest(path.build.fonts));
}

// Перемещение папки libs в dist

function libsToDistFunc() {
	return src(source + '/libs/**/*.js')
		.pipe(dest(dist + '/libs/'))
}

// Конвертация шрифтов из otf в ttf

gulp.task('otf-ttf', function() {
	return src([source + '/fonts/*.otf'])
		.pipe(fonter({
			formats: ['ttf']
		}))
		.pipe(dest(source + '/fonts/'))
})

// Функция для записи в fonts.scss

function saveFontsStyle() {
	let file_content = fs.readFileSync(source + '/scss/fonts.scss');
	if (file_content == '') {
		fs.writeFile(source + '/scss/fonts.scss', '', cb);
		return fs.readdir(path.build.fonts, function (err, items) {
			if (items) {
				let c_fontname;
				for (let i = 0; i < items.length; i++) {
					let fontname = items[i].split('.');
					fontname = fontname[0];
					if (c_fontname != fontname) {
						fs.appendFile(source + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
					}
					c_fontname = fontname;
				}
			}
		})
	}
}

function cb() {}

// Отслеживание изменений (перезагрузка браузера)

function watchFunc() {
	gulp.watch([path.watch.html], htmlFunc);
	gulp.watch([path.watch.css], cssFunc);
	gulp.watch([path.watch.js], jsFunc);
	gulp.watch([path.watch.img], imgFunc);
}

let build = gulp.series(cleanFunc, gulp.parallel(htmlFunc, cssFunc, jsFunc, imgFunc, fontFunc, libsToDistFunc), saveFontsStyle);
let watch = gulp.parallel(build, watchFunc, browserSyncFunc);

exports.html = htmlFunc;
exports.css = cssFunc;
exports.js = jsFunc;
exports.img = imgFunc;
exports.font = fontFunc;
exports.libsToDistFunc = libsToDistFunc;
exports.saveFontsStyle = saveFontsStyle;

exports.build = build;
exports.watch = watch;

exports.default = watch;