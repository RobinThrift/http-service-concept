
var gulp   = require('gulp'),
    path   = require('path'),
    config = {
        paths: {
            dest: 'dist',
            scripts: ['src/*.js', 'src/**/*.js'],
            tests: {
                unit: ['test/*.spec.js', 'test/**/*.spec.js']
            }
        },
        eslint: {
            rcPath: path.join(__dirname + '/.eslintrc')
        }
    },
    args   = require('yargs')(process.argv)
                .string('only')
                .default('only', undefined)
                .argv;

gulp.task('scripts:lint', function() {
    var eslint = require('gulp-eslint');

    return gulp.src(config.paths.scripts)
        .pipe(eslint({
            configFile: config.eslint.rcPath
        }))
        .pipe(eslint.format())
        .pipe(eslint.failOnError())
});

gulp.task('scripts:transpile', ['scripts:lint'], function() {
    var babel = require('gulp-babel');

    return gulp.src(config.paths.scripts, {base: './src'})
        .pipe(babel({
            optional: ['runtime']
        }))
        .on('error', function(err) {
            console.error(err);
        })
        .pipe(gulp.dest(config.paths.dest));
});

gulp.task('scripts', ['scripts:transpile']);

gulp.task('scripts:watch', function() {
    gulp.watch(config.paths.scripts, ['scripts']);
});

gulp.task('test:unit', ['scripts'], function() {
    var mocha = require('gulp-mocha');

    return gulp.src(config.paths.tests.unit, {read: false})
        .pipe(mocha({
            reporter: 'spec',
            ui: 'tdd',
            grep: args.only,
            require: [path.join(__dirname, '/test/babelRegister')]
        }));
});

gulp.task('test:unit:watch', function() {
    gulp.watch(config.paths.scripts, ['test:unit']);
    gulp.watch(config.paths.tests.unit, ['test:unit']);
});

gulp.task('test', ['test:unit']);


gulp.task('build', ['scripts:transpile']);
