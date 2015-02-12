
	module.exports = function (grunt) {

		grunt.initConfig({

			pkg: grunt.file.readJSON('package.json'),

			jshint: {
				build: ['Gruntfile.js', 'public/js/*.js']
			},

		    concat: {
		    	dist: {
		    		src: [
		    			'public/js/lib/lodash.js',
		    			'public/js/lib/mousetrap.js',
		    			'public/js/lib/jquery.js',
		    				'public/js/lib/velocity.min.js',
		    					'public/js/lib/velocityui.min.js',
		    				'public/js/lib/jscrollpane.js',
		    				'public/js/lib/jquery.cloudinary.js'
		    		],
		    		dest: 
		    			'public/dist/lib.js'
		    	}
		    },

			uglify: {
		      options: {
		        banner: '/*\n <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n'
		      },
		      build: {
		        files: {
		          'public/dist/lib.min.js': 'public/dist/lib.js'
		        }
		      }
		    }

		});

		grunt.loadNpmTasks('grunt-contrib-jshint');
		grunt.loadNpmTasks('grunt-contrib-concat');
		grunt.loadNpmTasks('grunt-contrib-uglify');
		grunt.loadNpmTasks('grunt-contrib-cssmin');

		grunt.registerTask('default', ['concat','uglify']);

	}