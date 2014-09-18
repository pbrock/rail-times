module.exports = function(grunt){

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        less: {
            development:{
                options: {
                    paths: "css"
                },
                files: {
                  "css/base.css": "css/base.less"
                }
            }
        },
        watch: {
            files: 'css/*.less',
            tasks: ['less']
        },
        concat: {
            options: {
              stripBanners: false,
              banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - */\n'
            },
            dist: {
              src: ['js/main.js', 'js/helpers.js'],
              dest: 'js/site.js'
            }
          }
    });
    
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    
    grunt.registerTask('default', ['less','watch']);
};