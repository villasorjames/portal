localStorage.removeItem('isPause');

setSessionState('connected');

var modal = document.querySelectorAll('.modal');

function openModal(index) {
    if (index === 0) {
        initInsertCoin();
    } else if (index === 2) {
        fetchRatesFromServer();
        modalShow(modal[index]);
    } else {
        modalShow(modal[index]);
    }
}

function closeModal(index) {
    if (index === 0) {
        cancelTopUp();
    }
    modalHide(modal[index]);
}

if (potalError != '') {
    showNotification(potalError);
    closeNotification(3000);
}

function logout() {
    window.location.href = '/logout?erase-cookie=on';
}

function pause() {
    localStorage.setItem('isPause', true);
    localStorage.setItem('remainingTime', sessionTimeLeftSecs);
    window.location.href = '/logout?erase-cookie=on';
}

async function fetchUserTextFile() {
    var mac = userMac.replace(/:/g, '');
    var url = '/data/' + mac + '.txt?q=' + new Date().getTime();
    var response = await fetch(url);
    var text = await response.text();
    var voucher = text.split('#')[0];
    var expiryDate = text.split('#')[1];
    if (response.ok) {
        var el = document.getElementById('expiry');
        if (el) el.textContent = formatExpiry(expiryDate);
    } else {
        var el = document.getElementById('expiry');
        if (el) el.textContent = 'N/A';
    }
}

setTimeout(function () { fetchUserTextFile(); }, 1500);

function updateDataStats() {
    var url = 'http://' + (hsAddress || '10.0.0.1') + '/status?_=' + Date.now();
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.timeout = 5000;
    xhr.onload = function () {
        if (xhr.status === 200) {
            var html = xhr.responseText;
            var m1 = html.match(/id="bytesIn"[^>]*>([^<]+)/);
            var m2 = html.match(/id="bytesOut"[^>]*>([^<]+)/);
            var inEl = document.getElementById('bytesIn');
            var outEl = document.getElementById('bytesOut');
            if (m1 && inEl) inEl.textContent = m1[1].trim();
            if (m2 && outEl) outEl.textContent = m2[1].trim();
        }
    };
    xhr.send();
}
setInterval(updateDataStats, 5000);

