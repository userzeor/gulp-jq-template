const gulp = require("gulp");
const gulpif = require("gulp-if");
const babel = require("gulp-babel"); //把es6语法解析成es5
const stylus = require("gulp-stylus"); // stylus处理
const webserver = require("gulp-webserver"); // web服务
const clean = require("gulp-clean"); // 清除文件
const rev = require("gulp-rev"); //对文件名加MD5后缀
const revCollector = require("gulp-rev-collector"); //路径替换
const uglify = require("gulp-uglify"); //js文件压缩
const cleanCSS = require("gulp-clean-css"); // css文件压缩
const watch = require("gulp-watch"); // 监听
const uncss = require('gulp-uncss'); // 清除冗余没用的css
const autoprefixer = require('gulp-autoprefixer'); // 加上css样式兼容前缀

const buildBasePath = "./build/";

// 清除文件夹
gulp.task("clean:Build", function () {
  return gulp.src(buildBasePath, { allowEmpty: true }).pipe(clean());
});

//jsmd5，压缩后并用md5进行命名，下面使用revCollector进行路径替换
gulp.task("minifyjsmd5", function () {
  return gulp
    .src("./src/assets/js/**/*.js")
    .pipe(babel())
    .pipe(uglify()) //压缩js到一行
    .pipe(rev()) //文件名加MD5后缀
    .pipe(gulp.dest(buildBasePath + "src/assets/js")) //输出到js目录
    .pipe(rev.manifest("rev-js-manifest.json")) ////生成一个rev-manifest.json
    .pipe(gulp.dest("rev")); //将 rev-manifest.json 保存到 rev 目录内
});

gulp.task("stylus", function () {
  return gulp
    .src("./src/assets/style/**/*.styl")
    .pipe(
      stylus({
        compress: true,
        // linenos: true,
        "include css": true,
      })
    ) //stylus转成css
    .pipe(autoprefixer())
    // .pipe(uncss({  
    //     html: ['views/**/*.html', 'index.html']   // 去除没用到的css
    // }))
    .pipe(rev()) //文件名加MD5后缀
    .pipe(gulp.dest(buildBasePath + "src/assets/style")) //输出到css目录
    .pipe(rev.manifest("rev-styl-manifest.json")) //生成一个rev-manifest.json
    .pipe(gulp.dest("rev")); //将 rev-manifest.json 保存到 rev 目录内
});

//cssmd5，压缩后并用md5进行命名，下面使用revCollector进行路径替换
gulp.task("minifycssmd5", function () {
  return gulp
    .src("./src/assets/style/**/*.css")
    .pipe(autoprefixer())
    // .pipe(uncss({  
    //     html: ['views/**/*.html', 'index.html']   // 去除没用到的css
    // }))
    .pipe(cleanCSS({ compatibility: "ie8" })) //压缩css到一样
    .pipe(rev()) //文件名加MD5后缀
    .pipe(gulp.dest(buildBasePath + "src/assets/style")) //输出到css目录
    .pipe(rev.manifest("rev-css-manifest.json")) //生成一个rev-manifest.json
    .pipe(gulp.dest("rev")); //将 rev-manifest.json 保存到 rev 目录内
});

//imgmd5，压缩后并用md5进行命名，下面使用revCollector进行路径替换
gulp.task("minifyimgmd5", function () {
  return gulp
    .src(["./src/assets/images/**/*.jpg", "./src/assets/images/**/*.png"])
    .pipe(rev()) //文件名加MD5后缀
    .pipe(gulp.dest(buildBasePath + "src/assets/images")) //输出到css目录
    .pipe(rev.manifest("rev-img-manifest.json")) //生成一个rev-manifest.json
    .pipe(gulp.dest("rev")); //将 rev-manifest.json 保存到 rev 目录内
});

//使用rev替换成md5文件名，这里包括html和css的资源文件也一起
gulp.task("rev", function () {
  //html，针对js,css,img
  return gulp
    .src(["rev/**/*.json", "views/**/*.html", "index.html"])
    .pipe(revCollector({ replaceReved: true }))
    .pipe(gulpif("index.html", gulp.dest(buildBasePath + "src")))
    .pipe(
      gulpif("views/**/*.html", gulp.dest(buildBasePath + "src/assets/views"))
    );
});

gulp.task("revimg", function () {
  //css，主要是针对img替换
  return gulp
    .src(["rev/**/rev-img-manifest.json", buildBasePath + "src/assets/style/**/**/*.css"])
    .pipe(revCollector({ replaceReved: true }))
    .pipe(gulp.dest(buildBasePath + "src/assets/style"));
});

//复制lib文件夹到打包目录
gulp.task("copy", function () {
  return gulp.src("./src/lib/**/*.js").pipe(gulp.dest(buildBasePath + "src/lib"));
});

//监视文件的变化，有修改时，自动调用default缺省默认任务
gulp.task("watch", function () {
  w("./src/**/*.html", ["rev"]);
  w("./src/assets/js/**/*.js", ["minifyjsmd5", "rev"]);
  w("./src/assets/style/**/*.css", ["minifycssmd5", "rev", "revimg"]);
  w("./src/assets/style/**/*.styl", ["stylus", "rev", "revimg"]);

  function w(path, task) {
    watch(path, gulp.series(task));
  }
});

// 启动web服务
gulp.task("webserver", function () {
  gulp.src("./build/src").pipe(
    webserver({
      host: "localhost",
      port: 9000,
      //   path: "/",
      livereload: true,
      directoryListing: {
        path: "./build/src",
        enable: true,
      },
      open: true,
    })
  );
});

/* Ex:
body
  color: data.red;
*/

// gulp.series：按照顺序执行
// gulp.parallel：可以并行计算

//执行多个任务gulp4的用法 gulp.series()串行，gulp.parallel()并行
gulp.task(
  "default",
  gulp.series(
    "clean:Build",
    "stylus",
    "minifycssmd5",
    "minifyjsmd5",
    "minifyimgmd5",
    "rev",
    "revimg",
    "copy",
    "watch"
    // "webserver"
  ),
  function (done) {
    console.log("全部执行完毕");
    done();
  }
);
