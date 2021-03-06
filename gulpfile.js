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
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const clean = require('gulp-clean');

//清除dist
gulp.task('clean', function () {
    return gulp.src('dist')
        .pipe(clean())
})

//编译且处理完js文件后返回流
gulp.task('scripts', function () {
    return gulp.src('src/js/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(concat('index.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'))
})

gulp.task('browserify', function () {
    var b = browserify({
        entries: 'dist/js/index.js',
    })

    return b.bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('dist/js'))
})

// 创建一个任务确保JS任务完成之前能够继续响应
// 浏览器重载
gulp.task('js-watch', ['scripts', 'browserify'], reload);

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

// scss编译后的css将注入到浏览器里实现更新
gulp.task('sass', function () {
    return gulp.src("src/css/*.scss")
        .pipe(sass({ sourcemap: true }))
        .pipe(cssnano())
        // .pipe(concat('index.min.css')) 
        .pipe(rename(
            function (path) {
                path.basename += '.min'
            }
        ))
        .pipe(gulp.dest("dist/css"))
        .pipe(filter('**/*.css'))
        .pipe(reload({ stream: true }));
});

//html页面压缩
gulp.task('htmlmin', function () {
    var options = {
        removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
        collapseBooleanAttributes: true,
        removeEmptyAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        minifyJS: true,//压缩页面JS
        minifyCSS: true//压缩页面CSS
    };
    return gulp.src('src/pages/*.html')
        .pipe(htmlmin(options))
        .pipe(gulp.dest('dist'));
});
gulp.task('html-watch', ['htmlmin'], function () {
    reload();
});
// gulp.task('html-watch', ['htmlmin'], reload);
//压缩图片
gulp.task('imagemin', function () {
    return gulp.src('src/images/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/images'))
})


// 静态服务器
gulp.task('serve', ['sass'], function () {
    init({
        server: "./dist/"
    });
    //监视文件变化,自动执行
    gulp.watch("src/css/*.scss", ['sass']);
    gulp.watch("./src/pages/*.html", ['html-watch']);
    gulp.watch('src/js/*.js', ['js-watch']);
    gulp.watch('src/images/*', ['imagemin']);
});

// 代理
gulp.task('browser-sync', function () {
    init({
        proxy: ""
    });
});

gulp.task('default', ['clean'], function () {
    gulp.start('htmlmin', 'imagemin', 'scripts', 'browserify', 'serve');
})
// gulp.task('start', ['htmlmin','imagemin', 'scripts', 'browserify',  'serve']);