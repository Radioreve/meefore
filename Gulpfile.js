
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
        users_schema = require( process.cwd() + '/scripts/users/update-schema');


    var config    = require( process.cwd() + '/config/config');
    var NAMESPACE = 'mee'

    // Minifcation of all Javascript files
    gulp.task('min-js', function(){

        var lib_path = 'public/js/lib';
        var src_path = 'public/js/src/**/*.js';

        var lodash         = lib_path + '/lodash/lodash.js';
        var jquery         = lib_path + '/jquery/jquery.js';
        var mousetrap      = lib_path + '/mousetrap/mousetrap.js';
        var jsp            = lib_path + '/jscrollpane/jscrollpane.js';
        var jsp_mousewhell = lib_path + '/jscrollpane/jscrollpane.mousewheel.js';
        var cloudinary     = lib_path + '/cloudinary/jquery.cloudinary.js';
        var typeahead      = lib_path + '/typeahead/jquery.typeahead.js';
        var typed          = lib_path + '/typed/type.js';
        var imagesloaded   = lib_path + '/imagesloaded/imagesloaded.js';
        var velocity       = lib_path + '/velocity/velocity.js';
        var velocity_ui    = lib_path + '/velocity/velocity-ui.js';
        var moment         = lib_path + '/moment/moment.min.js';
        var moment_locale  = lib_path + '/moment/momentwithlocale.js';
        var nouislider     = lib_path + '/nouislider/nouislider.js';
        var pikaday        = lib_path + '/pikaday/pikaday.js';
        var clock          = lib_path + '/countdown/countdown.js';

    	gulp.src([
            // Librairies
    		lodash, jquery, mousetrap, jsp, jsp_mousewhell, cloudinary,
            typeahead, typed, imagesloaded, velocity, velocity_ui, moment,
            moment_locale, pikaday, nouislider, countdown

            // Sources in any order
            src_path

    		])
    		.pipe(concat( NAMESPACE + '.js'))
            .pipe( process.APP_ENV === 'production' ? uglify() : gutil.noop() )
    		.pipe(gulp.dest('./public/dist'))
    }); 
    // End minifications javascript


    // Minification of all CSS files
    gulp.task('min-css', function(){
        
        var lib_path    = 'public/css/lib';
      //  var fontello    = 'public/css/lib/fontello/css/fontello.css';
      //  var flags       = 'public/css/lib/flags/flags.css';
        var hint        = lib_path + '/hint/hint.css';
        var jscrollpane = lib_path + '/jscrollpane/jscrollpane.css';
        var nouislider  = lib_path + '/nouislider/nouislider.css';
        var pikadate    = lib_path + '/pikadate/pikadate.css';
        var typeahead   = lib_path + '/typeahead/typeahead.css';

        var reset       = 'public/css/src/reset.css';
        var common      = 'public/css/src/common.css';
        var media       = 'public/css/src/media.css';

        // Sources, in any order
        var sources     = 'public/css/src/**/*.css';

        gulp.src([
            hint, jscrollpane, nouislider, pikadate, typeahead, reset,
            common,
            sources,
            media
        ])
        .pipe(concat( NAMESPACE + '.css'))
        .pipe(postcss([ autoprefixer ]))
        .pipe(cssbeautify())
        .pipe(gulp.dest('./public/dist'));
    });
    // End minifications css
    

    // Reset database state
    gulp.task('reset-db', reset.db.resetAll );
    gulp.task('reset-requests', reset.db.resetRequests );
    gulp.task('reset-status', reset.db.resetStatus );
    gulp.task('reset-all-cache', reset.rd.resetAll );
    gulp.task('update-user-schema', users_schema.updateSchema );

    // Adjusting html staged & prod versions
    // Thank god I dont have to do it manually !
    var replace_tasks = [];
    [ 'devbuild', 'staged','prod' ].forEach(function( task_type ){

        var suffix    = task_type;
        var env_type  = task_type == "devbuild" ? "dev" : task_type;
        var task_name = 'replace-html-' + task_type;

        var fb_app_id     = config.facebook[ env_type ].client_id;
        var pusher_app_id = config.pusher[ env_type ].key;

        var replace_config = {
            'css'           : '<link rel="stylesheet" href="/dist/' + NAMESPACE + '.css" />',
            'js'            : '<script src="/dist/' + NAMESPACE + '.js"></script>',
            'header-fb-id'  : fb_app_id,
            'fb-app-id'     : '\nwindow.facebook_app_id = "%";'.replace('%', fb_app_id ),
            'pusher-app-id' : '\nwindow.pusher_app_id = "%";\n'.replace('%', pusher_app_id ),
            'app-env'       : '\nwindow.LJ.app_mode = "%";\n'.replace('%', env_type ),
            'remove'        : ''
        };

        gulp.task( task_name, function(){

            gulp.src('./views/index-dev.html')
                .pipe(htmlreplace( replace_config ))
                .pipe(rename('./index-' + suffix + '.html'))
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
        gulp.watch('public/css/**/*.css', ['min-css']);
        gulp.watch('views/index-dev.html', ['replace-html']);
    });

    gulp.task('build', [ "replace-html", "min-css", "min-js" ], function(){
        gutil.log('Gulp done');
    });


    gulp.task('default', ['watch'], function() {
    	gutil.log('Gulp is running');
    });
