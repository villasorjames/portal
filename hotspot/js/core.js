var errorCode = [];
errorCode["coin.slot.banned"] = "Too many attempts, please try again later";
errorCode["coinslot.busy"] = "Coinslot busy";

var vendoIpAddress;
var loginOption;
var isMultiVendo;
var multivendoOption;
var pauseCount;
var isMacAsVoucher;
var voucher;
var coin;
var timer = null;
var isInsertingCoin = false;
var sanitizeMac;
var currency;
var multiVendoArray;

var InsertCoinSound = new Audio("sound/bgmusic.mp3");
InsertCoinSound.loop = true;

document.addEventListener('touchstart', function unlockAudio() {
    InsertCoinSound.load();
    document.removeEventListener('touchstart', unlockAudio);
}, false);

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function hideById(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = "none";
}

function setVendoName(name) {
    var el = document.getElementById("vendoName");
    if (el) el.textContent = name || "";
}

function toggleDropdown(id, btn) {
    var el = document.getElementById(id);
    if (!el) return;
    var open = el.classList.toggle("open");
    if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
}

var _svgIco = 'xmlns="http://www.w3.org/2000/svg" class="ico" viewBox="0 0 24 24"';
var _stateIcons = {
    disconnected: '<svg ' + _svgIco + '><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    connected:    '<svg ' + _svgIco + '><polyline points="20 6 9 17 4 12"/></svg>',
    paused:       '<svg ' + _svgIco + '><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'
};
var _stateLabels = { disconnected: "Disconnected", connected: "Connected", paused: "Time Paused" };

function setSessionState(state) {
    var badge = document.getElementById("sessionStatus");
    if (!badge) return;
    if (!_stateLabels[state]) state = "disconnected";
    badge.classList.remove("disconnected", "connected", "paused");
    badge.classList.add("status-badge", state);
    var icon = badge.querySelector(".status-icon");
    var text = badge.querySelector(".status-text");
    if (text) text.textContent = _stateLabels[state];
    if (icon) icon.innerHTML = _stateIcons[state];
    var card = document.getElementById("timeCard");
    if (card) {
        card.classList.remove("connected", "paused");
        if (state !== "disconnected") card.classList.add(state);
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    if (localStorage.getItem("spacePortalClearCache") === null) {
        localStorage.clear();
        localStorage.setItem("spacePortalClearCache", true);
    }

    const settingsResponse = await fetch("/setting.json");
    const settingsData = await settingsResponse.json();
    const { setting } = settingsData;

    loginOption = setting.login_option;
    isMultiVendo = setting.multi_vendo;
    multivendoOption = setting.multi_vendo_option;
    pauseCount = setting.pause_count;
    isMacAsVoucher = true;
    currency = setting.currency || "PHP";
    var enableMemberLogout = setting.enable_member_logout;

    var multiVendoIps = setting.multi_vendo_ip;
    var insertCoinBtn = document.getElementById("insert-coin-button");
    var userType = insertCoinBtn ? insertCoinBtn.getAttribute("user-type") : "member";

    var isStatusPage = typeof sessionTimeLeftSecs !== 'undefined';

    if (userType === "extend" && isStatusPage) {
        hideById("memberButton");

        var hsname = localStorage.getItem("hsname");
        var hotspotTitle = document.getElementById("hotspotName");
        if (hotspotTitle) hotspotTitle.textContent = hsname || setting.hotspot_name || "Hotspot";

        var storedPauseDay = localStorage.getItem("pauseCount");
        if (storedPauseDay === null) {
            localStorage.setItem("pauseCount", new Date().getDate() + 2);
        } else {
            const today = new Date().getDate();
            if (parseInt(storedPauseDay) === parseInt(today) || parseInt(storedPauseDay) < parseInt(today)) {
                localStorage.removeItem("locked");
                localStorage.removeItem("hsname");
                localStorage.removeItem("pauseCount");
            }
        }
    } else if (!setting.enable_member) {
        hideById("memberButton");
    } else if (setting.hotspot_name) {
        var titleEl = document.getElementById("hotspotName");
        if (titleEl) titleEl.textContent = setting.hotspot_name;
    }

    if (!isMultiVendo) {
        vendoIpAddress = setting.single_vendo_ip;
    } else if (multivendoOption === 1) {
        var hsHost = hsAddress.split(":")[0];
        const matchedVendo = multiVendoIps.find(v => v.hs_address === hsHost);
        if (matchedVendo) {
            vendoIpAddress = matchedVendo.vendo_ip;
            setVendoName(matchedVendo.vendo_name);
        }
        if (matchedVendo && matchedVendo.voucher_mode) {
            hideById("insert-coin-button");
        }
    } else if (multivendoOption === 2) {
        const matchedVendo = multiVendoIps.find(v => v.interface === vlanId);
        if (matchedVendo) {
            vendoIpAddress = matchedVendo.vendo_ip;
            setVendoName(matchedVendo.vendo_name);
        }
        if (matchedVendo && matchedVendo.voucher_mode) {
            hideById("insert-coin-button");
        }
    } else {
        const vendoList = document.getElementById("vendo-list");
        multiVendoIps.forEach(vendo => {
            const item = document.createElement("div");
            item.className = "vendo-list-items";
            item.innerHTML = "<div>" + vendo.vendo_name + "</motion>";
            item.addEventListener("click", () => {
                vendoIpAddress = vendo.vendo_ip;
                checkVendoStatus();
                if (!vendoStatusInterval) {
                    vendoStatusInterval = setInterval(checkVendoStatus, 10000);
                }
                topUp();
            });
            vendoList.appendChild(item);
        });
    }

    sanitizeMac = userMac.replace(/:/g, "");

    if (!setting.enable_insert_coin) hideById("insert-coin-button");
    if (!setting.enable_wifi_rate) hideById("ratesButton");
    if (!setting.enable_pause) hideById("pauseButton");
    if (enableMemberLogout === false) hideById("memberLogoutButton");

    const gcashWrapper = document.getElementById("gcash-button-wrapper");
    if (gcashWrapper && setting.enable_gcash) {
        const gcashBtn = document.createElement("button");
        gcashBtn.id = "gcashBtn";
        gcashBtn.type = "button";
        gcashBtn.className = "btn btn-primary";
        gcashBtn.setAttribute(
            "onclick",
            "display_ewalletvoucher_modal('" + setting.gcash_portal_key + "', '" + setting.gcash_node_ip + "', 'username', 'btnLogin');"
        );
        gcashBtn.innerHTML = "<span>E-Payment</span>";
        gcashWrapper.appendChild(gcashBtn);
    }

    if (vendoIpAddress) {
        checkVendoStatus();
        vendoStatusInterval = setInterval(checkVendoStatus, 10000);
    }
});

