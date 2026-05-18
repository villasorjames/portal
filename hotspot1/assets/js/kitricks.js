var __KS=["true","no-cache","--container","Tue, 01 Jan 1980 1:00:00 GMT","floor","pauseBtn","auto","play","Mpass","vendo_option","style","timeLeft","<button type=\"button\" class=\"btn btn-primary\" onclick=\"insertBtnManual(this)\" data-vendo-ip=\"","setItem","Connecting, Please wait!","charAt","Wifi Rates","http://","ssid","Invalid Voucher","src","send","false","/getRates?date=","pointerEvents","77nUytkD","trial","Unlimited","0h:0m","waitTime","submit","50%","/login","gcashBtn","Settings","mlBody","replace","POST"," Day ","value","/logout","no_internet_settings","[data-dialog]","footer_text","username","loginBy","classList","Content-type","activeVoucher","Voucher checking, Please wait!","internet_status_text","width","#message"," is offline!","none","cookie","indexOf","clear","timer","block","95085GpAhRz","currentTime","textContent","timeAdded","split","[data-insert-coin]","coin.not.inserted","assets/sounds/coinreceived.mp3?date=","<div class=\"inner-wrapper\"><div id=\"min\">","75%","Done Paying","&convertVoucher=","220iNKKGi","assets/sounds/insertcoinbg.mp3?date=","offline","[data-gcash]","Done","--color-primary","Connect","=; Max-Age=-99999999;","erase-cookie=true","Invalid Username or Password!","getElementById","remainTime","[data-wr-close]","href","setProperty","&mac=","onerror","vendoName","[data-ic-close]","getTime","interface","display","loop","Content-Type","documentElement","voucher=","Days ","<td>","#totalCoin","reload","parse","Resume","add",".header","dataset","errorCode","textcolor","footer_link",".btn-group .input-group","pause","[data-ml-close]","removeItem","text/plain","23898ESNSIR","validity","erase-cookie=false","insertcoin","You have been banned from using coin slot, due to multiple request for insert coin, please try again later!","responseText","</div><div>minutes</div></div><div class=\"inner-wrapper\"><div id=\"sec\">","voucher_input","exp","[data-vendo]","tempMac","Error connecting to ","/data/","username=","Connected Successfully!","querySelector","Insert Coin","35032kKpFsY","/api","; expires=","Please Insert Coin","show",", Please check your wifi connection","Login to Connect","Coinslot was cancelled","[data-sv-close]","subscription_prefix","&extendTime=","[data-message]","Not Available","coinslot.busy","[data-ssid]","now","insertBtn","--:--","selectVendo","/topUp","rates","ratesBody","<td><p><b>User:</b></td><td><span>","ratesBtn","/cancelTopUp","innerHTML","dst=&username=T-","onreadystatechange","Muser","&amount=","Converting, Please wait!","</td>"," Days ","hour","Retrying, Please wait!","mac",".progress-bar","--background","totalCoin","100%","<div class=\"d-flex flex-fill align-content-stretch\"><div class=\"inner-wrapper\"><div>UNLIMITED</div><div></div></div></div>","load","readyState","[data-rates]","<div class=\"d-flex flex-fill align-content-stretch\">","memberBtn","setRequestHeader","status","<div class=\"loader\"></div>","auto_pause",".00</td>","<div class=\"d-flex flex-fill align-content-stretch\"><div class=\"inner-wrapper\"><div>Subscription</div><div></div></div></div>","4386195lnUAuG","gcash_payment","Disconnected","internet_status","timeleft","gcAmount","Note: Changes takes effects only after uploading to mikrotik","<div class=\"inner-wrapper\"><div id=\"hr\">","8578ucgAtZ",".txt","30%","Cancel","modal-active","toUTCString","Reading coin, please wait","length","Pause","No Pause Time","activeMac","Force login, Please wait!","invalidUser","settings.json","</div><div>hours</div></div><div class=\"inner-wrapper\"><div id=\"min\">","VendoAddresses","3377940ZAXBfT","[data-gc-pay]","remove","Logout","application/x-www-form-urlencoded","gcNumber","null","custom_theme","no.internet.detected","Checking User...","setInterval","Loading...","GET","</tr>","[data-msg-close]","down","</div><div>seconds</div></div></div>","Processing, Please wait!","coin.is.reading","Error!","<script>","vendoIp","&password=","Retrying, Please Wait!","<tr>","Expires","[data-select-vendo]","min","substring","</div><div>day</div></div>","#validity","Time Paused","#totalTime","Coin slot is busy, Please try again later","pause_button","3672472OYjNEs","[data-member]","Pragma","&ipAddress=","Connected","</div><div>days</div></div>","onclick","open","/useVoucher","</div><div>seconds</div></div>","151enXMxH","Coin slot expired"];
function _0x5873e6(i){return __KS[i-410];}
var voucher = getStorageValue("activeVoucher"),
  activeMac = getStorageValue("activeMac"),
  tempMac = getStorageValue("tempMac"),
  invalidUser = getStorageValue("invalidUser"),
  insertcoinbg = new Audio(),
  coinCount = new Audio(),
  dateNow = Date.now(),
  totalCoinReceived = 0,
  extendTimeCriteria = 0,
  vcTopUp = false,
  voucherToConvert = "",
  macVoucher = "",
  vendorIpAddress = "",
  currency = "",
  apiStatus = "",
  ipAddress = "",
  mac = "",
  macNoColon = "",
  payment_gateway = "",
  portal_key = "",
  internet_status = "",
  intervalID = null,
  timer = null,
  insertingCoin = false,
  insertCoinRetryTimer = null,
  insertCoinDone = false,
  username_only = false,
  pause = false,
  trial = false,
  unlimited = false,
  randomtempMac = false,
  prefix = false,
  coinslotExit = false,
  pause_button = true,
  member_logout_button = true,
  trial_logout_button = true,
  subscription = false,
  subscription_prefix = [],
  body = document.getElementById("body"),
  interfaceName = body.dataset.interface,
  icmodal = document.querySelector("[data-insert-coin]"),
  insertBtn = document.getElementById("insertBtn"),
  svmodal = document.querySelector("[data-select-vendo]"),
  pauseBtn = document.getElementById("pauseBtn"),
  dialog = document.querySelector("[data-dialog]"),
  trlmodal = document.querySelector("[data-trial]"),
  ssid = document.querySelector("[data-ssid]"),
  vendor = document.querySelector("[data-vendo]"),
  selectVendo = document.getElementById("selectVendo"),
  link = document.getElementById("link");
