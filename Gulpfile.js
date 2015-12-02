
	var
        gulp         = require('gulp'),
        gutil        = require('gulp-util'),
        uglify       = require('gulp-uglify'),
        concat       = require('gulp-concat'),
        cssbeautify  = require('gulp-cssbeautify'),
        postcss      = require('gulp-postcss'),
        autoprefixer = require('autoprefixer');


    
    var dir_lib = 'public/js/lib/';
    gulp.task('minify-lib', function(){
    	gulp.src([
    		dir_lib + 'lodash.js',
			dir_lib + 'mousetrap.js',
            dir_lib + 'jquery.js',
            dir_lib + 'pikaday.js',
            dir_lib + 'joyride.js',
            dir_lib + 'jscrollpane.js',
            dir_lib + 'jquery.cloudinary.js',
            dir_lib + 'jquery.typeahead.js',
            dir_lib + 'typed.js',
            dir_lib + 'waitForImages.min.js',
            dir_lib + 'velocity.js',
            dir_lib + 'velocityui.min.js',
            dir_lib + 'moment.min.js',
            dir_lib + 'jscrollpane.mousewheel.js',
            dir_lib + 'momentwithlocale.min.js',
            dir_lib + 'rangeslider.js',
            dir_lib + 'async.min.js',
            dir_lib + 'jquery.bxslider.js'
    		])
    		.pipe(concat('lib.min.js'))
    		// .pipe(uglify())
    		.pipe(gulp.dest('./public/dist'))
    }); 

    var dir_src = 'public/js/src/';
    gulp.task('minify-src', function(){
    	gulp.src([
            dir_src + 'lj-params.js',
            dir_src + 'router/lj-router.js',
            dir_src + 'languages/lj-textsource.js',
            dir_src + 'lj-helpers.js',
            dir_src + 'tpl/lj-render-profile.js',
            dir_src + 'tpl/lj-render-landing.js',
            dir_src + 'tpl/lj-render-user-profile.js',
            dir_src + 'tpl/lj-render-create.js',
            dir_src + 'tpl/lj-render-event.js',
            dir_src + 'tpl/lj-render-typeahead.js',
            dir_src + 'lj-domEvents.js',
            dir_src + 'events/lj-events-chat.js',
            dir_src + 'events/lj-events-settings.js',
            dir_src + 'events/lj-events-groups.js',
            dir_src + 'events/lj-events-filters.js',
            dir_src + 'events/lj-events-preview.js',
            dir_src + 'events/lj-events-tabview.js',
            dir_src + 'events/lj-events-create.js',
            dir_src + 'events/lj-events-map.js',
            dir_src + 'admin/lj-admin.js',
            dir_src + 'typeaheads/lj-typeaheads.js',
            dir_src + 'landing/lj-landing.js',
            dir_src + 'ladder/lj-ladder.js',
            dir_src + 'ui/lj-ui.js',
            dir_src + 'profile/lj-profile.js',
            dir_src + 'settings/lj-settings.js',
            dir_src + 'pusher/lj-pusher.js',
            dir_src + 'errors/lj-errors.js',
            dir_src + 'languages/lj-country.js',
            dir_src + 'languages/lj-languages.js',
            dir_src + 'analytics/lj-analytics.js',
            dir_src + 'intro/lj-intro.js',
            dir_src + 'notifications/lj-notifications.js',
            dir_src + 'init/lj-init.js',
            dir_src + 'lj-junk.js'
    		])
    		.pipe(concat('lj.min.js'))
    		// .pipe(gutil.env.type === 'prod' ? uglify() : gutil.noop())
    		.pipe(gulp.dest('./public/dist'))
    }); 
    
    var dir_css = 'public/css/';
    gulp.task('minify-css', function(){
        gulp.src([
            // dir_css + 'bootstrap.min.css',
            // dir_css + 'reset.css',
            // dir_css + 'jscrollpane.css',
            // dir_css + 'fontello/css/fontello.css',
            // dir_css + 'flags/css/flag-icon.min.css',
            // dir_css + 'hint.css',
            dir_css + 'style.css',
            dir_css + 'landing.css',
            dir_css + 'profile.css',
            dir_css + 'events.css',
            dir_css + 'create.css',
            dir_css + 'search.css',
            dir_css + 'chat.css',
            dir_css + 'media.css',
            dir_css + 'admin.css',
            dir_css + 'modal.css',
            dir_css + 'intro.css',
            dir_css + 'notifications.css'
            // dir_css + 'pikadate.css'
            // dir_css + 'rangeslider/css/rangeslider.css',
            // dir_css + 'css/rangeslider/css/rangeslider.flat.css',
            // dir_css + 'css/bxslider/jquery.bxslider.css'
            ])
        .pipe(concat('post.css'))
        .pipe(postcss([ autoprefixer ]))
        .pipe(cssbeautify())
        .pipe(gulp.dest('./public/dist'));
    });
        

    gulp.task('default', ['minify-lib', 'minify-src', 'minify-css'], function() {
    	gutil.log('Gulp is running');
    });
