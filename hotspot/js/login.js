const modal = document.querySelectorAll('.modal');

function openModal(index) {
    if (index === 0) {
        initInsertCoin();
    } else if (index === 2) {
        fetchRatesFromServer();
        modal[index].style = 'display: block';
    } else if (index === 5) {
        modal[index].style = 'display: block';
        var trialLink = document.getElementById('trial-link');
        var timer = 10;
        setInterval(function () {
            timer--;
            document.getElementById('trial-timer').textContent = timer;
            if (timer <= 0) {
                trialLink.click();
            }
        }, 1000);
    } else {
        modal[index].style = 'display: block';
    }
}

function closeModal(index) {
    if (index === 0) {
        cancelTopUp();
    }
    modal[index].style = 'display: none';
}

fetch("/setting.json")
    .then(function (res) { return res.json(); })
    .then(function (data) {
        if (data.setting.hotspot_name) {
            document.getElementById("hotspotName").textContent = data.setting.hotspot_name;
        }
    });

if (potalError != '') {
    showNotification(potalError);
    closeNotification(3000);
}

var isPaused = localStorage.getItem('isPause');
var resumeVoucher = "";

function doResume() {
    if (resumeVoucher) {
        document.sendin.username.value = resumeVoucher;
    }
    doLogin();
    return false;
}

async function fetchUserTextFile(skipAutoLogin) {
    var mac = userMac.replace(/:/g, '');
    var url = '/data/' + mac + '.txt?q=' + new Date().getTime();
    var response = await fetch(url);
    var text = await response.text();
    var voucher = text.split('#')[0];
    if (response.ok) {
        if (isPaused === null) {
            resumeVoucher = voucher;
            if (!skipAutoLogin) {
                showNotification('Syncing mac address');
                document.sendin.username.value = voucher;
                setTimeout(function () {
                    doLogin();
                }, 3000);
            }
        } else {
            sessionTimeConvert(localStorage.getItem('remainingTime'));
            resumeVoucher = voucher;
            var wrapper = document.getElementById('resumeWrapper');
            if (wrapper) wrapper.style.display = 'block';
            var extendBtn = document.getElementById('insert-coin-button');
            if (extendBtn) {
                extendBtn.setAttribute('user-type', 'extend');
                var label = extendBtn.querySelector('span:last-child');
                if (label) label.textContent = 'Extend';
            }
            setSessionState('paused');
        }
    }
}

if (potalError != 'invalid username or password') {
    fetchUserTextFile(false);
} else {
    fetchUserTextFile(true);
}

async function fetchExpiry() {
    var mac = userMac.replace(/:/g, '');
    var url = '/data/' + mac + '.txt?q=' + new Date().getTime();
    try {
        var response = await fetch(url);
        var text = await response.text();
        var expiryDate = text.split('#')[1];
        if (response.ok && expiryDate) {
            var el = document.getElementById('expiry');
            if (el) el.textContent = formatExpiry(expiryDate);
        }
    } catch (e) {}
}

fetchExpiry();
