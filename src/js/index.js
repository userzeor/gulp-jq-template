$(() => {
  //   init();
  initEvent();
});

function init() {
  let visitor = {},
    query = getUrlParams();
  if (query.token) {
    visitor = myCrypto.Decrypt(query.token);
    console.log(visitor);
    login({
      resultCode: "1",
      menus: [],
      permissions: [],
      user: { hosHospCode: visitor.code, userName: visitor.user },
    });
  }
}

function initEvent() {
  $("#ext-drugInst").on('click',function (e) {
    goToPage("ext-drugInst")
  });
}

function goToPage(path, type) {
  $(window).attr("location", "src/page/" + path + ".html");
  //   if (
  //     StoreCtrl.instance.loginUser.hosHospCode &&
  //     StoreCtrl.instance.loginUser.userName &&
  //     StoreCtrl.instance.loginUser.hosHospCode != ""
  //   ) {
  //     if (path.indexOf("literature") >= 0)
  //       this.$router.push({ path: path, params: { type: type } });
  //     else {
  //       this.$router.push({ path: path });
  //     }
  //   } else {
  //     this.$Message.error("携带信息不全！！");
  //     this.$router.push("/knowledge");
  //   }
}
