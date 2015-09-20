
var yargs = require('yargs'),
    join  = require('path').join,
    gulp = require('gulp'),
    config = {
        paths: {
            scripts: ['src/**/*.ts', 'src/*.ts'],
            tests: ['test/*.spec.js'],
            dest: 'dist'
        }
    },
    args = yargs
            .default('only', undefined)
            .argv;

gulp.task('lint', function() {
    var tslint = require('gulp-tslint');
    return gulp.src(config.paths.scripts)
        .pipe(tslint({
            configuration: require('./tslint')
        }))
        .pipe(tslint.report('verbose'));
});

gulp.task('compile', function() {
    var tsc = require('gulp-typescript'),
        merge = require('merge2'),
        tsStream;

    tsStream = gulp.src(config.paths.scripts)
        .pipe(tsc({
            target: 'es3',
            moduleResolution: 'node',
            module: 'umd',
            declaration: true
        }));

    return merge([
        tsStream.dts.pipe(gulp.dest(config.paths.dest)),
        tsStream.js.pipe(gulp.dest(config.paths.dest))
    ]);
});

gulp.task('test', ['compile'], function() {
    var mocha = require('gulp-mocha');
    return gulp.src(config.paths.tests, {read: false})
        .pipe(mocha({
            reporter: 'spec',
            ui: 'tdd',
            grep: args.only,
            require: [join(__dirname, 'test/babelRegister')]
        }));
});

gulp.task('watch', function() {
    gulp.watch(config.paths.scripts, ['lint', 'test']);;
    gulp.watch(config.paths.tests, ['lint', 'test']);;
});

gulp.task('setup', function(done) {
    var exec = require('child_process').exec;
    exec(join(__dirname, 'node_modules/tsd/build/cli.js') + ' install', 
         function(err, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
            done(err);
        });
});

gulp.task('build', ['lint', 'test']);