((body.style.display = "none"),
  (pauseBtn.style.pointerEvents = "none"));
var ajaxsettings = new XMLHttpRequest();
function api() {
  var n = _0x5873e6,
    o = document.getElementById("exp"),
    a = document.getElementById("status"),
    i = document.getElementById("timer"),
    r = document.getElementById("memberBtn"),
    s = document.getElementById("userID"),
    e = new XMLHttpRequest();
  (e.open("GET", "/api", true),
    e.send(),
    (e.onreadystatechange = function () {
      var e,
        t = n;
      4 == this.readyState &&
        (200 == this.status
          ? ((e = JSON.parse(this.responseText)),
            (mac = e.mac),
            (macNoColon = replaceAll(mac, ":")),
            (ipAddress = e.ip),
            (a.textContent = e.status),
            (apiStatus = e.status),
            (null != voucher && "" != voucher) || (voucher = macNoColon),
            insertingCoin
              ? ((o.textContent = "Loading..."),
                setTimeout(function () {
                  getValidity(1);
                }, 3e3))
              : getData(1),
            e.status == "Disconnected"
              ? ("yes" == e.trial &&
                  setTimeout(function () {
                    openModal(trlmodal);
                  }, 1e3),
                null !== getCookie("timeLeft") &&
                  ((i.innerHTML = getCookie("timeLeft")),
                  (a.textContent = "Time Paused"),
                  (document.getElementById("memberBtn").style.pointerEvents = "auto"),
                  (pauseBtn.style.display = "block")),
                tempMac !== mac && null !== tempMac && (randomtempMac = true),
                (pauseBtn.style.pointerEvents = "auto"),
                intervalManager(0),
                (r.style.pointerEvents = "auto"),
                (body.style.display = "block"))
              : "Connected" == e.status &&
                ((voucher = e.voucher),
                e.loginBy !== "trial" && setStorageValue("activeVoucher", voucher),
                null !== getCookie("timeLeft") && eraseCookie("timeLeft"),
                removeStorageValue("invalidUser"),
                (r.style.pointerEvents = "none"),
                setStorageValue("tempMac", mac),
                (pause = false),
                (a.textContent = "Connected"),
                (null != activeMac && null != activeMac) ||
                  setStorageValue("activeMac", mac),
                pause_button
                  ? prefix ||
                    ((pauseBtn.style.display = "block"),
                    (pauseBtn.style.pointerEvents = "auto"),
                    (pauseBtn.textContent = "Pause"))
                  : ((pauseBtn.style.display = "none"),
                    (pauseBtn.style.pointerEvents = "none")),
                subscription &&
                  (0 === voucher.indexOf(subscription_prefix[0]) ||
                    0 === voucher.indexOf(subscription_prefix[1]) ||
                    0 === voucher.indexOf(subscription_prefix[2]) ||
                    (0 === voucher.indexOf(subscription_prefix[3]) &&
                      voucher.length < 12)) &&
                  ((insertBtn.style.display = "none"),
                  (pauseBtn.style.display = "none"),
                  (prefix = true),
                  (document.querySelector(".btn-group .input-group").style.display = "none"),
                  (i.innerHTML = "<div class=\"d-flex flex-fill align-content-stretch\"><div class=\"inner-wrapper\"><div>Subscription</div><div></div></div></div>")),
                null != e.timeleft || prefix
                  ? e.loginBy == "trial" || voucher == "T-" + mac
                    ? (intervalManager(true, animate, 1e3),
                      (trial = true),
                      (insertBtn.style.display = "none"),
                      (document.querySelector(".btn-group .input-group").style.display = "none"),
                      trial_logout_button
                        ? ((pauseBtn.style.display = "block"),
                          (pauseBtn.style.pointerEvents = "auto"),
                          (pauseBtn.textContent = "Logout"))
                        : (pauseBtn.style.display = "none"))
                    : prefix ||
                      (intervalManager(true, animate, 1e3),
                      (i.innerHTML = secondsToDhms(e.timeleft)))
                  : ((unlimited = true),
                    intervalManager(0),
                    (i.innerHTML = "<div class=\"d-flex flex-fill align-content-stretch\"><div class=\"inner-wrapper\"><div>UNLIMITED</div><div></div></div></div>"),
                    (insertBtn.style.display = "none"),
                    member_logout_button
                      ? ((pauseBtn.style.display = "block"),
                        (pauseBtn.style.pointerEvents = "auto"),
                        (pauseBtn.textContent = "Logout"))
                      : (pauseBtn.style.display = "none"),
                    (document.querySelector(".btn-group .input-group").style.display = "none")),
                (body.style.display = "block")),
            voucher != macNoColon &&
              (voucher == "T-" + mac
                ? (s.innerHTML = "<td><p><b>User:</b></td><td><b>TRIAL</b></td>")
                : (s.innerHTML = "<td><p><b>User:</b></td><td><span>" + voucher + "</span></td>")))
          : (body.style.display = "block"));
    }));
}
function getInternetStatus(n, o, a, i) {
  var r = _0x5873e6,
    s = document.getElementById("ratesBtn"),
    c = document.querySelector("[data-message]"),
    e = new XMLHttpRequest();
  (e.open("GET", "internetstatus.txt", true),
    e.setRequestHeader("Expires", "Tue, 01 Jan 1980 1:00:00 GMT"),
    e.setRequestHeader("Pragma", "no-cache"),
    (e.onreadystatechange = function () {
      var e,
        t = r;
      4 != this.readyState ||
        200 != this.status ||
        ((e = this.responseText) == "down" &&
          (openModal(c),
          (c.querySelector(".header").textContent = a),
          (document.querySelector("#message").textContent = i),
          n || ((internet_status = e), (s.style.pointerEvents = "auto")),
          o && null !== intervalID && paused(300)));
    }),
    e.send());
}
function getValidity(o) {
  var e,
    t,
    a = _0x5873e6,
    i = document.getElementById("exp");
  5 < o
    ? (i.textContent = "Not Available")
    : ((e =
        null == activeMac || null == activeMac
          ? macNoColon
          : replaceAll(activeMac, ":")),
      (t = new XMLHttpRequest()).open("GET", "/data/" + e + ".txt", true),
      t.setRequestHeader("Expires", "Tue, 01 Jan 1980 1:00:00 GMT"),
      t.setRequestHeader("Pragma", "no-cache"),
      t.send(),
      (t.onreadystatechange = function () {
        var e,
          t,
          n = a;
        4 == this.readyState &&
          (200 == this.status
            ? ((t = (e = this.responseText).split("#")),
              (i.textContent = t[1]),
              50 < e.length &&
                ((i.textContent = "Loading..."),
                setTimeout(function () {
                  getValidity(o + 1);
                }, 1e3)))
            : (i.textContent = "Not Available"));
      }));
}
function getData(o) {
  var e,
    t,
    a = _0x5873e6,
    i = document.getElementById("exp");
  5 < o
    ? fallbackData()
    : ((e =
        null == activeMac || null == activeMac
          ? macNoColon
          : replaceAll(activeMac, ":")),
      btnLoading(pauseBtn),
      (t = new XMLHttpRequest()).open("GET", "/data/" + e + ".txt", true),
      t.setRequestHeader("Expires", "Tue, 01 Jan 1980 1:00:00 GMT"),
      t.setRequestHeader("Pragma", "no-cache"),
      t.send(),
      (t.onreadystatechange = function () {
        var e = a;
        if (4 == this.readyState)
          if (200 == this.status) {
            var t = this.responseText,
              n = t.split("#");
            if (((macVoucher = n[0]), (i.textContent = n[1]), 50 < t.length))
              return (
                (i.textContent = "Loading..."),
                void setTimeout(function () {
                  getData(o + 1);
                }, 1e3)
              );
            "Disconnected" == apiStatus
              ? ((pauseBtn.style.pointerEvents = "auto"),
                pauseBtn.classList.remove("is-loading"),
                (pause = true),
                null == voucher
                  ? ((macVoucher == "null" && "" == macVoucher) ||
                      (voucher = macVoucher),
                    (pauseBtn.textContent = "Connect"))
                  : (pauseBtn.textContent = "Resume"),
                null == invalidUser && getTimeleft())
              : (pauseBtn.classList.remove("is-loading"),
                unlimited || (pauseBtn.textContent = "Pause"));
          } else fallbackData();
      }));
}
function fallbackData() {
  var e = _0x5873e6,
    t = document.getElementById("exp"),
    n = document.getElementById("status");
  apiStatus !== "Connected"
    ? (null == invalidUser && getTimeleft(),
      pauseBtn.classList.remove("is-loading"),
      (pauseBtn.style.pointerEvents = "auto"),
      (pause = true),
      n.textContent == "Disconnected"
        ? (pauseBtn.textContent = "Connect")
        : (pauseBtn.textContent = "Resume"))
    : (pauseBtn.classList.remove("is-loading"),
      (pauseBtn.style.pointerEvents = "auto"),
      (t.textContent = "Not Available"));
}
function getTimeleft() {
  var e = _0x5873e6;
  randomtempMac
    ? setTimeout(function () {
        doConnect(false, false, voucher);
      }, 300)
    : null == getCookie("timeLeft") &&
      setTimeout(function () {
        doConnect(false, true, voucher);
      }, 300);
}
function paused(e) {
  var n = _0x5873e6,
    o = document.getElementById("status");
  ((pauseBtn.style.pointerEvents = "none"),
    (timeleft = document.getElementById("timer")),
    btnLoading(pauseBtn),
    setTimeout(function () {
      var e,
        t = n;
      ((pauseBtn.style.pointerEvents = "auto"),
        pause
          ? doConnect(false, false, voucher)
          : (intervalManager(0),
            (e = new XMLHttpRequest()).open("POST", "/logout", true),
            e.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"),
            e.send("erase-cookie=true"),
            (e.onreadystatechange = function () {
              var e = t;
              4 == this.readyState &&
                200 == this.status &&
                (unlimited
                  ? (removeStorageValue("activeMac"),
                    removeStorageValue("tempMac"),
                    removeStorageValue("activeVoucher"),
                    location.reload())
                  : trial
                    ? location.reload()
                    : ((o.textContent = "Time Paused"),
                      pauseBtn.classList.remove("is-loading"),
                      (pauseBtn.textContent = "Resume"),
                      (document.getElementById("memberBtn").style.pointerEvents = "auto"),
                      setCookie("timeLeft", timeleft.innerHTML, 30),
                      location.replace('/login')));
            }),
            (pause = true)));
    }, e));
}
function doConnect(t, n, e, o) {
  var a = _0x5873e6,
    i = document.querySelector("[data-member]"),
    r = document.getElementById("status");
  t
    ? (closeModal(i),
      openModal(dialog),
      (dialog.querySelector(".progress-bar").style.display = "none"),
      (dialog.querySelector(".header").textContent = "Checking User..."))
    : (o = username_only ? "" : e);
  i = new XMLHttpRequest();
  (i.open("POST", "/login", true),
    (i.onreadystatechange = function () {
      var e = a;
      4 == this.readyState &&
        200 == this.status &&
        ("" != this.responseText.split("<script>")[0]
          ? t
            ? ((dialog.querySelector(".header").textContent = "Invalid Username or Password!"),
              setTimeout(function () {
                closeModal(dialog);
              }, 1500))
            : (null !== getCookie("timeLeft") && eraseCookie("timeLeft"),
              removeStorageValue("activeMac"),
              removeStorageValue("tempMac"),
              removeStorageValue("activeVoucher"),
              (document.getElementById("timer").innerHTML = secondsToDhms(0)),
              (r.textContent = "Disconnected"),
              n
                ? setStorageValue("invalidUser", "true")
                : ((dialog.querySelector(".progress-bar").style.display =
                    "none"),
                  openModal(dialog),
                  (dialog.querySelector(".header").textContent =
                    "Invalid Voucher!"),
                  setTimeout(function () {
                    (pauseBtn.classList.remove("is-loading"),
                    (pauseBtn.textContent = "Connect"),
                    closeModal(dialog));
                  }, 1500)))
          : (t
              ? ((dialog.querySelector(".header").textContent = "Connected Successfully!"),
                setTimeout(function () {
                  location.reload();
                }, 1500))
              : n && paused(300),
            api()));
    }),
    i.send("username=" + e + "&password=" + (typeof chapId !== "undefined" && chapId !== "" ? hexMD5(chapId + o + chapChallenge) : o)));
}
function forceLogin() {
  var e = _0x5873e6,
    t = document.querySelector("[data-dialog]");
  ((t.querySelector(".progress-bar").style.width = "100%"),
    (t.querySelector(".header").textContent = "Done"),
    setTimeout(function () {
      (closeModal(t), api());
    }, 250));
}
function insertBtnManual(e) {
  var t = _0x5873e6,
    n = e.dataset,
    o = document.querySelector("[data-ssid]"),
    e = document.querySelector("[data-vendo]");
  (closeModal(svmodal),
    btnLoading(insertBtn),
    (vendorIpAddress = n.vendoIp),
    (o.innerHTML = n.ssid),
    (e.innerHTML = n.vendoName),
    (vcTopUp = false),
    insertCoin(0),
    setStorageValue("vendoIp", n.vendoIp),
    setStorageValue("ssid", n.ssid),
    setStorageValue("vendoName", n.vendoName));
}
function insertCoin(n) {
  var o = _0x5873e6;
  if (0 == n) {
    insertCoinDone = false;
    if (null != insertCoinRetryTimer) {
      clearTimeout(insertCoinRetryTimer);
      insertCoinRetryTimer = null;
    }
  }
  if (insertCoinDone || (insertingCoin && 0 == n)) {
    return false;
  }
  ((document.querySelector("#totalTime").textContent = "--:--"),
    (document.querySelector("#validity").textContent = "--:--"),
    removeStorageValue("invalidUser"));
  var t = getStorageValue("activeVoucher");
  extendTimeCriteria = null == t ? 0 : 1;
  t = new XMLHttpRequest();
  return (
    t.open("POST", "http://" + vendorIpAddress + "/topUp", true),
    (t.timeout = 6000 + n * 2000),
    t.setRequestHeader("Content-type", "application/x-www-form-urlencoded"),
    (t.onreadystatechange = function () {
      var e,
        t = o;
      4 == this.readyState &&
        200 == this.status &&
        ((e = JSON.parse(this.responseText)).status == "true"
          ? (vcTopUp
              ? ((dialog.querySelector(".progress-bar").style.display = "block"),
                (dialog.querySelector(".progress-bar").style.width = "10%"),
                (dialog.querySelector(".header").textContent = "Voucher checking, Please wait!"),
                convertextVoucher(),
                openModal(dialog))
              : (audioPlay(true),
                (coinslotExit = false),
                (icmodal.querySelector(".header").textContent = "Please Insert Coin"),
                (insertBtn.style.pointerEvents = "auto"),
                insertBtn.classList.remove("is-loading"),
                (insertBtn.textContent = "Insert Coin"),
                (icmodal.querySelector(".progress-bar").style.width = "100%"),
                (document.querySelector("[data-ic-close]").textContent = "Cancel"),
                null == timer &&
                  (timer = window.setInterval(function () {
                    checkCoin();
                  }, 1e3)),
                openModal(icmodal)),
            (insertCoinDone = true),
            null != insertCoinRetryTimer &&
              (clearTimeout(insertCoinRetryTimer),
              (insertCoinRetryTimer = null)),
            (voucher = e.voucher),
            (insertingCoin = true))
          : (notifyCoinSlotError(e.errorCode),
            (timer = null),
            clearInterval(timer)));
    }),
    (t.onerror = t.ontimeout = function () {
      if (insertCoinDone) {
        return;
      }
      if (null == vendorIpAddress || "" == vendorIpAddress) {
        openModal(dialog);
        dialog.querySelector(".progress-bar").style.display = "none";
        dialog.querySelector(".header").textContent =
          "No vendo selected. Please choose a location and try again.";
        setTimeout(function () {
          closeModal(dialog);
        }, 2e3);
        insertBtn.classList.remove("is-loading");
        insertBtn.textContent = "Insert Coin";
        insertBtn.style.pointerEvents = "auto";
        return;
      }
      openModal(dialog),
        (dialog.querySelector(".progress-bar").style.display = "none"),
        (dialog.querySelector(".header").textContent =
          vendor.textContent +
          " is not responding. Check that the NodeMcu is on and connected, then try."),
        setTimeout(function () {
          closeModal(dialog);
        }, 5e3),
        (insertingCoin = false),
        clearInterval(timer),
        (timer = null),
        insertBtn.classList.remove("is-loading"),
        (insertBtn.textContent = "Insert Coin"),
        (insertBtn.style.pointerEvents = "auto");
    }),
    t.send(
      "voucher=" +
        voucher +
        "&mac=" +
        mac +
        "&ipAddress=" +
        ipAddress +
        "&extendTime=" +
        extendTimeCriteria,
    ),
    (totalCoinReceived = 0),
    false
  );
}
function checkCoin() {
  var s = _0x5873e6,
    e = new XMLHttpRequest();
  (e.open("POST", "http://" + vendorIpAddress + "/checkCoin", true),
    e.setRequestHeader("Content-type", "application/x-www-form-urlencoded"),
    e.send("voucher=" + voucher),
    (e.onreadystatechange = function () {
      var e,
        t,
        n,
        o,
        a,
        i,
        r = s;
      4 == this.readyState &&
        200 == this.status &&
        ((e = JSON.parse(this.responseText)),
        (totalCoinReceived = parseInt(e.totalCoin)),
        vcTopUp
          ? "true" == e.status
            ? (setStorageValue("activeVoucher", voucher),
              null !== intervalID &&
                (intervalManager(0),
                (a = new XMLHttpRequest()).open("POST", "/logout", true),
                a.send("erase-cookie=false")))
            : "coin.not.inserted" == e.errorCode
              ? donepaying()
              : e.errorCode == "coinslot.busy"
                ? (clearInterval(timer),
                  0 == totalCoinReceived
                    ? insertCoinhidden(true, "Coinslot was cancelled")
                    : donepaying())
                : clearInterval(timer)
          : ((t = document.querySelector("#validity")),
            (n = document.querySelector("[data-ic-close]")),
            (o = document.querySelector("#totalTime")),
            "true" == e.status
              ? ((n.style.pointerEvents = "none"),
                setStorageValue("activeVoucher", voucher),
                null !== intervalID &&
                  (intervalManager(0),
                  (i = new XMLHttpRequest()).open("POST", "/logout", true),
                  i.send("erase-cookie=false")),
                (document.querySelector("#totalCoin").textContent =
                  currency + " " + e.totalCoin),
                0 == e.timeAdded
                  ? (o.textContent = "--:--")
                  : (o.textContent = credits(parseInt(e.timeAdded))),
                0 == e.validity
                  ? (t.textContent = "--:--")
                  : (t.textContent = credits(parseInt(60 * e.validity))),
                coindropPlay())
              : e.errorCode == "coin.is.reading"
                ? ((icmodal.querySelector(".header").textContent = "Reading coin, please wait"),
                  (n.textContent = "Wait"),
                  (n.style.pointerEvents = "none"))
                : e.errorCode == "coin.not.inserted"
                  ? ((totalCoinReceived = parseInt(e.totalCoin)),
                    (n.style.pointerEvents = "auto"),
                    coinslotExit || (icmodal.querySelector(".header").textContent = "Please Insert Coin"),
                    (a = parseInt(parseInt(e.remainTime) / 1e3)),
                    (i = parseFloat(e.waitTime)),
                    (i = parseInt(((1e3 * a) / i) * 100)),
                    0 < totalCoinReceived && (n.textContent = "Done Paying"),
                    0 == a
                      ? 0 < totalCoinReceived
                        ? donepaying()
                        : insertCoinhidden(true, "Coin slot expired")
                      : ((document.querySelector("#totalCoin").textContent =
                          currency + " " + e.totalCoin),
                        0 == e.timeAdded
                          ? (o.textContent = "--:--")
                          : (o.textContent = credits(parseInt(e.timeAdded))),
                        0 == e.validity
                          ? (t.textContent = "--:--")
                          : (t.textContent = credits(
                              parseInt(60 * e.validity),
                            )),
                        (icmodal.querySelector(".progress-bar").style.width = i + "%")))
                  : e.errorCode == "coinslot.busy"
                    ? (audioPlay(false),
                      clearInterval(timer),
                      0 == totalCoinReceived
                        ? insertCoinhidden(true, "Coinslot was cancelled")
                        : donepaying())
                    : clearInterval(timer)));
    }));
}
function donepaying() {
  var e,
    t = _0x5873e6;
  0 < totalCoinReceived
    ? (vcTopUp || (audioPlay(false), closeModal(icmodal)),
      clearInterval(timer),
      (timer = null),
      openModal(dialog),
      (dialog.querySelector(".progress-bar").style.width = "50%"),
      (dialog.querySelector(".header").textContent = "Processing, Please wait!"),
      (e = new XMLHttpRequest()).open(
        "POST",
        "http://" + vendorIpAddress + "/useVoucher",
        true,
      ),
      e.setRequestHeader("Content-type", "application/x-www-form-urlencoded"),
      e.send("voucher=" + voucher),
      (e.onreadystatechange = function () {
        var e = t;
        4 == this.readyState &&
          200 == this.status &&
          (JSON.parse(this.responseText).status == "true"
            ? ((dialog.querySelector(".progress-bar").style.width = "75%"),
              (dialog.querySelector(".header").textContent = "Connecting, Please wait!"),
              setTimeout(function () {
                forceLogin();
              }, 250))
            : insertCoinhidden(false));
      }),
      (e.onerror = function () {
        var e = t;
        ((dialog.querySelector(".progress-bar").style.width = "75%"),
          (dialog.querySelector(".header").textContent = "Force login, Please wait!"),
          setTimeout(function () {
            forceLogin();
          }, 3e3));
      }))
    : insertCoinhidden(false);
}
function convertextVoucher() {
  var n = _0x5873e6,
    e = document.getElementById("username").value;
  voucherToConvert = e;
  e = new XMLHttpRequest();
  (e.open("POST", "http://" + vendorIpAddress + "/convertVoucher", true),
    e.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"),
    e.send("voucher=" + voucher + "&convertVoucher=" + voucherToConvert),
    (e.onreadystatechange = function () {
      var t = n;
      4 == this.readyState &&
        200 == this.status &&
        (JSON.parse(this.responseText).status == "false"
          ? insertCoinhidden(true, "Invalid Voucher")
          : null == timer &&
            (timer = window.setInterval(function () {
              var e = t;
              ((dialog.querySelector(".progress-bar").style.width = "30%"),
                (dialog.querySelector(".header").textContent = "Converting, Please wait!"),
                checkCoin());
            }, 1e3)),
        (document.getElementById("username").value = ""));
    }),
    (e.onerror = function () {
      var e = n;
      document.getElementById("username").value = "";
    }));
}
function insertCoinhidden(e, t) {
  var n = _0x5873e6;
  (closeModal(icmodal),
    clearInterval(timer),
    (timer = null),
    (insertingCoin = false),
    vcTopUp || audioPlay(false),
    e &&
      ((dialog.querySelector(".progress-bar").style.display = "none"),
      openModal(dialog),
      (coinslotExit = true),
      (dialog.querySelector(".header").textContent = t),
      setTimeout(function () {
        closeModal(dialog);
      }, 2e3)),
    0 == totalCoinReceived && cancelTopUp());
}
function cancelTopUp() {
  var e = _0x5873e6,
    t = new XMLHttpRequest();
  (t.open("POST", "http://" + vendorIpAddress + "/cancelTopUp", true),
    t.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"),
    t.send("voucher=" + voucher + "&mac=" + mac));
}
function getWifiRate(n) {
  var d = _0x5873e6,
    p = document.getElementById("ratesBtn"),
    m = document.getElementById("ratesBody");
  ((document.getElementById("ratesBody").style.display = "block"),
    (p.style.pointerEvents = "none"),
    (m.style.display = "none"),
    (wrmodal = document.querySelector("[data-rates]")),
    btnLoading(p));
  var e = new XMLHttpRequest();
  (e.open("GET", "http://" + vendorIpAddress + "/getRates?date=" + Date.now(), true),
    e.setRequestHeader("Content-type", "text/plain"),
    e.send(),
    (e.onreadystatechange = function () {
      var s = d;
      if (4 == this.readyState && 200 == this.status) {
        var e = this.responseText;
        ((p.style.pointerEvents = "auto"),
          (m.style.display = "block"),
          p.classList.remove("is-loading"),
          (p.textContent = "Wifi Rates"),
          (wrmodal.querySelector(".header").textContent = "Wifi Rates"),
          openModal(wrmodal));
        var t,
          n = e.split("|"),
          o = "";
        for (t in n) {
          var a = n[t].split("#"),
            i = 60 * parseInt(a[2]),
            r = 60 * parseInt(a[3]);
          function c(e) {
            var t = s,
              n = Math.floor(e / 86400),
              o = Math.floor((e % 86400) / 3600),
              a = Math.floor((e % 3600) / 60),
              i = 0 < n ? n + (1 === n ? "Day " : "Days ") : "",
              r = 0 < o ? o + "" : "0",
              e = 0 < a ? a + "" : "0";
            return 0 < n && 0 == o && 0 == a
              ? i
              : 0 < a && 0 == o && 0 == n
                ? e + "min"
                : 0 < o && 0 == a && 0 == n
                  ? r + "hour"
                  : i + r + "h:" + e + "m";
          }
          var l = c(i),
            u = c(r);
          "0h:0m" == u && (u = "");
          (o =
              (o =
                (o = (o += "<tr>") + "<td>" + currency + " " + a[1] + ".00</td>") +
                "<td>" +
                l +
                "</td>") +
              "<td>" +
              u +
              "</td>"),
            (o += "</tr>"),
            (document.getElementById("rates").innerHTML = o);
        }
      }
    }),
    (e.onerror = function () {
      var e = d,
        t = document.getElementById("ratesBtn");
      n < 4
        ? (openModal(wrmodal),
          (wrmodal.querySelector(".header").textContent = "Retrying, Please wait!"),
          setTimeout(function () {
            getWifiRate(n + 1);
          }, 1e3))
        : ((wrmodal.querySelector(".header").textContent =
            "Wifi rates is not availabe at this moment."),
          setTimeout(function () {
            closeModal(wrmodal);
          }, 2e3),
          (t.style.pointerEvents = "auto"),
          t.classList.remove("is-loading"),
          (t.textContent = "Wifi Rates"));
    }));
}
(ajaxsettings.open("GET", "settings.json", true),
  ajaxsettings.setRequestHeader("Expires", "Tue, 01 Jan 1980 1:00:00 GMT"),
  ajaxsettings.setRequestHeader("Pragma", "no-cache"),
  ajaxsettings.send(),
  (ajaxsettings.onreadystatechange = function () {
    var e = _0x5873e6;
    if (4 == this.readyState && 200 == this.status) {
      var t = JSON.parse(this.responseText);
      if (
        ((pause_button = t.Settings.pause_button),
        (member_logout_button = t.Settings.member_logout_button),
        (trial_logout_button = t.Settings.trial_logout_button),
        (currency = t.Settings.currency),
        (username_only = t.Settings.username_only),
        (link.href = t.Settings.footer_link),
        (link.textContent = t.Settings.footer_text),
        t.Settings.custom_theme &&
          (document.documentElement.style.setProperty("--background", t.custom_theme.background),
          document.documentElement.style.setProperty("--container", t.custom_theme.container),
          document.documentElement.style.setProperty("--color-primary", t.custom_theme.color),
          document.documentElement.style.setProperty(
            "--text-color",
            t.custom_theme.textcolor,
          )),
        t.Settings.gcash_payment
          ? ((payment_gateway = t.gcash_payment.payment_gateway),
            (portal_key = t.gcash_payment.portal_key))
          : (document.getElementById("gcashBtn").style.display = "none"),
        t.Settings.voucher_input ||
          (document.querySelector(".btn-group .input-group").style.display =
            "none"),
        t.Settings.internet_status &&
          getInternetStatus(
            t.no_internet_settings.insertcoin,
            t.no_internet_settings.auto_pause,
            t.no_internet_settings.internet_status_tittle,
            t.no_internet_settings.internet_status_text,
          ),
        t.Settings.subscription &&
          ((subscription = true), (subscription_prefix = t.subscription_prefix)),
        0 == t.Settings.vendo_option)
      )
        ((ssid.innerHTML = t.VendoAddresses[0].ssid),
          (vendor.textContent = t.VendoAddresses[0].vendoName),
          (vendorIpAddress = t.VendoAddresses[0].vendoIp));
      else if (1 == t.Settings.vendo_option) {
        ((autoSelect = false),
          null == getStorageValue("vendoIp")
            ? ((vendorIpAddress = t.VendoAddresses[0].vendoIp),
              (ssid.innerHTML = t.VendoAddresses[0].ssid),
              (vendor.innerHTML = t.VendoAddresses[0].vendoName),
              setStorageValue("vendoIp", t.VendoAddresses[0].vendoIp),
              setStorageValue("ssid", t.VendoAddresses[0].ssid),
              setStorageValue("vendoName", t.VendoAddresses[0].vendoName))
            : ((vendorIpAddress = getStorageValue("vendoIp")),
              (ssid.innerHTML = getStorageValue("ssid")),
              (vendor.innerHTML = getStorageValue("vendoName"))));
        for (var n = 0; n < t.VendoAddresses.length; n++)
          selectVendo.innerHTML =
            selectVendo.innerHTML +
            "<button type=\"button\" class=\"btn btn-primary\" onclick=\"insertBtnManual(this)\" data-vendo-ip=\"" +
            t.VendoAddresses[n].vendoIp +
            '" data-ssid="' +
            t.VendoAddresses[n].ssid +
            '" data-vendo-name="' +
            t.VendoAddresses[n].vendoName +
            '">' +
            t.VendoAddresses[n].vendoName +
            "</button>";
      } else if (2 == t.Settings.vendo_option)
        for (n = 0; n < t.VendoAddresses.length; n++) {
          var o = interfaceName;
          t.VendoAddresses[n].interfaceName == o &&
            ((ssid.innerHTML = t.VendoAddresses[n].ssid),
            (vendor.textContent = t.VendoAddresses[n].vendoName),
            (vendorIpAddress = t.VendoAddresses[n].vendoIp));
        }
      (1 !== t.Settings.vendo_option &&
        ((autoSelect = true),
        removeStorageValue("vendoIp"),
        removeStorageValue("ssid"),
        removeStorageValue("vendoName")),
        api());
    }
  }),
  (ajaxsettings.onerror = function () {
    var e = _0x5873e6;
    ((body.style.display = "block"), alert("Note: Changes takes effects only after uploading to mikrotik"));
  }),
  (insertBtn.onclick = function () {
    var e = _0x5873e6;
    autoSelect
      ? (btnLoading(insertBtn),
        (vcTopUp = false),
        insertCoin(0))
      : internet_status == "down"
        ? notifyCoinSlotError("no.internet.detected")
        : openModal(svmodal);
  }),
  (document.querySelector("[data-ic-close]").onclick = function () {
    donepaying();
  }),
  (document.querySelector("[data-sv-close]").onclick = function () {
    closeModal(svmodal);
  }),
  (document.querySelector("[data-wr-close]").onclick = function () {
    var e = _0x5873e6;
    closeModal(document.querySelector("[data-rates]"));
  }),
  (document.querySelector("[data-ml-close]").onclick = function () {
    var e = _0x5873e6;
    closeModal(document.querySelector("[data-member]"));
  }),
  (document.querySelector("[data-msg-close]").onclick = function () {
    var e = _0x5873e6;
    closeModal(document.querySelector("[data-message]"));
  }),
  (pauseBtn.onclick = function () {
    paused(1e3);
  }),
  (document.getElementById("ratesBtn").onclick = function () {
    getWifiRate(0);
  }),
  (document.getElementById("gcashBtn").onclick = function () {
    var e = _0x5873e6;
    openModal(document.querySelector("[data-gcash]"));
  }),
  (document.querySelector("[data-gc-close]").onclick = function () {
    var e = _0x5873e6;
    closeModal(document.querySelector("[data-gcash]"));
  }),
  (document.querySelector("[data-gc-pay]").onclick = function () {
    var e = _0x5873e6,
      t = document.getElementById("gcNumber").value,
      n = document.getElementById("gcAmount").value;
    location.href =
      payment_gateway +
      "?portal_key=" +
      portal_key +
      "&mobile=" +
      t +
      "&amount=" +
      n;
  }),
  (document.getElementById("memberBtn").onclick = function () {
    var e = _0x5873e6,
      t = document.querySelector("[data-member]");
    ((document.getElementById("mlBody").style.display = "block"),
      (t.querySelector(".header").textContent = "Login to Connect"),
      openModal(t));
  }),
  (document.querySelector("[data-login]").onclick = function () {
    var e = _0x5873e6;
    doConnect(
      true,
      false,
      document.getElementById("Muser").value,
      document.getElementById("Mpass").value,
    );
  }),
  (document.getElementById("submit").onclick = function () {
    var e = _0x5873e6,
      t = document.getElementById("username").value;
    internet_status == "down"
      ? notifyCoinSlotError("no.internet.detected")
      : "" == t
        ? (openModal(dialog),
          (dialog.querySelector(".progress-bar").style.display = "none"),
          (dialog.querySelector(".header").textContent = "Invalid Voucher!"),
          setTimeout(function () {
            closeModal(dialog);
          }, 2e3))
        : ((vcTopUp = true), insertCoin(0));
  }),
  (document.querySelector("[data-claim]").onclick = function () {
    var n = _0x5873e6;
    (btnLoading(this),
      setTimeout(function () {
        var e = n,
          t = new XMLHttpRequest();
        (t.open("POST", "/login", true),
          t.send("dst=&username=T-" + mac + (typeof chapId !== "undefined" && chapId !== "" ? "&password=" + hexMD5(chapId + "" + chapChallenge) : "")),
          location.reload());
      }, 1e3));
  }),
  (document.querySelector("[data-trl-close]").onclick = function () {
    closeModal(trlmodal);
  }));
