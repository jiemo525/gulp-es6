const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const init = browserSync.init;
const filter = require('gulp-filter');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const cssnano = require('gulp-cssnano');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const sass = require('gulp-sass');

//编译并压缩js
gulp.task('scripts', function () {
    return gulp.src('src/js/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(concat('index.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'))
})

//重命名并压缩css
// gulp.task('styles', function () {
//     return gulp.src('src/css/*.css')
//         .pipe(cssnano())
//         .pipe(rename(
//             function (path) {
//                 path.basename += '.min'
//             }
//         ))
//         .pipe(gulp.dest('dist/css'))
// })

gulp.task('browserify', function () {
    var b = browserify({
        entries: 'dist/js/index.js',
    })

    return b.bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('dist/js'))
})

// scss编译后的css将注入到浏览器里实现更新
gulp.task('sass', function () {
    return gulp.src("src/css/*.scss")
        .pipe(sass({sourcemap: true}))
        .pipe(cssnano())
        .pipe(concat('index.min.css'))  
        .pipe(gulp.dest("dist/css"))
        .pipe(filter('**/*.css'))
        .pipe(reload({ stream: true }));
});

//监视文件变化,自动执行
// gulp.task('watch', function() {
//     gulp.watch('src/css/*.css', ['styles']);
//     gulp.watch('src/js/*.js', ['scripts']);
// })

// 静态服务器
gulp.task('serve', ['sass'], function () {
    init({
        server: "./"
    });
    gulp.watch("src/css/*.scss", ['sass']);
    gulp.watch("public/*.html").on('change', reload);
    gulp.watch('src/js/*.js', ['scripts']);
});

// 代理
gulp.task('browser-sync', function () {
    init({
        proxy: ""
    });
});


gulp.task('start', ['scripts', 'browserify', 'serve']);