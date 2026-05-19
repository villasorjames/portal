localStorage.removeItem('isPause');

setSessionState('connected');

var modal = document.querySelectorAll('.modal');

function openModal(index) {
    if (index === 0) {
        initInsertCoin();
    } else if (index === 2) {
        fetchRatesFromServer();
        modal[index].style = 'display: block';
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
        if (el) el.textContent = expiryDate;
    } else {
        var el = document.getElementById('expiry');
        if (el) el.textContent = 'N/A';
    }
}

setTimeout(function () { fetchUserTextFile(); }, 1500);