var vendoDotEl = null;
var vendoStatusInterval = null;

function checkVendoStatus() {
    if (!vendoIpAddress) return;
    if (!vendoDotEl) vendoDotEl = document.querySelector(".vendo-dot");
    if (!vendoDotEl) return;

    var url = "http://" + vendoIpAddress + "/getRates?rateType=1&_=" + Date.now();
    var xhr = new XMLHttpRequest();
    xhr.timeout = 3000;

    xhr.onload = function() {
        if (xhr.status >= 200 || xhr.status === 0) {
            vendoDotEl.className = "vendo-dot online";
        } else {
            vendoDotEl.className = "vendo-dot offline";
        }
    };

    xhr.onerror = function() {
        vendoDotEl.className = "vendo-dot offline";
    };

    xhr.ontimeout = function() {
        vendoDotEl.className = "vendo-dot offline";
    };

    try {
        xhr.open("GET", url, true);
        xhr.send();
    } catch (e) {
        vendoDotEl.className = "vendo-dot offline";
    }
}

function initInsertCoin() {
    const savedVoucher = localStorage.getItem("savedVoucher");
    voucher = savedVoucher != null ? savedVoucher : "";

    const savedCoin = localStorage.getItem("savedCoin");
    coin = savedCoin != null ? savedCoin : 0;

    if (!isMultiVendo) {
        showNotification("Connecting to vendo..");
        topUp();
    } else if (multivendoOption === 0) {
        openModal(3);
    } else {
        showNotification("Connecting to vendo..");
        topUp();
    }
}

