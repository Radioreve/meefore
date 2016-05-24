
	var
        gulp         = require('gulp'),
        gutil        = require('gulp-util'),
        uglify       = require('gulp-uglify'),
        concat       = require('gulp-concat'),
        cssbeautify  = require('gulp-cssbeautify'),
        postcss      = require('gulp-postcss'),
        htmlreplace  = require('gulp-html-replace'),
        rename       = require('gulp-rename'),
        autoprefixer = require('autoprefixer'),
        syncdirs     = require('gulp-directory-sync')
        reset        = require( process.cwd() + '/scripts/reset/reset');
        restore      = require( process.cwd() + '/scripts/restore/restore');

    var config    = require( process.cwd() + '/config/config');
    var NAMESPACE = 'mee'

    // Minifcation of all Javascript files
    gulp.task('min-js', function(){

        var dir_lib = 'public/js/lib/';
        var dir_src = 'public/js/src/';

    	gulp.src([
            // Librairies
    		dir_lib + 'lodash/lodash.js',
            // Sources
            dir_src + 'admin/admin.js'
    		])
    		.pipe(concat( NAMESPACE + '.js'))
            .pipe( process.NODE_ENV === 'production' ? uglify() : gutil.noop() )
    		.pipe(gulp.dest('./public/dist'))
    }); 
    // End minifications javasscrit


    // Minification of all CSS files
    gulp.task('min-css', function(){

        var dir_lib = 'public/css/lib/'
        var dir_src = 'public/css/src/';

        gulp.src([
            // Librairies
            dir_lib + 'jscrollpane/jscrollpane.css',
            // Sources
            dir_src + 'admin/admin.css'
            ])
        .pipe(concat( NAMESPACE + '.css'))
        .pipe(postcss([ autoprefixer ]))
        .pipe(cssbeautify())
        .pipe(gulp.dest('./public/dist'));
    });
    // End minifications css
    

    // Reset database state
    gulp.task('reset-all-db', reset.db.resetAll );
    gulp.task('reset-requests', reset.db.resetRequests );
    gulp.task('reset-all-cache', reset.rd.resetAll );
    gulp.task('restore-before-cache', restore.restoreBeforeCache );
    gulp.task('restore-group-status-cache', restore.restoreGroupStatusCache )

    // Adjusting html staged & prod versions
    // Thank god I dont have to do it manually !
    var replace_tasks = [];
    ['staged','prod'].forEach(function( env_type ){

        var task_name = 'replace-html-' + env_type;
        gulp.task( task_name, function(){

            var fb_app_id     = config.facebook[ env_type ].client_id;
            var pusher_app_id = config.pusher[ env_type ].key;

            gulp.src('./views/index-dev.html')
                .pipe(htmlreplace({
                    'css'           : '<link rel="stylesheet" href="/dist/' + NAMESPACE + '.css" />',
                    'js'            : '<script src="/dist/' + NAMESPACE + '.js"></script>',
                    'header-fb-id'  : fb_app_id,
                    'fb-app-id'     : '\nwindow.facebook_app_id = "%";'.replace('%', fb_app_id ),
                    'pusher-app-id' : '\nwindow.pusher_app_id = "%";\n'.replace('%', pusher_app_id ),
                    'app-env'       : '\nwindow.LJ.app_mode = "%";\n'.replace('%', env_type ),
                    'remove'        : ''
                }))
                .pipe(rename('./index-' + env_type + '.html'))
                .pipe(gulp.dest('./views'));
        });

        replace_tasks.push( task_name );

    });

    gulp.task('replace-html', replace_tasks );
    // End adjusting html staged & prod versions

    gulp.task('syncbots-drive-to-local', function(){  
        var source_dir = '/users/MacLJ/Google\ Drive/Meefore/Bots';
        var dest_dir   = './bots';
        return gulp.src( '' )
                    .pipe( syncdirs( source_dir, dest_dir, { printSummary: true }))
                    .on('error', gutil.log );
    });

    gulp.task('syncbots-local-to-drive', function(){  
        var dest_dir     = '/users/MacLJ/Google\ Drive/Meefore/Bots';
        var source_dir   = './bots';
        return gulp.src( '' )
                    .pipe( syncdirs( source_dir, dest_dir, { printSummary: true }))
                    .on('error', gutil.log );
    });

    gulp.task('watch-syncbots', function(){
        gulp.watch('/users/MacLJ/Google\ Drive/Meefore/Bots/**/**/*.*', ['syncbots-drive-to-local']);
        gulp.watch('./bots/**/**/*.*', ['syncbots-local-to-drive']);
    });


    gulp.task('watch', function(){
        gulp.watch('public/js/**/*.js', ['min-js']);
        gulp.watch('views/index-dev.html', ['replace-html']);
    });



    gulp.task('default', ['watch'], function() {
    	gutil.log('Gulp is running');
    });
