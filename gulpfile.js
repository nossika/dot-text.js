const gulp = require('gulp');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const concat = require('gulp-concat');

gulp.task('package_js', () => {
    gulp.src('DotText.js')
        .pipe(babel({
            presets: ['es2015'],
        }))
        .pipe(concat('DotText.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/..'));
});

gulp.watch(['DotText.js'], ['package_js']);

gulp.task('default', ['package_js'], () => {
    console.log('done');
});

process.on('uncaughtException', function(err) {
    console.log('uncaughtException: ' , err.stack);
});