async function topUp() {
    if (isMultiVendo && multivendoOption === 0) {
        closeModal(3);
    }

    const userType = document.getElementById("insert-coin-button").getAttribute("user-type");
    let extendTime;

    if (userType === "new") {
        extendTime = 0;
    } else {
        extendTime = 1;
        voucher = (typeof toSyncVoucher !== 'undefined' && toSyncVoucher) ? toSyncVoucher : (typeof resumeVoucher !== 'undefined' && resumeVoucher ? resumeVoucher : voucher);
    }

    if (isMacAsVoucher) {
        voucher = sanitizeMac;
    }

    try {
        const url = "http://" + vendoIpAddress + "/topUp?voucher=" + voucher +
            "&ipAddress=" + userIp + "&mac=" + userMac + "&extendTime=" + extendTime;
        const timeout = new Promise(function(_, reject) {
            setTimeout(function() { reject(new Error("timeout")); }, 10000);
        });
        const response = await Promise.race([fetch(url), timeout]);
        const data = await response.json();

        if (data.status === "true") {
            var p = InsertCoinSound.play(); if (p) p.catch(function(){});
            isInsertingCoin = true;
            closeNotification(10);
            modal[0].style.display = "flex";
            voucher = data.voucher;
            if (timer === null) {
                timer = setInterval(checkCoin, 1000);
            }
        } else {
            showNotification(errorCode[data.errorCode]);
            closeNotification(3000);
        }
    } catch (err) {
        console.error(err);
        showNotification("Coinslot is not available");
        closeNotification(3000);
    }
}

async function cancelTopUp() {
    clearInterval(timer);
    timer = null;
    isInsertingCoin = false;
    InsertCoinSound.pause();
    InsertCoinSound.currentTime = 0;
    try {
        var url = "http://" + vendoIpAddress + "/cancelTopUp?voucher=" + voucher + "&mac=" + userMac;
        var timeout = new Promise(function(_, reject) {
            setTimeout(function() { reject(new Error("timeout")); }, 5000);
        });
        await Promise.race([fetch(url), timeout]);
    } catch (e) {
        // vendo unreachable, local cleanup already done
    }
}

async function checkCoin() {
    if (!timer) return;
    try {
        const url = "http://" + vendoIpAddress + "/checkCoin?voucher=" + voucher;
        const timeout = new Promise(function(_, reject) {
            setTimeout(function() { reject(new Error("timeout")); }, 5000);
        });
        const response = await Promise.race([fetch(url), timeout]);
        const data = await response.json();

        const timeAdded = Number(data.timeAdded) || 0;
        const remainTime = Number(data.remainTime) || 0;
        const remainSeconds = Math.floor(remainTime / 1000);
        const waitTime = Number(data.waitTime) || 0;
        const progressPercent = Math.floor(remainSeconds * 1000 / waitTime * 100);

        const cancelBtn = document.getElementById("cancelInsertCoinButton");
        const proceedBtn = document.getElementById("proceedInsertCoinButton");
        const userTimeEl = document.getElementById("userTime");

        if (data.status === "true") {
            showToast('' + currency + '' + data.newCoin + " accepted", "success");
            coin = data.totalCoin;
            localStorage.setItem("savedCoin", coin);
            localStorage.setItem("savedVoucher", voucher);
        } else if (data.errorCode === "coin.is.reading") {
            showToast("Processing coin", "warning");
        } else if (data.errorCode === "coin.not.inserted") {
            updateProgress(progressPercent);
            if (remainSeconds > 0) {
                if (coin > 0) {
                    document.getElementById("userCoin").textContent = coin;
                    document.getElementById("userCode").textContent = voucher;
                    userTimeEl.textContent = timeConvert(timeAdded);
                    cancelBtn.style.opacity = "25%";
                    cancelBtn.disabled = true;
                    proceedBtn.style.opacity = "100%";
                    proceedBtn.disabled = false;
                } else {
                    cancelBtn.style.opacity = "100%";
                }
            } else if (coin > 0) {
                loginVoucher();
            } else {
                closeModal(0);
            }
        } else if (data.errorCode === "coinslot.busy") {
            // waiting
        }
    } catch (e) {
        clearInterval(timer);
        timer = null;
        isInsertingCoin = false;
        InsertCoinSound.pause();
        InsertCoinSound.currentTime = 0;
        coin = 0;
        voucher = "";
        localStorage.removeItem("savedCoin");
        localStorage.removeItem("savedVoucher");
        closeModal(0);
        showNotification("NodeMCU connection lost");
        setTimeout(function() { location.reload(); }, 3000);
    }
}

