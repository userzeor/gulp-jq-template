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
const uncss = require("gulp-uncss"); // 清除冗余没用的css
const autoprefixer = require("gulp-autoprefixer"); // 加上css样式兼容前缀
const preprocess = require("gulp-preprocess"); // 注入环境变量

const buildBasePath = "./build/";

// 
const CONFIG = process.env.NODE_ENV == 'development' ? require('./config/config.dev.json') : require('./config/config.prd.json');

// 清除文件夹
gulp.task("clean:Build", function () {
  return gulp.src(buildBasePath, { allowEmpty: true }).pipe(clean());
});

//jsmd5，压缩后并用md5进行命名，下面使用revCollector进行路径替换
gulp.task("minifyjsmd5", function () {
  return gulp
    .src("./src/js/**/*.js")
    .pipe(
      preprocess({
        context: {
          // 此处可接受来自调用命令的 NODE_ENV 参数，默认为 development 开发测试环境
          NODE_ENV: process.env.NODE_ENV || "development",
          BASE_URL: CONFIG.BASE_URL
        },
      })
    )
    .pipe(babel({
			presets: ['@babel/preset-env']
		})) // es6转译es5
    .pipe(uglify()) //压缩js到一行
    .pipe(rev()) //文件名加MD5后缀
    .pipe(gulp.dest(buildBasePath + "src/js")) //输出到js目录
    .pipe(rev.manifest("rev-js-manifest.json")) ////生成一个rev-manifest.json
    .pipe(gulp.dest("rev")); //将 rev-manifest.json 保存到 rev 目录内
});

gulp.task("stylus", function () {
  return gulp
    .src("./src/style/**/*.styl")
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
    .pipe(gulp.dest(buildBasePath + "src/style")) //输出到css目录
    .pipe(rev.manifest("rev-styl-manifest.json")) //生成一个rev-manifest.json
    .pipe(gulp.dest("rev")); //将 rev-manifest.json 保存到 rev 目录内
});

//cssmd5，压缩后并用md5进行命名，下面使用revCollector进行路径替换
gulp.task("minifycssmd5", function () {
  return gulp
    .src("./src/css/**/*.css")
    .pipe(
      uncss({
        html: ["page/**/*.html", "index.html"], // 去除没用到的css
      })
    )
    .pipe(autoprefixer())
    .pipe(cleanCSS({ compatibility: "ie8" })) //压缩css到一样
    .pipe(rev()) //文件名加MD5后缀
    .pipe(gulp.dest(buildBasePath + "src/css")) //输出到css目录
    .pipe(rev.manifest("rev-css-manifest.json")) //生成一个rev-manifest.json
    .pipe(gulp.dest("rev")); //将 rev-manifest.json 保存到 rev 目录内
});

//imgmd5，压缩后并用md5进行命名，下面使用revCollector进行路径替换
gulp.task("minifyimgmd5", function () {
  return gulp
    .src([
      "./src/images/**/*.jpg",
      "./src/images/**/*.png",
      "./src/images/**/*.svg",
    ])
    .pipe(rev()) //文件名加MD5后缀
    .pipe(gulp.dest(buildBasePath + "src/images")) //输出到css目录
    .pipe(rev.manifest("rev-img-manifest.json")) //生成一个rev-manifest.json
    .pipe(gulp.dest("rev")); //将 rev-manifest.json 保存到 rev 目录内
});

//使用rev替换成md5文件名，这里包括html和css的资源文件也一起
gulp.task("rev", function () {
  //html，针对js,css,img
  return gulp
    .src(["rev/**/*.json", "index.html"])
    .pipe(revCollector({ replaceReved: true }))
    .pipe(
      gulpif(
        "index.html",
        preprocess({
          context: {
            // 此处可接受来自调用命令的 NODE_ENV 参数，默认为 development 开发测试环境
            NODE_ENV: process.env.NODE_ENV || "development",
            BASE_URL: CONFIG.BASE_URL
          },
        })
      )
    )
    .pipe(gulpif("index.html", gulp.dest(buildBasePath)));
});

gulp.task("rev-html", function () {
  //html，针对js,css,img
  return gulp
    .src(["rev/**/*.json", "./src/page/**/*.html"])
    .pipe(revCollector({ replaceReved: true }))
    .pipe(
      preprocess({
        context: {
          // 此处可接受来自调用命令的 NODE_ENV 参数，默认为 development 开发测试环境
          NODE_ENV: process.env.NODE_ENV || "development",
          BASE_URL: CONFIG.BASE_URL
        },
      })
    )
    .pipe(gulp.dest(buildBasePath + "src/page"));
});

gulp.task("revimg", function () {
  //css，主要是针对img替换
  return gulp
    .src(["rev/**/rev-img-manifest.json", buildBasePath + "src/css/**/*.css"])
    .pipe(revCollector({ replaceReved: true }))
    .pipe(gulp.dest(buildBasePath + "src/css"));
});

//复制lib文件夹到打包目录
gulp.task("copy", function () {
  return gulp
    .src("./src/lib/**/*.js")
    .pipe(gulp.dest(buildBasePath + "src/lib"));
});

//监视文件的变化，有修改时，自动调用default缺省默认任务
gulp.task("watch", function () {
  w(["./src/page/**/*.html", "index.html"], ["rev"]);
  w("./src/js/**/*.js", ["minifyjsmd5", "rev"]);
  w("./src/css/**/*.css", ["minifycssmd5", "rev", "revimg"]);

  function w(path, task) {
    watch(path, gulp.series(task));
  }
});

// 启动web服务
gulp.task("webserver", function () {
  gulp.src("./build/").pipe(
    webserver({
      host: "localhost",
      port: 9000,
      // path: "/build/",
      livereload: true,
      // directoryListing: {
      //   path: "/build/",
      //   enable: true,
      // },
      // fallback: "index.html",
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
  gulp.parallel(
    "watch",
    gulp.series(
      "clean:Build",
      "stylus",
      "minifycssmd5",
      "minifyjsmd5",
      "minifyimgmd5",
      "rev",
      "rev-html",
      "revimg",
      "copy",
      "webserver"
    )
  ),
  function (done) {
    console.log("全部执行完毕");
    done();
  }
);
