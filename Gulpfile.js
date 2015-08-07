
	
	var gulp = require('gulp'),
       gutil = require('gulp-util'),
      uglify = require('gulp-uglify'),
      concat = require('gulp-concat');

    gulp.task('build-js', function(){
    	gulp.src([
    		'public/js/lib/lodash.js',
			'public/js/lib/mousetrap.js',
			'public/js/lib/jquery.js',
				'public/js/lib/joyride.js',
				'public/js/lib/jscrollpane.js',
				'public/js/lib/jquery.cloudinary.js',
				'public/js/lib/typed.js',
				'public/js/lib/waitForImages.min.js'
				'public/js/lib/velocity.min.js',
					'public/js/lib/velocityui.min.js',
			'public/js/lib/moment.min.js',
    		])
    		.pipe(concat('scripts.js'))
    		//.pipe(uglify())
    		.pipe(gulp.dest('./public/dist/lib.min.js/'))
    });


    gulp.task('default', ['build-js'], function(){});