async function loginVoucher() {
    localStorage.removeItem("syncCount");
    localStorage.removeItem("savedVoucher");
    localStorage.removeItem("savedCoin");
    clearInterval(timer);
    timer = null;
    isInsertingCoin = false;
    InsertCoinSound.pause();
    InsertCoinSound.currentTime = 0;

    const userType = document.getElementById("insert-coin-button").getAttribute("user-type");

    if (userType === "new") {
        const url = "http://" + vendoIpAddress + "/useVoucher?voucher=" + voucher;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "true") {
            modal[0].style.display = "none";
            showNotification("Logging in voucher: " + voucher, 3000);
            setTimeout(() => location.reload(), 2000);
        }
    } else {
        fetch("/logout?erase-cookie=on");
        await delay(1000);

        const url = "http://" + vendoIpAddress + "/useVoucher?voucher=" + voucher;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "true") {
            modal[0].style.display = "none";
            showNotification("Extending voucher: " + voucher, 3000);
            setTimeout(() => location.reload(), 2000);
        }
    }
}

async function convertVoucher(convertCode) {
    await topUp();
    modal[0].style.display = "none";
    await delay(2000);

    var syncVoucher = (typeof toSyncVoucher !== 'undefined' && toSyncVoucher) ? toSyncVoucher : (typeof resumeVoucher !== 'undefined' && resumeVoucher ? resumeVoucher : voucher);
    var url = "http://" + vendoIpAddress + "/convertVoucher?voucher=" + syncVoucher +
        "&convertVoucher=" + convertCode;
    var response = await fetch(url);
    var data = await response.json();

    if (data.status === "true") {
        modal[0].style.display = "none";
        showNotification(
            "Converting voucher: " + convertCode +
            " success! <br><br><small>Applying your new time, please wait</small>"
        );
        await delay(2000);
        loginVoucher();
    } else {
        showNotification("Converting voucher: " + convertCode + " failed.");
        await delay(2000);
        cancelTopUp();
        modal[0].style.display = "none";
        closeNotification(3000);
    }
}

function initConvertVoucher() {
    var input = document.getElementById('convertVoucherInput');
    if (!input) return;
    var value = input.value.trim();
    if (value != '') {
        if (modal[6]) modal[6].style.display = 'none';
        convertVoucher(value);
    } else {
        showToast('Please input a voucher', 'warning');
    }
}

function showNotification(message) {
    document.getElementById("notificationMessage").innerHTML = "" + message;
    modal[4].style.display = "flex";
}

function closeNotification(ms) {
    setTimeout(() => {
        modal[4].style.display = "none";
    }, ms);
}

let toastCount = 0;

var progressValue = null;
var currentProgress = 100;
var circumference = 2 * Math.PI * 40;
var maxProgress = 100;

function updateProgress(progress) {
    if (!progressValue) progressValue = document.querySelector('#progress-value');
    if (!progressValue) return;
    currentProgress = Math.max(0, Math.min(maxProgress, progress));
    var offset = circumference - (currentProgress / 100) * circumference;
    progressValue.style.strokeDashoffset = offset;
}

function showToast(message, type = "success") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = "toast " + type;
    toast.innerHTML = '<span style="font-family: monospace; font-size: larger">' + message + '</span>';

    const colors = {
        success: "#4CAF50",
        warning: "#FF9800",
        error: "#f44336"
    };
    const borderColor = colors[type] || "#333";

    toast.style.cssText = `
        background-color: #fff;
        border: 3px solid #000;
        border-left: 8px solid ${borderColor};
        color: #000;
        padding: 12px 20px;
        margin: 10px;
        border-radius: 4px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        min-width: 250px;
        max-width: 300px;
        word-wrap: break-word;
        opacity: 0;
        transform: translateX(400px);
        transition: all 0.3s ease;
        pointer-events: auto;
        position: absolute;
        font-weight: 700;
    `;

    container.appendChild(toast);
    toastCount++;
    adjustToasts();

    setTimeout(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateX(0)";
    }, 100);

    setTimeout(() => dismissToast(toast), 4000);
}

function dismissToast(toastEl) {
    toastEl.style.opacity = "0";
    toastEl.style.transform = "translateX(400px)";
    setTimeout(() => {
        if (toastEl.parentNode) {
            toastEl.parentNode.removeChild(toastEl);
            toastCount--;
            adjustToasts();
        }
    }, 300);
}

function adjustToasts() {
    const toasts = document.querySelectorAll("#toastContainer .toast");
    let top = 20;
    toasts.forEach(toast => {
        toast.style.top = top + "px";
        toast.style.right = "20px";
        top += (toast.offsetHeight || 50) + 10;
    });
}

function formatExpiry(val) {
    if (!val) return '--';
    val = val.trim();
    var d = new Date(val.replace(' ', 'T'));
    if (isNaN(d.getTime())) return val;
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var h = d.getHours(), m = d.getMinutes();
    var ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return months[d.getMonth()] + '/' + d.getDate() + ' ' + h + ':' + (m < 10 ? '0' + m : m) + ' ' + ampm;
}

