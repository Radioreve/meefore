
	
	var gulp    = require('gulp'),
        gutil   = require('gulp-util'),
        uglify  = require('gulp-uglify'),
        concat  = require('gulp-concat');

       
    gulp.task('lib-js', function(){
    	gulp.src([
    		'public/js/lib/lodash.js',
			'public/js/lib/mousetrap.js',
			'public/js/lib/jquery.js',
				'public/js/lib/joyride.js',
				'public/js/lib/jscrollpane.js',
				'public/js/lib/jquery.cloudinary.js',
				'public/js/lib/jquery.typeahead.js',
				'public/js/lib/typed.js',
				'public/js/lib/waitForImages.min.js',
				'public/js/lib/velocity.min.js',
					'public/js/lib/velocityui.min.js',
			'public/js/lib/moment.min.js'
    		])
    		.pipe(concat('lib.js'))
    		.pipe(uglify())
    		.pipe(gulp.dest('./public/dist'))
    }); 

    gulp.task('src-js', function(){
    	gulp.src([
    		'public/js/src/lj-params.js',
    		'public/js/src/lj-render.js',
    		'public/js/src/lj-domEvents.js',
    		'public/js/src/lj-admin.js',
    		'public/js/src/lj-typeaheads.js',
    		'public/js/src/lj-params.js',
    		'public/js/src/lj-helpers.js',
            'public/js/src/lj-tour.js',
            'public/js/src/lj-landing.js',
    		'public/js/src/lj.js'
    		])
    		.pipe(concat('src.js'))
    		.pipe(gutil.env.type === 'prod' ? uglify() : gutil.noop())
    		.pipe(gulp.dest('./public/dist'))
    }); 

    gulp.task('default', ['lib-js','src-js'], function() {
    	gutil.log('Gulp is running');
    });