var animate = function () {
  var n = _0x5873e6,
    e = new XMLHttpRequest();
  (e.open("GET", "/api", true),
    e.send(),
    (e.onreadystatechange = function () {
      var e,
        t = n;
      4 === this.readyState &&
        200 === this.status &&
        ((e = JSON.parse(this.responseText)),
        null == getStorageValue("ip")
          ? setStorageValue("ip", e.ip)
          : getStorageValue("ip") !== e.ip &&
            (removeStorageValue("ip"), location.reload()),
        (mac = e.mac),
        (macNoColon = replaceAll(mac, ":")),
        (ipAddress = e.ip),
        (document.getElementById("timer").innerHTML = secondsToDhms(e.timeleft)),
        (document.getElementById("status").textContent = e.status),
        "Disconnected" == e.status && intervalManager(0),
        0 == e.timeleft &&
          ((e = new XMLHttpRequest()).open("POST", "/logout", true),
          e.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"),
          e.send("erase-cookie=true"),
          (e.onreadystatechange = function () {
            var e = t;
            4 == this.readyState && 200 == this.status && location.reload();
          }),
          null !== getCookie("timeLeft") && eraseCookie("timeLeft"),
          removeStorageValue("activeMac"),
          removeStorageValue("tempMac"),
          removeStorageValue("activeVoucher")),
        pause_button
          ? !prefix &&
            trial &&
            trial_logout_button &&
            ((pauseBtn.style.display = "block"),
            (pauseBtn.style.pointerEvents = "auto"))
          : ((pauseBtn.style.display = "none"),
            (pauseBtn.style.pointerEvents = "none")));
    }),
    (e.onerror = function () {
      notifyCoinSlotError("offline");
    }));
};
function intervalManager(e, t, n) {
  e
    ? ((intervalID = setInterval(t, n)), (pauseBtn.textContent = "Pause"))
    : (clearInterval(intervalID), (intervalID = null));
}
function audioPlay(e) {
  var t = _0x5873e6;
  4 === insertcoinbg.readyState
    ? e
      ? insertcoinbg.play()
      : (insertcoinbg.pause(), (insertcoinbg.currentTime = 0))
    : ((insertcoinbg.src = "assets/sounds/insertcoinbg.mp3?date=" + Date.now()),
      insertcoinbg.load(),
      (insertcoinbg.loop = true),
      insertcoinbg.play());
}
function coindropPlay() {
  var e = _0x5873e6;
  4 === coinCount.readyState
    ? coinCount.play()
    : ((coinCount.src = "assets/sounds/coinreceived.mp3?date=" + Date.now()),
      coinCount.load(),
      coinCount.play());
}
function credits(e) {
  var t = _0x5873e6;
  e = Number(e);
  var n = Math.floor(e / 86400),
    o = Math.floor((e % 86400) / 3600),
    e = Math.floor((e % 3600) / 60);
  return (
    (0 < n ? n + (1 == n ? " Day " : " Days ") : "") +
    "" +
    (0 < o ? o + "" : "0") +
    "h:" +
    (0 < e ? e + "" : "0") +
    "m"
  );
}
function secondsToDhms(e) {
  var t = _0x5873e6;
  e = Number(e);
  var n = Math.floor(e / 86400),
    o = Math.floor((e % 86400) / 3600),
    a = Math.floor((e % 3600) / 60),
    i = Math.floor(e % 60);
  (n < 10 && (n = "0" + n),
    o < 10 && (o = "0" + o),
    a < 10 && (a = "0" + a),
    i < 10 && (i = "0" + i));
  ((e =
    0 < n
      ? '<div class="inner-wrapper"><div id="day">' + n + (1 == n ? "</div><div>day</div></div>" : "</div><div>days</div></div>")
      : ""),
    (a = 0 < a ? a + "" : "00"),
    (i = 0 < i ? i + "" : "00"));
  if (0 < n && 0 == o) {
    var r = 0 < o ? o + "" : "00";
    return "<div class=\"d-flex flex-fill align-content-stretch\">" + e + "<div class=\"inner-wrapper\"><div id=\"hr\">" + r + "</div><div>hours</div></div><div class=\"inner-wrapper\"><div id=\"min\">" + a + "</div><div>minutes</div></div><div class=\"inner-wrapper\"><div id=\"sec\">" + i + "</div><div>seconds</div></div>";
  }
  return (
    '<div class="d-flex flex-fill align-content-stretch">' +
    e +
    (r = 0 < o ? "<div class=\"inner-wrapper\"><div id=\"hr\">" + o + "</div><div>hours</div></div>" : "") +
    "<div class=\"inner-wrapper\"><div id=\"min\">" +
    a +
    "</div><div>minutes</div></div><div class=\"inner-wrapper\"><div id=\"sec\">" +
    i +
    "</div><div>seconds</div></div></div>"
  );
}
function setStorageValue(e, t) {
  null != localStorage && localStorage.setItem(e, t);
}
function removeStorageValue(e) {
  null != localStorage && localStorage.removeItem(e);
}
function getStorageValue(e) {
  if (null != localStorage) return localStorage.getItem(e);
}
function clearStorageValue() {
  null != localStorage && localStorage.clear();
}
function setCookie(e, t, n) {
  var o,
    a = _0x5873e6,
    i = "";
  (n &&
    ((o = new Date()).setTime(o.getTime() + 1e3 * n),
    (i = "; expires=" + o.toUTCString())),
    (document.cookie = e + "=" + (t || "") + i + "; path=/"));
}
function getCookie(e) {
  for (
    var t = _0x5873e6, n = e + "=", o = document.cookie.split(";"), a = 0;
    a < o.length;
    a++
  ) {
    for (var i = o[a]; " " == i.charAt(0); ) i = i.substring(1, i.length);
    if (0 == i.indexOf(n)) return i.substring(n.length, i.length);
  }
  return null;
}
function eraseCookie(e) {
  var t = _0x5873e6;
  document.cookie = e + "=; Max-Age=-99999999;";
}
function replaceAll(e, t) {
  for (var n = _0x5873e6, o = e; 0 < o.indexOf(t); ) o = o.replace(t, "");
  return o;
}
function notifyCoinSlotError(e) {
  var t = _0x5873e6,
    n = document.querySelector("[data-message]");
  (openModal(n),
    e == "coinslot.busy" &&
      ((n.querySelector(".header").textContent = "Error!"),
      (document.querySelector("#message").textContent = "Coin slot is busy, Please try again later")),
    "coin.slot.banned" == e &&
      ((n.querySelector(".header").textContent = "Warning!"),
      (document.querySelector("#message").textContent = "You have been banned from using coin slot, due to multiple request for insert coin, please try again later!")),
    e == "no.internet.detected" &&
      ((n.querySelector(".header").textContent = "Error!"),
      (document.querySelector("#message").textContent =
        "No internet connection as of the moment, Please try again later")),
    e == "offline"
      ? ((n.querySelector(".header").textContent = "Error!"),
        (document.querySelector("#message").textContent =
          "Error connecting to " + '"' + document.querySelector("[data-ssid]").textContent + '"' + ", Please check your wifi connection"))
      : setTimeout(function () {
          var e = t;
          ((insertBtn.style.pointerEvents = "auto"),
            insertBtn.classList.remove("is-loading"),
            (insertBtn.textContent = "Insert Coin"));
        }, 3e3));
}
function btnLoading(el, text) {
  if (null == el) return;
  if (text) el.textContent = text;
  el.classList.add("is-loading");
  el.style.pointerEvents = "none";
}
function btnDone(el, text) {
  if (null == el) return;
  el.classList.remove("is-loading");
  if (text) el.textContent = text;
  el.style.pointerEvents = "auto";
}
function openModal(e) {
  var t = _0x5873e6;
  null != e && (e.classList.add("show"), body.classList.add("modal-active"));
}
function closeModal(e) {
  var t = _0x5873e6;
  null != e && (e.classList.remove("show"), body.classList.remove("modal-active"));
}