function timeConvert(seconds) {
    seconds = Number(seconds);
    var daySecs = 86400;
    var hourSecs = 3600;
    var minSecs = 60;

    var days = Math.floor(seconds / daySecs);
    var hours = Math.floor(seconds % daySecs / hourSecs);
    var minutes = Math.floor(seconds % hourSecs / minSecs);
    var secs = Math.floor(seconds % minSecs);

    var parts = [];
    parts.push(days + "d");
    parts.push(hours + "h");
    parts.push(minutes + "m");
    if (secs > 0) parts.push(secs + "s");

    return parts.join(":");
}

function rateTimeConvert(seconds) {
    seconds = Number(seconds);
    const daySecs = 86400;
    const hourSecs = 3600;
    const minSecs = 60;

    const days = Math.floor(seconds / daySecs);
    const hours = Math.floor(seconds % daySecs / hourSecs);
    const minutes = Math.floor(seconds % hourSecs / minSecs);
    const secs = Math.floor(seconds % minSecs);

    const parts = [];
    if (days > 0) parts.push(days + " day ");
    if (hours > 0) parts.push(hours + " hrs");
    if (minutes > 0) parts.push(minutes + " min ");
    if (secs > 0) parts.push(secs + " sec");

    return parts.join("");
}

function pad2(n) {
    return n < 10 ? "0" + n : "" + n;
}

var _timerEls = null;
var _timerVisible = { days: false, hours: false, minutes: false, seconds: false };

function sessionTimeConvert(seconds) {
    seconds = Number(seconds);
    var daySecs = 86400;
    var hourSecs = 3600;
    var minSecs = 60;

    var days = Math.floor(seconds / daySecs);
    var hours = Math.floor(seconds % daySecs / hourSecs);
    var minutes = Math.floor(seconds % hourSecs / minSecs);
    var secs = Math.floor(seconds % minSecs);

    if (!_timerEls) {
        _timerEls = {
            daysEl: document.getElementById("days"),
            hoursEl: document.getElementById("hours"),
            minutesEl: document.getElementById("minutes"),
            secondsEl: document.getElementById("seconds"),
            semicolons: document.querySelectorAll(".semicolon")
        };
    }
    var el = _timerEls;

    var units = [
        { value: days, el: el.daysEl, semicolon: el.semicolons[0], key: "days" },
        { value: hours, el: el.hoursEl, semicolon: el.semicolons[1], key: "hours" },
        { value: minutes, el: el.minutesEl, semicolon: el.semicolons[2], key: "minutes" },
        { value: secs, el: el.secondsEl, semicolon: null, key: "seconds" }
    ];

    for (var i = 0; i < units.length; i++) {
        var unit = units[i];
        if (unit.value > 0 && !_timerVisible[unit.key]) {
            _timerVisible[unit.key] = true;
            unit.el.style.opacity = "100%";
            if (unit.semicolon) {
                unit.semicolon.style.opacity = "100%";
            }
        }
    }

    el.daysEl.textContent = pad2(days);
    el.hoursEl.textContent = pad2(hours);
    el.minutesEl.textContent = pad2(minutes);
    el.secondsEl.textContent = pad2(secs);

    var remainingEl = document.getElementById("remaining-time");
    if (remainingEl) {
        var parts = [];
        if (days > 0) parts.push(days + "d");
        if (days > 0 || hours > 0) parts.push(pad2(hours) + "h");
        parts.push(pad2(minutes) + "m");
        parts.push(pad2(secs) + "s");
        remainingEl.textContent = parts.join(" ");
    }
}

var rateLoaded = false;

async function fetchRatesFromServer() {
    if (!rateLoaded) {
        rateLoaded = true;
        const url = "http://" + vendoIpAddress + "/getRates?rateType=1&date=" + new Date().getTime();
        const response = await fetch(url, { method: "GET" });
        const text = await response.text();

        multiVendoArray = text.split("|").filter(entry => entry.trim() !== "");
        const rateList = document.getElementById("rate-list");

        multiVendoArray.forEach(entry => {
            const parts = entry.split("#");
            const row = document.createElement("tr");
            row.innerHTML =
                `<td>${currency}${parts[1]}</td>` +
                `<td>${rateTimeConvert(parts[2] * 60)}</td>` +
                `<td>${rateTimeConvert(parts[3] * 60)}</td>`;
            rateList.appendChild(row);
        });
    }
}
