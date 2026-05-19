$(document).ready(function() {

    // Initialize Portal module elements for new modular components
    if (Portal && Portal.initElements) {
        Portal.initElements();
        console.log('[Portal] Elements initialized');
    }

    $(document).on('click', '.promo-item', function() {
        // Remove selection from all promo items
        $('.promo-item').removeClass('active');

        // Add selection to clicked promo item
        $(this).addClass('active');

        // Get promo details
        const promoId = $(this).data('promo-id');
        const promoPrice = $(this).data('promo-price');
        const promoExtag = $(this).data('promo-extag') || '';
        const promoName = $(this).find('.fw-bold').text();
        const promoDesc = $(this).find('small').text();

        console.log("Selected promo:", {
            id: promoId,
            name: promoName,
            price: promoPrice,
            extag: promoExtag,
            desc: promoDesc
        });

        // Store selected promo
        selectedPromo = {
            id: promoId,
            name: promoName,
            price: promoPrice,
            extag: promoExtag,
            desc: promoDesc
        };

        // Go to number input screen
        currentScreen = 'number';

        // Hide promos container, show number input
        $promosContainer.hide();

        // Hide main options and show back button for last step
        $('#main-options-row').hide();
        $backBtn.removeClass('d-none');

        // Set selected provider logo and name (from stored values)
        $('#selected-provider-logo').attr('src', selectedProviderLogo);
        $('#selected-provider-name').text(selectedProvider);

        // Update promo details display
        $('#selected-promo-name').text(promoName);
        $('#selected-promo-desc').text(promoDesc);
        $('#selected-promo-price').text('₱' + promoPrice);

        // Hide regular amount input, show promo details
        $regularAmountContainer.hide();
        $promoDetailsContainer.removeClass('d-none');
        $numberInputContainer.removeClass('d-none').show();
    });

    // Element references
    const $statusIndicator = $('#status-indicator');
    const $connectionInfo = $('#connection-info');
    const $creditInfo = $('#credit-info');
    const $cpointsInfo = $('#cpoints-info');
    const $remainingTime = $('#remaining-time');
    const $voucherInput = $('#voucher-input');
    const $submitVoucherBtn = $('#submit-voucher-btn');
    const $insertMoneyBtn = $('#insert-money-btn');
    const $wifiRatesBtn = $('#wifi-rates-btn');
    const $dataRatesBtn = $('#data-rates-btn');
    const $toggleTimeBtn = $('#toggle-time-btn'); // New single toggle button
    const $modalTitle = $('#modal-title');
    const $modalBody = $('#modal-body');
    const $loadingOverlay = $('#loading-overlay');
    const $progressBar = $('#progress-bar');
    const $loadingText = $('#loading-text');
    const $uploadedData = $('#uploaded-data');
    const $downloadedData = $('#downloaded-data');
    const $toastContainer = $('#liveToast');
    const $toastTitle = $('#toast-title');
    const $toastMessage = $('#toast-message');
    const $statsToggle = $('#stats-toggle');


    // Coin slot elements
    const $coinInsertionModal = $('#coin-insertion-modal');
    const $coinTimerValue = $('#coin-timer-value');
    const $timerProgressBar = $('#timer-progress-bar');
    const $coinTimeValue = $('#coin-time-value');
    const $coinVoucherValue = $('#coin-voucher-value');
    const $coinDataValue = $('#coin-data-value');
    const $coinAmountValue = $('#coin-amount-value');
    const $buyVoucherBtn = $('#buy-voucher-btn');
    const $closeCoinModalBtn = $('#close-coin-modal');
    const $buyTimeBtn = $('#buy-time-btn');
    const $buyDataBtn = $('#buy-data-btn');

// E-loading button elements
const $eloadingBtn = $('#eloading-btn');
const $eloadingModal = $('#eloading-modal');

// Free time button element
const $freeTimeBtn = $('#free-time-btn');
const FREE_TIME_GENERATE_API = Portal.Config.FREE_TIME_GENERATE_API;
const $buyLoadOption = $('#buy-load-option');
const $cashInOption = $('#cash-in-option');
const $providerSelection = $('#provider-selection');
const $loadTypeContainer = $('#load-type-container');
const $regularLoadOption = $('#regular-load-option');
const $promosOption = $('#promos-option');
const $promosContainer = $('#promos-container');
const $numberInputContainer = $('#number-input-container');
const $regularAmountContainer = $('#regular-amount-container');
const $promoDetailsContainer = $('#promo-details-container');
const $backBtn = $('#back-btn');
const $confirmEloadBtn = $('#confirm-eload-btn');
const $providerOptions = $('.provider-option');
const $promoItems = $('.promo-item');


    // Coin slot waiting modal elements
    const $coinSlotWaitingModal = $('#coin-slot-waiting-modal');
    const $waitingTimeRemaining = $('#waiting-time-remaining');
    const $waitingProgressBar = $('#waiting-progress-bar');
    const $checkInterval = $('#check-interval');
    const $checkNowBtn = $('#check-now-btn');
    const $cancelWaitingBtn = $('#cancel-waiting-btn');

    // SSE indicator - new UI uses this element
    const $sseStatus = $('#ws-indicator');

    // Disconnection overlay elements
    const $disconnectedOverlay = $('#disconnected-overlay');
    const $reconnectStatus = $('#reconnect-status');
    const $reconnectCountdown = $('#reconnect-countdown');
    const $reconnectSpinner = $('#reconnect-spinner');
    let disconnectedReconnectInterval = null;
    let disconnectedCountdownInterval = null;
    let isShowingDisconnected = false;
    let lastConnectionTime = 0; // Track when connection was established
    let lastDisconnectTime = 0; // Track when last disconnect happened
    const connectionStabilityMs = 2000; // Connection must be stable for 2 seconds
    const reconnectCooldownMs = 3000; // Wait 3 seconds between reconnect attempts

    // Use Portal.Config for API endpoints
    const AUTH_API = Portal.Config.AUTH_API;
    const RATES_API = Portal.Config.RATES_API;
    const DATA_RATES_API = Portal.Config.DATA_RATES_API;
    const NETWORK_API = Portal.Config.NETWORK_API;
    const PORTAL_SSE_URL = Portal.Config.PORTAL_SSE_URL;
    const PAUSE_API = Portal.Config.PAUSE_API;
    const RESUME_API = Portal.Config.RESUME_API;

    // Coin slot API endpoints
    const COINSLOT_START_API = Portal.Config.COINSLOT_START_API;
    const COINSLOT_STOP_API = Portal.Config.COINSLOT_STOP_API;
    const COINSLOT_COUNT_API = Portal.Config.COINSLOT_COUNT_API;
    const COINSLOT_RESET_API = Portal.Config.COINSLOT_RESET_API;
    const ELOAD_PRODUCTS_API = Portal.Config.ELOAD_PRODUCTS_API;
    const ELOAD_RATES_API = Portal.Config.ELOAD_RATES_API;

    // Network/Coin slot info (will be fetched)
    let clientNetworkInfo = {
        coin_slot_id: 1,
        network_label: 'WiFi',
        network: 'unknown',
        coinslot_name: 'Insert Coins',
        coinslot_enabled: false,
        insert_coin_enabled: false,
        available_coinslots: [],
        selected_coinslot: null
    };

    // Device ID - persistent identifier (survives MAC randomization)
    const DEVICE_ID_KEY = Portal.Config.DEVICE_ID_KEY;
    const DEVICE_ID_API = Portal.Config.DEVICE_ID_API;

    // Cookie helper functions (from Portal.Utils)
    const setCookie = Portal.Utils.setCookie;
    const getCookie = Portal.Utils.getCookie;

    // Get device ID from URL params (CNA redirect), cookie, or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const urlDeviceId = urlParams.get('device_id');
    let deviceId = urlDeviceId || getCookie(DEVICE_ID_KEY) || localStorage.getItem(DEVICE_ID_KEY) || null;

    // If device_id came from URL (iOS CNA redirect), save it immediately to cookie/localStorage
    if (urlDeviceId) {
        setCookie(DEVICE_ID_KEY, urlDeviceId, 365);
        localStorage.setItem(DEVICE_ID_KEY, urlDeviceId);
        // Clean up URL by removing device_id param
        urlParams.delete('device_id');
        const cleanUrl = urlParams.toString() ? window.location.pathname + '?' + urlParams.toString() : window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);
    }

    // Format device ID for display (lpb_lastdigits)
    function formatDeviceIdDisplay(id) {
        if (!id) return '--';
        // Get last 6 characters of the device ID
        const lastPart = id.replace(/-/g, '').slice(-6);
        return 'lpb_' + lastPart;
    }

    // Update device ID display on the page
    function updateDeviceIdDisplay() {
        const deviceIdDisplay = document.getElementById('device-id-display');
        if (deviceIdDisplay && deviceId) {
            deviceIdDisplay.textContent = formatDeviceIdDisplay(deviceId);
        }
    }

    // Get or create device ID from backend
    // Returns { isDesktop: boolean } to indicate if this is a desktop device
    async function initDeviceId() {
        try {
            let url = DEVICE_ID_API;
            if (deviceId) {
                url += '?device_id=' + encodeURIComponent(deviceId);
            }

            const response = await $.ajax({
                url: url,
                method: 'GET',
                dataType: 'json',
                headers: deviceId ? { 'X-Device-ID': deviceId } : {}
            });
            if (response && response.status === 'success' && response.device_id) {
                deviceId = response.device_id;
                // Save to both cookie (365 days) and localStorage
                setCookie(DEVICE_ID_KEY, deviceId, 365);
                localStorage.setItem(DEVICE_ID_KEY, deviceId);
                updateDeviceIdDisplay();
                console.log('Device ID:', deviceId, response.is_new ? '(new)' : '(existing)');
                if (response.mac_updated) {
                    console.log('MAC mapping updated for this device');
                }
                // Check if this is a desktop device
                if (response.desktop === true) {
                    console.log('Desktop device detected');
                    return { isDesktop: true };
                }
            }
            return { isDesktop: false };
        } catch (error) {
            console.error('Failed to get device ID:', error);
            if (!deviceId) {
                deviceId = 'dev_local_' + Math.random().toString(36).substring(2, 11);
                setCookie(DEVICE_ID_KEY, deviceId, 365);
                localStorage.setItem(DEVICE_ID_KEY, deviceId);
            }
            updateDeviceIdDisplay();
            console.log('Using fallback device ID:', deviceId);
            return { isDesktop: false };
        }
    }

    // Note: initDeviceId() is called in initializeApp() to ensure it completes
    // before authentication runs (needed for MAC change detection)

    // Fetch client network info and update coin modal title
    async function fetchNetworkInfo() {
        try {
            const response = await $.ajax({
                url: NETWORK_API,
                method: 'GET',
                dataType: 'json'
            });
            if (response && response.status === 'success') {
                clientNetworkInfo = {
                    coin_slot_id: response.coin_slot_id || 1,
                    network_label: response.network_label || 'WiFi',
                    network: response.network || 'unknown',
                    coinslot_name: response.coinslot_name || 'Insert Coins',
                    coinslot_enabled: response.coinslot_enabled !== false,
                    insert_coin_enabled: response.insert_coin_enabled !== false,
                    available_coinslots: response.available_coinslots || [],
                    selected_coinslot: null
                };
                // Update the coin insertion modal title with coinslot name
                const modalTitle = document.getElementById('coinInsertionModalLabel');
                if (modalTitle) {
                    modalTitle.innerHTML = `<i class="fa-solid fa-coins me-2 text-warning"></i>${clientNetworkInfo.coinslot_name}`;
                }
                // Disable Insert Money button if no coinslots available
                updateInsertMoneyButtonState();
                console.log('Network info:', clientNetworkInfo);
            }
        } catch (error) {
            console.error('Failed to fetch network info:', error);
        }
    }

    // Fetch network info on page load
    fetchNetworkInfo();


    // Bootstrap toast instance
    const toast = new bootstrap.Toast($toastContainer[0]);

    // Initialize bootstrap modal for coin insertion
    const coinModal = new bootstrap.Modal(document.getElementById('coin-insertion-modal'), {
        backdrop: 'static',
        keyboard: false
    });

    const coinWaitingModal = new bootstrap.Modal(document.getElementById('coin-slot-waiting-modal'), {
        backdrop: 'static',
        keyboard: false
    });

    // State
    let connected = false;
    let ipAddress = '--';
    let macAddress = '--';
    let credits = 0;
    let cpoints = 0;
    let remainingTimeInSeconds = 0;
    let countdownInterval;
    let socket;
    let socketConnected = false;
    let socketRetryCount = 0;
    let isReconnecting = false;
    let reconnectTimer = null;
    const MAX_SOCKET_RETRIES = 2;
    const RECONNECT_DELAY = 5000; // 5 seconds between reconnection attempts
    let equivMinutes = 0;
    let dataAmount = 0;
    let expiryTimeInSeconds = 0;
    let expiryUpdateInterval = null;
    // Data mode state
    let dataMode = false;
    let sessionData = [];
    let lastProcessedMessageTime = 0;
    let pendingModeSwitch = false;

    // Pause state
    let pauseStatus = 0;
    let pauseRemaining = 0;
    let pauseTimeLimit = 0;
    let lastPauseCommandTime = 0; // Track when last pause/resume command was sent to prevent SSE race condition

    // Free time state
    let canClaimFreeTime = false;

    //eloading
let currentScreen = 'main'; // main, provider, loadtype, promos, number
let selectedService = ''; // buyload, cashin, paybills
let selectedProvider = '';
let selectedProviderLogo = ''; // Store provider logo for later use
let selectedLoadType = ''; // regular, promos
let selectedPromo = null; // { id, name, price, desc }
let prepaidProducts = [];
let loadRates = [];
let loadRatePercent = 0;
let cachedStationRates = [];
let hasStationRates = false;
// Pending e-load request (waiting for payment)
let pendingEloadRequest = null;
// Pending cash-in request (waiting for payment)
let pendingCashinRequest = null;
// Original buyload provider HTML (saved before cash-in modifies it)
let originalProviderHtml = null;

    // Coin slot state
    let coinSessionActive = false; // Track if we're in an active coin session
    let coinPollingInterval = null; // Polling fallback for coin count
    let usePollingFallback = false; // Only poll when SSE is unavailable
    let lastPolledAmount = 0; // Track last polled amount to detect coin inserts
    let maxTimerValue = 60;
    let currentTimerValue = 60;
    let totalAmount = 0;
    let timeValue = 0;
    let voucherValue = 0;
    let timerActive = false;
    let coinUpdateInterval = null;
    let waitingForCoinSlot = false;
    let waitingTimeInSeconds = 30;
    let waitingInterval = null;
    let checkAvailabilityInterval = null;
    let lastCheckTime = 0;
    let lastExpiryDisplayUpdate = 0;
    let expiryUpdateDebounceTimer = null;
    let lastExpiryTimeValue = -1; // Track last displayed value
    const CHECK_INTERVAL_SECONDS = 5;
    const MAX_WAIT_TIME = 120; // 2 minutes max waiting time
    const AUTO_CHECK_INTERVAL = 5000; // 5 seconds

    // Portal settings state
    let portalSettings = {
        buyTime: 'Enable',
        buyVoucher: 'Enable',
        buyData: 'Enable',
        buyCharging: 'Disable',
        viewRates: 'Enable',
        viewDataRates: 'Enable',
        chargingRates: 'Disable',
        enterVoucherCode: 'Enable',
        chatbox: 'Disable',
        autoPause: 'Enable',
        brandTitle: 'PISO WIFI',
        announcements: 'High Speed Connection!',
        // Auto-claim setting (auto-pause runs on backend)
        insertCoinAutoClaim: 'OFF',
        // Insert coin limit settings (handled by backend now)
        insertCoinLimit: 10,
        insertCoinLimitReset: 1
    };

    // Portal Settings API endpoint (includes banners and banner settings)
    const PORTAL_SETTINGS_API = Portal.Config.PORTAL_SETTINGS_API;

    // Coin sounds
    const coinBgSound = document.getElementById('coin-bg-sound');
    const coinInsertSound = document.getElementById('coin-insert-sound');
    let bannerSliderInterval = 5000; // Default 5 seconds
    let audioContext = null;
    let audioUnlocked = false;

    // Unlock audio for iOS Safari - must be called on user interaction
    function unlockAudio() {
        if (audioUnlocked) return;

        // Create and resume AudioContext only
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
        } catch (e) {
            console.log('AudioContext not supported');
        }

        // Don't play coin sounds here - they will be unlocked when actually needed
        audioUnlocked = true;
        console.log('Audio unlocked for iOS');
    }

    // Add unlock listeners on first user interaction
    ['touchstart', 'touchend', 'click', 'keydown'].forEach(event => {
        document.addEventListener(event, unlockAudio, { once: true });
    });

    // Play background sound (loops during coin insertion session)
    function playCoinBgSound() {
        if (coinBgSound) {
            coinBgSound.currentTime = 0;
            coinBgSound.volume = 0.5;
            coinBgSound.play().catch(err => {
                console.log('Could not play background sound:', err);
            });
        }
    }

    // Stop background sound
    function stopCoinBgSound() {
        if (coinBgSound) {
            coinBgSound.pause();
            coinBgSound.currentTime = 0;
        }
    }

    // Play coin insert sound (each coin)
    function playCoinInsertSound() {
        if (coinInsertSound && coinInsertSound.src) {
            coinInsertSound.currentTime = 0;
            coinInsertSound.volume = 0.8;
            coinInsertSound.play().catch(err => {
                console.log('Could not play coin insert sound:', err);
            });
        }
    }

    // Populate banner carousel with images
    function populateBannerCarousel(banners) {
        const slidesContainer = document.getElementById('banner-slides');
        const indicatorsContainer = document.getElementById('banner-indicators');

        if (!slidesContainer || !indicatorsContainer) return;

        // Clear existing content
        slidesContainer.innerHTML = '';
        indicatorsContainer.innerHTML = '';

        banners.forEach((banner, index) => {
            // Create slide
            const slide = document.createElement('div');
            slide.className = `carousel-item ${index === 0 ? 'active' : ''}`;
            slide.innerHTML = `<img src="${banner.url}" alt="Banner ${index + 1}" class="banner-img">`;
            slidesContainer.appendChild(slide);

            // Create indicator
            const indicator = document.createElement('button');
            indicator.type = 'button';
            indicator.setAttribute('data-bs-target', '#bannerCarousel');
            indicator.setAttribute('data-bs-slide-to', index.toString());
            if (index === 0) indicator.classList.add('active');
            indicatorsContainer.appendChild(indicator);
        });

        // Initialize or reinitialize carousel with interval
        const carouselElement = document.getElementById('bannerCarousel');
        if (carouselElement && banners.length > 1) {
            // Dispose existing carousel if any
            const existingCarousel = bootstrap.Carousel.getInstance(carouselElement);
            if (existingCarousel) {
                existingCarousel.dispose();
            }

            // Create new carousel with settings
            new bootstrap.Carousel(carouselElement, {
                interval: bannerSliderInterval,
                ride: 'carousel',
                wrap: true
            });
        }
    }

    // Fetch portal settings from backend
    async function fetchPortalSettings() {
        try {
            const response = await $.ajax({
                url: PORTAL_SETTINGS_API,
                method: 'GET',
                dataType: 'json'
            });
            console.log('Portal settings API response:', response);
            if (response && response.status === 'success' && response.data) {
                portalSettings = { ...portalSettings, ...response.data };
                console.log('Portal settings merged:', portalSettings);
                console.log('enterVoucherCode value:', portalSettings.enterVoucherCode);
                applyPortalSettings();

                // Handle banners from portal settings (reduces API calls)
                if (response.data.bannerSettings && response.data.bannerSettings.sliderInterval) {
                    bannerSliderInterval = response.data.bannerSettings.sliderInterval * 1000; // Convert to ms
                }
                if (response.data.banners && response.data.banners.length > 0) {
                    populateBannerCarousel(response.data.banners);
                }
            }
        } catch (error) {
            console.error('Failed to fetch portal settings:', error);
            // Use default settings on error
            applyPortalSettings();
        }
    }

    // Apply portal settings to show/hide UI elements
    function applyPortalSettings() {
        // Buy Time button (Insert Money)
        // Visibility is controlled by both buyTime setting and coinslot availability
        updateInsertMoneyButtonState();

        // View Rates button (WiFi Rates)
        if (portalSettings.viewRates === 'Disable') {
            $wifiRatesBtn.addClass('d-none');
        } else {
            $wifiRatesBtn.removeClass('d-none');
        }

        // Data Rates button (View Data Rates)
        if (portalSettings.viewDataRates === 'Disable') {
            $dataRatesBtn.addClass('d-none');
        } else {
            $dataRatesBtn.removeClass('d-none');
        }

        // Enter Voucher Code (hidden by default in HTML, show only if enabled)
        const $voucherContainer = $('.voucher-container');
        if (portalSettings.enterVoucherCode === 'Enable') {
            $voucherContainer.removeClass('d-none');
        } else {
            $voucherContainer.addClass('d-none');
        }

        // Hide Internet Time row in payment details if buyTime is disabled
        if (portalSettings.buyTime === 'Disable') {
            $('#internet-time-row').addClass('d-none');
        } else {
            $('#internet-time-row').removeClass('d-none');
        }

        // Hide Voucher Duration row in payment details if buyVoucher is disabled
        if (portalSettings.buyVoucher === 'Disable') {
            $('#voucher-duration-row').addClass('d-none');
        } else {
            $('#voucher-duration-row').removeClass('d-none');
        }

        // Hide Data Allowance row in payment details if buyData is disabled
        if (portalSettings.buyData === 'Disable') {
            $('#data-allowance-row').addClass('d-none');
        } else {
            $('#data-allowance-row').removeClass('d-none');
        }

        // Voucher List button - hide if buyVoucher is disabled OR enterVoucherCode is disabled
        const $voucherListBtn = $('#voucher-list-btn');
        if (portalSettings.buyVoucher === 'Disable' || portalSettings.enterVoucherCode === 'Disable') {
            $voucherListBtn.addClass('d-none');
        } else {
            $voucherListBtn.removeClass('d-none');
        }

        // Session List button - hide if session merge is enabled (only 1 session)
        const $sessionListBtn = $('#session-list-btn');
        if (portalSettings.timesessionmerge === 1) {
            $sessionListBtn.addClass('d-none');
        } else {
            $sessionListBtn.removeClass('d-none');
        }

        // E-Loading & Cash-In button - hide if buyLoad is disabled
        if (portalSettings.buyLoad === 'Disable') {
            $eloadingBtn.addClass('d-none');
        } else {
            $eloadingBtn.removeClass('d-none');
        }

        // Update brand title (wifi-text element and page title)
        if (portalSettings.brandTitle) {
            document.title = portalSettings.brandTitle + ' - Login Portal';
            const $wifiText = $('.wifi-text');
            if ($wifiText.length) {
                $wifiText.html(portalSettings.brandTitle + ' <i class="fa-solid fa-wifi wifi-icon"></i>');
            }
        }

        // Update announcements/subtitle
        const announcement = portalSettings.portalAnnouncements || portalSettings.announcements;
        if (announcement) {
            const $subtitle = $('.subtitle');
            if ($subtitle.length) {
                $subtitle.text(announcement);
            }
        }

        // Update "Powered by" footer with brandTitle
        if (portalSettings.brandTitle) {
            const $footerLink = $('.voucher-footer .footer-link, .footer-link');
            if ($footerLink.length) {
                $footerLink.text(portalSettings.brandTitle);
            }
        }

        // Note: Account Credits now shows totalPeso (inserted coins) from user status
        // Credits from portal settings are not displayed here

        // Check E-Payment availability (no delay, loads with other settings)
        checkEpaymentAvailable();

        // Auto-arrange buttons when some are hidden
        autoArrangeButtons();

        console.log('Portal settings applied');
    }

    // Auto-arrange buttons function - expands remaining visible buttons when others are hidden
    function autoArrangeButtons() {
        // Find all button rows (rates, voucher/session, eloading/epayment rows)
        const $buttonRows = $('.main-card .row.g-2.mb-2');

        $buttonRows.each(function() {
            const $row = $(this);
            const $cols = $row.children('.col-6');

            // Check visibility of buttons in each column
            let visibleCount = 0;
            let $visibleCol = null;

            $cols.each(function() {
                const $col = $(this);
                const $btn = $col.find('button');

                if ($btn.length && !$btn.hasClass('d-none')) {
                    visibleCount++;
                    $visibleCol = $col;
                }
            });

            // If only one button visible, make it full width
            if (visibleCount === 1 && $visibleCol) {
                $visibleCol.removeClass('col-6').addClass('col-12');
            } else if (visibleCount === 2) {
                // Reset to half width if both visible
                $cols.removeClass('col-12').addClass('col-6');
            } else if (visibleCount === 0) {
                // Hide the entire row if no buttons visible
                $row.addClass('d-none');
            } else {
                // Show the row
                $row.removeClass('d-none');
            }
        });
    }

    // Network stats collapse icon rotation is handled by Bootstrap
    // Listen to collapse events to update the chevron icon
    $('#networkStatsCollapse').on('shown.bs.collapse', function() {
        $statsToggle.find('i.fa-chevron-down').removeClass('fa-chevron-down').addClass('fa-chevron-up');
    }).on('hidden.bs.collapse', function() {
        $statsToggle.find('i.fa-chevron-up').removeClass('fa-chevron-up').addClass('fa-chevron-down');
    });

    // Toggle pause/resume
    $toggleTimeBtn.on('click', function() {
        // Add click animation
        $toggleTimeBtn.addClass('btn-click-animation');
        setTimeout(() => {
            $toggleTimeBtn.removeClass('btn-click-animation');
        }, 300);

        if (pauseStatus === 1) {
            // Currently paused, so resume
            resumeTime();
        } else {
            // Currently running, so pause
            pauseTime();
        }
    });

function formatExpiryTime(seconds) {
    if (seconds <= 0) return 'EXPIRED';

    const days = Math.floor(seconds / (24 * 60 * 60));

    // If more than 150 days, show "No Expiry"
    if (days > 150) {
        return 'No Expiry';
    }

    seconds %= (24 * 60 * 60);

    const hours = Math.floor(seconds / (60 * 60));
    seconds %= (60 * 60);

    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    // Format with leading zeros for minutes and seconds
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    // Include days only if there are any
    if (days > 0) {
        return `${days}d ${hours}h ${formattedMinutes}m ${formattedSeconds}s`;
    } else if (hours > 0) {
        return `${hours}h ${formattedMinutes}m ${formattedSeconds}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${formattedSeconds}s`;
    } else {
        return `${seconds}s`;
    }
}

    // Function to pause the time
    async function pauseTime() {
        if (!socketConnected) {
            showNotification('Error', 'Not connected to server');
            return;
        }

        const hideLoading = showLoading('Pausing session...');
        try {
            const success = await sendCommand('pause');
            if (success) {
                // Update UI only after server confirms success
                lastPauseCommandTime = Date.now();
                pauseStatus = 1;
                clearInterval(countdownInterval);
                if (expiryUpdateInterval) {
                    clearInterval(expiryUpdateInterval);
                    expiryUpdateInterval = null;
                }
                updateUI();
            }
            // Error notification is already shown by sendCommand
        } finally {
            hideLoading();
        }
    }

    // Function to resume the time
    async function resumeTime() {
        if (!socketConnected) {
            showNotification('Error', 'Not connected to server');
            return;
        }

        const hideLoading = showLoading('Resuming session...');
        try {
            const success = await sendCommand('resume');
            if (success) {
                // Update UI only after server confirms success
                lastPauseCommandTime = Date.now();
                pauseStatus = 0;
                pauseRemaining = 0;
                if (remainingTimeInSeconds > 0 && !dataMode) {
                    startCountdown(remainingTimeInSeconds);
                }
                updateUI();
            }
            // Error notification is already shown by sendCommand
        } finally {
            hideLoading();
        }
    }

    // Auto-claim function - automatically buy time when coins are inserted
    async function autoClaimTime() {
        if (portalSettings.insertCoinAutoClaim !== 'ON' || totalAmount <= 0) {
            return;
        }

        console.log('Auto-claim: Attempting to auto-claim time...');

        try {
            // Get station from selected coinslot
            let stationParam = '';
            if (clientNetworkInfo.selected_coinslot) {
                const coinslot = clientNetworkInfo.selected_coinslot;
                stationParam = coinslot.type === 'main_vendo' ? '' : `&chipid=${encodeURIComponent(coinslot.chip_id)}`;
            }

            // Call the session generate API with station
            const response = await $.ajax({
                url: `/api/coinslot/session-generate?type=time${stationParam}`,
                method: 'GET',
                dataType: 'json'
            });

            if (response.status === 'success' && response.data) {
                console.log('Auto-claim: Time purchased successfully');
                showNotification('Success', 'Time auto-claimed successfully');

                // Close modal and reset coin slot (skip auto-claim check to avoid recursion)
                closeCoinModal(true);
                stopCoinSlot();
                resetCoinCounter();

                // Request updated status to refresh UI
                if (socketConnected) {
                    sendCommand('status');
                }

                // Redirect after 3 seconds if afterDonePayingRedirect is set and valid
                const redirectUrl = portalSettings.afterDonePayingRedirect;
                if (redirectUrl && redirectUrl.trim() !== '' && redirectUrl.trim().toLowerCase() !== 'https://www.youtube.com') {
                    setTimeout(() => {
                        window.location.href = redirectUrl;
                    }, 3000);
                }
            }
        } catch (error) {
            console.error('Auto-claim error:', error);
        }
    }

    async function fetchWifiRates(chipid = null) {
        try {
            const hideLoading = showLoading('Loading rates...');

            // Build URL with chipid parameter if provided
            // If chipid is empty, use public /rates endpoint
            let url = RATES_API;
            if (chipid && chipid.trim() !== '') {
                url = `/rates/by-chipid?chipid=${encodeURIComponent(chipid)}`;
            }

            const response = await $.ajax({
                url: url,
                method: 'GET',
                dataType: 'json'
            });
            hideLoading();
            if (response.status === 'success' && response.data) {
                return response.data.map(rate => {
                    // Format the time from minutes to days, hours, and minutes
                    const formattedTime = formatMinutesToDaysHoursMinutes(rate.Time || 0);

                    // Format the expiry time (also in minutes)
                    let expiryFormatted = '';
                    if (rate.Expiry) {
                        expiryFormatted = formatMinutesToDaysHoursMinutes(rate.Expiry);
                    }

                    return {
                        name: rate.Note || 'WiFi Package',
                        amount: `₱${rate.Amount || 0}`,
                        time: formattedTime,
                        expiry: expiryFormatted
                    };
                });
            }
            return [];
        } catch (error) {
            console.error('Error fetching WiFi rates:', error);
            showNotification('Error', 'Could not load WiFi rates');
            return [];
        }
    }

    async function fetchDataRates(chipid = null) {
        try {
            const hideLoading = showLoading('Loading data rates...');

            // Build URL with chipid parameter if provided
            // If chipid is empty, use public /datarates endpoint
            let url = DATA_RATES_API;
            if (chipid && chipid.trim() !== '') {
                url = `/datarates/by-chipid?chipid=${encodeURIComponent(chipid)}`;
            }

            const response = await $.ajax({
                url: url,
                method: 'GET',
                dataType: 'json'
            });
            hideLoading();

            if (response.status === 'success' && response.data) {
                return response.data.map(rate => {
                    // Format the data size
                    let dataFormatted = '';
                    if (rate.Data) {
                        if (rate.Data >= 1000) {
                            dataFormatted = `${rate.Data / 1000} GB`;
                        } else {
                            dataFormatted = `${rate.Data} MB`;
                        }
                    }

                    // Format the expiry time (in minutes from database)
                    let expiryFormatted = '';
                    if (rate.Expiry) {
                        expiryFormatted = formatMinutesToDaysHoursMinutes(rate.Expiry);
                    }

                    return {
                        name: rate.Note || 'Data Package',
                        amount: `₱${rate.Amount || 0}`,
                        data: dataFormatted,
                        expiry: expiryFormatted
                    };
                });
            }
            return [];
        } catch (error) {
            console.error('Error fetching data rates:', error);
            showNotification('Error', 'Could not load data rates');
            return [];
        }
    }

    // Fetch rates by chipid
    async function fetchRatesByChipID(chipid) {
        try {
            const url = chipid ? `/rates/by-chipid?chipid=${encodeURIComponent(chipid)}` : '/rates';
            const response = await $.ajax({
                url: url,
                method: 'GET',
                dataType: 'json'
            });

            // Also fetch data rates
            let hasDataRates = false;
            try {
                const dataUrl = chipid ? `/datarates/by-chipid?chipid=${encodeURIComponent(chipid)}` : '/datarates';
                const dataResponse = await $.ajax({
                    url: dataUrl,
                    method: 'GET',
                    dataType: 'json'
                });
                hasDataRates = dataResponse.status === 'success' && dataResponse.data && dataResponse.data.length > 0;
            } catch (e) {
                console.log('No data rates available');
            }

            if (response.status === 'success') {
                cachedStationRates = response.data || [];
                hasStationRates = response.has_rates || false;
                return {
                    rates: cachedStationRates,
                    hasRates: hasStationRates,
                    hasDataRates: hasDataRates
                };
            }
            return { rates: [], hasRates: false, hasDataRates: hasDataRates };
        } catch (error) {
            console.error('Error fetching rates by station:', error);
            return { rates: [], hasRates: false, hasDataRates: false };
        }
    }

    // Update payment buttons visibility based on rates and portal settings
    function updatePaymentButtonsVisibility(hasRates, hasDataRates) {
        const $buyTimeBtn = $('#buy-time-btn');
        const $buyDataBtn = $('#buy-data-btn');
        const $buyVoucherBtn = $('#buy-voucher-btn');

        if (!hasRates) {
            // Hide buttons when no rates
            $buyTimeBtn.addClass('d-none');
            $buyDataBtn.addClass('d-none');
            $buyVoucherBtn.addClass('d-none');
        } else {
            // Show Buy Time if enabled in portal settings
            if (portalSettings.buyTime === 'Disable') {
                $buyTimeBtn.addClass('d-none');
            } else {
                $buyTimeBtn.removeClass('d-none');
            }

            // Show Generate Voucher only if buyVoucher is enabled in portal settings
            if (portalSettings.buyVoucher === 'Disable') {
                $buyVoucherBtn.addClass('d-none');
            } else {
                $buyVoucherBtn.removeClass('d-none');
            }

            // Only show Buy Data if data rates exist AND buyData is enabled
            if (hasDataRates && portalSettings.buyData !== 'Disable') {
                $buyDataBtn.removeClass('d-none');
            } else {
                $buyDataBtn.addClass('d-none');
            }
        }
    }

// Add these functions for e-loading functionality
async function fetchPrepaidProducts() {
    try {
        const response = await $.ajax({
            url: ELOAD_PRODUCTS_API,
            method: 'GET',
            dataType: 'json',
            timeout: 10000 // 10 second timeout
        });

        if (response.success && response.data) {
            prepaidProducts = response.data;
            return prepaidProducts;
        }
        return [];
    } catch (error) {
        console.error('Error fetching prepaid products:', error);
        if (error.statusText === 'timeout') {
            showNotification('Error', 'E-loading service timed out');
        } else {
            showNotification('Error', 'Could not load prepaid products');
        }
        return [];
    }
}

async function fetchLoadRates() {
    try {
        const response = await $.ajax({
            url: ELOAD_RATES_API,
            method: 'GET',
            dataType: 'json',
            timeout: 10000 // 10 second timeout
        });

        if (response.success && response.data) {
            loadRates = response.data;
            return loadRates;
        }
        return [];
    } catch (error) {
        console.error('Error fetching load rates:', error);
        if (error.statusText === 'timeout') {
            showNotification('Error', 'E-loading service timed out');
        } else {
            showNotification('Error', 'Could not load rate information');
        }
        return [];
    }
}

function getLoadRate(amount) {
    if (!loadRates || loadRates.length === 0) return 0;

    for (const rate of loadRates) {
        if (amount >= parseInt(rate.range_start) && amount <= parseInt(rate.range_end)) {
            return parseFloat(rate.rate);
        }
    }
    return 0;
}

function getCategoryProductsByProvider(provider) {
    if (!prepaidProducts || prepaidProducts.length === 0) return [];

    // Get all products for this provider using category field
    let providerProducts = [];

    // Special handling for TNT which may include some SMART products
    if (provider === 'TNT') {
        // Get products with TNT category
        const tntProducts = prepaidProducts.filter(product =>
            product.category === 'TNT'
        );

        // Also include SMART products that might be relevant for TNT
        const smartTntProducts = prepaidProducts.filter(product =>
            product.category === 'SMART' &&
            (product.telcotag.includes('TNT') || product.pdescription?.includes('TNT'))
        );

        providerProducts = [...tntProducts, ...smartTntProducts];
    } else {
        // For all other providers, get products by matching the category field exactly
        providerProducts = prepaidProducts.filter(product =>
            product.category === provider
        );
    }

    // Group products into logical categories
    const categories = {};

    providerProducts.forEach(product => {
        // Create logical grouping based on telcotag or description patterns
        let groupingCategory = "General Plans";

        if (product.telcotag.includes('DATA') || (product.pdescription && product.pdescription.includes('data'))) {
            groupingCategory = "Data Packages";
        } else if (product.telcotag.includes('UNLI') || (product.pdescription && product.pdescription.includes('Unlimited'))) {
            groupingCategory = "Unlimited Plans";
        } else if (product.telcotag.includes('CALL') || (product.pdescription && product.pdescription.includes('call'))) {
            groupingCategory = "Call and Text";
        } else if (product.telcotag.includes('SURF') || product.telcotag.includes('GIGA')) {
            groupingCategory = "Internet Packages";
        } else if (product.telcotag.includes('MAGIC')) {
            groupingCategory = "Magic Packages";
        } else if (product.telcotag.includes('TIK') || (product.pdescription && product.pdescription.includes('TikTok'))) {
            groupingCategory = "Social Media";
        } else if (product.telcotag.includes('PROMO')) {
            groupingCategory = "Promo Packages";
        }

        if (!categories[groupingCategory]) {
            categories[groupingCategory] = [];
        }

        categories[groupingCategory].push(product);
    });

    // Sort products by denomination within each category
    Object.keys(categories).forEach(category => {
        categories[category].sort((a, b) => a.denomination - b.denomination);
    });

    return categories;
}

function resetEloadingModal() {
    currentScreen = 'main';
    selectedService = '';
    selectedProvider = '';
    selectedProviderLogo = '';
    selectedLoadType = '';
    selectedPromo = null;

    // Reset UI - show main options, hide all sub-screens
    $('#main-options-row').show();
    $providerSelection.addClass('d-none').hide();
    $('#cashin-provider-selection').addClass('d-none').hide();
    $loadTypeContainer.addClass('d-none').hide();
    $promosContainer.addClass('d-none').hide();
    $numberInputContainer.addClass('d-none').hide();
    if ($('#cashin-form-container').length) {
        $('#cashin-form-container').remove();
    }
    $backBtn.addClass('d-none');

    // Restore original buyload providers if they were replaced by cash-in services
    if (originalProviderHtml) {
        $('#provider-selection .row').html(originalProviderHtml);
    }

    // Reset form elements
    $('#phone-number').val('');
    $('#amount').val('');
    $regularAmountContainer.show();
    $promoDetailsContainer.addClass('d-none');

    // Clear products container
    $('#products-container').empty();

    // Remove selections from all options
    $('.provider-option').removeClass('selected');
    $('.promo-item').removeClass('active');
    $('.eloading-option').removeClass('selected');
}


    function showNotification(title, message, autohide = true) {
        const $toast = $toastContainer;
        const $icon = $('#toast-icon');

        // Determine type based on title
        let type = 'toast-info';
        let iconClass = 'fa-solid fa-info-circle';

        const titleLower = title.toLowerCase();
        if (titleLower.includes('success') || titleLower.includes('connected')) {
            type = 'toast-success';
            iconClass = 'fa-solid fa-check-circle';
        } else if (titleLower.includes('error') || titleLower.includes('failed')) {
            type = 'toast-error';
            iconClass = 'fa-solid fa-times-circle';
        } else if (titleLower.includes('warning') || titleLower.includes('lost')) {
            type = 'toast-warning';
            iconClass = 'fa-solid fa-exclamation-triangle';
        }

        // Update content
        $toastTitle.text(title);
        $toastMessage.text(message);
        $icon.attr('class', 'toast-icon ' + iconClass);

        // Update toast style
        $toast.removeClass('toast-success toast-error toast-warning toast-info').addClass(type);

        // Show toast using Bootstrap
        toast.show();
    }

    function showLoading(message = 'Loading...') {
        $loadingText.text(message);
        $loadingOverlay.removeClass('d-none').css('display', 'flex');

        return function hideLoading() {
            $loadingOverlay.addClass('d-none').css('display', 'none');
        };
    }

    function formatMinutesToDaysHoursMinutes(minutes) {
        if (!minutes) return '0 minutes';

        const days = Math.floor(minutes / (24 * 60));

        // If more than 150 days, show "No Expiry"
        if (days > 150) {
            return 'No Expiry';
        }

        const hours = Math.floor((minutes % (24 * 60)) / 60);
        const remainingMinutes = Math.floor(minutes % 60);

        let formattedTime = '';

        if (days > 0) {
            formattedTime += `${days} day${days > 1 ? 's' : ''} `;
        }

        if (hours > 0) {
            formattedTime += `${hours} hour${hours > 1 ? 's' : ''} `;
        }

        if (remainingMinutes > 0 || (days === 0 && hours === 0)) {
            formattedTime += `${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
        }

        return formattedTime.trim();
    }

    // Format time function for days, hours, minutes, seconds
    // Use Portal.Utils for formatting functions
    const formatTime = Portal.Utils.formatTime;
    const formatBytes = Portal.Utils.formatBytes;

  function formatSpeed(speedInKbps) {
    if (speedInKbps >= 1e6) {
      // If the speed is at least 1,000,000 Kbps, display in Gbps
      return (speedInKbps / 1e6).toFixed(2) + ' Gbps';
    } else if (speedInKbps >= 1e3) {
      // If the speed is at least 1,000 Kbps, display in Mbps
      return (speedInKbps / 1e3).toFixed(2) + ' Mbps';
    } else {
      // Otherwise, keep it in Kbps
      return speedInKbps + ' Kbps';
    }
  }


// Function to show billers in a selected category
function showBillersInCategory(category, billers) {
    currentScreen = 'billers';

    // Hide categories container
    $('#bills-categories-container').hide();

    // Remove any existing billers container
    if ($('#billers-container').length) {
        $('#billers-container').remove();
    }

    // Create billers container
    const $billersContainer = $(`
        <div id="billers-container" class="mt-4">
            <h5 class="mb-3">${category}</h5>
            <div class="row g-2" id="billers-row"></div>
        </div>
    `);

    $('#eloading-modal .modal-body').append($billersContainer);

    // Sort billers alphabetically by description
    billers.sort((a, b) => a.description.localeCompare(b.description));

    // Add billers to the container
    billers.forEach(biller => {
        // Fix the logo path - convert from assets/ecBills/ to img/ecBills/
        const logoPath = biller.logo.replace('assets/ecBills/', 'img/ecBills/');

        const $billerCard = $(`
            <div class="col-md-4 col-6 mb-2">
                <div class="biller-option" data-billertag="${biller.billertag}">
                    <img src="${logoPath}" alt="${biller.description}" class="biller-logo"
                         onerror="this.src='img/network/placeholder.png';this.onerror='';">
                    <span>${biller.description}</span>
                </div>
            </div>
        `);

        $('#billers-row').append($billerCard);
    });

    // Add click handler for billers
    $('.biller-option').on('click', function() {
        const billerTag = $(this).data('billertag');
        const selectedBiller = window.billersData.find(b => b.billertag === billerTag);
        showBillerPaymentForm(selectedBiller);
    });

    $billersContainer.show();
}

// Function to show payment form for selected biller
function showBillerPaymentForm(biller) {
    currentScreen = 'billpayment';

    // Hide billers container
    $('#billers-container').hide();

    // Remove any existing payment form
    if ($('#bill-payment-form-container').length) {
        $('#bill-payment-form-container').remove();
    }

    // Fix the logo path
    const logoPath = biller.logo.replace('assets/ecBills/', 'img/ecBills/');

    // Create payment form
    const $paymentFormContainer = $(`
        <div id="bill-payment-form-container" class="mt-4">
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-header bg-primary text-white py-3">
                    <h5 class="mb-0 fw-bold d-flex align-items-center">
                        <img src="${logoPath}" alt="${biller.description}" class="biller-header-logo me-2"
                             onerror="this.src='img/network/placeholder.png';this.onerror='';">
                        ${biller.description}
                    </h5>
                </div>
                <div class="card-body p-4">
                    <div class="form-floating mb-3">
                        <input type="text" class="form-control" id="bill-field1"
                               placeholder="${biller.firstfield}"
                               maxlength="${biller.firstfieldwidth || 20}">
                        <label for="bill-field1">${biller.firstfield}</label>
                        <div class="form-text">Format: ${biller.firstfieldformat || 'Any'}, Max Length: ${biller.firstfieldwidth || 'N/A'}</div>
                    </div>

                    <div class="form-floating mb-3">
                        <input type="text" class="form-control" id="bill-field2"
                               placeholder="${biller.secondfield}"
                               maxlength="${biller.secondfieldwidth || 20}">
                        <label for="bill-field2">${biller.secondfield}</label>
                        <div class="form-text">Format: ${biller.secondfieldformat || 'Any'}, Max Length: ${biller.secondfieldwidth || 'N/A'}</div>
                    </div>

                    <div class="form-floating mb-3">
                        <input type="number" class="form-control" id="bill-amount" placeholder="Amount" min="${biller.MinAmount || 1}">
                        <label for="bill-amount">Amount (Min: ₱${biller.MinAmount || '1.00'})</label>
                    </div>

                    <div class="alert alert-info d-flex align-items-center mb-3" role="alert">
                        <i class="fa-solid fa-circle-info me-2 fs-5"></i>
                        <div>
                            <strong>Service Fee:</strong> <span id="bill-fee">₱${biller.servicecharge || '0'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Policy Information -->
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-header bg-light py-2">
                    <h6 class="mb-0 fw-bold">Payment Policies</h6>
                </div>
                <div class="card-body p-3">
                    <ul class="policy-list mb-0">
                        ${biller.policy1 ? `<li>${biller.policy1}</li>` : ''}
                        ${biller.policy2 ? `<li>${biller.policy2}</li>` : ''}
                        ${biller.policy3 ? `<li>${biller.policy3}</li>` : ''}
                        <li>Area of Coverage: ${biller.AreaofCoverage || 'Nationwide'}</li>
                    </ul>
                </div>
            </div>

            <!-- Pricing Ranges -->
            ${biller.pricing_ranges ? `
            <div class="pricing-info mb-3">
                <div class="pricing-header mb-2">Processing Fee Rates:</div>
                <div class="table-responsive">
                    <table class="table table-sm table-bordered">
                        <thead class="table-light">
                            <tr>
                                <th>Amount Range</th>
                                <th>Fee</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${biller.pricing_ranges.map(range => `
                                <tr>
                                    <td>₱${range.min} - ₱${range.max}</td>
                                    <td>₱${range.rate}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            ` : ''}

            <button class="btn btn-success w-100" id="confirm-bill-payment-btn">
                <i class="fa-solid fa-check-circle me-2"></i>Confirm Payment
            </button>
        </div>
    `);

    $('#eloading-modal .modal-body').append($paymentFormContainer);

    // Add validation and event handlers for the form
    setupBillPaymentFormValidation(biller);

    $paymentFormContainer.show();
}

// Function to setup validation for bill payment form
function setupBillPaymentFormValidation(biller) {
    // Add event listener for amount input to calculate fee if there are pricing ranges
    if (biller.pricing_ranges && biller.pricing_ranges.length > 0) {
        $('#bill-amount').on('input', function() {
            const amount = parseFloat($(this).val()) || 0;
            let fee = biller.servicecharge || 0;

            // Find the applicable fee rate from pricing ranges
            for (const range of biller.pricing_ranges) {
                if (amount >= range.min && amount <= range.max) {
                    fee = range.rate;
                    break;
                }
            }

            // Update the fee display
            $('#bill-fee').text(`₱${fee}`);
        });
    }

    // Add field format validation
    $('#bill-field1').on('input', function() {
        validateField($(this), biller.firstfieldformat, biller.firstfieldwidth);
    });

    $('#bill-field2').on('input', function() {
        validateField($(this), biller.secondfieldformat, biller.secondfieldwidth);
    });

    // Add confirm button handler
    $('#confirm-bill-payment-btn').on('click', function() {
        const field1Value = $('#bill-field1').val();
        const field2Value = $('#bill-field2').val();
        const amount = parseFloat($('#bill-amount').val()) || 0;

        // Validate fields
        if (!validateBillPaymentForm(biller, field1Value, field2Value, amount)) {
            return;
        }

        // Calculate service fee
        let fee = biller.servicecharge || 0;
        if (biller.pricing_ranges && biller.pricing_ranges.length > 0) {
            for (const range of biller.pricing_ranges) {
                if (amount >= range.min && amount <= range.max) {
                    fee = range.rate;
                    break;
                }
            }
        }

        // Show confirmation dialog
        if (confirm(`Confirm payment for ${biller.description}:
- ${biller.firstfield}: ${field1Value}
- ${biller.secondfield}: ${field2Value}
- Amount: ₱${amount.toFixed(2)}
- Service Fee: ₱${fee}
- Total: ₱${(amount + parseFloat(fee)).toFixed(2)}`)) {

            // Show loading animation
            const hideLoading = showLoading('Processing bill payment...');

            // Simulate successful processing (replace with actual API call)
            setTimeout(() => {
                hideLoading();

                // Show success message
                showNotification('Success', `Payment for ${biller.description} (₱${amount.toFixed(2)}) submitted successfully!`);

                // Close the modal
                bootstrap.Modal.getInstance(document.getElementById('eloading-modal')).hide();
            }, 2000);
        }
    });
}

// Function to validate bill payment form
function validateBillPaymentForm(biller, field1Value, field2Value, amount) {
    // Validate first field
    if (!field1Value) {
        showNotification('Error', `Please enter ${biller.firstfield}`);
        return false;
    }

    if (biller.firstfieldformat === 'Numeric' && !/^\d+$/.test(field1Value)) {
        showNotification('Error', `${biller.firstfield} must contain only numbers`);
        return false;
    }

    if (biller.firstfieldwidth && field1Value.length > biller.firstfieldwidth) {
        showNotification('Error', `${biller.firstfield} must not exceed ${biller.firstfieldwidth} characters`);
        return false;
    }

    // Validate second field
    if (!field2Value) {
        showNotification('Error', `Please enter ${biller.secondfield}`);
        return false;
    }

    if (biller.secondfieldformat === 'Numeric' && !/^\d+$/.test(field2Value)) {
        showNotification('Error', `${biller.secondfield} must contain only numbers`);
        return false;
    }

    if (biller.secondfieldwidth && field2Value.length > biller.secondfieldwidth) {
        showNotification('Error', `${biller.secondfield} must not exceed ${biller.secondfieldwidth} characters`);
        return false;
    }

    // Validate amount
    if (!amount || amount <= 0) {
        showNotification('Error', 'Please enter a valid amount');
        return false;
    }

    if (biller.MinAmount && amount < parseFloat(biller.MinAmount)) {
        showNotification('Error', `Minimum amount is ₱${biller.MinAmount}`);
        return false;
    }

    // All validations passed
    return true;
}

// Helper function to validate field based on format and width
function validateField($field, format, width) {
    const value = $field.val();

    // Validate format
    if (format === 'Numeric') {
        // Allow only digits
        $field.val(value.replace(/[^\d]/g, ''));
    } else if (format === 'AlphaNumeric') {
        // Allow only letters and digits
        $field.val(value.replace(/[^a-zA-Z0-9]/g, ''));
    }

    // Validate width
    if (width && value.length > width) {
        $field.val(value.substring(0, width));
    }
}

// Function to get icon based on category
function getCategoryIcon(category) {
    switch (category.toLowerCase()) {
        case 'telecommunications':
            return 'fa-solid fa-phone';
        case 'utilities':
            return 'fa-solid fa-lightbulb';
        case 'government':
            return 'fa-solid fa-landmark';
        case 'loans':
            return 'fa-solid fa-hand-holding-dollar';
        case 'insurance':
            return 'fa-solid fa-shield-alt';
        case 'cable & internet':
        case 'cable and internet':
            return 'fa-solid fa-wifi';
        case 'water':
            return 'fa-solid fa-faucet';
        case 'electric':
            return 'fa-solid fa-bolt';
        case 'credit cards':
            return 'fa-solid fa-credit-card';
        case 'education':
            return 'fa-solid fa-graduation-cap';
        case 'transportation':
            return 'fa-solid fa-bus';
        case 'real estate':
            return 'fa-solid fa-home';
        case 'hmo':
            return 'fa-solid fa-hospital';
        default:
            return 'fa-solid fa-file-invoice';
    }
}

function updateUI() {
    // Pause status check - isPaused takes priority over connected
    const isPaused = pauseStatus === 1;
    const statusIcon = $statusIndicator.find('.status-icon i');
    const statusText = $statusIndicator.find('.status-text');


    // Remove all status classes first
    $statusIndicator.removeClass('bg-danger-subtle text-danger bg-success-subtle text-success bg-warning-subtle text-warning');
    $remainingTime.removeClass('paused');
    $('#time-container').removeClass('border-warning-subtle border-primary-subtle border-info-subtle');

    // Get current label state to avoid unnecessary DOM updates
    const currentLabel = $('.time-label').text().trim();
    const isDataLabel = currentLabel.includes('Data Allowance');

    // Only update the label if the mode actually changed
    if (dataMode && !isDataLabel) {
        // Switch to data mode
        $('.time-label').html(`<i class="fa-solid fa-database me-1"></i> Data Allowance:`);
        $('#time-container').removeClass('border-primary-subtle').addClass('border-info-subtle');
    } else if (!dataMode && isDataLabel) {
        // Switch to time mode
        $('.time-label').html('\u23F1 Remaining Time:');
        $('#time-container').removeClass('border-info-subtle').addClass('border-primary-subtle');
    }

    // Handle the different states
    if (isPaused) {
        // Pause state
        $statusIndicator.addClass('bg-warning-subtle text-warning');
        statusIcon.attr('class', '').text('\u23F8');
        statusText.text('Paused');
        $remainingTime.addClass('paused');
        $('#time-container').addClass('border-warning-subtle');

        // Update toggle button to show Resume - show if we have remaining time OR pause remaining
        $toggleTimeBtn.removeClass('btn-warning').addClass('btn-success');
        $toggleTimeBtn.find('.icon-container').html('\u25B6');
        $toggleTimeBtn.find('.btn-label').text('Resume ' + (dataMode ? 'Data' : 'Time'));
        if (remainingTimeInSeconds > 0 || pauseRemaining > 0) {
            $toggleTimeBtn.removeClass('d-none');
        } else {
            $toggleTimeBtn.addClass('d-none');
        }

        // Display pause remaining time if available
        if (pauseRemaining && pauseRemaining > 0) {
            if (dataMode) {
                const dataAllowance = formatBytes(pauseRemaining * 1024 * 1024);
                $remainingTime.text(dataAllowance);
            } else {
                $remainingTime.text(formatTime(pauseRemaining));
            }
        } else if (remainingTimeInSeconds > 0) {
            if (dataMode) {
                const dataAllowance = formatBytes(remainingTimeInSeconds * 1024 * 1024);
                $remainingTime.text(dataAllowance);
            } else {
                $remainingTime.text(formatTime(remainingTimeInSeconds));
            }
        } else {
            $remainingTime.text('PAUSED');
        }

        // Hide network stats collapse
        $('#networkStatsCollapse').collapse('hide');
    } else if (connected && remainingTimeInSeconds > 0) {
        // Connected state - ONLY if we have remaining time
        $statusIndicator.addClass('bg-success-subtle text-success');
        statusIcon.attr('class', '').text('\u2713');
        statusText.text('Connected');

        // Update toggle button to show Pause
        $toggleTimeBtn.removeClass('btn-success').addClass('btn-warning');
        $toggleTimeBtn.find('.icon-container').html('\u23F8');
        $toggleTimeBtn.find('.btn-label').text('Pause ' + (dataMode ? 'Data' : 'Time'));

        // Show expiry info if we have an expiry time
        if (expiryTimeInSeconds > 0) {
            updateExpiryTimeDisplay();
            $('#expiry-info').show();
        } else {
            $('#expiry-info').hide();
        }

        // Show remaining time or data based on mode
        if (dataMode) {
            // Show data allowance instead of time for data mode
            const dataAllowance = formatBytes(remainingTimeInSeconds * 1024 * 1024); // Convert MB to bytes
            const currentDisplay = $remainingTime.text();
            if (currentDisplay !== dataAllowance) {
                $remainingTime.text(dataAllowance);
            }
        } else {
            // For time mode
            const formattedTime = formatTime(remainingTimeInSeconds);
            const currentDisplay = $remainingTime.text();
            if (currentDisplay !== formattedTime) {
                $remainingTime.text(formattedTime);
            }
        }
        // Only show toggle button if we have remaining time AND pause limit is available
        if (pauseTimeLimit > 0) {
            // Check "Show Pause When Time Less Than" setting
            if (portalSettings.showPauseTimeWhenLessThan && portalSettings.showPauseTimeInMinutes > 0) {
                const thresholdSeconds = portalSettings.showPauseTimeInMinutes * 60;
                if (remainingTimeInSeconds < thresholdSeconds) {
                    $toggleTimeBtn.removeClass('d-none');
                } else {
                    $toggleTimeBtn.addClass('d-none');
                }
            } else {
                $toggleTimeBtn.removeClass('d-none');
            }
        } else {
            $toggleTimeBtn.addClass('d-none');
        }

        // Show expiry info if available
        if (expiryTimeInSeconds > 0) {
            updateExpiryTimeDisplay();
        } else if ($('#expiry-container').length > 0) {
            // Hide expiry container if no expiry time and container exists
            $('#expiry-container').hide();
        }
    } else {
        // Disconnected state - No remaining time
        $statusIndicator.addClass('bg-danger-subtle text-danger');
        statusIcon.attr('class', '').text('\u2715');
        statusText.text('Disconnected');
        $remainingTime.text('--');
        $toggleTimeBtn.addClass('d-none');
        // Hide network stats collapse
        $('#networkStatsCollapse').collapse('hide');

        // Reset to time mode display when no time
        $('.time-label').html('\u23F1 Remaining Time:');
        $('#time-container').removeClass('border-info-subtle').addClass('border-primary-subtle');

        // Hide expiry container when no time
        if ($('#expiry-container').length > 0) {
            $('#expiry-container').hide();
        }
    }

    // Show IP and MAC addresses in new collapsed structure
    $connectionInfo.html(`
        <div class="d-flex justify-content-between mb-2">
            <span class="fw-semibold"><i class="fa-solid fa-globe me-1"></i> IP</span>
            <span class="fw-bold">${ipAddress}</span>
        </div>
        <div class="d-flex justify-content-between mb-2">
            <span class="fw-semibold"><i class="fa-solid fa-network-wired me-1"></i> MAC</span>
            <span class="fw-bold">${macAddress}</span>
        </div>
        <div id="device-id-info" class="d-flex justify-content-between">
            <span class="fw-semibold"><i class="fa-solid fa-fingerprint me-1"></i> Device</span>
            <span id="device-id-display" class="fw-bold">${formatDeviceIdDisplay(deviceId)}</span>
        </div>
    `);

    // Show credits (just value in new design)
    $creditInfo.text(`₱${credits}`);

    // Show cpoints (just value in new design)
    $cpointsInfo.text(`${cpoints}`);

    // Update free time button visibility
    updateFreeTimeButton();
}



function updateExpiryTimeDisplay() {
    // Check if expiry is more than 150 days (150 * 24 * 60 * 60 = 12960000 seconds)
    const days = Math.floor(expiryTimeInSeconds / (24 * 60 * 60));
    let formattedExpiryTime;
    if (days > 150) {
        formattedExpiryTime = 'No Expiry';
    } else {
        formattedExpiryTime = formatTime(expiryTimeInSeconds);
    }

    // Update the text
    $('#expiry-time').text(formattedExpiryTime);

    // Handle the styling based on state (30 minutes = 1800 seconds)
    if (expiryTimeInSeconds <= 0) {
        // Expired state
        $('#expiry-time').removeClass('paused');
        $('#expiry-info').removeClass('expiry-warning text-info text-warning')
                         .addClass('expiry-critical text-danger');
    } else if (expiryTimeInSeconds < 1800) {
        // Warning state - less than 30 minutes left
        $('#expiry-time').removeClass('paused');
        $('#expiry-info').removeClass('expiry-critical text-info text-danger')
                         .addClass('expiry-warning text-warning');
    } else {
        // Normal state
        $('#expiry-time').removeClass('paused');
        $('#expiry-info').removeClass('expiry-warning expiry-critical text-warning text-danger')
                         .addClass('text-info');
    }

    // Show or hide based on availability
    if (connected && expiryTimeInSeconds > 0) {
        $('#expiry-info').show();
    } else if (expiryTimeInSeconds <= 0) {
        // Still show if expired, with expired styling
        $('#expiry-info').show();
    } else {
        $('#expiry-info').hide();
    }
}

function startExpiryCountdown(expiryInSeconds) {
    // Clear any existing interval
    if (expiryUpdateInterval) {
        clearInterval(expiryUpdateInterval);
        expiryUpdateInterval = null;
    }

    // Don't start countdown if no expiry time (new visitor without session)
    if (!expiryInSeconds || expiryInSeconds <= 0) {
        expiryTimeInSeconds = 0;
        return null;
    }

    // Server sends expiry time in seconds
    expiryTimeInSeconds = expiryInSeconds;
    updateExpiryTimeDisplay();

    // Start the countdown every second (like remaining time)
    expiryUpdateInterval = setInterval(() => {
        // Decrement by 1 second
        expiryTimeInSeconds--;
        updateExpiryTimeDisplay();

        if (expiryTimeInSeconds <= 0) {
            clearInterval(expiryUpdateInterval);
            expiryUpdateInterval = null;

            // If expiry time reaches zero, disconnect user
            disconnectUser();
            showNotification('Session Expired', 'Your session has expired.');
        }
    }, 1000); // Update every second

    return expiryUpdateInterval;
}

// Update free time button visibility
function updateFreeTimeButton() {
    if (canClaimFreeTime) {
        $freeTimeBtn.removeClass('d-none');
    } else {
        $freeTimeBtn.addClass('d-none');
    }
}

// Reset checking flag after showing E-Payment toast
async function resetCheckingFlag() {
    try {
        const portalData = localStorage.getItem('wifiPortalData');
        if (!portalData) return;

        const { mac } = JSON.parse(portalData);
        await fetch(`/api/portal-user/reset-checking?mac=${encodeURIComponent(mac)}`, {
            method: 'POST'
        });
        console.log('[E-Payment] Checking flag reset');
    } catch (error) {
        console.error('[E-Payment] Failed to reset checking flag:', error);
    }
}

// Claim free time
async function claimFreeTime() {
    const hideLoading = showLoading('Claiming free time...');

    try {
        const response = await $.ajax({
            url: FREE_TIME_GENERATE_API,
            method: 'GET',
            dataType: 'json'
        });

        hideLoading();

        if (response.status === 'success') {
            showNotification('Success', response.message || 'Free time claimed successfully!');
            canClaimFreeTime = false;
            $freeTimeBtn.addClass('d-none');

            // Request status update to refresh the UI
            if (socketConnected) {
                sendCommand('status');
            }
        } else {
            showNotification('Error', response.message || response.error || 'Failed to claim free time');
        }
    } catch (error) {
        hideLoading();
        console.error('Error claiming free time:', error);
        showNotification('Error', 'Failed to claim free time. Please try again.');
    }
}

// Modified handleSSEMessage - simplified to handle expiry like remaining time
// NOTE: handleSSEMessage function moved below to avoid duplicate definition

    // Modify startCountdown to respect pause status and data mode
    function startCountdown(durationInSeconds) {
        // Clear existing interval if any
        clearInterval(countdownInterval);

        // Set initial time
        remainingTimeInSeconds = durationInSeconds;
        updateRemainingTime();

        // Don't start countdown if in pause mode or data mode
        if (pauseStatus === 1 || dataMode) {
            return;
        }

        // Start the countdown only for time mode
        countdownInterval = setInterval(() => {
            // If session gets paused or switches to data mode, stop the countdown
            if (pauseStatus === 1 || dataMode) {
                clearInterval(countdownInterval);
                return;
            }

            remainingTimeInSeconds--;
            updateRemainingTime();

            if (remainingTimeInSeconds <= 0) {
                clearInterval(countdownInterval);
                disconnectUser();
            }
        }, 1000);
    }

    // A new function to update just the remaining time display
    function updateRemainingTime() {
        if (pauseStatus === 1 && pauseRemaining > 0) {
            if (dataMode) {
                const dataAllowance = formatBytes(pauseRemaining * 1024 * 1024);
                $remainingTime.text(dataAllowance);
            } else {
                $remainingTime.text(formatTime(pauseRemaining));
            }
        } else {
            if (dataMode) {
                const dataAllowance = formatBytes(remainingTimeInSeconds * 1024 * 1024);
                $remainingTime.text(dataAllowance);
            } else {
                $remainingTime.text(formatTime(remainingTimeInSeconds));
            }
        }
    }

    function disconnectUser() {
        connected = false;
        updateUI();
    }

    // Show desktop mode blocking message
    function showDesktopModeBlock() {
        // Hide the main portal content
        $('body').html(`
            <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; text-align: center; padding: 20px;">
                <i class="fa-solid fa-desktop" style="font-size: 80px; margin-bottom: 30px; color: #f59e0b;"></i>
                <h1 style="font-size: 28px; margin-bottom: 15px;">Portal Access Restricted</h1>
                <div style="margin-top: 20px; padding: 20px 30px; background: rgba(245, 158, 11, 0.1); border: 1px solid #f59e0b; border-radius: 10px; max-width: 450px;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 24px; color: #f59e0b; margin-bottom: 10px;"></i>
                    <p style="font-size: 15px; color: #e2e8f0; line-height: 1.8; margin: 0;">
                        You are not allowed to use the portal because this device is registered as a <strong style="color: #f59e0b;">Desktop</strong>.<br><br>
                        Please use the <strong style="color: #4ade80;">Piso Net App of LPB</strong> to access services.
                    </p>
                </div>
            </div>
        `);
    }

    // Initial authentication via HTTP to get IP and MAC
    async function initialAuthentication(showSuccessNotification = false) {
        const hideLoading = showLoading('Authenticating...');

        try {
            const response = await $.ajax({
                url: AUTH_API,
                method: 'GET',
                dataType: 'json'
            });

            if (response.status === 'success') {
                // Save data to localStorage
                if (response.data) {
                    const userData = {
                        ip: response.data.ip,
                        mac: response.data.mac
                    };

                    localStorage.setItem('wifiPortalData', JSON.stringify(userData));

                    ipAddress = response.data.ip;
                    macAddress = response.data.mac;

                    // Check hasFreeTime ONCE on page load/refresh
                    if (response.data.hasFreeTime !== undefined) {
                        canClaimFreeTime = response.data.hasFreeTime === true;
                        updateFreeTimeButton();
                        console.log('FreeTime: Initial check from auth - hasFreeTime=' + canClaimFreeTime);
                    }

                    // Store mainvendo_enabled setting for Insert Money fallback
                    if (response.data.mainvendo_enabled !== undefined) {
                        clientNetworkInfo.mainvendo_enabled = response.data.mainvendo_enabled;
                        console.log('MainVendo: enabled=' + clientNetworkInfo.mainvendo_enabled);
                    }

                    // Setup SSE with IP and MAC
                    setupSSE(response.data.ip, response.data.mac);
                }

                hideLoading();
                // Only show notification when explicitly requested (not on page refresh)
                if (showSuccessNotification) {
                    showNotification('Success', 'Authentication successful!');
                }
                return true;
            } else {
                hideLoading();
                showNotification('Error', 'Authentication failed: ' + (response.message || 'Unknown error'));
                return false;
            }
        } catch (error) {
            hideLoading();
            console.error('Authentication error:', error);
            showNotification('Error', 'Error connecting to authentication server. Please try again.');
            return false;
        }
    }

    // Portal EventSource for SSE
    let portalEventSource = null;

    function setupSSE(ip, mac) {
        // Prevent multiple simultaneous connection attempts
        if (isReconnecting) {
            console.log('Already attempting to reconnect, skipping...');
            return;
        }

        // If already connected, don't reconnect
        if (portalEventSource && portalEventSource.readyState === EventSource.OPEN) {
            console.log('SSE already connected');
            return;
        }

        // Clear any pending reconnect timer
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }

        // Close existing connection
        if (portalEventSource) {
            portalEventSource.close();
            portalEventSource = null;
        }

        // Get IP and MAC from parameters or localStorage
        let sseIp = ip;
        let sseMac = mac;
        if (!sseIp || !sseMac) {
            const portalData = localStorage.getItem('wifiPortalData');
            if (portalData) {
                const data = JSON.parse(portalData);
                sseIp = data.ip;
                sseMac = data.mac;
            } else {
                showNotification('Error', 'IP and MAC are required for SSE connection');
                return;
            }
        }

        try {
            isReconnecting = true;
            // Connect with IP and MAC in the URL
            const sseUrl = `${PORTAL_SSE_URL}?ip=${encodeURIComponent(sseIp)}&mac=${encodeURIComponent(sseMac)}`;
            console.log('[SSE] Connecting to portal:', sseUrl);
            portalEventSource = new EventSource(sseUrl);

            portalEventSource.onopen = function() {
                console.log('[SSE] Portal connection established');
                socketConnected = true;
                socketRetryCount = 0;
                isReconnecting = false;
                lastConnectionTime = Date.now();
                $sseStatus.addClass('connected active');

                // Hide disconnection overlay if it was showing
                if (isShowingDisconnected) {
                    hideDisconnectedOverlay();
                    showNotification('Connected', 'WiFi connection restored!');
                }
            };

            // Listen for status events
            portalEventSource.addEventListener('status', function(event) {
                try {
                    const data = JSON.parse(event.data);
                    handleSSEMessage(data);
                } catch (e) {
                    console.error('[SSE] Error parsing message:', e);
                }

                // Visual feedback - pulse effect
                $sseStatus.removeClass('active');
                setTimeout(() => $sseStatus.addClass('active'), 50);
            });

            // Listen for error events
            portalEventSource.addEventListener('error', function(event) {
                try {
                    const data = JSON.parse(event.data);
                    console.error('[SSE] Server error:', data);
                } catch (e) {
                    // Not JSON, ignore
                }
            });

            portalEventSource.onerror = function(error) {
                console.error('[SSE] Portal error:', error);
                $sseStatus.removeClass('connected active');
                socketConnected = false;
                isReconnecting = false;

                if (portalEventSource.readyState === EventSource.CLOSED) {
                    const now = Date.now();
                    lastDisconnectTime = now;

                    console.log('[SSE] Connection closed, checking if still connected to WiFi...');

                    // Check if we're still connected to WiFi before showing overlay
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 3000);

                    fetch(AUTH_API, { method: 'GET', signal: controller.signal })
                        .then(response => response.json())
                        .then(response => {
                            clearTimeout(timeoutId);
                            if (response.status === 'success' && response.data && response.data.ip && response.data.mac) {
                                // Still connected to WiFi - just reconnect SSE silently
                                console.log('[SSE] Still connected to WiFi, reconnecting silently...');
                                setTimeout(() => {
                                    if (!socketConnected && !isReconnecting) {
                                        setupSSE(response.data.ip, response.data.mac);
                                    }
                                }, 1000);
                            } else {
                                // Auth failed - show disconnected overlay
                                console.log('[SSE] Auth check failed, showing disconnected overlay');
                                showDisconnectedOverlay();
                            }
                        })
                        .catch(() => {
                            clearTimeout(timeoutId);
                            // Network error - show disconnected overlay
                            console.log('[SSE] Network error, showing disconnected overlay');
                            showDisconnectedOverlay();
                        });
                }
            };
        } catch (error) {
            console.error('[SSE] Setup error:', error);
            isReconnecting = false;
        }
    }


    // Show disconnection overlay and start fetch-only check (no SSE reconnect loop)
    function showDisconnectedOverlay() {
        if (isShowingDisconnected) return;
        isShowingDisconnected = true;

        // Close any open modals EXCEPT coin modal (let coin slot keep working if possible)
        try {
            if (coinWaitingModal) coinWaitingModal.hide();
            // Don't close coin modal or SSE - let it reconnect on its own
            // The coin SSE has its own auto-reconnect logic
        } catch (e) {
            // Ignore modal close errors
        }

        // Show full screen overlay
        $disconnectedOverlay.removeClass('d-none');
        $reconnectStatus.text('Connecting... Please wait');
        $reconnectSpinner.removeClass('d-none');

        // Start fetch-only connection check (no SSE setup until confirmed online)
        startFetchOnlyCheck();
    }

    // Hide disconnection overlay
    function hideDisconnectedOverlay() {
        isShowingDisconnected = false;
        $disconnectedOverlay.addClass('d-none');

        // Clear intervals
        if (disconnectedReconnectInterval) {
            clearInterval(disconnectedReconnectInterval);
            disconnectedReconnectInterval = null;
        }
        if (disconnectedCountdownInterval) {
            clearInterval(disconnectedCountdownInterval);
            disconnectedCountdownInterval = null;
        }
    }

    // Start auto-reconnect when disconnected
    // Fetch-only connection check - requires 2 successful fetches before reconnecting
    let fetchSuccessCount = 0;
    const requiredSuccessCount = 2; // Need 2 successful fetches to confirm stable connection

    function startFetchOnlyCheck() {
        fetchSuccessCount = 0;
        let countdown = 5;

        // Clear any existing intervals
        if (disconnectedReconnectInterval) clearInterval(disconnectedReconnectInterval);
        if (disconnectedCountdownInterval) clearInterval(disconnectedCountdownInterval);

        // Update countdown every second
        disconnectedCountdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                $reconnectCountdown.text(countdown);
            }
        }, 1000);

        // Check connection with fetch only (no SSE setup until stable)
        // Use /portal-user/auth which auto-detects IP and MAC from request
        const checkConnection = () => {
            countdown = 5;
            $reconnectCountdown.text(countdown);
            $reconnectStatus.text('Checking connection...');
            $reconnectSpinner.removeClass('d-none');

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            // Use AUTH_API which auto-detects IP/MAC (doesn't require parameters)
            fetch(AUTH_API, {
                method: 'GET',
                signal: controller.signal
            })
            .then(response => response.json())
            .then(response => {
                clearTimeout(timeoutId);
                if (response.status === 'success' && response.data && response.data.ip && response.data.mac) {
                    fetchSuccessCount++;
                    $reconnectStatus.text(`Connection detected (${fetchSuccessCount}/${requiredSuccessCount})...`);

                    // Only setup SSE after multiple successful fetches (stable connection)
                    if (fetchSuccessCount >= requiredSuccessCount) {
                        const userData = {
                            ip: response.data.ip,
                            mac: response.data.mac,
                            remainingTime: response.data.remainingTime || 0,
                            remainingCredit: response.data.remainingCredit || 0
                        };
                        localStorage.setItem('wifiPortalData', JSON.stringify(userData));

                        // Stop checking
                        if (disconnectedReconnectInterval) {
                            clearInterval(disconnectedReconnectInterval);
                            disconnectedReconnectInterval = null;
                        }
                        if (disconnectedCountdownInterval) {
                            clearInterval(disconnectedCountdownInterval);
                            disconnectedCountdownInterval = null;
                        }

                        $reconnectStatus.text('Connected! Restoring...');
                        hideDisconnectedOverlay();
                        setupSSE(userData.ip, userData.mac);
                        showNotification('Connected', 'WiFi connection restored!');
                    }
                } else {
                    fetchSuccessCount = 0; // Reset on failure
                    $reconnectStatus.text('Waiting for Piso WiFi...');
                    $reconnectSpinner.addClass('d-none');
                }
            })
            .catch(() => {
                clearTimeout(timeoutId);
                fetchSuccessCount = 0; // Reset on failure
                $reconnectStatus.text('Waiting for Piso WiFi...');
                $reconnectSpinner.addClass('d-none');
            });
        };

        // Initial check after short delay
        setTimeout(checkConnection, 1000);

        // Check every 5 seconds
        disconnectedReconnectInterval = setInterval(checkConnection, 5000);
    }

    // Send commands via HTTP POST (SSE is receive-only)
    async function sendCommand(type, data = {}) {
        const portalData = localStorage.getItem('wifiPortalData');
        if (!portalData) {
            console.warn('No portal data for sending command');
            return false;
        }

        const { ip, mac } = JSON.parse(portalData);

        try {
            let url;
            switch (type) {
                case 'pause':
                    url = `${PAUSE_API}?ip=${encodeURIComponent(ip)}&mac=${encodeURIComponent(mac)}`;
                    break;
                case 'resume':
                    url = `${RESUME_API}?ip=${encodeURIComponent(ip)}&mac=${encodeURIComponent(mac)}`;
                    break;
                case 'status':
                case 'ping':
                    // No longer needed - SSE handles status updates automatically
                    return true;
                default:
                    console.log('Unknown command type:', type);
                    return false;
            }

            const response = await fetch(url, { method: 'POST' });
            const result = await response.json();

            if (result.status === 'success') {
                // Show notification - UI update is handled by caller (pauseTime/resumeTime)
                if (type === 'pause') {
                    showNotification('Session Paused', result.message || 'Your session has been paused');
                } else if (type === 'resume') {
                    showNotification('Session Resumed', result.message || 'Your session has been resumed');
                }
                return true;
            } else {
                showNotification('Error', result.error || 'Command failed');
                return false;
            }
        } catch (error) {
            console.error('Error sending command:', error);
            showNotification('Error', 'Could not send command');
            return false;
        }
    }


function handleSSEMessage(data) {
    if (!data || !data.status) {
        console.error('Invalid SSE message format', data);
        return;
    }

    // Prevent duplicate message processing by checking timestamp
    const currentTime = Date.now();
    if (currentTime - lastProcessedMessageTime < 300) { // Increased from 100ms to 300ms for better debouncing
        console.log('Skipping duplicate message - too soon after last message');
        return;
    }
    lastProcessedMessageTime = currentTime;

    // Handle error messages
    if (data.status === 'error') {
        showNotification('Error', data.error || 'An error occurred');
        return;
    }

    // Handle success messages with data
    if (data.status === 'success' && data.data) {
        const userData = data.data;

        // Check if this device is an allowed MAC (MAC Control)
        if (userData.is_allowed_mac) {
            connected = true;
            pauseStatus = 0;
            // Update IP/MAC
            if (userData.ip) ipAddress = userData.ip;
            if (userData.mac) macAddress = userData.mac;
            // Status badge
            var $si = $('#status-indicator');
            $si.removeClass('bg-danger-subtle text-danger bg-warning-subtle text-warning bg-secondary-subtle text-secondary').addClass('bg-success-subtle text-success');
            $si.find('.status-icon i').attr('class', 'fa-solid fa-shield-halved');
            $si.find('.status-text').text('Allowed');
            // Time display
            $('#remaining-time').html('<span class="text-success">Allowed MAC Device</span>');
            $('.time-label').html('<i class="fa-solid fa-shield-halved me-1"></i> Status:');
            // Show IP/MAC info
            $('#connection-info').html(
                '<div class="d-flex justify-content-between mb-2"><span class="fw-semibold"><i class="fa-solid fa-globe me-1"></i> IP</span><span class="fw-bold">' + ipAddress + '</span></div>' +
                '<div class="d-flex justify-content-between"><span class="fw-semibold"><i class="fa-solid fa-network-wired me-1"></i> MAC</span><span class="fw-bold">' + macAddress + '</span></div>'
            );
            // Hide all buttons not needed for allowed MAC
            $('#toggle-time-btn').addClass('d-none');
            $('#insert-money-btn').addClass('d-none');
            $('#wifi-rates-btn').addClass('d-none');
            $('#data-rates-btn').addClass('d-none');
            $('#voucher-list-btn').addClass('d-none');
            $('#session-list-btn').addClass('d-none');
            $('#free-time-btn').addClass('d-none');
            $('#eloading-btn').addClass('d-none');
            $('#epayment-btn').addClass('d-none');
            $('#spinwheel-main-btn').addClass('d-none');
            $('.voucher-container').addClass('d-none');
            // Hide expiry and network stats
            $('#expiry-info').hide();
            $('#networkStatsCollapse').collapse('hide');
            $('#stats-toggle').addClass('d-none');
            return;
        }

        let shouldUpdateUI = false; // Define the variable here to track if UI needs updating

        // Store old values BEFORE any updates for detection
        const oldConnected = connected;
        const oldRemainingTime = remainingTimeInSeconds;

        // Update IP and MAC
        if (userData.ip && userData.ip !== ipAddress) {
            ipAddress = userData.ip;
            shouldUpdateUI = true;
        }

        if (userData.mac && userData.mac !== macAddress) {
            macAddress = userData.mac;
            shouldUpdateUI = true;
        }

        // Detect DELETE: User was connected with time, now has no time and disconnected
        const newConnectionStatus = userData.status === 1;
        const newRemainingTime = userData.remainingTime || 0;
        if (oldConnected && oldRemainingTime > 0 && !newConnectionStatus && newRemainingTime === 0) {
            showNotification('Session Deleted', 'Your session has been deleted by admin');
            // Stop countdown timers
            if (countdownInterval) clearInterval(countdownInterval);
            if (expiryUpdateInterval) {
                clearInterval(expiryUpdateInterval);
                expiryUpdateInterval = null;
            }
            // Force UI update
            remainingTimeInSeconds = 0;
            connected = false;
            shouldUpdateUI = true;
        }

        // Update connection status
        if (connected !== newConnectionStatus) {
            connected = newConnectionStatus;
            shouldUpdateUI = true;
        }

        // Update PAUSE status - always update to ensure UI reflects server state
        // BUT skip if we just sent a manual pause/resume command (within 5 seconds) to avoid race condition
        if (userData.pauseStatus !== undefined) {
            const timeSinceLastCommand = Date.now() - lastPauseCommandTime;
            const skipPauseUpdate = timeSinceLastCommand < 5000; // 5 second cooldown

            if (skipPauseUpdate) {
                console.log('Skipping SSE pause status update - within cooldown period');
            } else {
                const newPauseStatus = userData.pauseStatus || 0;
                if (pauseStatus !== newPauseStatus) {
                    // Show notification when pause status changes
                    if (newPauseStatus === 1 && pauseStatus === 0) {
                        showNotification('Session Paused', 'Your session has been paused');
                        // Stop countdown timers
                        if (countdownInterval) clearInterval(countdownInterval);
                        if (expiryUpdateInterval) {
                            clearInterval(expiryUpdateInterval);
                            expiryUpdateInterval = null;
                        }
                    } else if (newPauseStatus === 0 && pauseStatus === 1) {
                        showNotification('Session Resumed', 'Your session has been resumed');
                        // Restart countdown if we have time
                        if (remainingTimeInSeconds > 0 && !dataMode) {
                            startCountdown(remainingTimeInSeconds);
                        }
                    }
                    pauseStatus = newPauseStatus;
                    shouldUpdateUI = true;
                }
            }
            // Always update pauseRemaining
            pauseRemaining = userData.pauseRemaining || 0;
        }

        // Update pause time limit
        if (userData.pauseTimeLimit !== undefined) {
            pauseTimeLimit = userData.pauseTimeLimit;
        }

        // Force UI update if paused but UI shows connected (fix for stale state)
        if (pauseStatus === 1 && connected) {
            shouldUpdateUI = true;
        }

        // Update data mode status - FIXED CODE
        // Only update dataMode if Mode is explicitly defined in the response
        if (userData.Mode !== undefined) {
            // Check if the data mode is changing
            const newDataMode = userData.Mode === 1;
            if (dataMode !== newDataMode) {
                console.log('Data mode changed to:', newDataMode ? 'DATA MODE' : 'TIME MODE');
                const oldMode = dataMode;
                dataMode = newDataMode;
                shouldUpdateUI = true;

                // If switching to data mode, stop the countdown timer
                if (dataMode && !oldMode && countdownInterval) {
                    clearInterval(countdownInterval);
                    console.log('Stopped countdown because switched to DATA MODE');
                }

                // If switching from data mode to time mode, restart the countdown
                if (!dataMode && oldMode && !pauseStatus) {
                    if (userData.expiryTime !== undefined) {
                        startExpiryCountdown(userData.expiryTime);
                    }

                    startCountdown(remainingTimeInSeconds);
                    console.log('Started countdown because switched to TIME MODE');
                }
            }
        }

        if (userData.cpoints !== undefined && cpoints !== userData.cpoints) {
            cpoints = userData.cpoints || 0;
            shouldUpdateUI = true;
        }

        // Note: credits come from portal settings, not user data (remainingCredit)

        // Update expiry time - only sync if significant drift (>5 seconds)
        // Local countdown handles display, server sync corrects drift
        if (userData.expiryTime !== undefined && userData.expiryTime > 0) {
            // Server sends expiry time in seconds
            const expiryDiff = Math.abs(expiryTimeInSeconds - userData.expiryTime);

            // Only sync if drift is significant (>5 seconds) or first time (expiryTime is 0)
            if (expiryDiff > 5 || expiryTimeInSeconds === 0) {
                startExpiryCountdown(userData.expiryTime);
                shouldUpdateUI = true;
            }
        }

        // Update remaining time - only sync if significant drift (>5 seconds)
        // Local countdown handles display, server sync corrects drift
        if (userData.remainingTime !== undefined) {
            const timeDiff = Math.abs(remainingTimeInSeconds - userData.remainingTime);

            // Only sync if drift is significant (>5 seconds) or first time (remainingTime is 0)
            if (timeDiff > 5 || remainingTimeInSeconds === 0) {
                // Detect time EDIT by admin (not delete - that's handled above)
                // Only check if we had time before and still have time now (just different amount)
                if (oldRemainingTime > 0 && userData.remainingTime > 0 && timeDiff > 60) {
                    // Significant time change (more than 1 minute) - time was edited
                    if (userData.remainingTime > oldRemainingTime) {
                        showNotification('Time Added', 'Your time has been extended');
                    } else {
                        showNotification('Time Reduced', 'Your time has been reduced');
                    }
                }

                remainingTimeInSeconds = userData.remainingTime;

                // Only restart countdown if not in pause mode and not in data mode
                if (pauseStatus !== 1 && !dataMode) {
                    startCountdown(userData.remainingTime);
                }
                shouldUpdateUI = true;
            }
        }

        // Store timeSession data for session list
        if (userData.timeSession) {
            sessionData = userData.timeSession;
        }

        // Update network usage
        if (userData.uploaded !== undefined && userData.downloaded !== undefined) {
            const currentUpload = $uploadedData.text();
            const currentDownload = $downloadedData.text();
            const newUpload = formatBytes(userData.uploaded);
            const newDownload = formatBytes(userData.downloaded);

            if (currentUpload !== newUpload) {
                $uploadedData.text(newUpload);
                shouldUpdateUI = true;
            }

            if (currentDownload !== newDownload) {
                $downloadedData.text(newDownload);
                shouldUpdateUI = true;
            }
        }

        // Free time button visibility is ONLY checked on page load/refresh
        // Do NOT update on every SSE message to prevent spamming
        // The initial check happens in updateUI() on page load

        // Update coinslot count data from user status (avoids separate API call)
        if (userData.totalPeso !== undefined) {
            const prevTotal = totalAmount;
            totalAmount = userData.totalPeso || 0;
            equivMinutes = userData.equivMinutes || 0;
            dataAmount = userData.dataAmount || 0;
            timeValue = equivMinutes;
            voucherValue = equivMinutes;

            // Only update coin modal UI and Account Credits if values changed
            if (prevTotal !== totalAmount) {
                // Update Account Credits display with totalPeso (inserted coins)
                credits = totalAmount;
                $creditInfo.text(`₱${credits}`);
                updateCoinModalUI();
            }
        }

        // Check for E-Payment notification (Checking = 1)
        if (userData.checking === 1) {
            showNotification('E-Payment', 'Your E-Payment was already processed!');
            // Reset the checking flag via API
            resetCheckingFlag();
        }

        // Update chat unread badge from SSE (real-time)
        if (userData.chat_unread !== undefined && chatEnabled) {
            if (userData.chat_unread > 0) {
                $('#chat-badge').text(userData.chat_unread).removeClass('d-none');
            } else {
                $('#chat-badge').addClass('d-none').text('0');
            }
        }

        // Only update UI if something actually changed
        if (shouldUpdateUI) {
            debouncedUpdateUI();
        }
    }

    // Handle specific message types
    if (data.type) {
        switch (data.type) {
            case 'voucher':
                showNotification('Voucher', data.message || 'Voucher processed');
                break;

            case 'payment':
                showNotification('Payment', data.message || 'Payment processed');
                break;

            case 'pause':
                if (data.status === 'success') {
                    lastPauseCommandTime = Date.now(); // Set timestamp to prevent race condition
                    showNotification('Session Paused', data.message || 'Your session has been paused');
                    pauseStatus = 1;
                    clearInterval(countdownInterval);
                    clearInterval(expiryUpdateInterval);
                    expiryUpdateInterval = null;
                    // Use direct updateUI for immediate state change
                    updateUI();
                } else {
                    showNotification('Pause Error', data.error || 'Could not pause session');
                }
                break;

            case 'resume':
                if (data.status === 'success') {
                    lastPauseCommandTime = Date.now(); // Set timestamp to prevent race condition
                    showNotification('Session Resumed', data.message || 'Your session has been resumed');
                    pauseStatus = 0;
                    pauseRemaining = 0; // Reset pause remaining

                    // Update remaining time from server response if available (nested in data.data)
                    const resumeData = data.data || {};
                    if (resumeData.remainingTime !== undefined) {
                        remainingTimeInSeconds = resumeData.remainingTime;
                        console.log('Resume: Updated remainingTime to', remainingTimeInSeconds, dataMode ? 'MB (data mode)' : 'seconds (time mode)');
                    }

                    if (!dataMode) {
                        // Time mode: start countdown
                        if (resumeData.expiryTime !== undefined) {
                            startExpiryCountdown(resumeData.expiryTime);
                        }
                        startCountdown(remainingTimeInSeconds);
                    }
                    // Data mode: just update UI (no countdown needed)

                    // Use direct updateUI for immediate state change
                    updateUI();
                } else {
                    showNotification('Resume Error', data.error || 'Could not resume session');
                }
                break;
        }
    }
}
    // Updated function to show WiFi rates modal with enhanced design
    function showWifiRatesModal(rates) {
        $modalTitle.html('<i class="fa-solid fa-wifi me-2"></i>WiFi Rates');
        $modalBody.empty();

        // Create rates list with new design
        const $list = $('<div class="wifi-rates-list"></div>');

        // Add header
        $list.append(`
            <div class="rate-header">
                <span>Amount</span>
                <span>Time</span>
                <span>Note</span>
            </div>
        `);

        // Add rate items using new design
        rates.forEach(rate => {
            const $rateItem = $(`
                <div class="rate-plan">
                    <span class="plan-price">${rate.amount}</span>
                    <span class="plan-time">${rate.time}</span>
                    <span class="plan-name">${rate.name}</span>
                </div>
            `);

            $list.append($rateItem);
        });

        $modalBody.append($list);

        // Show Bootstrap modal
        const ratesModal = new bootstrap.Modal(document.getElementById('rates-modal'));
        ratesModal.show();
    }

    // Updated function to show Data rates modal with enhanced design
    function showDataRatesModal(rates) {
        // Use the data-rates-modal
        const $dataRatesBody = $('#data-rates-modal .modal-body');
        $dataRatesBody.empty();

        // Create rates list with new design
        const $list = $('<div class="wifi-rates-list"></div>');

        // Add header
        $list.append(`
            <div class="rate-header">
                <span>Amount</span>
                <span>Data</span>
                <span>Note</span>
            </div>
        `);

        // Add rate items using new design
        rates.forEach(rate => {
            const $rateItem = $(`
                <div class="rate-plan">
                    <span class="plan-price">${rate.amount}</span>
                    <span class="plan-data">${rate.data}</span>
                    <span class="plan-name">${rate.name}</span>
                </div>
            `);

            $list.append($rateItem);
        });

        $dataRatesBody.append($list);

        // Show Bootstrap modal
        const dataRatesModal = new bootstrap.Modal(document.getElementById('data-rates-modal'));
        dataRatesModal.show();
    }

// Function to show the session list modal with real data
function showSessionListModal() {
    // Use the session-list-modal instead of rates-modal
    const $sessionModalBody = $('#session-modal-body');
    $sessionModalBody.empty();

    // Check if we have session data
    if (!sessionData || sessionData.length === 0) {
        $sessionModalBody.append(`
            <div class="text-center py-4" style="color: #9ca3af;">
                <i class="fa-solid fa-clock-rotate-left fa-2x mb-2"></i>
                <p class="mb-0">No sessions found</p>
                <small>Your session history will appear here</small>
            </div>
        `);
    } else {
        // Build the session list with new design
        const $list = $('<div class="session-list"></div>');

        // Add header
        $list.append(`
            <div class="session-header">
                <span>Type</span>
                <span>Remaining</span>
                <span>Status</span>
                <span>Action</span>
            </div>
        `);

        // Add session items
        sessionData.forEach((session) => {
            // Determine remaining time/data based on type
            let remaining = '—';
            if (session.type === 'time') {
                remaining = formatTime(session.remainingTime);
            } else if (session.type === 'data') {
                // Convert MB to bytes, then format
                const dataBytes = session.remainingTime * 1024 * 1024;
                remaining = formatBytes(dataBytes);
            }

            // Determine the status badge
            let statusClass = 'status-paused';
            let statusText = 'Unknown';

            switch(session.status) {
                case 0:
                    statusClass = 'status-expired';
                    statusText = 'Expired';
                    break;
                case 1:
                    statusClass = 'status-active';
                    statusText = 'Active';
                    break;
                case 2:
                    statusClass = 'status-completed';
                    statusText = 'Done';
                    break;
                case 3:
                    statusClass = 'status-paused';
                    statusText = 'Paused';
                    break;
            }

            const typeIcon = session.type === 'time' ? 'fa-regular fa-clock' : 'fa-solid fa-database';
            const typeLabel = session.type === 'time' ? 'Time' : 'Data';

            const $item = $(`
                <div class="session-item" data-session-id="${session.id}">
                    <span class="session-type"><i class="${typeIcon} me-1"></i>${typeLabel}</span>
                    <span class="session-remaining">${remaining}</span>
                    <span class="session-status"><span class="status-badge-small ${statusClass}">${statusText}</span></span>
                    <button class="session-action-btn switch-session-btn" data-session-id="${session.id}">Switch</button>
                </div>
            `);
            $list.append($item);
        });

        $sessionModalBody.append($list);

        // Add click handler for switch session buttons
        $sessionModalBody.on('click', '.switch-session-btn', function(e) {
            e.preventDefault();

            const $btn = $(this);
            const sessionId = $btn.data('session-id');

            $btn.prop('disabled', true).text('...');

            // Make POST request to switch session mode
            $.ajax({
                url: `/api/sessions/switch?id=${sessionId}`,
                method: 'POST',
                dataType: 'json',
                success: function(response) {
                    if (response && (response.status === 'success' || response.success === true)) {
                        let successMsg = 'Session switched successfully';

                        if (response.new_session && response.old_session) {
                            successMsg = response.message || `Switched to ${response.new_session.Type} session`;
                        }

                        // Close the modal
                        bootstrap.Modal.getInstance(document.getElementById('session-list-modal')).hide();

                        setTimeout(() => {
                            showNotification('Success', successMsg);
                        }, 300);

                        // Refresh data
                        const hideLoading = showLoading('Refreshing...');
                        if (socketConnected) {
                            sendCommand('status');
                            setTimeout(() => hideLoading(), 2000);
                        } else {
                            setTimeout(() => hideLoading(), 1000);
                        }
                    } else {
                        let errorMsg = response?.message || 'Failed to switch session';
                        showNotification('Error', errorMsg);
                        $btn.prop('disabled', false).text('Switch');
                    }
                },
                error: function() {
                    showNotification('Error', 'Could not switch session. Please try again.');
                    $btn.prop('disabled', false).text('Switch');
                }
            });
        });
    }

    // Show Bootstrap modal
    const sessionModal = new bootstrap.Modal(document.getElementById('session-list-modal'));
    sessionModal.show();
}
    // Function to show the voucher list modal using real API data
    async function showVoucherListModal() {
        // Use the voucher-list-modal instead of rates-modal
        const $voucherModalBody = $('#voucher-modal-body');
        $voucherModalBody.empty();

        const hideLoading = showLoading('Loading voucher list...');

        try {
            // Fetch voucher list from the API
            const response = await $.ajax({
                url: '/api/portal-user/voucherlist',
                method: 'GET',
                dataType: 'json'
            });

            hideLoading();

            if (response && response.vouchers && response.vouchers.length > 0) {
                // Build the voucher list with new design
                const $list = $('<div class="voucher-list"></div>');

                // Add header
                $list.append(`
                    <div class="voucher-header">
                        <span>Code</span>
                        <span>Amount</span>
                        <span>Duration</span>
                        <span>Action</span>
                    </div>
                `);

                // Add voucher items
                response.vouchers.forEach(voucher => {
                    // Format duration in hours and minutes
                    const hours = Math.floor(voucher.minutes / 60);
                    const minutes = voucher.minutes % 60;
                    let duration = '';
                    if (hours > 0) duration += `${hours}h`;
                    if (minutes > 0) {
                        if (duration) duration += ' ';
                        duration += `${minutes}m`;
                    }

                    const $item = $(`
                        <div class="voucher-item">
                            <span class="voucher-code">${voucher.vcode}</span>
                            <span class="voucher-amount">₱${voucher.amount}</span>
                            <span class="voucher-duration">${duration}</span>
                            <button class="voucher-action-btn use-voucher-btn" data-voucher="${voucher.vcode}">Use</button>
                        </div>
                    `);
                    $list.append($item);
                });

                $voucherModalBody.append($list);

                // Add click handler for use voucher buttons
                $voucherModalBody.find('.use-voucher-btn').on('click', function() {
                    const voucherCode = $(this).data('voucher');

                    // Show confirmation dialog
                    if (confirm(`Are you sure you want to use voucher ${voucherCode}?`)) {
                        // Set the voucher code in the input field
                        $('#voucher-input').val(voucherCode);

                        // Close the modal
                        bootstrap.Modal.getInstance(document.getElementById('voucher-list-modal')).hide();

                        // Automatically submit the voucher
                        $submitVoucherBtn.click();
                    }
                });
            } else {
                $voucherModalBody.append(`
                    <div class="text-center py-4" style="color: #9ca3af;">
                        <i class="fa-solid fa-ticket fa-2x mb-2"></i>
                        <p class="mb-0">No vouchers found</p>
                        <small>Purchase time to generate vouchers</small>
                    </div>
                `);
            }
        } catch (error) {
            hideLoading();
            console.error('Error fetching voucher list:', error);
            $voucherModalBody.append(`
                <div class="text-center py-4" style="color: #ef4444;">
                    <i class="fa-solid fa-exclamation-circle fa-2x mb-2"></i>
                    <p class="mb-0">Error loading vouchers</p>
                    <small>Please try again</small>
                </div>
            `);
        }

        // Show Bootstrap modal
        const voucherModal = new bootstrap.Modal(document.getElementById('voucher-list-modal'));
        voucherModal.show();
    }

    // ========== COIN SLOT FUNCTIONS ==========

    // SSE URL for coin slot
    const COINSLOT_SSE_URL = Portal.Config.COINSLOT_SSE_URL;

    // EventSource for SSE connection
    let coinEventSource = null;

    // Connect to SSE for coin slot (returns Promise)
    function connectCoinSSE() {
        return new Promise((resolve, reject) => {
            // Close existing connection
            if (coinEventSource) {
                coinEventSource.close();
                coinEventSource = null;
            }

            try {
                // Build SSE URL with station parameter
                let sseUrl = COINSLOT_SSE_URL;
                if (clientNetworkInfo.selected_coinslot) {
                    const coinslot = clientNetworkInfo.selected_coinslot;
                    if (coinslot.type !== 'main_vendo' && coinslot.chip_id) {
                        sseUrl = `${COINSLOT_SSE_URL}?chipid=${encodeURIComponent(coinslot.chip_id)}`;
                    }
                }

                console.log('[SSE] Connecting to:', sseUrl);
                coinEventSource = new EventSource(sseUrl);

                coinEventSource.onopen = function() {
                    console.log('[SSE] Coin slot SSE connected');
                    usePollingFallback = false;
                    stopCoinPolling();
                    resolve(true);
                };

                // Listen for specific event types
                coinEventSource.addEventListener('init', function(event) {
                    console.log('[SSE] Init event:', event.data);
                    handleCoinSlotMessage(JSON.parse(event.data));
                });

                coinEventSource.addEventListener('coin', function(event) {
                    console.log('[SSE] Coin event:', event.data);
                    handleCoinSlotMessage(JSON.parse(event.data));
                });

                coinEventSource.addEventListener('bill', function(event) {
                    console.log('[SSE] Bill event:', event.data);
                    handleCoinSlotMessage(JSON.parse(event.data));
                });

                coinEventSource.addEventListener('timer', function(event) {
                    console.log('[SSE] Timer event:', event.data);
                    handleCoinSlotMessage(JSON.parse(event.data));
                });

                coinEventSource.addEventListener('timer_expired', function(event) {
                    console.log('[SSE] Timer expired event:', event.data);
                    handleCoinSlotMessage(JSON.parse(event.data));
                });

                coinEventSource.addEventListener('busy', function(event) {
                    console.log('[SSE] Busy event:', event.data);
                    handleCoinSlotMessage(JSON.parse(event.data));
                });

                coinEventSource.addEventListener('clear', function(event) {
                    console.log('[SSE] Clear event:', event.data);
                    handleCoinSlotMessage(JSON.parse(event.data));
                });

                coinEventSource.onerror = function(error) {
                    console.error('[SSE] Coin slot SSE error:', error);

                    // Check connection state
                    if (coinEventSource.readyState === EventSource.CLOSED) {
                        console.log('[SSE] Connection closed');

                        if (coinSessionActive && !window.coinModalClosing) {
                            console.log('[SSE] Enabling polling fallback...');
                            usePollingFallback = true;
                            startCoinPolling();

                            // Try to reconnect after delay
                            console.log('[SSE] Attempting reconnect in 2s...');
                            setTimeout(() => {
                                if (coinSessionActive && !window.coinModalClosing) {
                                    connectCoinSSE().then(() => {
                                        console.log('[SSE] Reconnected - disabling polling');
                                        if (!$coinInsertionModal.hasClass('show')) {
                                            openCoinModal();
                                        }
                                    }).catch(err => {
                                        console.log('[SSE] Reconnect failed, polling active');
                                    });
                                }
                            }, 2000);
                        }
                    }

                    if (!window.coinModalClosing && coinEventSource.readyState === EventSource.CONNECTING) {
                        // Still trying to connect - don't reject yet
                        console.log('[SSE] Still connecting...');
                    }
                };

                // Timeout after 10 seconds if not connected
                setTimeout(() => {
                    if (coinEventSource && coinEventSource.readyState === EventSource.CONNECTING) {
                        console.log('[SSE] Connection timeout');
                        coinEventSource.close();
                        reject(new Error('SSE connection timeout'));
                    }
                }, 10000);

            } catch (error) {
                console.error('[SSE] Failed to connect:', error);
                reject(error);
            }
        });
    }


    function handleCoinSlotMessage(data) {
        if (!data) return;

        const serverTimer = data.seconds_remaining || 0;
        const newMaxTimer = data.connection_seconds || 60;
        const newTotalAmount = data.total_peso || 0;
        const newTimerActive = data.timer_active || false;

        // Store the equiv_minutes and data_amount from backend (based on station rates)
        equivMinutes = data.equiv_minutes || 0;
        dataAmount = data.data_amount || 0;

        // Use actual rates - no fallback (0 if no rates configured for this station)
        timeValue = equivMinutes;
        voucherValue = equivMinutes;

        // Update total amount immediately
        totalAmount = newTotalAmount;
        timerActive = newTimerActive;

        // Handle different message types
        switch (data.type) {
            case 'init':
                // Initialization - sync timer completely
                currentTimerValue = serverTimer;
                maxTimerValue = newMaxTimer;
                updateCoinModalUI();
                // Always open modal on init - we're waiting for coins
                openCoinModal();
                break;

            case 'coin':
                // Coin insertion event - reset timer to new value
                playInsertSound();
                currentTimerValue = serverTimer;
                maxTimerValue = newMaxTimer;
                // Update payment details immediately
                updatePaymentDetails();
                if (!$coinInsertionModal.hasClass('show')) {
                    openCoinModal();
                }
                // Note: Auto-claim now happens when timer expires, not on each coin insert
                break;

            case 'timer':
                // Timer update - only sync if difference is > 2 seconds to prevent jumping
                if (Math.abs(currentTimerValue - serverTimer) > 2) {
                    currentTimerValue = serverTimer;
                }
                maxTimerValue = newMaxTimer;
                // Update payment details
                updatePaymentDetails();
                if (timerActive && !$coinInsertionModal.hasClass('show')) {
                    openCoinModal();
                }
                break;

            case 'timer_expired':
                // Timer reached zero
                currentTimerValue = 0;

                // Auto-claim time if enabled and has coins inserted
                if (portalSettings.insertCoinAutoClaim === 'ON' && totalAmount > 0) {
                    console.log('Auto-claim: Timer expired, auto-claiming time...');
                    autoClaimTime();
                } else {
                    stopCoinSlot(); // Stop monitoring when timer expires
                }
                break;
        }
    }

    // Polling fallback for coin count (only when SSE is down)
    function startCoinPolling() {
        if (coinPollingInterval) {
            clearInterval(coinPollingInterval);
        }
        if (!usePollingFallback) {
            console.log('Polling not needed - SSE active');
            return;
        }
        lastPolledAmount = totalAmount;

        // Poll every 500ms for real-time updates
        coinPollingInterval = setInterval(async () => {
            if (!coinSessionActive || !usePollingFallback) {
                stopCoinPolling();
                return;
            }

            try {
                const response = await fetch(COINSLOT_COUNT_API, {
                    method: 'GET',
                    cache: 'no-store'
                });
                const data = await response.json();

                if (data.status === 'success' && data.data) {
                    const newTotal = data.data.total_peso || 0;
                    const newTimer = data.data.seconds_remaining || 0;

                    // Only update when coin count INCREASES (new coin inserted)
                    if (newTotal > lastPolledAmount) {
                        console.log('[POLLING] Coin detected:', lastPolledAmount, '->', newTotal);
                        totalAmount = newTotal;
                        lastPolledAmount = newTotal;
                        equivMinutes = data.data.equiv_minutes || 0;
                        dataAmount = data.data.data_amount || 0;

                        // Reset timer on coin insert (like server does)
                        currentTimerValue = newTimer;
                        maxTimerValue = data.data.connection_seconds || 60;

                        playInsertSound();
                        updatePaymentDetails();
                        updateCoinModalUI();
                    }
                }
            } catch (err) {
                // Silent fail - polling will retry
            }
        }, 500);

        console.log('[POLLING] Started as SSE fallback (500ms interval)');
    }

    function stopCoinPolling() {
        if (coinPollingInterval) {
            clearInterval(coinPollingInterval);
            coinPollingInterval = null;
            console.log('Coin polling stopped');
        }
    }

    // Track previous values for smooth animation
    let prevTotalAmount = 0;

    // Update only payment details without touching timer
    function updatePaymentDetails() {
        // Check if amount changed for animation
        const amountChanged = totalAmount !== prevTotalAmount && totalAmount > 0;

        // Update e-load "Coins Inserted" value if in e-load mode
        if (pendingEloadRequest) {
            const $eloadInserted = $('#eload-inserted-value');
            $eloadInserted.text('₱' + totalAmount);

            // Check progress and update color
            if (totalAmount >= pendingEloadRequest.totalRequired) {
                $eloadInserted.removeClass('text-warning').addClass('text-success');
            } else if (totalAmount > 0) {
                $eloadInserted.removeClass('text-success').addClass('text-warning');
            }
        }

        // Update cash-in "Coins Inserted" value if in cash-in mode
        if (pendingCashinRequest) {
            const $cashinInserted = $('#cashin-inserted-value');
            $cashinInserted.text('₱' + totalAmount);

            // Check progress and update color
            if (totalAmount >= pendingCashinRequest.totalRequired) {
                $cashinInserted.removeClass('text-warning').addClass('text-success');
            } else if (totalAmount > 0) {
                $cashinInserted.removeClass('text-success').addClass('text-warning');
            }
        }

        // Only show values when we have actual data (no "0m" during transaction)
        const formattedTime = equivMinutes > 0 ? formatMinutesToTimeString(equivMinutes) : '-';
        const formattedData = dataAmount > 0 ? formatDataAmount(dataAmount) : '-';
        const formattedAmount = totalAmount > 0 ? '₱' + totalAmount : '-';

        // Update all values at once
        $coinTimeValue.text(formattedTime);
        $coinVoucherValue.text(formattedTime);
        $coinDataValue.text(formattedData);
        $coinAmountValue.text(formattedAmount);

        // Add animation effect when amount changes
        if (amountChanged) {
            prevTotalAmount = totalAmount;
            // Add updated class for animation
            $coinTimeValue.addClass('updated');
            $coinVoucherValue.addClass('updated');
            $coinDataValue.addClass('updated');
            $coinAmountValue.addClass('updated');
            $('#eload-inserted-value').addClass('updated');
            $('#cashin-inserted-value').addClass('updated');
            // Remove after animation
            setTimeout(() => {
                $coinTimeValue.removeClass('updated');
                $coinVoucherValue.removeClass('updated');
                $coinDataValue.removeClass('updated');
                $coinAmountValue.removeClass('updated');
                $('#eload-inserted-value').removeClass('updated');
                $('#cashin-inserted-value').removeClass('updated');
            }, 300);

            // Check if there's a pending e-load request and enough coins inserted
            if (pendingEloadRequest && totalAmount >= pendingEloadRequest.totalRequired) {
                processEloadPayment();
            }

            // Check if there's a pending cash-in request and enough coins inserted
            if (pendingCashinRequest && totalAmount >= pendingCashinRequest.totalRequired) {
                processCashinPayment();
            }
        }
    }

    // Show e-load receipt modal
    function showEloadReceipt(data) {
        // Remove existing receipt modal if any
        $('#eload-receipt-modal').remove();

        const receiptHtml = `
            <div class="modal fade" id="eload-receipt-modal" tabindex="-1" data-bs-backdrop="static">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title">
                                <i class="fa-solid fa-check-circle me-2"></i>E-Load Successful
                            </h5>
                        </div>
                        <div class="modal-body">
                            <div class="text-center mb-3">
                                <i class="fa-solid fa-check-circle fa-4x text-success mb-2"></i>
                                <h6 class="text-muted">${data.timestamp}</h6>
                            </div>
                            <div class="border rounded p-3">
                                <div class="row mb-2">
                                    <div class="col-5 text-muted">Reference:</div>
                                    <div class="col-7 text-end fw-bold text-primary">${data.transactionId || 'N/A'}</div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-5 text-muted">Phone:</div>
                                    <div class="col-7 text-end fw-bold">${data.phoneNumber}</div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-5 text-muted">Network:</div>
                                    <div class="col-7 text-end">${data.network}</div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-5 text-muted">Product:</div>
                                    <div class="col-7 text-end">${data.productName}</div>
                                </div>
                                <hr>
                                <div class="row mb-2">
                                    <div class="col-5 text-muted">Amount:</div>
                                    <div class="col-7 text-end">₱${data.amount}</div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-5 text-muted">Fee:</div>
                                    <div class="col-7 text-end">₱${data.fee || 0}</div>
                                </div>
                                <hr>
                                <div class="row">
                                    <div class="col-5 fw-bold">Total Paid:</div>
                                    <div class="col-7 text-end fw-bold text-success fs-5">₱${data.totalPaid}</div>
                                </div>
                            </div>
                            <div class="text-center mt-3">
                                <small class="text-muted">Take a screenshot to save this receipt</small>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-success w-100" data-bs-dismiss="modal">
                                <i class="fa-solid fa-check me-2"></i>Done
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('body').append(receiptHtml);
        const receiptModal = new bootstrap.Modal(document.getElementById('eload-receipt-modal'));
        receiptModal.show();

        // Cleanup on modal close
        $('#eload-receipt-modal').on('hidden.bs.modal', function() {
            $(this).remove();
        });
    }

    // Show e-load refund/error modal
    function showEloadRefundModal(data) {
        // Remove existing modal if any
        $('#eload-refund-modal').remove();

        const isRefunded = data.errorMessage.toLowerCase().includes('refund');
        const title = isRefunded ? 'Transaction Refunded' : 'Transaction Failed';
        const icon = isRefunded ? 'fa-rotate-left' : 'fa-times-circle';
        const headerClass = isRefunded ? 'bg-warning' : 'bg-danger';
        const iconClass = isRefunded ? 'text-warning' : 'text-danger';

        const modalHtml = `
            <div class="modal fade" id="eload-refund-modal" tabindex="-1" data-bs-backdrop="static">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header ${headerClass} text-white">
                            <h5 class="modal-title">
                                <i class="fa-solid ${icon} me-2"></i>${title}
                            </h5>
                        </div>
                        <div class="modal-body">
                            <div class="text-center mb-3">
                                <i class="fa-solid ${icon} fa-4x ${iconClass} mb-2"></i>
                                <h6 class="text-muted">${data.timestamp}</h6>
                            </div>
                            <div class="border rounded p-3">
                                <div class="row mb-2">
                                    <div class="col-5 text-muted">Phone:</div>
                                    <div class="col-7 text-end fw-bold">${data.phoneNumber}</div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-5 text-muted">Network:</div>
                                    <div class="col-7 text-end">${data.network}</div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-5 text-muted">Product:</div>
                                    <div class="col-7 text-end">${data.productName}</div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-5 text-muted">Amount:</div>
                                    <div class="col-7 text-end">₱${data.amount}</div>
                                </div>
                                <hr>
                                <div class="row">
                                    <div class="col-12">
                                        <span class="text-muted">Reason:</span>
                                        <div class="alert alert-${isRefunded ? 'warning' : 'danger'} mt-2 mb-0 py-2 small">
                                            ${data.errorMessage}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            ${isRefunded ? '<div class="text-center mt-3"><small class="text-success"><i class="fa-solid fa-info-circle me-1"></i>Your coins have been returned.</small></div>' : ''}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary w-100" data-bs-dismiss="modal">
                                <i class="fa-solid fa-check me-2"></i>OK
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('body').append(modalHtml);
        const refundModal = new bootstrap.Modal(document.getElementById('eload-refund-modal'));
        refundModal.show();

        // Cleanup on modal close
        $('#eload-refund-modal').on('hidden.bs.modal', function() {
            $(this).remove();
        });
    }

    // Process e-load after payment is complete
    async function processEloadPayment() {
        if (!pendingEloadRequest) return;

        const request = pendingEloadRequest;
        pendingEloadRequest = null; // Clear immediately to prevent double processing

        // Close coin modal
        closeCoinModal(true); // Skip auto-claim

        const hideLoading = showLoading('Processing e-load...');

        try {
            const response = await $.ajax({
                url: '/api/portal-eload/sendload',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    pcode: request.productCode,
                    network: request.network,
                    number: request.phoneNumber,
                    denomination: request.amount.toString()
                }),
                timeout: 30000
            });

            hideLoading();

            if (response.success) {
                // Parse transaction ID from response
                let transactionId = '';
                const match = response.success.match(/Transaction ID:\s*([^,]+)/);
                if (match) {
                    transactionId = match[1].trim();
                }

                // Show receipt modal
                showEloadReceipt({
                    transactionId: transactionId,
                    phoneNumber: request.phoneNumber,
                    productName: request.productName,
                    network: request.network,
                    amount: request.amount,
                    fee: request.fee,
                    totalPaid: request.totalRequired,
                    status: 'SUCCESS',
                    rawResponse: response.success,
                    timestamp: new Date().toLocaleString()
                });
            } else {
                // Show refund/error modal for failed response
                showEloadRefundModal({
                    phoneNumber: request.phoneNumber,
                    network: request.network,
                    productName: request.productName,
                    amount: request.amount,
                    errorMessage: response.error || 'Failed to send load. Please try again.',
                    timestamp: new Date().toLocaleString()
                });
            }
        } catch (error) {
            hideLoading();
            console.error('E-load error:', error);
            // Extract error message from response
            let errorMessage = 'Failed to process e-load. Please try again.';
            if (error.responseJSON) {
                errorMessage = error.responseJSON.error || error.responseJSON.message || errorMessage;
            } else if (error.responseText) {
                try {
                    const parsed = JSON.parse(error.responseText);
                    errorMessage = parsed.error || parsed.message || errorMessage;
                } catch (e) {
                    // Use responseText directly if not JSON
                    if (error.responseText && error.responseText.length < 200) {
                        errorMessage = error.responseText;
                    }
                }
            }
            // Show refund/error modal instead of toast
            showEloadRefundModal({
                phoneNumber: request.phoneNumber,
                network: request.network,
                productName: request.productName,
                amount: request.amount,
                errorMessage: errorMessage,
                timestamp: new Date().toLocaleString()
            });
        }
    }

    // Process cash-in after payment is complete
    async function processCashinPayment() {
        if (!pendingCashinRequest) return;

        const request = pendingCashinRequest;
        pendingCashinRequest = null; // Clear immediately to prevent double processing

        // Close coin modal
        closeCoinModal(true); // Skip auto-claim

        const hideLoading = showLoading('Processing cash-in...');

        try {
            const response = await $.ajax({
                url: '/api/send-cashin',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    service_type: request.serviceType,
                    account_no: request.field1Value,
                    identifier: request.field2Value,
                    amount: request.amount.toString()
                }),
                timeout: 30000
            });

            hideLoading();

            if (response.success || response.Message) {
                // Parse transaction ID and reference from response
                // Format: "Transaction ID: 70374, status=success, response: 7PU93Qi4IKRyV"
                let transactionId = '';
                let referenceId = '';
                if (response.success) {
                    // Extract Transaction ID
                    const txMatch = response.success.match(/Transaction ID[:\s]*(\d+)/i);
                    if (txMatch) {
                        transactionId = txMatch[1].trim();
                    }
                    // Extract response/reference code
                    const refMatch = response.success.match(/response[:\s]*([^\s,]+)/i);
                    if (refMatch) {
                        referenceId = refMatch[1].trim();
                    }
                }

                // Show receipt modal
                showCashinReceipt({
                    transactionId: transactionId || 'N/A',
                    referenceId: referenceId || 'N/A',
                    serviceName: request.serviceName,
                    accountNo: request.field1Value,
                    amount: request.amount,
                    fee: request.fee,
                    totalPaid: request.totalRequired,
                    status: 'SUCCESS',
                    rawResponse: response.success || response.Message,
                    timestamp: new Date().toLocaleString()
                });
            } else {
                // Show refund/error modal for failed response
                showCashinRefundModal({
                    serviceName: request.serviceName,
                    accountNo: request.field1Value,
                    amount: request.amount,
                    errorMessage: response.error || 'Cash-in failed. Your coins have been returned.',
                    timestamp: new Date().toLocaleString()
                });
            }
        } catch (error) {
            hideLoading();
            console.error('Cash-in error:', error);
            // Extract error message from response
            let errorMessage = 'Failed to process cash-in. Please try again.';
            if (error.responseJSON) {
                errorMessage = error.responseJSON.error || error.responseJSON.message || error.responseJSON.Message || errorMessage;
            } else if (error.responseText) {
                try {
                    const parsed = JSON.parse(error.responseText);
                    errorMessage = parsed.error || parsed.message || parsed.Message || errorMessage;
                } catch (e) {
                    if (error.responseText && error.responseText.length < 200) {
                        errorMessage = error.responseText;
                    }
                }
            }
            // Show refund/error modal
            showCashinRefundModal({
                serviceName: request.serviceName,
                accountNo: request.field1Value,
                amount: request.amount,
                errorMessage: errorMessage,
                timestamp: new Date().toLocaleString()
            });
        }
    }

    // Show cash-in receipt modal
    function showCashinReceipt(data) {
        // Remove existing modal if any
        $('#cashin-receipt-modal').remove();

        const receiptHtml = `
            <div class="modal fade" id="cashin-receipt-modal" tabindex="-1" data-bs-backdrop="static">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title">
                                <i class="fa-solid fa-circle-check me-2"></i>Cash-in Successful
                            </h5>
                        </div>
                        <div class="modal-body">
                            <div class="text-center mb-3">
                                <i class="fa-solid fa-wallet fa-3x text-success mb-2"></i>
                                <h5 class="text-success">Transaction Complete!</h5>
                            </div>
                            <div class="card bg-light">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between mb-2">
                                        <span class="text-muted">Transaction ID:</span>
                                        <span class="fw-bold">${data.transactionId}</span>
                                    </div>
                                    <div class="d-flex justify-content-between mb-2">
                                        <span class="text-muted">Reference:</span>
                                        <span class="fw-bold text-primary">${data.referenceId}</span>
                                    </div>
                                    <div class="d-flex justify-content-between mb-2">
                                        <span class="text-muted">Service:</span>
                                        <span class="fw-bold">${data.serviceName}</span>
                                    </div>
                                    <div class="d-flex justify-content-between mb-2">
                                        <span class="text-muted">Account:</span>
                                        <span class="fw-bold">${data.accountNo}</span>
                                    </div>
                                    <hr>
                                    <div class="d-flex justify-content-between mb-2">
                                        <span class="text-muted">Amount:</span>
                                        <span class="fw-bold">₱${data.amount}</span>
                                    </div>
                                    <div class="d-flex justify-content-between mb-2">
                                        <span class="text-muted">Fee:</span>
                                        <span class="fw-bold text-warning">₱${data.fee}</span>
                                    </div>
                                    <hr>
                                    <div class="d-flex justify-content-between">
                                        <span class="fw-bold">Total Paid:</span>
                                        <span class="fw-bold text-success fs-5">₱${data.totalPaid}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="text-center mt-3">
                                <small class="text-muted">${data.timestamp}</small>
                            </div>
                            <div class="alert alert-info mt-3 mb-0">
                                <i class="fa-solid fa-camera me-2"></i>
                                <small>Take a screenshot to save this receipt</small>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-success w-100" data-bs-dismiss="modal">
                                <i class="fa-solid fa-check me-2"></i>Done
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('body').append(receiptHtml);
        const receiptModal = new bootstrap.Modal(document.getElementById('cashin-receipt-modal'));
        receiptModal.show();

        // Clean up on close
        $('#cashin-receipt-modal').on('hidden.bs.modal', function() {
            $(this).remove();
        });
    }

    // Show cash-in refund/error modal
    function showCashinRefundModal(data) {
        // Remove existing modal if any
        $('#cashin-refund-modal').remove();

        const isRefunded = data.errorMessage.toLowerCase().includes('refund');
        const title = isRefunded ? 'Transaction Refunded' : 'Transaction Failed';
        const headerClass = isRefunded ? 'bg-warning' : 'bg-danger';
        const icon = isRefunded ? 'fa-rotate-left' : 'fa-circle-xmark';

        const refundHtml = `
            <div class="modal fade" id="cashin-refund-modal" tabindex="-1" data-bs-backdrop="static">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header ${headerClass} text-white">
                            <h5 class="modal-title">
                                <i class="fa-solid ${icon} me-2"></i>${title}
                            </h5>
                        </div>
                        <div class="modal-body">
                            <div class="text-center mb-3">
                                <i class="fa-solid fa-wallet fa-3x ${isRefunded ? 'text-warning' : 'text-danger'} mb-2"></i>
                            </div>
                            <div class="card bg-light">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between mb-2">
                                        <span class="text-muted">Service:</span>
                                        <span class="fw-bold">${data.serviceName}</span>
                                    </div>
                                    <div class="d-flex justify-content-between mb-2">
                                        <span class="text-muted">Account:</span>
                                        <span class="fw-bold">${data.accountNo}</span>
                                    </div>
                                    <div class="d-flex justify-content-between mb-2">
                                        <span class="text-muted">Amount:</span>
                                        <span class="fw-bold">₱${data.amount}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="alert ${isRefunded ? 'alert-warning' : 'alert-danger'} mt-3 mb-0">
                                <i class="fa-solid fa-circle-info me-2"></i>
                                <strong>Reason:</strong> ${data.errorMessage}
                                ${isRefunded ? '<br><br><i class="fa-solid fa-coins me-2"></i>Your coins have been returned to your balance.' : ''}
                            </div>
                            <div class="text-center mt-3">
                                <small class="text-muted">${data.timestamp}</small>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary w-100" data-bs-dismiss="modal">
                                <i class="fa-solid fa-xmark me-2"></i>Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('body').append(refundHtml);
        const refundModal = new bootstrap.Modal(document.getElementById('cashin-refund-modal'));
        refundModal.show();

        // Clean up on close
        $('#cashin-refund-modal').on('hidden.bs.modal', function() {
            $(this).remove();
        });
    }

    // Use Portal.Utils for coin slot formatting
    const formatMinutesToTimeString = Portal.Utils.formatMinutesToTimeString;
    const formatDataAmount = Portal.Utils.formatDataAmount;

    function updateCoinModalUI() {
        // Update timer text
        $coinTimerValue.text(currentTimerValue);

        // Update timer progress bar
        const progressPercentage = (currentTimerValue / maxTimerValue) * 100;
        $timerProgressBar.css('width', progressPercentage + '%');

        // Update all payment details together (realtime)
        updatePaymentDetails();
    }

    // Open coin modal
    function openCoinModal() {
        // Reset only timer progress, not payment details
        $coinTimerValue.text(currentTimerValue || maxTimerValue);
        const progressPercentage = (currentTimerValue / maxTimerValue) * 100;
        $timerProgressBar.css('width', progressPercentage + '%');

        // Check if we're in e-load payment mode
        if (pendingEloadRequest) {
            // Show e-load payment details, hide WiFi and cash-in details
            $('#wifi-payment-details').addClass('d-none');
            $('#eload-payment-details').removeClass('d-none');
            $('#cashin-payment-details').addClass('d-none');
            $('#wifi-payment-actions').addClass('d-none');
            $('#eload-payment-actions').removeClass('d-none');
            $('#cashin-payment-actions').addClass('d-none');

            // Populate e-load details
            $('#eload-phone-value').text(pendingEloadRequest.phoneNumber);
            $('#eload-product-value').text(pendingEloadRequest.productName);
            $('#eload-amount-value').text('₱' + pendingEloadRequest.amount);
            $('#eload-fee-value').text('₱' + pendingEloadRequest.fee);
            $('#eload-total-value').text('₱' + pendingEloadRequest.totalRequired);
            // Show current inserted coins (credits remaining)
            $('#eload-inserted-value').text('₱' + totalAmount);
            // Update color based on if enough funds
            if (totalAmount >= pendingEloadRequest.totalRequired) {
                $('#eload-inserted-value').removeClass('text-warning').addClass('text-success');
            } else {
                $('#eload-inserted-value').removeClass('text-success').addClass('text-warning');
            }

            // Update modal title for e-load
            const modalTitle = document.getElementById('coinInsertionModalLabel');
            if (modalTitle) {
                modalTitle.innerHTML = `<i class="fa-solid fa-mobile-screen-button me-2 text-success"></i>E-Load Payment`;
            }

            // Auto-process if credits already sufficient
            if (totalAmount >= pendingEloadRequest.totalRequired) {
                // Delay slightly to show the modal briefly before processing
                setTimeout(() => {
                    processEloadPayment();
                }, 500);
            }
        } else if (pendingCashinRequest) {
            // Show cash-in payment details, hide WiFi and e-load details
            $('#wifi-payment-details').addClass('d-none');
            $('#eload-payment-details').addClass('d-none');
            $('#cashin-payment-details').removeClass('d-none');
            $('#wifi-payment-actions').addClass('d-none');
            $('#eload-payment-actions').addClass('d-none');
            $('#cashin-payment-actions').removeClass('d-none');

            // Populate cash-in details
            $('#cashin-service-value').text(pendingCashinRequest.serviceName);
            $('#cashin-field1-label').text(pendingCashinRequest.field1Label);
            $('#cashin-field1-value').text(pendingCashinRequest.field1Value);
            $('#cashin-field2-label').text(pendingCashinRequest.field2Label);
            $('#cashin-field2-value').text(pendingCashinRequest.field2Value);
            $('#cashin-amount-value').text('₱' + pendingCashinRequest.amount);
            $('#cashin-fee-value').text('₱' + pendingCashinRequest.fee);
            $('#cashin-total-value').text('₱' + pendingCashinRequest.totalRequired);
            // Show current inserted coins (credits remaining)
            $('#cashin-inserted-value').text('₱' + totalAmount);
            // Update color based on if enough funds
            if (totalAmount >= pendingCashinRequest.totalRequired) {
                $('#cashin-inserted-value').removeClass('text-warning').addClass('text-success');
            } else {
                $('#cashin-inserted-value').removeClass('text-success').addClass('text-warning');
            }

            // Update modal title for cash-in
            const modalTitle = document.getElementById('coinInsertionModalLabel');
            if (modalTitle) {
                modalTitle.innerHTML = `<i class="fa-solid fa-wallet me-2 text-info"></i>Cash-in Payment`;
            }

            // Auto-process if credits already sufficient
            if (totalAmount >= pendingCashinRequest.totalRequired) {
                // Delay slightly to show the modal briefly before processing
                setTimeout(() => {
                    processCashinPayment();
                }, 500);
            }
        } else {
            // Show WiFi payment details, hide e-load and cash-in details
            $('#wifi-payment-details').removeClass('d-none');
            $('#eload-payment-details').addClass('d-none');
            $('#cashin-payment-details').addClass('d-none');
            $('#wifi-payment-actions').removeClass('d-none');
            $('#eload-payment-actions').addClass('d-none');
            $('#cashin-payment-actions').addClass('d-none');

            // Update payment details with current values (not 0)
            updatePaymentDetails();

            // Update modal title with coinslot name
            const modalTitle = document.getElementById('coinInsertionModalLabel');
            if (modalTitle && clientNetworkInfo.coinslot_name) {
                modalTitle.innerHTML = `<i class="fa-solid fa-coins me-2 text-warning"></i>${clientNetworkInfo.coinslot_name}`;
            }
        }

        coinModal.show();
        startCoinUpdateInterval();

        // Play background sound when modal opens
        playCoinBgSound();
    }

    // Close coin modal
    function closeCoinModal(skipAutoClaim = false) {
        // Check if there's a pending e-load that wasn't completed
        if (pendingEloadRequest && totalAmount < pendingEloadRequest.totalRequired) {
            showNotification('Cancelled', 'E-load payment cancelled. Insert enough coins to complete purchase.');
            pendingEloadRequest = null;
        }

        // Check if there's a pending cash-in that wasn't completed
        if (pendingCashinRequest && totalAmount < pendingCashinRequest.totalRequired) {
            showNotification('Cancelled', 'Cash-in payment cancelled. Insert enough coins to complete transaction.');
            pendingCashinRequest = null;
        }

        // Auto-claim time if enabled and has coins inserted (unless skipped) and no pending e-load/cash-in
        if (!skipAutoClaim && !pendingEloadRequest && !pendingCashinRequest && portalSettings.insertCoinAutoClaim === 'ON' && totalAmount > 0) {
            console.log('Auto-claim: Modal closing with coins, auto-claiming time...');
            autoClaimTime();
            // autoClaimTime will handle closing modal and resetting
            return;
        }

        coinModal.hide();
        stopCoinUpdateInterval();
        // Reset values only when modal closes
        resetCoinSlotValues();

        // Reset modal back to WiFi mode (for next opening)
        $('#wifi-payment-details').removeClass('d-none');
        $('#eload-payment-details').addClass('d-none');
        $('#cashin-payment-details').addClass('d-none');
        $('#wifi-payment-actions').removeClass('d-none');
        $('#eload-payment-actions').addClass('d-none');
        $('#cashin-payment-actions').addClass('d-none');

        // Stop background sound when modal closes
        stopCoinBgSound();
    }

    // Reset coin slot values (called when modal closes)
    function resetCoinSlotValues() {
        equivMinutes = 0;
        dataAmount = 0;
        totalAmount = 0;
        timeValue = 0;
        voucherValue = 0;
        prevTotalAmount = 0;
    }

    // Reset coin slot UI (for full reset)
    function resetCoinSlotUI() {
        $coinTimerValue.text(maxTimerValue);
        $timerProgressBar.css('width', '100%');
        $coinTimeValue.text('0m');
        $coinVoucherValue.text('0m');
        $coinDataValue.text('0 MB');
        $coinAmountValue.text('₱0');
    }

    // Start coin update interval for smoother UI updates
    function startCoinUpdateInterval() {
        stopCoinUpdateInterval(); // Clear any existing interval

        coinUpdateInterval = setInterval(function() {
            // Always countdown when modal is open and timer has value
            if (currentTimerValue > 0) {
                currentTimerValue = Math.max(0, currentTimerValue - 1);
                const progressPercentage = (currentTimerValue / maxTimerValue) * 100;
                $coinTimerValue.text(currentTimerValue);
                $timerProgressBar.css('width', progressPercentage + '%');
            }
            // Don't auto-close here - let timer_expired event from backend handle it
        }, 1000);
    }

    // Stop coin update interval
    function stopCoinUpdateInterval() {
        if (coinUpdateInterval) {
            clearInterval(coinUpdateInterval);
            coinUpdateInterval = null;
        }
    }

    async function startCoinSlot() {
        const hideLoading = showLoading('Starting coin slot...');

        try {
            // Get station from selected coinslot
            let stationParam = '';
            if (clientNetworkInfo.selected_coinslot) {
                const coinslot = clientNetworkInfo.selected_coinslot;
                if (coinslot.type === 'main_vendo') {
                    // Explicitly tell backend to use GPIO (main vendo)
                    stationParam = '?type=main_vendo';
                } else if (coinslot.chip_id) {
                    stationParam = `?chipid=${encodeURIComponent(coinslot.chip_id)}`;
                }
            }

            const response = await $.ajax({
                url: COINSLOT_START_API + stationParam,
                method: 'GET',
                dataType: 'json'
            });

            hideLoading();

            if (response.status === 'success') {
                try {
                    coinSessionActive = true; // Mark session as active
                    usePollingFallback = false; // Try SSE first

                    // Try SSE first (faster when it works)
                    try {
                        await connectCoinSSE();
                        console.log('[WS] Connected - using SSE for updates');
                    } catch (wsError) {
                        // SSE failed - use polling fallback
                        console.log('[WS] Failed, using polling fallback:', wsError.message);
                        usePollingFallback = true;
                        startCoinPolling();
                    }

                    showNotification('Connected', 'Coin slot ready');
                    return true;
                } catch (error) {
                    coinSessionActive = false; // Connection failed
                    usePollingFallback = false;
                    stopCoinPolling();
                    console.error('Coin slot connection failed:', error);
                    showNotification('Error', 'Could not connect to coin slot');
                    return false;
                }
            } else if (response.status === 'error' && response.data && response.data.status === 'busy') {
                // Coin slot is busy, show waiting modal
                showCoinSlotWaitingModal();
                return false;
            } else {
                showNotification('Error', response.message || 'Failed to start coin slot');
                return false;
            }
        } catch (error) {
            hideLoading();
            console.error('Error starting coin slot:', error);

            // For demo/testing, assume a 403 or 409 status means it's busy
            if (error.status === 403 || error.status === 409) {
                showCoinSlotWaitingModal();
                return false;
            }

            showNotification('Error', 'Could not start coin slot system');
            return false;
        }
    }

    // Show the coin slot waiting modal
    function showCoinSlotWaitingModal() {
        // Reset waiting state
        waitingForCoinSlot = true;
        waitingTimeInSeconds = 30;
        $waitingTimeRemaining.text(waitingTimeInSeconds + 's');
        $waitingProgressBar.css('width', '100%');
        $checkInterval.text(CHECK_INTERVAL_SECONDS);

        // Show the modal
        coinWaitingModal.show();

        // Start the countdown timer
        startWaitingCountdown();

        // Start the periodic checking interval
        startCheckInterval();
    }

    // Start countdown for waiting modal
    function startWaitingCountdown() {
        // Clear existing interval if any
        clearInterval(waitingInterval);

        waitingInterval = setInterval(() => {
            if (waitingTimeInSeconds > 0) {
                waitingTimeInSeconds--;
                $waitingTimeRemaining.text(waitingTimeInSeconds + 's');

                // Update progress bar
                const progressPercentage = (waitingTimeInSeconds / 30) * 100;
                $waitingProgressBar.css('width', progressPercentage + '%');

                // If time reaches zero, check availability automatically
                if (waitingTimeInSeconds === 0) {
                    checkCoinSlotAvailability();
                    waitingTimeInSeconds = 30; // Reset timer
                }
            }
        }, 1000);
    }

    // Start periodic availability check
    function startCheckInterval() {
        // Clear existing interval if any
        clearInterval(checkAvailabilityInterval);

        // Record the initial check time
        lastCheckTime = Date.now();

        checkAvailabilityInterval = setInterval(() => {
            // Calculate time since last check
            const currentTime = Date.now();
            const timeSinceLastCheck = Math.floor((currentTime - lastCheckTime) / 1000);

            // Update the displayed time until next check
            const timeUntilNextCheck = Math.max(0, CHECK_INTERVAL_SECONDS - timeSinceLastCheck);
            $checkInterval.text(timeUntilNextCheck);

            // If it's time for a check, do it
            if (timeSinceLastCheck >= CHECK_INTERVAL_SECONDS) {
                checkCoinSlotAvailability();
                lastCheckTime = currentTime;
            }
        }, 1000);
    }

    // Check if coin slot is available
    async function checkCoinSlotAvailability() {
        const hideLoading = showLoading('Checking availability...');

        try {
            // Get station from selected coinslot
            let stationParam = '';
            if (clientNetworkInfo.selected_coinslot) {
                const coinslot = clientNetworkInfo.selected_coinslot;
                if (coinslot.type !== 'main_vendo' && coinslot.chip_id) {
                    stationParam = `&chipid=${encodeURIComponent(coinslot.chip_id)}`;
                }
            }

            // Try to start the coin slot
            const response = await $.ajax({
                url: COINSLOT_START_API + `?_=${Date.now()}${stationParam}`,
                method: 'GET',
                dataType: 'json'
            });

            hideLoading();

            if (response.status === 'success') {
                // Coin slot is available now
                closeCoinSlotWaitingModal();
                connectCoinSSE();
                openCoinModal();
                showNotification('Success', 'Coin slot is now available!');
                return true;
            } else {
                // Still busy
                showNotification('Info', 'Coin slot is still in use by another user');
                return false;
            }
        } catch (error) {
            hideLoading();
            console.error('Error checking coin slot availability:', error);

            // If it's been too long waiting, give up
            const totalWaitingTime = Math.floor((Date.now() - lastCheckTime) / 1000);
            if (totalWaitingTime > MAX_WAIT_TIME) {
                closeCoinSlotWaitingModal();
                showNotification('Error', 'Gave up waiting after 2 minutes');
                return false;
            }

            showNotification('Info', 'Coin slot is still busy. Will check again soon.');
            return false;
        }
    }

    // Close the waiting modal and clean up
    function closeCoinSlotWaitingModal() {
        // Clear all intervals
        clearInterval(waitingInterval);
        clearInterval(checkAvailabilityInterval);

        // Reset waiting state
        waitingForCoinSlot = false;

        // Hide the modal
        coinWaitingModal.hide();
    }

    // Stop coin slot monitoring
    async function stopCoinSlot() {
        coinSessionActive = false; // Mark session as inactive FIRST
        usePollingFallback = false; // Reset polling flag

        // Stop polling
        stopCoinPolling();

        // Close SSE connection
        if (coinEventSource) {
            coinEventSource.close();
            coinEventSource = null;
        }

        // Close coin modal if open
        if ($coinInsertionModal.hasClass('show')) {
            closeCoinModal(true);
        }

        try {
            const response = await $.ajax({
                url: COINSLOT_STOP_API,
                method: 'GET',
                dataType: 'json'
            });

            if (response.status === 'success') {
                showNotification('Success', response.message);
                return true;
            } else {
                showNotification('Error', response.message || 'Failed to stop coin slot');
                return false;
            }
        } catch (error) {
            console.error('Error stopping coin slot:', error);
            showNotification('Error', 'Could not stop coin slot system');
            return false;
        }
    }

    // Reset coin counter
    async function resetCoinCounter() {
        try {
            const response = await $.ajax({
                url: COINSLOT_RESET_API,
                method: 'POST',
                dataType: 'json'
            });

            if (response.status === 'success') {
                showNotification('Success', 'Done Insert Coin');
                return true;
            } else {
                showNotification('Error', response.message || 'Failed to reset Insert Coin');
                return false;
            }
        } catch (error) {
            console.error('Error resetting coin counter:', error);
            showNotification('Error', 'Could not reset coin counter');
            return false;
        }
    }

    // Get current coin count
    async function getCoinCount() {
        try {
            const response = await $.ajax({
                url: COINSLOT_COUNT_API,
                method: 'GET',
                dataType: 'json'
            });

            if (response.status === 'success' && response.data) {
                totalAmount = response.data.total_peso || 0;
                // Use actual equiv_minutes from backend (based on station rates)
                equivMinutes = response.data.equiv_minutes || 0;
                dataAmount = response.data.data_amount || 0;
                timeValue = equivMinutes;
                voucherValue = equivMinutes;
                updateCoinModalUI();
                return response.data;
            } else {
                showNotification('Error', response.message || 'Failed to get coin count');
                return null;
            }
        } catch (error) {
            console.error('Error getting coin count:', error);
            showNotification('Error', 'Could not get coin count');
            return null;
        }
    }


async function initializeEloading() {
    const hideLoading = showLoading('Loading e-loading services...');

    try {
        await Promise.all([
            fetchPrepaidProducts(),
            fetchLoadRates()
        ]);

        hideLoading();
        return true;
    } catch (error) {
        hideLoading();
        console.error('Error initializing e-loading:', error);
        showNotification('Error', 'Could not initialize e-loading services');
        return false;
    }
}

    function playInsertSound() {
        console.log('playInsertSound called');

        // Play beep as immediate feedback
        playBeepSound();

        // Also try to play MP3 if available
        try {
            if (coinInsertSound && coinInsertSound.src) {
                console.log('Playing MP3 sound');
                coinInsertSound.currentTime = 0;
                coinInsertSound.volume = 0.8;
                coinInsertSound.play().catch(err => {
                    console.log('MP3 sound failed:', err);
                });
            }
        } catch (error) {
            console.error('Error playing MP3 sound:', error);
        }

        // Flash effect on the amount
        $('#coin-amount-value').addClass('highlight-value');
        setTimeout(() => {
            $('#coin-amount-value').removeClass('highlight-value');
        }, 700);
    }

    // Simple beep using Audio API with base64 encoded beep
    const beepDataUri = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU' +
        Array(300).fill('//8=').join('');
    const beepAudio = new Audio(beepDataUri);
    beepAudio.volume = 0.8;

    function playBeepSound() {
        console.log('playBeepSound called');

        // Method 1: Try HTML5 Audio with data URI (works on most browsers)
        try {
            beepAudio.currentTime = 0;
            beepAudio.play().catch(e => console.log('Beep audio failed:', e));
        } catch (e) {
            console.log('Beep audio error:', e);
        }

        // Method 2: Try Web Audio API oscillator
        try {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }

            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.type = 'square'; // Square wave is louder
            oscillator.frequency.value = 880; // A5 note
            gainNode.gain.value = 0.5;

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);

            console.log('Oscillator beep played');
        } catch (error) {
            console.error('Oscillator error:', error);
        }
    }

function renderCategoryProducts(category, products) {
    const $productsContainer = $('#products-container');

    if (!products || products.length === 0) return;

    // Create a safe CSS class name by replacing special characters and spaces with hyphens
    const safeCategoryClass = category.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();

    $productsContainer.append(`
        <div class="card category-card mb-4">
            <div class="card-header bg-primary bg-gradient text-white">
                <h6 class="mb-0 fw-bold">${category}</h6>
            </div>
            <div class="list-group list-group-flush category-${safeCategoryClass}"></div>
        </div>
    `);

    const $categoryGroup = $(`.category-${safeCategoryClass}`);

    products.forEach(product => {
        $categoryGroup.append(`
            <button type="button" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center promo-item"
                    data-promo-id="${product.id}"
                    data-promo-price="${product.denomination}"
                    data-promo-extag="${product.extag || ''}">
                <div>
                    <div class="fw-bold">${product.telcotag} - ₱${product.denomination}</div>
                    <small class="text-muted">${product.pdescription || 'No description available'}</small>
                </div>
                <span class="badge bg-primary rounded-pill">₱${product.denomination}</span>
            </button>
        `);
    });
}
    // Generate a random voucher code
    function generateVoucherCode(amount) {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';

        // Add timestamp component
        const timestamp = Date.now().toString().slice(-6);

        // Add random characters
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        // Format the code in blocks
        return `${code.substring(0, 3)}-${timestamp}-${amount}`;
    }

    // Event Listeners
    $checkNowBtn.on('click', function() {
        checkCoinSlotAvailability();
        // Reset the last check time
        lastCheckTime = Date.now();
    });

    $cancelWaitingBtn.on('click', function() {
        closeCoinSlotWaitingModal();
        showNotification('Cancelled', 'Stopped waiting for coin slot');
    });

    $submitVoucherBtn.on('click', async function() {
        const voucher = $voucherInput.val().trim();
        if (voucher === '') return;

        const hideLoading = showLoading('Processing voucher...');

        try {
            // Get IP and MAC from stored portal data
            const portalData = localStorage.getItem('wifiPortalData');
            if (!portalData) {
                hideLoading();
                showNotification('Error', 'No connection data found');
                return;
            }

            const { ip, mac } = JSON.parse(portalData);

            // Call the voucher redeem API
            const response = await fetch(`/api/portal-user/voucher/redeem?ip=${encodeURIComponent(ip)}&mac=${encodeURIComponent(mac)}&voucher=${encodeURIComponent(voucher)}`, {
                method: 'POST'
            });

            const result = await response.json();
            hideLoading();

            if (result.status === 'success') {
                showNotification('Success', result.message || 'Voucher redeemed successfully');
                $voucherInput.val('');

                // Refresh the page data after a short delay
                setTimeout(() => {
                    initialAuthentication();
                }, 1000);
            } else {
                showNotification('Error', result.error || 'Failed to redeem voucher');
            }
        } catch (error) {
            hideLoading();
            console.error('Error redeeming voucher:', error);
            showNotification('Error', 'Could not process voucher. Please try again.');
        }
    });

    // Handle Enter key in voucher input
    $voucherInput.on('keypress', function(e) {
        if (e.which === 13) { // Enter key
            e.preventDefault();
            $submitVoucherBtn.click();
        }
    });

    // Function to update Insert Money button state based on coinslot status and portal settings
    function updateInsertMoneyButtonState() {
        // Check if buyTime, buyVoucher, AND buyData are all disabled - if so, hide insert coin
        if (portalSettings.buyTime === 'Disable' && portalSettings.buyVoucher === 'Disable' && portalSettings.buyData === 'Disable') {
            $insertMoneyBtn.removeClass('d-flex').addClass('d-none');
            return;
        }

        // Always show Insert Money button - use main_vendo as default if no coinslot assigned
        $insertMoneyBtn.removeClass('d-none').addClass('d-flex');
        $insertMoneyBtn.prop('disabled', false);
        $insertMoneyBtn.removeClass('disabled');
    }

    // Function to show coinslot selection modal
    function showCoinslotSelectionModal() {
        const coinslots = clientNetworkInfo.available_coinslots;
        if (!coinslots || coinslots.length === 0) {
            // No coinslot assigned - use main_vendo if enabled
            if (clientNetworkInfo.mainvendo_enabled === 1) {
                clientNetworkInfo.selected_coinslot = { type: 'main_vendo', name: 'Main Vendo', chip_id: '' };
                startCoinSlot();
                return;
            } else {
                showNotification('Error', 'No coinslot available for this network');
                return;
            }
        }

        // Background colors for coinslots - Material Design Red shades
        const bgColors = [
            'linear-gradient(135deg, #ef5350 0%, #e53935 100%)',
            'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
            'linear-gradient(135deg, #e57373 0%, #ef5350 100%)',
            'linear-gradient(135deg, #c62828 0%, #b71c1c 100%)',
            'linear-gradient(135deg, #ff5252 0%, #ff1744 100%)',
            'linear-gradient(135deg, #d50000 0%, #c62828 100%)'
        ];

        // Build modal content
        let modalContent = `
            <div class="modal fade" id="coinslot-selection-modal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header" style="background: linear-gradient(135deg, #ef5350 0%, #e53935 100%); border-radius: 0.5rem 0.5rem 0 0;">
                            <h5 class="modal-title fw-bold text-white"><i class="fa-solid fa-coins me-2" style="color: #ffd54f;"></i>Select Coinslot</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body pt-2">
                            <div class="d-grid gap-3">
        `;

        coinslots.forEach((cs, index) => {
            const isMainVendo = cs.type === 'main_vendo';
            const bgGradient = isMainVendo ? 'linear-gradient(135deg, #b71c1c 0%, #880e4f 100%)' : bgColors[index % bgColors.length];
            const numberLabel = isMainVendo ? 'M' : (index + 1);

            modalContent += `
                <button type="button" class="coinslot-select-btn border-0 text-white text-start p-3"
                        data-coinslot-id="${cs.id}"
                        data-coinslot-name="${cs.name}"
                        data-coinslot-type="${cs.type}"
                        data-coinslot-chipid="${cs.chip_id || ''}"
                        style="background: ${bgGradient}; border-radius: 12px; min-height: 80px;">
                    <div class="d-flex align-items-center h-100">
                        <span class="bg-white bg-opacity-25 rounded-circle me-3 fw-bold d-flex align-items-center justify-content-center"
                              style="width: 40px; height: 40px; font-size: 16px;">${numberLabel}</span>
                        <div class="flex-grow-1">
                            <div class="fw-bold" style="font-size: 16px;">${cs.name || 'Coinslot ' + (index + 1)}</div>
                            ${cs.description ? `<div class="text-white-50" style="font-size: 13px;">${cs.description}</div>` : ''}
                        </div>
                    </div>
                </button>
            `;
        });

        modalContent += `
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        $('#coinslot-selection-modal').remove();

        // Add modal to body
        $('body').append(modalContent);

        // Initialize and show modal
        const selectionModal = new bootstrap.Modal(document.getElementById('coinslot-selection-modal'));
        selectionModal.show();

        // Handle coinslot selection
        $('.coinslot-select-btn').on('click', async function() {
            const coinslotId = $(this).data('coinslot-id');
            const coinslotName = $(this).data('coinslot-name');
            const coinslotType = $(this).data('coinslot-type');
            const coinslotChipid = $(this).data('coinslot-chipid');

            // Store selected coinslot
            clientNetworkInfo.selected_coinslot = {
                id: coinslotId,
                name: coinslotName,
                type: coinslotType,
                chip_id: coinslotChipid
            };
            clientNetworkInfo.coinslot_name = coinslotName;

            // Update modal title
            const modalTitle = document.getElementById('coinInsertionModalLabel');
            if (modalTitle) {
                modalTitle.innerHTML = `<i class="fa-solid fa-coins me-2" style="color: #ffd54f;"></i>${coinslotName}`;
            }

            // Close selection modal
            selectionModal.hide();

            // Fetch rates for the selected coinslot using chip_id
            const chipid = coinslotType === 'main_vendo' ? null : coinslotChipid;
            const ratesResult = await fetchRatesByChipID(chipid);

            // Update payment buttons visibility
            updatePaymentButtonsVisibility(ratesResult.hasRates, ratesResult.hasDataRates);

            // Check if this is for e-load, cash-in, or regular coin insertion
            if (pendingEloadRequest) {
                proceedWithEloadCoinInsertion();
            } else if (pendingCashinRequest) {
                proceedWithCashinCoinInsertion();
            } else {
                proceedWithCoinInsertion();
            }
        });
    }

    // Function to proceed with coin insertion after selection
    function proceedWithCoinInsertion() {
        if (!socketConnected) {
            initialAuthentication().then(success => {
                if (success) {
                    startCoinSlot().then(success => {
                        if (success) {
                            openCoinModal();
                        }
                    });
                } else {
                    showNotification('Error', 'Could not connect to server');
                }
            });
        } else {
            startCoinSlot().then(success => {
                if (success) {
                    openCoinModal();
                }
            });
        }
    }

    // Modified Insert Money button handler
    $insertMoneyBtn.on('click', async function() {
        // Check if MAC address is registered
        if (!macAddress || macAddress === '--' || macAddress === '') {
            showNotification('Error', 'Please Refresh Portal. Mac address not registered.');
            return;
        }

        const availableCoinslots = clientNetworkInfo.available_coinslots;

        // Check if no coinslots available - use main_vendo as default if enabled
        if (!availableCoinslots || availableCoinslots.length === 0) {
            // Check if main_vendo is enabled in settings
            if (clientNetworkInfo.mainvendo_enabled === 1) {
                clientNetworkInfo.selected_coinslot = { type: 'main_vendo', name: 'Main Vendo', chip_id: '' };
                clientNetworkInfo.coinslot_name = 'Main Vendo';
                startCoinSlot();
                return;
            } else {
                showNotification('Error', 'No coinslot available for this network');
                return;
            }
        }

        // Check if coinslot is disabled (only when coinslots are assigned)
        if (!clientNetworkInfo.coinslot_enabled) {
            showNotification('Error', 'Coin slot is currently disabled');
            return;
        }
        if (!clientNetworkInfo.insert_coin_enabled) {
            showNotification('Error', 'Insert coin is currently disabled for this coinslot');
            return;
        }

        // If multiple coinslots available, show selection modal
        if (availableCoinslots.length > 1) {
            showCoinslotSelectionModal();
            return;
        }

        // Single coinslot - auto select and proceed
        const singleCoinslot = availableCoinslots[0];
        clientNetworkInfo.selected_coinslot = {
            id: singleCoinslot.id,
            name: singleCoinslot.name,
            type: singleCoinslot.type,
            chip_id: singleCoinslot.chip_id
        };
        clientNetworkInfo.coinslot_name = singleCoinslot.name;

        // Update modal title
        const modalTitle = document.getElementById('coinInsertionModalLabel');
        if (modalTitle) {
            modalTitle.innerHTML = `<i class="fa-solid fa-coins me-2" style="color: #ffd54f;"></i>${singleCoinslot.name}`;
        }

        // Fetch rates for the selected coinslot using chip_id
        const chipid = singleCoinslot.type === 'main_vendo' ? null : singleCoinslot.chip_id;
        const ratesResult = await fetchRatesByChipID(chipid);

        // Update payment buttons visibility
        updatePaymentButtonsVisibility(ratesResult.hasRates, ratesResult.hasDataRates);

        // Proceed with coin insertion
        proceedWithCoinInsertion();
    });

// Free time button click handler
$freeTimeBtn.on('click', function() {
    claimFreeTime();
});

// E-loading button click handler
$eloadingBtn.on('click', async function() {
    // Check if rates are loaded - if not, don't show modal
    if (loadRates.length === 0 || prepaidProducts.length === 0) {
        const success = await initializeEloading();
        if (!success || loadRates.length === 0 || prepaidProducts.length === 0) {
            showNotification('Error', 'E-loading service is not available');
            return;
        }
    }

    // Initialize the modal to default state
    resetEloadingModal();

    // Show the modal
    const eloadingModal = new bootstrap.Modal(document.getElementById('eloading-modal'));
    eloadingModal.show();
});


// Service option click handlers
$buyLoadOption.on('click', function() {
    selectedService = 'buyload';
    currentScreen = 'loadtype';

    // Hide all other screens first (in case user was in cash-in flow)
    $providerSelection.addClass('d-none').hide();
    $('#cashin-provider-selection').addClass('d-none').hide();
    if ($('#cashin-form-container').length) {
        $('#cashin-form-container').remove();
    }
    // Restore original buyload providers if they were replaced
    if (originalProviderHtml) {
        $('#provider-selection .row').html(originalProviderHtml);
    }

    // Keep main options visible, just show load type selection below
    document.getElementById('load-type-container').classList.remove('d-none');
    document.getElementById('load-type-container').style.display = 'block';
    document.getElementById('back-btn').classList.remove('d-none');

    // Highlight selected option
    $buyLoadOption.addClass('selected');
    $cashInOption.removeClass('selected');
});

$cashInOption.off('click').on('click', async function() {
    selectedService = 'cashin';
    currentScreen = 'provider';

    // Hide all other screens first (in case user was in buyload flow)
    $loadTypeContainer.addClass('d-none').hide();
    $providerSelection.addClass('d-none').hide();
    $promosContainer.addClass('d-none').hide();
    $numberInputContainer.addClass('d-none').hide();
    $('#products-container').empty();
    selectedLoadType = '';
    selectedPromo = null;

    // Highlight selected option
    $cashInOption.addClass('selected');
    $buyLoadOption.removeClass('selected');

    // Show loading spinner
    const hideLoading = showLoading('Loading cash-in services...');

    try {
        // Fetch the cash-in services from the API
        const response = await $.ajax({
            url: '/api/portal-eload/cashin',
            method: 'GET',
            dataType: 'json',
            timeout: 10000 // 10 second timeout
        });

        if (response.success && response.data) {
            // Store the data globally
            window.cashInServices = response.data;
            console.log('Cash-in services loaded successfully:', window.cashInServices.length);

            // Save original buyload providers HTML before replacing
            if (!originalProviderHtml) {
                originalProviderHtml = $('#provider-selection .row').html();
            }

            // Clear the provider container first
            $('#provider-selection .row').empty();

            // Generate provider options from the fetched data
            window.cashInServices.forEach(service => {
                if (service.online === 1 && service.status === 1) {
                    // Create a safe CSS class for the service
                    const safeServiceClass = service.services.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();

                    // Fix the logo path - convert from assets/eccash/ to img/eccash/
                    const logoPath = service.logo.replace('assets/eccash/', 'img/eccash/');

                    // Create provider option element
                    const providerHtml = `
                        <div class="col-6 col-md-3 mb-3">
                            <div class="provider-option" data-provider="${service.services}" data-service-id="${service.id}">
                                <img src="${logoPath}" alt="${service.description}" class="provider-logo"
                                     onerror="this.src='img/network/placeholder.png';this.onerror='';">
                                <span>${service.description}</span>
                            </div>
                        </div>
                    `;

                    // Add to the provider container
                    $('#provider-selection .row').append(providerHtml);
                }
            });

            // Instead of reassigning $providerOptions (which causes the error),
            // apply the click handler directly to the newly added elements
            $('#provider-selection .provider-option').off('click.cashin').on('click.cashin', function() {
                // Only handle if we're in cash-in mode
                if (selectedService !== 'cashin') return;

                // First remove selection from all providers
                $('.provider-option').removeClass('selected');

                // Add selection to clicked provider
                $(this).addClass('selected');

                // Store selected provider and service ID
                selectedProvider = $(this).data('provider');
                const serviceId = $(this).data('service-id');
                console.log('Selected provider:', selectedProvider, 'Service ID:', serviceId);

                // Find the service data for this provider
                const serviceData = window.cashInServices.find(service =>
                    service.services === selectedProvider ||
                    service.id === serviceId);

                if (!serviceData) {
                    showNotification('Error', 'Service data not found');
                    return;
                }

                // Move to cash-in form screen
                currentScreen = 'cashin-form';
                $providerSelection.hide();

                // Hide provider selection, main options and show back button for last step
                $('#cashin-provider-selection').addClass('d-none').hide();
                $('#main-options-row').hide();
                $backBtn.removeClass('d-none');

                // Remove existing form if any
                if ($('#cashin-form-container').length) {
                    $('#cashin-form-container').remove();
                }

                // Get field labels and pricing from service data
                const firstFieldLabel = serviceData.firstfield.trim();
                const secondFieldLabel = serviceData.secondfield.trim();
                const serviceName = serviceData.description;
                const serviceType = serviceData.services.toUpperCase();
                const serviceLogo = serviceData.logo ? serviceData.logo.replace('assets/eccash/', '../img/eccash/') : '';

                // Check if service is GCASH or MAYA (identifier = account_no)
                const isSimpleService = serviceType.includes('GCASH') || serviceType.includes('MAYA');

                // Get pricing ranges
                const pricingRanges = serviceData.pricing_ranges || [
                    { min: 1, max: 1000, rate: 5 },
                    { min: 1001, max: 2000, rate: 10 }
                ];

                // Create cash-in form (simplified layout like eload)
                const cashInFormHtml = `
                    <div id="cashin-form-container" class="mt-4" data-simple-service="${isSimpleService}">
                        <!-- Selected Provider Display -->
                        <div class="mb-3 p-2 bg-light rounded border">
                            <small class="text-muted">Selected Service:</small>
                            <div class="d-flex align-items-center gap-2 mt-1">
                                <img src="${serviceLogo}" alt="${serviceName}" class="selected-provider-logo" onerror="this.src='../img/network/placeholder.png';">
                                <div class="fw-bold text-primary">${serviceName}</div>
                            </div>
                        </div>

                        <div class="mb-3">
                            <div class="form-floating">
                                <input type="tel" class="form-control" id="cashin-field1" placeholder="${firstFieldLabel}">
                                <label for="cashin-field1">${firstFieldLabel}</label>
                            </div>
                        </div>

                        <div class="mb-3 ${isSimpleService ? 'd-none' : ''}">
                            <div class="form-floating">
                                <input type="text" class="form-control" id="cashin-field2" placeholder="${secondFieldLabel}">
                                <label for="cashin-field2">${secondFieldLabel}</label>
                            </div>
                        </div>

                        <div class="mb-3">
                            <div class="form-floating">
                                <input type="number" class="form-control" id="cashin-amount" placeholder="Amount" min="${pricingRanges[0].min}" max="${pricingRanges[pricingRanges.length-1].max}">
                                <label for="cashin-amount">Amount</label>
                            </div>
                            <small class="text-muted ms-1">Min ₱${pricingRanges[0].min} - Max ₱${pricingRanges[pricingRanges.length-1].max}</small>
                            <div class="small text-muted mt-1">Service Fee: <span id="cashin-fee" class="fw-bold text-primary">₱0</span></div>
                        </div>

                        <button class="btn btn-success w-100" id="confirm-cashin-btn">
                            <i class="fa-solid fa-arrow-right me-2"></i>Proceed to Payment
                        </button>
                    </div>
                `;

                // Add the form to the modal body
                $('#eloading-modal .modal-body').append(cashInFormHtml);

                // Set up the amount input handler
                $('#cashin-amount').on('input', function() {
                    const amount = parseFloat($(this).val()) || 0;
                    let fee = 0;

                    // Find the applicable fee rate
                    for (const range of pricingRanges) {
                        if (amount >= range.min && amount <= range.max) {
                            fee = range.rate;
                            break;
                        }
                    }

                    // Update the fee display
                    $('#cashin-fee').text(`₱${fee}`);
                });

                // Set up the confirm button handler
                $('#confirm-cashin-btn').on('click', async function() {
                    const field1Value = $('#cashin-field1').val();
                    // For GCASH/MAYA, use field1 as field2 (identifier = account_no)
                    const field2Value = isSimpleService ? field1Value : $('#cashin-field2').val();
                    const amount = parseFloat($('#cashin-amount').val()) || 0;

                    // Validate form fields
                    if (!field1Value) {
                        showNotification('Error', `Please enter ${firstFieldLabel}`);
                        return;
                    }

                    // Only validate field2 for non-simple services
                    if (!isSimpleService && !field2Value) {
                        showNotification('Error', `Please enter ${secondFieldLabel}`);
                        return;
                    }

                    if (!amount || amount < pricingRanges[0].min || amount > pricingRanges[pricingRanges.length-1].max) {
                        showNotification('Error', `Please enter an amount between ₱${pricingRanges[0].min} and ₱${pricingRanges[pricingRanges.length-1].max}`);
                        return;
                    }

                    // Calculate the service fee
                    let fee = 0;
                    for (const range of pricingRanges) {
                        if (amount >= range.min && amount <= range.max) {
                            fee = range.rate;
                            break;
                        }
                    }

                    const totalRequired = amount + fee;

                    // Validate with API first
                    const hideLoading = showLoading('Validating cash-in...');
                    try {
                        await $.ajax({
                            url: '/api/send-cashin-validate',
                            method: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify({
                                service_type: serviceData.services,
                                account_no: field1Value,
                                identifier: field2Value,
                                amount: amount.toString()
                            }),
                            timeout: 15000
                        });
                        hideLoading();
                    } catch (error) {
                        hideLoading();
                        let errorMessage = 'Validation failed. Please check your details.';
                        if (error.responseJSON) {
                            errorMessage = error.responseJSON.Message || error.responseJSON.error || errorMessage;
                        } else if (error.responseText) {
                            try {
                                const parsed = JSON.parse(error.responseText);
                                errorMessage = parsed.Message || parsed.error || errorMessage;
                            } catch (e) {}
                        }
                        showNotification('Error', errorMessage);
                        return;
                    }

                    // Store pending cash-in request
                    pendingCashinRequest = {
                        serviceName: serviceName,
                        serviceType: serviceData.services,
                        field1Label: firstFieldLabel,
                        field2Label: secondFieldLabel,
                        field1Value: field1Value,
                        field2Value: field2Value,
                        amount: amount,
                        fee: fee,
                        totalRequired: totalRequired
                    };

                    // Show beautiful confirmation modal
                    $('#confirm-cashin-service').text(serviceName);
                    $('#confirm-cashin-field1-label').text(firstFieldLabel + ':');
                    $('#confirm-cashin-field1').text(field1Value);
                    // Hide field2 row for simple services (GCASH/MAYA)
                    if (isSimpleService) {
                        $('#confirm-cashin-field2-label').parent().addClass('d-none');
                    } else {
                        $('#confirm-cashin-field2-label').parent().removeClass('d-none');
                        $('#confirm-cashin-field2-label').text(secondFieldLabel + ':');
                        $('#confirm-cashin-field2').text(field2Value);
                    }
                    $('#confirm-cashin-amount').text('₱' + amount);
                    $('#confirm-cashin-fee').text('₱' + fee);
                    $('#confirm-cashin-total').text('₱' + totalRequired);

                    // Show the confirmation modal
                    const confirmModal = new bootstrap.Modal(document.getElementById('cashin-confirm-modal'));
                    confirmModal.show();
                });

                // Show the back button
                $backBtn.removeClass('d-none');
            });
        } else {
            console.error('Failed to load cash-in services:', response);
            showNotification('Error', 'Could not load cash-in service providers');
        }
    } catch (error) {
        console.error('Error fetching cash-in services:', error);
        showNotification('Error', 'Failed to connect to server');
    }

    hideLoading();

    // Keep main options visible, show cash-in provider selection
    $('#cashin-provider-selection').removeClass('d-none').show();
    $backBtn.removeClass('d-none');
});

// Update the provider click handler for cash-in
$(document).off('click', '.provider-option').on('click', '.provider-option', function() {
    if (selectedService !== 'cashin') return; // Let original code handle other services

    // Get the selected provider
    const $selectedProvider = $(this);
    $('.provider-option').removeClass('selected');
    $selectedProvider.addClass('selected');

    // Store selected provider and service ID
    selectedProvider = $selectedProvider.data('provider');
    const serviceId = $selectedProvider.data('service-id');
    console.log('Selected provider:', selectedProvider, 'Service ID:', serviceId);

    // Find the service data for this provider
    const serviceData = window.cashInServices.find(service =>
        service.services === selectedProvider ||
        service.id === serviceId);

    if (!serviceData) {
        showNotification('Error', 'Service data not found');
        return;
    }

    // Move to cash-in form screen
    currentScreen = 'cashin-form';
    $providerSelection.hide();

    // Hide provider selection, main options and show back button for last step
    $('#cashin-provider-selection').addClass('d-none').hide();
    $('#main-options-row').hide();
    $backBtn.removeClass('d-none');

    // Remove existing form if any
    if ($('#cashin-form-container').length) {
        $('#cashin-form-container').remove();
    }

    // Get field labels and pricing from service data
    const firstFieldLabel = serviceData.firstfield.trim();
    const secondFieldLabel = serviceData.secondfield.trim();
    const serviceName = serviceData.description;
    const serviceType = serviceData.services.toUpperCase();
    const serviceLogo = serviceData.logo ? serviceData.logo.replace('assets/eccash/', '../img/eccash/') : '';

    // Check if service is GCASH or MAYA (identifier = account_no)
    const isSimpleService = serviceType.includes('GCASH') || serviceType.includes('MAYA');

    // Get pricing ranges
    const pricingRanges = serviceData.pricing_ranges || [
        { min: 1, max: 1000, rate: 5 },
        { min: 1001, max: 2000, rate: 10 }
    ];

    // Create cash-in form (simplified layout like eload)
    const cashInFormHtml = `
        <div id="cashin-form-container" class="mt-4" data-simple-service="${isSimpleService}">
            <!-- Selected Provider Display -->
            <div class="mb-3 p-2 bg-light rounded border">
                <small class="text-muted">Selected Service:</small>
                <div class="d-flex align-items-center gap-2 mt-1">
                    <img src="${serviceLogo}" alt="${serviceName}" class="selected-provider-logo" onerror="this.src='../img/network/placeholder.png';">
                    <div class="fw-bold text-primary">${serviceName}</div>
                </div>
            </div>

            <div class="mb-3">
                <div class="form-floating">
                    <input type="tel" class="form-control" id="cashin-field1" placeholder="${firstFieldLabel}">
                    <label for="cashin-field1">${firstFieldLabel}</label>
                </div>
            </div>

            <div class="mb-3 ${isSimpleService ? 'd-none' : ''}">
                <div class="form-floating">
                    <input type="text" class="form-control" id="cashin-field2" placeholder="${secondFieldLabel}">
                    <label for="cashin-field2">${secondFieldLabel}</label>
                </div>
            </div>

            <div class="mb-3">
                <div class="form-floating">
                    <input type="number" class="form-control" id="cashin-amount" placeholder="Amount" min="${pricingRanges[0].min}" max="${pricingRanges[pricingRanges.length-1].max}">
                    <label for="cashin-amount">Amount</label>
                </div>
                <small class="text-muted ms-1">Min ₱${pricingRanges[0].min} - Max ₱${pricingRanges[pricingRanges.length-1].max}</small>
                <div class="small text-muted mt-1">Service Fee: <span id="cashin-fee" class="fw-bold text-primary">₱0</span></div>
            </div>

            <button class="btn btn-success w-100" id="confirm-cashin-btn">
                <i class="fa-solid fa-arrow-right me-2"></i>Proceed to Payment
            </button>
        </div>
    `;

    // Add the form to the modal body
    $('#eloading-modal .modal-body').append(cashInFormHtml);

    // Set up the amount input handler
    $('#cashin-amount').on('input', function() {
        const amount = parseFloat($(this).val()) || 0;
        let fee = 0;

        // Find the applicable fee rate
        for (const range of pricingRanges) {
            if (amount >= range.min && amount <= range.max) {
                fee = range.rate;
                break;
            }
        }

        // Update the fee display
        $('#cashin-fee').text(`₱${fee}`);
    });

    // Set up the confirm button handler
    $('#confirm-cashin-btn').on('click', async function() {
        const field1Value = $('#cashin-field1').val();
        // For GCASH/MAYA, use field1 as field2 (identifier = account_no)
        const field2Value = isSimpleService ? field1Value : $('#cashin-field2').val();
        const amount = parseFloat($('#cashin-amount').val()) || 0;

        // Validate form fields
        if (!field1Value) {
            showNotification('Error', `Please enter ${firstFieldLabel}`);
            return;
        }

        // Only validate field2 for non-simple services
        if (!isSimpleService && !field2Value) {
            showNotification('Error', `Please enter ${secondFieldLabel}`);
            return;
        }

        if (!amount || amount < pricingRanges[0].min || amount > pricingRanges[pricingRanges.length-1].max) {
            showNotification('Error', `Please enter an amount between ₱${pricingRanges[0].min} and ₱${pricingRanges[pricingRanges.length-1].max}`);
            return;
        }

        // Calculate the service fee
        let fee = 0;
        for (const range of pricingRanges) {
            if (amount >= range.min && amount <= range.max) {
                fee = range.rate;
                break;
            }
        }

        const totalRequired = amount + fee;

        // Validate with API first
        const hideLoading = showLoading('Validating cash-in...');
        try {
            await $.ajax({
                url: '/api/send-cashin-validate',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    service_type: serviceData.services,
                    account_no: field1Value,
                    identifier: field2Value,
                    amount: amount.toString()
                }),
                timeout: 15000
            });
            hideLoading();
        } catch (error) {
            hideLoading();
            let errorMessage = 'Validation failed. Please check your details.';
            if (error.responseJSON) {
                errorMessage = error.responseJSON.Message || error.responseJSON.error || errorMessage;
            } else if (error.responseText) {
                try {
                    const parsed = JSON.parse(error.responseText);
                    errorMessage = parsed.Message || parsed.error || errorMessage;
                } catch (e) {}
            }
            showNotification('Error', errorMessage);
            return;
        }

        // Store pending cash-in request
        pendingCashinRequest = {
            serviceName: serviceName,
            serviceType: serviceData.services,
            field1Label: firstFieldLabel,
            field2Label: secondFieldLabel,
            field1Value: field1Value,
            field2Value: field2Value,
            amount: amount,
            fee: fee,
            totalRequired: totalRequired
        };

        // Show beautiful confirmation modal
        $('#confirm-cashin-service').text(serviceName);
        $('#confirm-cashin-field1-label').text(firstFieldLabel + ':');
        $('#confirm-cashin-field1').text(field1Value);
        // Hide field2 row for simple services
        if (isSimpleService) {
            $('#confirm-cashin-field2-label').parent().addClass('d-none');
        } else {
            $('#confirm-cashin-field2-label').parent().removeClass('d-none');
            $('#confirm-cashin-field2-label').text(secondFieldLabel + ':');
            $('#confirm-cashin-field2').text(field2Value);
        }
        $('#confirm-cashin-amount').text('₱' + amount);
        $('#confirm-cashin-fee').text('₱' + fee);
        $('#confirm-cashin-total').text('₱' + totalRequired);

        // Show the confirmation modal
        const confirmModal = new bootstrap.Modal(document.getElementById('cashin-confirm-modal'));
        confirmModal.show();
    });

    // Show the back button
    $backBtn.removeClass('d-none');
});

// Updated provider click handler with improved screen transition
// Use event delegation for provider clicks (so it works after HTML is restored)
$('#provider-selection').on('click', '.provider-option', async function() {
    // Remove selection from all providers
    $('.provider-option').removeClass('selected');

    // Add selection to clicked provider
    $(this).addClass('selected');

    // Store selected provider, logo, and parent provider if specified
    selectedProvider = $(this).data('provider');
    selectedProviderLogo = $(this).find('img').attr('src') || '';
    const parentProvider = $(this).data('parent-provider') || selectedProvider;

    // If products haven't been loaded yet, load them now
    if (prepaidProducts.length === 0) {
        const hideLoading = showLoading('Loading products...');
        await fetchPrepaidProducts();
        await fetchLoadRates();
        hideLoading();
    }

    // NEW CODE: Handle different flows based on selectedService
    if (selectedService === 'cashin') {
        // For cash-in service, go to the cash-in form
        currentScreen = 'cashin-form';

        // Hide provider selection, main options and show header back button for last step
        $providerSelection.hide();
        $('#cashin-provider-selection').addClass('d-none').hide();
        $('#main-options-row').hide();
        $backBtn.removeClass('d-none');

        // If we don't already have cash-in services data, fetch it
        if (!window.cashInServices) {
            const hideLoading = showLoading('Loading cash-in services...');
            try {
                const response = await $.ajax({
                    url: '/api/portal-eload/cashin',
                    method: 'GET',
                    dataType: 'json',
                    timeout: 10000 // 10 second timeout
                });

                if (response.success && response.data) {
                    window.cashInServices = response.data;
                } else {
                    window.cashInServices = [];
                }
            } catch (error) {
                console.error('Error fetching cash-in services:', error);
                window.cashInServices = [];
            }
            hideLoading();
        }

        // Find the selected service in our data
        const selectedService = window.cashInServices.find(service =>
            service.services === selectedProvider ||
            service.description.includes(selectedProvider));

        // Create cash-in form if it doesn't exist
        if (!$('#cashin-form-container').length) {
            const $cashInFormContainer = $('<div id="cashin-form-container" class="mt-4"></div>');
            $('#eloading-modal .modal-body').append($cashInFormContainer);
        }

        // Build the cash-in form with the correct fields
        const $cashInFormContainer = $('#cashin-form-container');

        // Clear previous content
        $cashInFormContainer.empty();

        // Get field labels from the selected service or use defaults
        const firstFieldLabel = selectedService ? selectedService.firstfield : 'Account Number';
        const secondFieldLabel = selectedService ? selectedService.secondfield : 'Account Name';
        const serviceType = selectedService ? selectedService.services.toUpperCase() : selectedProvider.toUpperCase();

        // Check if service is GCASH or MAYA (identifier = account_no)
        const isSimpleService = serviceType.includes('GCASH') || serviceType.includes('MAYA');

        // Get pricing info
        const pricingRanges = selectedService ? selectedService.pricing_ranges : [
            { min: 1, max: 1000, rate: 5 },
            { min: 1001, max: 2000, rate: 10 }
        ];

        // Create the form
        $cashInFormContainer.html(`
            <div class="card border-0 shadow-sm mb-4" data-simple-service="${isSimpleService}">
                <div class="card-header bg-primary bg-gradient text-white py-3">
                    <h5 class="mb-0 fw-bold">
                        <i class="fa-solid fa-wallet me-2"></i>
                        ${selectedService ? selectedService.description : selectedProvider} Cash-in
                    </h5>
                </div>
                <div class="card-body p-4">
                    <div class="form-floating mb-3">
                        <input type="tel" class="form-control" id="cashin-field1" placeholder="${firstFieldLabel}">
                        <label for="cashin-field1">${firstFieldLabel}</label>
                    </div>

                    <div class="form-floating mb-3 ${isSimpleService ? 'd-none' : ''}">
                        <input type="text" class="form-control" id="cashin-field2" placeholder="${secondFieldLabel}">
                        <label for="cashin-field2">${secondFieldLabel}</label>
                    </div>

                    <div class="form-floating mb-3">
                        <input type="number" class="form-control" id="cashin-amount" placeholder="Amount" min="${pricingRanges[0].min}" max="${pricingRanges[pricingRanges.length-1].max}">
                        <label for="cashin-amount">Amount (₱${pricingRanges[0].min} - ₱${pricingRanges[pricingRanges.length-1].max})</label>
                    </div>

                    <div class="alert alert-info d-flex align-items-center" role="alert">
                        <i class="fa-solid fa-circle-info me-2 fs-5"></i>
                        <div>
                            <strong>Service Fee:</strong> <span id="cashin-fee">₱0</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="pricing-info mb-3">
                <div class="pricing-header mb-2">Processing Fee Rates:</div>
                <div class="table-responsive">
                    <table class="table table-sm table-bordered">
                        <thead class="table-light">
                            <tr>
                                <th>Amount Range</th>
                                <th>Fee</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pricingRanges.map(range => `
                                <tr>
                                    <td>₱${range.min} - ₱${range.max}</td>
                                    <td>₱${range.rate}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <button class="btn btn-success w-100" id="confirm-cashin-btn">
                <i class="fa-solid fa-check-circle me-2"></i>Confirm Cash-in
            </button>
        `);

        // Add event listener for amount input to calculate fee
        $('#cashin-amount').on('input', function() {
            const amount = parseFloat($(this).val()) || 0;
            let fee = 0;

            // Find the applicable fee rate
            for (const range of pricingRanges) {
                if (amount >= range.min && amount <= range.max) {
                    fee = range.rate;
                    break;
                }
            }

            // Update the fee display
            $('#cashin-fee').text(`₱${fee}`);
        });

        // Add event listener for confirm button
        $('#confirm-cashin-btn').on('click', async function() {
            const field1Value = $('#cashin-field1').val();
            // For GCASH/MAYA, use field1 as field2 (identifier = account_no)
            const field2Value = isSimpleService ? field1Value : $('#cashin-field2').val();
            const amount = parseFloat($('#cashin-amount').val()) || 0;

            // Validate fields
            if (!field1Value) {
                showNotification('Error', `Please enter ${firstFieldLabel}`);
                return;
            }

            // Only validate field2 for non-simple services
            if (!isSimpleService && !field2Value) {
                showNotification('Error', `Please enter ${secondFieldLabel}`);
                return;
            }

            if (!amount || amount < pricingRanges[0].min || amount > pricingRanges[pricingRanges.length-1].max) {
                showNotification('Error', `Please enter an amount between ₱${pricingRanges[0].min} and ₱${pricingRanges[pricingRanges.length-1].max}`);
                return;
            }

            // Find the applicable fee rate
            let fee = 0;
            for (const range of pricingRanges) {
                if (amount >= range.min && amount <= range.max) {
                    fee = range.rate;
                    break;
                }
            }

            const totalRequired = amount + fee;
            const serviceName = selectedService ? selectedService.description : selectedProvider;
            const serviceType = selectedService ? selectedService.services : selectedProvider;

            // Validate with API first
            const hideLoading = showLoading('Validating cash-in...');
            try {
                await $.ajax({
                    url: '/api/send-cashin-validate',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        service_type: serviceType,
                        account_no: field1Value,
                        identifier: field2Value,
                        amount: amount.toString()
                    }),
                    timeout: 15000
                });
                hideLoading();
            } catch (error) {
                hideLoading();
                let errorMessage = 'Validation failed. Please check your details.';
                if (error.responseJSON) {
                    errorMessage = error.responseJSON.Message || error.responseJSON.error || errorMessage;
                } else if (error.responseText) {
                    try {
                        const parsed = JSON.parse(error.responseText);
                        errorMessage = parsed.Message || parsed.error || errorMessage;
                    } catch (e) {}
                }
                showNotification('Error', errorMessage);
                return;
            }

            // Store pending cash-in request
            pendingCashinRequest = {
                serviceName: serviceName,
                serviceType: serviceType,
                field1Label: firstFieldLabel,
                field2Label: secondFieldLabel,
                field1Value: field1Value,
                field2Value: field2Value,
                amount: amount,
                fee: fee,
                totalRequired: totalRequired
            };

            // Show beautiful confirmation modal
            $('#confirm-cashin-service').text(serviceName);
            $('#confirm-cashin-field1-label').text(firstFieldLabel + ':');
            $('#confirm-cashin-field1').text(field1Value);
            // Hide field2 row for simple services
            if (isSimpleService) {
                $('#confirm-cashin-field2-label').parent().addClass('d-none');
            } else {
                $('#confirm-cashin-field2-label').parent().removeClass('d-none');
                $('#confirm-cashin-field2-label').text(secondFieldLabel + ':');
                $('#confirm-cashin-field2').text(field2Value);
            }
            $('#confirm-cashin-amount').text('₱' + amount);
            $('#confirm-cashin-fee').text('₱' + fee);
            $('#confirm-cashin-total').text('₱' + totalRequired);

            // Show the confirmation modal
            const confirmModal = new bootstrap.Modal(document.getElementById('cashin-confirm-modal'));
            confirmModal.show();
        });

        // Show the cash-in form container
        $cashInFormContainer.removeClass('d-none').show();

        // Hide provider selection, main options and show back button for last step
        $('#cashin-provider-selection').addClass('d-none').hide();
        $('#main-options-row').hide();
        $backBtn.removeClass('d-none');
    } else if (selectedLoadType === 'regular') {
        // For regular load, go directly to number input
        currentScreen = 'number';
        $providerSelection.hide();

        // Hide main options and show back button for last step
        $('#main-options-row').hide();
        $backBtn.removeClass('d-none');

        // Set selected provider logo and name (using stored values)
        $('#selected-provider-logo').attr('src', selectedProviderLogo);
        $('#selected-provider-name').text(selectedProvider);

        $numberInputContainer.removeClass('d-none').show();

        // Show regular amount input, hide promo details
        $regularAmountContainer.show();
        $promoDetailsContainer.addClass('d-none');
    } else {
        // For promos, show products list (original code)
        currentScreen = 'promos';
        $providerSelection.hide();

        // Your existing code for showing promos...
        // Clear any existing products before adding new ones
        $('#products-container').empty();
        $promosContainer.empty();

        // Get products based on provider (category) logic
        let filteredProducts = [];

        // Special handling for TNT which may include some SMART products
        if (selectedProvider === 'TNT' && parentProvider === 'SMART') {
            // For TNT, include both TNT category products and some SMART products
            const tntProducts = prepaidProducts.filter(product =>
                product.category === 'TNT'
            );

            // Include SMART products that might be relevant for TNT
            const smartProducts = prepaidProducts.filter(product =>
                product.category === 'SMART' &&
                (product.telcotag.includes('TNT') || (product.pdescription && product.pdescription.includes('TNT')))
            );

            filteredProducts = [...tntProducts, ...smartProducts];
        } else {
            // For other providers, filter directly by category
            filteredProducts = prepaidProducts.filter(product =>
                product.category === selectedProvider
            );
        }

        // Group filtered products by subcategory or telcotag pattern for better organization
        const categoryProducts = {};

        filteredProducts.forEach(product => {
            // Use a grouping strategy based on telcotag patterns or product description
            let groupingCategory = "General";

            // Try to create logical groups based on product naming patterns
            if (product.telcotag.includes('DATA') || (product.pdescription && product.pdescription.includes('data'))) {
                groupingCategory = "Data Packages";
            } else if (product.telcotag.includes('UNLI') || (product.pdescription && product.pdescription.includes('Unlimited'))) {
                groupingCategory = "Unlimited Plans";
            } else if (product.telcotag.includes('CALL') || (product.pdescription && product.pdescription.includes('call'))) {
                groupingCategory = "Call and Text";
            } else if (product.telcotag.includes('SURF') || product.telcotag.includes('GIGA')) {
                groupingCategory = "Internet Surfing";
            } else if (product.telcotag.includes('MAGIC')) {
                groupingCategory = "Magic Packages";
            } else if (product.telcotag.includes('TIK') || (product.pdescription && product.pdescription.includes('TikTok'))) {
                groupingCategory = "Social Media";
            }

            if (!categoryProducts[groupingCategory]) {
                categoryProducts[groupingCategory] = [];
            }

            categoryProducts[groupingCategory].push(product);
        });

        // Sort products by denomination in each category
        Object.keys(categoryProducts).forEach(category => {
            categoryProducts[category].sort((a, b) => a.denomination - b.denomination);
        });

        // Generate the promos list
        $promosContainer.empty();

        // If no products
        if (Object.keys(categoryProducts).length === 0) {
            $promosContainer.append(`
                <h5 class="text-center mb-4">Select a Product</h5>
                <div class="alert alert-info">
                    No products available for this provider.
                </div>
            `);
        } else {
            // Get all valid categories (excluding null/undefined)
            const validCategories = Object.keys(categoryProducts).filter(
                cat => cat && cat !== "null" && cat !== "undefined" && cat !== ""
            );

            if (validCategories.length > 0) {
                // Create horizontal tabs for categories
                let tabsHtml = `
                    <div class="category-tabs-container">
                        <div class="nav-container">
                            <ul class="nav nav-tabs nav-fill category-tabs mb-3">
                                <li class="nav-item">
                                    <button class="nav-link active" data-category="all">All Products</button>
                                </li>
                `;

                // Add a tab for each category
                validCategories.forEach(category => {
                    tabsHtml += `
                        <li class="nav-item">
                            <button class="nav-link" data-category="${category}">${category}</button>
                        </li>
                    `;
                });

                // Close the tabs HTML
                tabsHtml += `
                            </ul>
                        </div>
                    </div>
                    <div id="products-container" class="mt-3"></div>
                `;

                $promosContainer.append(tabsHtml);

                // Add tab click handlers
                $('.category-tabs .nav-link').on('click', function() {
                    // Update active state
                    $('.category-tabs .nav-link').removeClass('active');
                    $(this).addClass('active');

                    // Get selected category
                    const selectedCategory = $(this).data('category');

                    // Display products for selected category
                    if (selectedCategory === 'all') {
                        // Show all categories
                        $('#products-container').empty();
                        validCategories.forEach(category => {
                            renderCategoryProducts(category, categoryProducts[category]);
                        });
                    } else {
                        // Show only the selected category
                        $('#products-container').empty();
                        renderCategoryProducts(selectedCategory, categoryProducts[selectedCategory]);
                    }
                });

                // Default display - show all categories
                validCategories.forEach(category => {
                    renderCategoryProducts(category, categoryProducts[category]);
                });
            } else {
                // No valid categories, just show the null products
                $promosContainer.append('<h5 class="text-center mb-4">Select a Product</h5>');
                $promosContainer.append('<div id="products-container" class="mt-3"></div>');

                const nullProducts = [
                    ...(categoryProducts["null"] || []),
                    ...(categoryProducts["undefined"] || []),
                    ...(categoryProducts[""] || [])
                ].filter(Boolean);

                if (nullProducts.length > 0) {
                    renderCategoryProducts("All Products", nullProducts);
                } else {
                    $('#products-container').append(`
                        <div class="alert alert-info">
                            No products available for this provider.
                        </div>
                    `);
                }
            }
        }

        $promosContainer.removeClass('d-none').show();
    }
});

// Regular load option click handler
$regularLoadOption.on('click', function() {
    selectedLoadType = 'regular';
    currentScreen = 'provider';

    // Direct DOM manipulation
    document.getElementById('load-type-container').style.display = 'none';
    document.getElementById('provider-selection').classList.remove('d-none');
    document.getElementById('provider-selection').style.display = 'block';
});

// Promos option click handler
$promosOption.on('click', function() {
    selectedLoadType = 'promos';
    currentScreen = 'provider';

    // Direct DOM manipulation
    document.getElementById('load-type-container').style.display = 'none';
    document.getElementById('provider-selection').classList.remove('d-none');
    document.getElementById('provider-selection').style.display = 'block';
});


// Back button click handler
$backBtn.off('click').on('click', function() {
    switch (currentScreen) {
        case 'billcategories':
            // Go back to main screen
            currentScreen = 'main';
            $('#bills-categories-container').remove();
            $backBtn.addClass('d-none');
            selectedService = '';
            $('.eloading-option').removeClass('selected');
            break;

        case 'billers':
            // Go back to bill categories
            currentScreen = 'billcategories';
            $('#billers-container').hide();
            $('#bills-categories-container').show();
            break;

        case 'billpayment':
            // Go back to billers list
            currentScreen = 'billers';
            $('#bill-payment-form-container').remove();
            $('#billers-container').show();
            break;

        case 'cashin-form':
            // Go back to provider selection
            currentScreen = 'provider';
            $('#cashin-form-container').remove();

            // Show main options
            $('#main-options-row').show();

            $('#cashin-provider-selection').removeClass('d-none').show();
            $backBtn.removeClass('d-none');
            break;

        case 'provider':
            // Go back to service selection
            if (selectedService === 'cashin') {
                currentScreen = 'main';
                $providerSelection.hide();
                $('#cashin-provider-selection').addClass('d-none').hide();
                $backBtn.addClass('d-none');
                selectedService = '';
                selectedProvider = '';
                $('.eloading-option').removeClass('selected');
                // Restore original buyload providers
                if (originalProviderHtml) {
                    $('#provider-selection .row').html(originalProviderHtml);
                }
            } else {
                // Go back to load type screen
                currentScreen = 'loadtype';
                $providerSelection.hide();
                $loadTypeContainer.removeClass('d-none');
                $backBtn.removeClass('d-none');
            }
            break;

        case 'loadtype':
            // Go back to main screen
            currentScreen = 'main';
            $loadTypeContainer.hide();
            $backBtn.addClass('d-none');
            selectedService = '';
            selectedProvider = '';
            selectedLoadType = '';
            $('.eloading-option').removeClass('selected');
            break;

        case 'promos':
            // Go back to provider selection
            currentScreen = 'provider';
            $promosContainer.hide();
            $providerSelection.removeClass('d-none').show();
            $backBtn.removeClass('d-none');
            $('.promo-item').removeClass('active');
            $('#products-container').empty();
            break;

        case 'number':
            // Show main options
            $('#main-options-row').show();

            if (selectedLoadType === 'promos') {
                // Go back to promos selection
                currentScreen = 'promos';
                $numberInputContainer.hide();
                $promosContainer.removeClass('d-none').show();
                $backBtn.removeClass('d-none');
            } else {
                // Go back to provider selection
                currentScreen = 'provider';
                $numberInputContainer.hide();
                $providerSelection.removeClass('d-none').show();
                $backBtn.removeClass('d-none');
            }
            break;
    }
});

// Confirm button click handler - opens coin modal for payment
$confirmEloadBtn.on('click', function() {
    const phoneNumber = $('#phone-number').val();
    let amount = 0;
    let fee = 0;
    let productName = '';
    let productCode = '';
    let network = '';

    if (!phoneNumber || phoneNumber.length < 10) {
        showNotification('Error', 'Please enter a valid phone number');
        return;
    }

    if (selectedLoadType === 'regular') {
        amount = parseInt($('#amount').val());

        if (!amount || amount < 1 || amount > 1000) {
            showNotification('Error', 'Please enter an amount between ₱1 and ₱1000');
            return;
        }

        fee = getLoadRate(amount);
        productName = `${selectedProvider.toUpperCase()} Regular Load`;
        network = selectedProvider.toUpperCase();
        // Set correct product code based on network
        // MYLOAD for Smart/TNT/SUN, AMAX for Globe/TM
        if (network === 'GLOBE' || network === 'TM') {
            productCode = 'AMAX';
        } else {
            productCode = 'MYLOAD';
        }
    } else if (selectedPromo) {
        amount = selectedPromo.price;
        fee = getLoadRate(amount);
        productName = selectedPromo.name;
        productCode = selectedPromo.extag;
        network = selectedPromo.telconame || selectedProvider.toUpperCase();
    } else {
        showNotification('Error', 'Please select a product');
        return;
    }

    const totalRequired = amount + fee;

    // Store pending e-load request
    pendingEloadRequest = {
        phoneNumber: phoneNumber,
        amount: amount,
        fee: fee,
        totalRequired: totalRequired,
        productName: productName,
        productCode: productCode,
        network: network
    };

    // Show beautiful confirmation modal
    $('#confirm-eload-phone').text(phoneNumber);
    $('#confirm-eload-product').text(productName);
    $('#confirm-eload-amount').text('₱' + amount);
    $('#confirm-eload-fee').text('₱' + fee);
    $('#confirm-eload-total').text('₱' + totalRequired);

    // Show the confirmation modal
    const confirmModal = new bootstrap.Modal(document.getElementById('eload-confirm-modal'));
    confirmModal.show();
});

// Track if user is proceeding to payment
let eloadProceedingToPayment = false;
let cashinProceedingToPayment = false;

// Handle e-load confirmation proceed button - uses same flow as Insert Money
$('#proceed-eload-btn').on('click', async function() {
    eloadProceedingToPayment = true;

    // Validate the e-load request before proceeding to coin insertion
    if (pendingEloadRequest) {
        const hideLoading = showLoading('Validating e-load...');
        try {
            const validateResponse = await $.ajax({
                url: '/api/portal-eload/validate',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    pcode: pendingEloadRequest.productCode,
                    network: pendingEloadRequest.network,
                    number: pendingEloadRequest.phoneNumber,
                    denomination: pendingEloadRequest.amount.toString()
                }),
                timeout: 15000
            });
            hideLoading();

            // Check if validation failed
            if (validateResponse.error) {
                showNotification('Error', validateResponse.error);
                eloadProceedingToPayment = false;
                return;
            }
            console.log('E-load validation passed:', validateResponse.Message || 'OK');
        } catch (error) {
            hideLoading();
            console.error('E-load validation error:', error);
            let errorMessage = 'Validation failed. Please check the phone number and try again.';
            if (error.responseJSON && error.responseJSON.error) {
                errorMessage = error.responseJSON.error;
            }
            showNotification('Error', errorMessage);
            eloadProceedingToPayment = false;
            return;
        }
    }

    const availableCoinslots = clientNetworkInfo.available_coinslots;

    // Check if no coinslots available
    if (!availableCoinslots || availableCoinslots.length === 0) {
        showNotification('Error', 'No coinslot available for this network');
        eloadProceedingToPayment = false;
        return;
    }

    // Check if coinslot is disabled
    if (!clientNetworkInfo.coinslot_enabled) {
        showNotification('Error', 'Coin slot is currently disabled');
        eloadProceedingToPayment = false;
        return;
    }

    if (!clientNetworkInfo.insert_coin_enabled) {
        showNotification('Error', 'Insert coin is currently disabled for this coinslot');
        eloadProceedingToPayment = false;
        return;
    }

    // Hide confirmation modal
    bootstrap.Modal.getInstance(document.getElementById('eload-confirm-modal')).hide();

    // Close e-loading modal
    const eloadingModal = bootstrap.Modal.getInstance(document.getElementById('eloading-modal'));
    if (eloadingModal) {
        eloadingModal.hide();
    }

    // If multiple coinslots available, show selection modal then proceed
    if (availableCoinslots.length > 1) {
        setTimeout(() => {
            showCoinslotSelectionModal();
            // After selection, proceedWithEloadCoinInsertion will be called
        }, 300);
        return;
    }

    // Single coinslot - auto select and proceed
    const singleCoinslot = availableCoinslots[0];
    clientNetworkInfo.selected_coinslot = {
        id: singleCoinslot.id,
        name: singleCoinslot.name,
        type: singleCoinslot.type,
        chip_id: singleCoinslot.chip_id
    };
    clientNetworkInfo.coinslot_name = singleCoinslot.name;

    // Proceed with e-load coin insertion after a short delay
    setTimeout(() => {
        proceedWithEloadCoinInsertion();
    }, 300);
});

// Function to proceed with e-load coin insertion (similar to proceedWithCoinInsertion)
function proceedWithEloadCoinInsertion() {
    if (!socketConnected) {
        initialAuthentication().then(success => {
            if (success) {
                startCoinSlot().then(success => {
                    if (success) {
                        openCoinModal();
                        eloadProceedingToPayment = false;
                    } else {
                        eloadProceedingToPayment = false;
                    }
                });
            } else {
                showNotification('Error', 'Could not connect to server');
                eloadProceedingToPayment = false;
            }
        });
    } else {
        startCoinSlot().then(success => {
            if (success) {
                openCoinModal();
                eloadProceedingToPayment = false;
            } else {
                eloadProceedingToPayment = false;
            }
        });
    }
}

// Handle e-load confirmation cancel (modal dismiss)
$('#eload-confirm-modal').on('hidden.bs.modal', function() {
    // Only clear if user cancelled (not proceeding to payment)
    if (!eloadProceedingToPayment && pendingEloadRequest) {
        pendingEloadRequest = null;
    }
});

// Handle cash-in confirmation proceed button - uses same flow as Insert Money
$('#proceed-cashin-btn').on('click', async function() {
    cashinProceedingToPayment = true;

    const availableCoinslots = clientNetworkInfo.available_coinslots;

    // Check if no coinslots available
    if (!availableCoinslots || availableCoinslots.length === 0) {
        showNotification('Error', 'No coinslot available for this network');
        cashinProceedingToPayment = false;
        return;
    }

    // Check if coinslot is disabled
    if (!clientNetworkInfo.coinslot_enabled) {
        showNotification('Error', 'Coin slot is currently disabled');
        cashinProceedingToPayment = false;
        return;
    }

    if (!clientNetworkInfo.insert_coin_enabled) {
        showNotification('Error', 'Insert coin is currently disabled for this coinslot');
        cashinProceedingToPayment = false;
        return;
    }

    // Hide confirmation modal
    bootstrap.Modal.getInstance(document.getElementById('cashin-confirm-modal')).hide();

    // Close e-loading modal
    const eloadingModal = bootstrap.Modal.getInstance(document.getElementById('eloading-modal'));
    if (eloadingModal) {
        eloadingModal.hide();
    }

    // If multiple coinslots available, show selection modal then proceed
    if (availableCoinslots.length > 1) {
        setTimeout(() => {
            showCoinslotSelectionModal();
            // After selection, proceedWithCashinCoinInsertion will be called
        }, 300);
        return;
    }

    // Single coinslot - auto select and proceed
    const singleCoinslot = availableCoinslots[0];
    clientNetworkInfo.selected_coinslot = {
        id: singleCoinslot.id,
        name: singleCoinslot.name,
        type: singleCoinslot.type,
        chip_id: singleCoinslot.chip_id
    };
    clientNetworkInfo.coinslot_name = singleCoinslot.name;

    // Proceed with cash-in coin insertion after a short delay
    setTimeout(() => {
        proceedWithCashinCoinInsertion();
    }, 300);
});

// Function to proceed with cash-in coin insertion (similar to proceedWithCoinInsertion)
function proceedWithCashinCoinInsertion() {
    if (!socketConnected) {
        initialAuthentication().then(success => {
            if (success) {
                startCoinSlot().then(success => {
                    if (success) {
                        openCoinModal();
                        cashinProceedingToPayment = false;
                    } else {
                        cashinProceedingToPayment = false;
                    }
                });
            } else {
                showNotification('Error', 'Could not connect to server');
                cashinProceedingToPayment = false;
            }
        });
    } else {
        startCoinSlot().then(success => {
            if (success) {
                openCoinModal();
                cashinProceedingToPayment = false;
            } else {
                cashinProceedingToPayment = false;
            }
        });
    }
}

// Handle cash-in confirmation cancel (modal dismiss)
$('#cashin-confirm-modal').on('hidden.bs.modal', function() {
    // Only clear if user cancelled (not proceeding to payment)
    if (!cashinProceedingToPayment && pendingCashinRequest) {
        pendingCashinRequest = null;
    }
});
//end eloading


    $wifiRatesBtn.on('click', async function() {
        try {
            // Get chipid from selected coinslot or available coinslots
            let chipid = '';
            if (clientNetworkInfo.selected_coinslot) {
                const coinslot = clientNetworkInfo.selected_coinslot;
                chipid = coinslot.type === 'main_vendo' ? '' : (coinslot.chip_id || '');
            } else if (clientNetworkInfo.available_coinslots && clientNetworkInfo.available_coinslots.length === 1) {
                // Auto-select if only one coinslot
                const coinslot = clientNetworkInfo.available_coinslots[0];
                chipid = coinslot.type === 'main_vendo' ? '' : (coinslot.chip_id || '');
            }

            const rates = await fetchWifiRates(chipid);
            showWifiRatesModal(rates);
        } catch (error) {
            console.error('Error displaying WiFi rates:', error);
            showNotification('Error', 'Could not load WiFi rates');
        }
    });

    $dataRatesBtn.on('click', async function() {
        try {
            // Get chipid from selected coinslot or available coinslots
            let chipid = '';
            if (clientNetworkInfo.selected_coinslot) {
                const coinslot = clientNetworkInfo.selected_coinslot;
                chipid = coinslot.type === 'main_vendo' ? '' : (coinslot.chip_id || '');
            } else if (clientNetworkInfo.available_coinslots && clientNetworkInfo.available_coinslots.length === 1) {
                // Auto-select if only one coinslot
                const coinslot = clientNetworkInfo.available_coinslots[0];
                chipid = coinslot.type === 'main_vendo' ? '' : (coinslot.chip_id || '');
            }

            const rates = await fetchDataRates(chipid);
            showDataRatesModal(rates);
        } catch (error) {
            console.error('Error displaying data rates:', error);
            showNotification('Error', 'Could not load data rates');
        }
    });

    // Add handlers for the new voucher list and session list buttons
    $('#voucher-list-btn').on('click', showVoucherListModal);
    $('#session-list-btn').on('click', showSessionListModal);

$buyTimeBtn.on('click', async function() {
    if (totalAmount <= 0) {
        showNotification('Error', 'Please insert coins first');
        return;
    }

    const hideLoading = showLoading('Processing time purchase...');

    try {
        // Get station from selected coinslot
        let stationParam = '';
        if (clientNetworkInfo.selected_coinslot) {
            const coinslot = clientNetworkInfo.selected_coinslot;
            stationParam = coinslot.type === 'main_vendo' ? '' : `&chipid=${encodeURIComponent(coinslot.chip_id)}`;
        }

        // Call the session generate API with station
        const response = await $.ajax({
            url: `/api/coinslot/session-generate?type=time${stationParam}`,
            method: 'GET',
            dataType: 'json'
        });

        hideLoading();

        if (response.status === 'success' && response.data) {
            showNotification('Success', response.message || 'Time purchased successfully');

            // Close modal and reset coin slot
            stopCoinSlot();
            resetCoinCounter();

            // Request updated status to refresh UI
            if (socketConnected) {
                sendCommand('status');
            }

            // Show session list if session was NOT merged (new session created)
            if (response.data.session_merged === false) {
                setTimeout(() => { $('#session-list-btn').trigger('click'); }, 500);
            }

            // Android: open Chrome with device_id via intent to persist session
            if (/Android/i.test(navigator.userAgent) && deviceId) {
                setTimeout(() => {
                    window.location.href = `intent://10.0.0.1/?device_id=${encodeURIComponent(deviceId)}#Intent;scheme=http;package=com.android.chrome;end`;
                }, 1500);
            }

            // Redirect after 3 seconds if afterDonePayingRedirect is set and valid
            const redirectUrl = portalSettings.afterDonePayingRedirect;
            if (redirectUrl && redirectUrl.trim() !== '' && redirectUrl.trim().toLowerCase() !== 'https://www.youtube.com') {
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 3000);
            }
        } else if (response.status === 'false') {
            // No coins inserted
            showNotification('Error', response.message || 'No coins inserted yet');
        } else {
            // Other error
            showNotification('Error', response.message || 'Failed to purchase time');
        }
    } catch (error) {
        hideLoading();
        console.error('Error purchasing time:', error);
        showNotification('Error', 'Could not purchase time. Please try again.');
    }
});

// Buy Data button handler
$buyDataBtn.on('click', async function() {
    if (totalAmount <= 0) {
        showNotification('Error', 'Please insert coins first');
        return;
    }

    const hideLoading = showLoading('Processing data purchase...');

    try {
        // Get station from selected coinslot
        let stationParam = '';
        if (clientNetworkInfo.selected_coinslot) {
            const coinslot = clientNetworkInfo.selected_coinslot;
            stationParam = coinslot.type === 'main_vendo' ? '' : `&chipid=${encodeURIComponent(coinslot.chip_id)}`;
        }

        // Call the session generate API with type=data and station
        const response = await $.ajax({
            url: `/api/coinslot/session-generate?type=data${stationParam}`,
            method: 'GET',
            dataType: 'json'
        });

        hideLoading();

        if (response.status === 'success' && response.data) {
            // Session successfully created
            showNotification('Success', response.message || 'Data purchased successfully');

            stopCoinSlot();
            resetCoinCounter();

            // Request updated status to refresh UI
            if (socketConnected) {
                sendCommand('status');
            }

            // Show session list if session was NOT merged (new session created)
            if (response.data.session_merged === false) {
                setTimeout(() => { $('#session-list-btn').trigger('click'); }, 500);
            }

            // Android: open Chrome with device_id via intent to persist session
            if (/Android/i.test(navigator.userAgent) && deviceId) {
                setTimeout(() => {
                    window.location.href = `intent://10.0.0.1/?device_id=${encodeURIComponent(deviceId)}#Intent;scheme=http;package=com.android.chrome;end`;
                }, 1500);
            }

            // Redirect after 3 seconds if afterDonePayingRedirect is set and valid
            const redirectUrl = portalSettings.afterDonePayingRedirect;
            if (redirectUrl && redirectUrl.trim() !== '' && redirectUrl.trim().toLowerCase() !== 'https://www.youtube.com') {
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 3000);
            }
        } else if (response.status === 'false') {
            // No coins inserted
            showNotification('Error', response.message || 'No coins inserted yet');
        } else {
            // Other error
            showNotification('Error', response.message || 'Failed to purchase data');
        }
    } catch (error) {
        hideLoading();
        console.error('Error purchasing data:', error);
        showNotification('Error', 'Could not purchase data. Please try again.');
    }
});


    $buyVoucherBtn.on('click', async function() {
        if (totalAmount <= 0) {
            showNotification('Error', 'Please insert coins first');
            return;
        }

        // We have coins, so generate a voucher
        const hideLoading = showLoading('Generating voucher...');

        try {
            // Get station from selected coinslot
            let stationParam = '';
            if (clientNetworkInfo.selected_coinslot) {
                const coinslot = clientNetworkInfo.selected_coinslot;
                stationParam = coinslot.type === 'main_vendo' ? '' : `?chipid=${encodeURIComponent(coinslot.chip_id)}`;
            }

            // Generate a voucher using the API with station
            const response = await $.ajax({
                url: `/api/coinslot/voucher-generate${stationParam}`,
                method: 'GET',
                dataType: 'json'
            });

            hideLoading();

            if (response.status === 'success' && response.data) {
                // Voucher successfully generated
                showNotification('Success', response.message || 'Voucher generated successfully');

                stopCoinSlot();
                resetCoinCounter();

                // Show the voucher list modal instead of pre-filling input
                $('#voucher-list-btn').trigger('click');
            } else {
                // Error generating voucher
                showNotification('Error', response.message || 'Failed to generate voucher');
            }
        } catch (error) {
            hideLoading();
            console.error('Error generating voucher:', error);
            showNotification('Error', 'Could not generate voucher. Please try again.');
        }
    });

    $closeCoinModalBtn.on('click', function() {
        window.coinModalClosing = true;
        stopCoinSlot().then(() => {
            window.coinModalClosing = false;
            closeCoinModal();
        });
    });


    $eloadingModal.on('hidden.bs.modal', function() {
        resetEloadingModal();
    });


    // Periodically send ping to keep SSE connection alive
    setInterval(() => {
        if (socketConnected && !isReconnecting && portalEventSource && portalEventSource.readyState === EventSource.OPEN) {
            sendCommand('ping');
        }
    }, 25000); // Every 25 seconds (keep connection alive)

    // Function to prevent rapid UI updates
    let uiUpdateDebounceTimer = null;
    function debouncedUpdateUI() {
        if (uiUpdateDebounceTimer) {
            clearTimeout(uiUpdateDebounceTimer);
        }

        uiUpdateDebounceTimer = setTimeout(() => {
            updateUI();
            uiUpdateDebounceTimer = null;
        }, 100); // 100ms debounce time
    }

$('#amount').on('input', function() {
    const amount = parseInt($(this).val());

    if (!isNaN(amount) && amount > 0) {
        const fee = getLoadRate(amount);
        $('#amount-fee').text(`Fee: ₱${fee}`);
    } else {
        $('#amount-fee').text('');
    }
});

    // Override the SSE message handler with a debounced version
    const originalSendSSEMessage = sendCommand;

    // Initialize the application
    async function initializeApp() {
        // Fetch portal settings to show/hide buttons based on admin configuration
        // (also includes banners and banner settings to reduce API calls)
        await fetchPortalSettings();

        // IMPORTANT: Initialize device ID FIRST before authentication
        // This ensures MAC mapping is updated before auth runs
        // (handles MAC randomization - transfers session when MAC changes)
        const deviceResult = await initDeviceId();

        // Check if this is a desktop device - block portal access
        if (deviceResult && deviceResult.isDesktop) {
            showDesktopModeBlock();
            return; // Stop initialization
        }

        // Always authenticate first when app starts
        initialAuthentication().then(success => {
            if (!success) {
                // If authentication fails, try to use stored credentials as fallback
                const portalData = localStorage.getItem('wifiPortalData');
                if (portalData) {
                    const data = JSON.parse(portalData);
                    ipAddress = data.ip;
                    macAddress = data.mac;
                    updateUI();

                    // Setup SSE with stored credentials
                    setupSSE(data.ip, data.mac);
                }
            }
        });

        // Coinslot count data now comes from user status (no separate API call needed)

        // E-loading is loaded on-demand when button is clicked (not on page load)

        // Hide loading overlay
        $('#loading-overlay').addClass('d-none');
    }

    // Start the app
    initializeApp();

    // ========================================
    // SPIN WHEEL FUNCTIONALITY
    // ========================================

    let spinwheelPrizes = [];
    let spinwheelSettings = {};
    let isSpinning = false;
    let spinwheelCanvas = null;
    let spinwheelCtx = null;
    let currentRotation = 0;

    // Initialize spinwheel when modal opens
    $('#spinwheelModal').on('show.bs.modal', function() {
        loadSpinwheelData();
    });

    // Load spinwheel data from API
    async function loadSpinwheelData() {
        try {
            const response = await fetch(`/api/portal-spinwheel/info?mac=${macAddress}&device_id=${deviceId}`);
            const data = await response.json();

            if (!data.enabled) {
                $('#spinwheel-main-btn').addClass('d-none');
                return;
            }

            spinwheelSettings = data;
            spinwheelPrizes = data.prizes || [];

            // Update UI
            $('#spin-cost').text(data.cpointsCost);
            $('#spin-user-cpoints').text(data.userCpoints);
            $('#spin-count-today').text(data.spinsToday);
            $('#spin-daily-limit').text(data.dailyLimit || 'Unlimited');

            // Enable/disable spin button
            if (data.canSpin && spinwheelPrizes.length > 0) {
                $('#spin-action-btn').prop('disabled', false);
            } else {
                $('#spin-action-btn').prop('disabled', true);
            }

            // Draw the wheel
            drawSpinwheel();

        } catch (error) {
            console.error('Error loading spinwheel data:', error);
        }
    }

    // Check if spinwheel is enabled on page load
    async function checkSpinwheelEnabled() {
        try {
            const response = await fetch(`/api/portal-spinwheel/info?mac=${macAddress}&device_id=${deviceId}`);
            const data = await response.json();

            if (data.enabled && data.prizes && data.prizes.length > 0) {
                $('#spinwheel-main-btn').removeClass('d-none');
            }
        } catch (error) {
            console.error('Error checking spinwheel:', error);
        }
    }

    // Draw the spinwheel on canvas
    function drawSpinwheel() {
        spinwheelCanvas = document.getElementById('spinwheel-canvas');
        if (!spinwheelCanvas) return;

        spinwheelCtx = spinwheelCanvas.getContext('2d');
        const centerX = spinwheelCanvas.width / 2;
        const centerY = spinwheelCanvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;

        // Clear canvas
        spinwheelCtx.clearRect(0, 0, spinwheelCanvas.width, spinwheelCanvas.height);

        if (spinwheelPrizes.length === 0) {
            spinwheelCtx.fillStyle = '#ccc';
            spinwheelCtx.font = '16px Arial';
            spinwheelCtx.textAlign = 'center';
            spinwheelCtx.fillText('No prizes available', centerX, centerY);
            return;
        }

        const sliceAngle = (2 * Math.PI) / spinwheelPrizes.length;

        // Draw slices
        spinwheelPrizes.forEach((prize, index) => {
            const startAngle = currentRotation + index * sliceAngle;
            const endAngle = startAngle + sliceAngle;

            // Draw slice
            spinwheelCtx.beginPath();
            spinwheelCtx.moveTo(centerX, centerY);
            spinwheelCtx.arc(centerX, centerY, radius, startAngle, endAngle);
            spinwheelCtx.closePath();
            spinwheelCtx.fillStyle = prize.Color || getDefaultColor(index);
            spinwheelCtx.fill();
            spinwheelCtx.strokeStyle = '#fff';
            spinwheelCtx.lineWidth = 2;
            spinwheelCtx.stroke();

            // Draw text
            spinwheelCtx.save();
            spinwheelCtx.translate(centerX, centerY);
            spinwheelCtx.rotate(startAngle + sliceAngle / 2);
            spinwheelCtx.textAlign = 'right';
            spinwheelCtx.fillStyle = '#fff';
            spinwheelCtx.font = 'bold 11px Arial';
            spinwheelCtx.fillText(prize.Name.substring(0, 12), radius - 15, 4);
            spinwheelCtx.restore();
        });

        // Draw center circle
        spinwheelCtx.beginPath();
        spinwheelCtx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
        spinwheelCtx.fillStyle = '#fff';
        spinwheelCtx.fill();
        spinwheelCtx.strokeStyle = '#e67e22';
        spinwheelCtx.lineWidth = 3;
        spinwheelCtx.stroke();
    }

    function getDefaultColor(index) {
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];
        return colors[index % colors.length];
    }

    // Spin the wheel
    $('#spin-action-btn').on('click', async function() {
        if (isSpinning) return;

        isSpinning = true;
        $(this).prop('disabled', true);
        $('#spin-result').addClass('d-none');

        try {
            // Call spin API
            const response = await fetch(`/api/portal-spinwheel/spin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mac: macAddress,
                    deviceId: deviceId
                })
            });

            const data = await response.json();

            if (data.status === 'success') {
                // Find prize index
                const prizeIndex = spinwheelPrizes.findIndex(p => p.ID === data.prize.ID);

                // Calculate winning angle
                const sliceAngle = (2 * Math.PI) / spinwheelPrizes.length;
                const targetAngle = -prizeIndex * sliceAngle - sliceAngle / 2 - Math.PI / 2;
                const spins = 5; // Number of full rotations
                const totalRotation = spins * 2 * Math.PI + targetAngle - currentRotation;

                // Animate spin
                animateWheel(totalRotation, () => {
                    // Show result
                    const resultDiv = $('#spin-result-content');
                    if (data.isWin) {
                        resultDiv.removeClass('alert-danger').addClass('alert-success');
                        let prizeText = `You won: ${data.prize.Name}!`;
                        if (data.prize.Minutes > 0) {
                            prizeText += ` (+${data.prize.Minutes} minutes, expires in ${data.prize.Expiry} min)`;
                        }
                        resultDiv.html(`<i class="fa-solid fa-trophy me-2"></i>${prizeText}`);
                    } else {
                        resultDiv.removeClass('alert-success').addClass('alert-danger');
                        resultDiv.html(`<i class="fa-solid fa-face-sad-tear me-2"></i>Better luck next time!`);
                    }
                    $('#spin-result').removeClass('d-none');

                    // Update cpoints display
                    $('#spin-user-cpoints').text(data.remainingCpoints);
                    cpoints = data.remainingCpoints;
                    updateCpointsDisplay();

                    // Reload spinwheel data
                    loadSpinwheelData();

                    isSpinning = false;
                });
            } else {
                showNotification('Error', data.error || 'Failed to spin');
                isSpinning = false;
                loadSpinwheelData();
            }
        } catch (error) {
            console.error('Spin error:', error);
            showNotification('Error', 'Failed to spin. Please try again.');
            isSpinning = false;
            loadSpinwheelData();
        }
    });

    function animateWheel(totalRotation, callback) {
        const duration = 4000; // 4 seconds
        const startTime = Date.now();
        const startRotation = currentRotation;

        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease out cubic)
            const easeOut = 1 - Math.pow(1 - progress, 3);

            currentRotation = startRotation + totalRotation * easeOut;
            drawSpinwheel();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                callback();
            }
        }

        animate();
    }

    function updateCpointsDisplay() {
        $('#cpoints-info').text(`${cpoints}`);
    }

    // Check spinwheel on initial load (after a delay to ensure mac is available)
    setTimeout(() => {
        if (macAddress && macAddress !== '--') {
            checkSpinwheelEnabled();
        }
    }, 2000);

    // ==================== CHAT FUNCTIONALITY ====================
    let chatWs = null;
    let chatReconnectInterval = null;
    let chatMessages = [];
    let chatInitialized = false;
    let chatEnabled = false;

    let chatUnreadInterval = null;

    // Check if chat is enabled in settings
    async function checkChatEnabled() {
        try {
            const response = await fetch('/api/portal-chat/enabled');
            if (response.ok) {
                const data = await response.json();
                chatEnabled = data.enabled === 1 || data.enabled === true;
                if (chatEnabled) {
                    $('#chat-floating-btn').removeClass('d-none');
                    // Start polling for unread messages
                    if (macAddress && macAddress !== '--' && !chatUnreadInterval) {
                        checkChatUnread();
                        chatUnreadInterval = setInterval(checkChatUnread, 60000); // Fallback polling (SSE provides real-time updates)
                    }
                } else {
                    $('#chat-floating-btn').addClass('d-none');
                    if (chatUnreadInterval) {
                        clearInterval(chatUnreadInterval);
                        chatUnreadInterval = null;
                    }
                }
            }
        } catch (error) {
            console.error('Error checking chat enabled:', error);
        }
    }

    // Initialize chat only when modal is opened (lazy load)
    function initChatOnOpen() {
        if (chatInitialized) return;
        if (!macAddress || macAddress === '--') return;

        chatInitialized = true;

        // Load chat history
        loadChatHistory();

        // Connect to chat SSE (direct to Go server port 100)
        connectChatSSE();
    }

    // Connect to chat SSE - direct connection to Go server
    function connectChatSSE() {
        if (!macAddress || macAddress === '--') return;
        if (chatWs && chatWs.readyState === EventSource.OPEN) return;

        // SSE uses HTTP, connect directly to Go server on port 100
        const sseUrl = `${window.location.protocol}//${window.location.hostname}:100/portal-chat/sse?mac=${encodeURIComponent(macAddress)}&device_id=${encodeURIComponent(deviceId)}`;

        try {
            chatWs = new EventSource(sseUrl);

            chatWs.onopen = () => {
                console.log('Chat SSE connected');
                if (chatReconnectInterval) {
                    clearInterval(chatReconnectInterval);
                    chatReconnectInterval = null;
                }
            };

            chatWs.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    handleChatMessage(data);
                } catch (e) {
                    console.error('Error parsing chat message:', e);
                }
            };

            chatWs.onerror = (error) => {
                console.error('Chat SSE error:', error);
                // EventSource auto-reconnects, but handle if chat modal closes
                if (!$('#chatModal').hasClass('show')) {
                    disconnectChatSSE();
                } else if (!chatReconnectInterval) {
                    // Manual reconnect fallback
                    chatReconnectInterval = setInterval(() => {
                        if (macAddress && macAddress !== '--' && $('#chatModal').hasClass('show')) {
                            if (!chatWs || chatWs.readyState === EventSource.CLOSED) {
                                connectChatSSE();
                            }
                        } else {
                            clearInterval(chatReconnectInterval);
                            chatReconnectInterval = null;
                        }
                    }, 5000);
                }
            };
        } catch (e) {
            console.error('Failed to create chat SSE:', e);
        }
    }

    // Disconnect chat SSE when modal closes
    function disconnectChatSSE() {
        if (chatReconnectInterval) {
            clearInterval(chatReconnectInterval);
            chatReconnectInterval = null;
        }
        if (chatWs) {
            chatWs.close();
            chatWs = null;
        }
        chatInitialized = false;
    }

    // Handle incoming chat messages
    function handleChatMessage(data) {
        switch (data.type) {
            case 'new_message':
                if (data.payload.mac === macAddress && data.payload.from_admin === 1) {
                    // New message from admin
                    addMessageToChat(data.payload);

                    // If chat modal is not open, show badge
                    if (!$('#chatModal').hasClass('show')) {
                        updateChatBadge();
                    }
                }
                break;
            case 'admin_typing':
                showTypingIndicator();
                break;
        }
    }

    // Load chat history
    async function loadChatHistory() {
        try {
            const response = await fetch(`/api/portal-chat/messages?mac=${macAddress}`);
            if (response.ok) {
                chatMessages = await response.json();
                renderChatMessages();
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }

    // Check for unread messages
    async function checkChatUnread() {
        try {
            const response = await fetch(`/api/portal-chat/unread?mac=${macAddress}`);
            if (response.ok) {
                const data = await response.json();
                if (data.unread > 0) {
                    $('#chat-badge').text(data.unread).removeClass('d-none');
                } else {
                    $('#chat-badge').addClass('d-none');
                }
            }
        } catch (error) {
            console.error('Error checking chat unread:', error);
        }
    }

    // Update chat badge
    function updateChatBadge() {
        const badge = $('#chat-badge');
        const currentCount = parseInt(badge.text()) || 0;
        badge.text(currentCount + 1).removeClass('d-none');
    }

    // Render chat messages
    function renderChatMessages() {
        const container = $('#chat-messages');
        const emptyMsg = $('#chat-empty');

        if (!chatMessages || chatMessages.length === 0) {
            emptyMsg.removeClass('d-none');
            return;
        }

        emptyMsg.addClass('d-none');
        container.empty();

        chatMessages.forEach(msg => {
            const isUser = msg.from_admin === 0;
            const messageHtml = `
                <div class="chat-message ${isUser ? 'user' : 'admin'}">
                    <div class="message-text">${escapeHtml(msg.message)}</div>
                    <span class="message-time">${formatChatTime(msg.CreatedAt)}</span>
                </div>
            `;
            container.append(messageHtml);
        });

        // Scroll to bottom
        container.scrollTop(container[0].scrollHeight);
    }

    // Add a single message to chat
    function addMessageToChat(msg) {
        chatMessages.push(msg);

        const container = $('#chat-messages');
        const emptyMsg = $('#chat-empty');
        emptyMsg.addClass('d-none');

        // Remove typing indicator if present
        $('.chat-typing').remove();

        const isUser = msg.from_admin === 0;
        const messageHtml = `
            <div class="chat-message ${isUser ? 'user' : 'admin'}">
                <div class="message-text">${escapeHtml(msg.message)}</div>
                <span class="message-time">${formatChatTime(msg.created_at)}</span>
            </div>
        `;
        container.append(messageHtml);

        // Scroll to bottom
        container.scrollTop(container[0].scrollHeight);
    }

    // Show typing indicator
    function showTypingIndicator() {
        const container = $('#chat-messages');

        // Remove existing typing indicator
        $('.chat-typing').remove();

        const typingHtml = `
            <div class="chat-typing">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        container.append(typingHtml);
        container.scrollTop(container[0].scrollHeight);

        // Remove after 3 seconds
        setTimeout(() => {
            $('.chat-typing').remove();
        }, 3000);
    }

    // Send chat message
    async function sendChatMessage(message) {
        if (!message.trim()) return;

        try {
            const response = await fetch('/api/portal-chat/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mac: macAddress,
                    device_id: deviceId,
                    message: message.trim()
                })
            });

            if (response.ok) {
                const msg = await response.json();
                addMessageToChat(msg);
                $('#chat-input').val('');
            } else {
                showNotification('Error', 'Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            showNotification('Error', 'Failed to send message');
        }
    }

    // Format chat time
    function formatChatTime(timestamp) {
        if (!timestamp) return '';

        // Handle different timestamp formats
        let date;
        if (typeof timestamp === 'string') {
            // If format is "2006-01-02 15:04:05" without timezone, treat as local
            if (timestamp.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
                timestamp = timestamp.replace(' ', 'T');
            }
            date = new Date(timestamp);
        } else {
            date = new Date(timestamp);
        }

        // Check if date is valid
        if (isNaN(date.getTime())) return '';

        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        // For today, show time like "10:30 AM"
        if (diffMins < 1) return 'Just now';
        if (diffHours < 24 && date.getDate() === now.getDate()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Chat event handlers
    $('#chat-send-btn').on('click', function() {
        const message = $('#chat-input').val();
        sendChatMessage(message);
    });

    $('#chat-input').on('keypress', function(e) {
        if (e.which === 13) {
            e.preventDefault();
            const message = $(this).val();
            sendChatMessage(message);
        }
    });

    // When chat modal opens - lazy load chat (connect SSE, load messages)
    $('#chatModal').on('shown.bs.modal', function() {
        $('#chat-badge').addClass('d-none').text('0');
        initChatOnOpen();
    });

    // When chat modal closes - disconnect SSE to save resources
    $('#chatModal').on('hidden.bs.modal', function() {
        disconnectChatSSE();
    });

    // Check if chat is enabled (only shows button, starts unread polling)
    setTimeout(checkChatEnabled, 2000);

    // ==================== E-PAYMENT FUNCTIONALITY ====================
    let epaymentAvailable = false;
    let epaymentDeviceId = '';
    let epaymentRates = [];
    let selectedEpaymentRate = null;

    // E-Payment API base URL (use port 100 for Go server)
    const EPAYMENT_API_BASE = `${window.location.protocol}//${window.location.hostname}:100`;

    // Check if e-payment is available
    async function checkEpaymentAvailable() {
        try {
            const response = await fetch(`${EPAYMENT_API_BASE}/portal-epayment/check`);
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success' && data.data?.available) {
                    epaymentAvailable = true;
                    epaymentDeviceId = data.data.device_id || '';
                    $('#epayment-btn').removeClass('d-none');
                    console.log('[E-Payment] Available, device:', epaymentDeviceId);
                } else {
                    epaymentAvailable = false;
                    $('#epayment-btn').addClass('d-none');
                    console.log('[E-Payment] Not available:', data.data?.reason);
                }
            }
        } catch (error) {
            console.error('[E-Payment] Error checking availability:', error);
            epaymentAvailable = false;
        }
    }

    // Load e-payment rates
    async function loadEpaymentRates() {
        try {
            $('#epay-rates-list').html(`
                <div class="text-center py-4 text-muted">
                    <div class="spinner-border spinner-border-sm me-2"></div>
                    Loading rates...
                </div>
            `);

            const response = await fetch(`${EPAYMENT_API_BASE}/portal-epayment/rates`);
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success' && data.data) {
                    epaymentRates = data.data;
                    renderEpaymentRates();
                } else {
                    $('#epay-rates-list').html(`
                        <div class="text-center py-4 text-muted">
                            <i class="fa-solid fa-exclamation-circle"></i> ${data.error || 'Failed to load rates'}
                        </div>
                    `);
                }
            }
        } catch (error) {
            console.error('[E-Payment] Error loading rates:', error);
            $('#epay-rates-list').html(`
                <div class="text-center py-4 text-danger">
                    <i class="fa-solid fa-exclamation-circle"></i> Error loading rates
                </div>
            `);
        }
    }

    // Render e-payment rates list
    function renderEpaymentRates() {
        if (!epaymentRates || epaymentRates.length === 0) {
            $('#epay-rates-list').html(`
                <div class="text-center py-4 text-muted">
                    <i class="fa-solid fa-info-circle"></i> No rates available
                </div>
            `);
            return;
        }

        let html = '<div class="list-group">';
        epaymentRates.forEach(rate => {
            const methods = [];
            if (rate.gcash) methods.push('<span class="badge bg-primary">GCash</span>');
            if (rate.maya) methods.push('<span class="badge bg-success">Maya</span>');

            html += `
                <button type="button" class="list-group-item list-group-item-action epay-rate-item" data-rate-id="${rate.ID}">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${rate.name}</strong>
                            <div class="small text-muted">${rate.minutes} mins</div>
                        </div>
                        <div class="text-end">
                            <div class="fw-bold text-success">₱${rate.amount}</div>
                            <div class="small">${methods.join(' ')}</div>
                        </div>
                    </div>
                </button>
            `;
        });
        html += '</div>';
        $('#epay-rates-list').html(html);
    }

    // Select a rate
    function selectEpaymentRate(rateId) {
        // Convert to number for comparison (data attribute returns string)
        const numericRateId = parseInt(rateId, 10);
        selectedEpaymentRate = epaymentRates.find(r => r.ID === numericRateId);
        if (!selectedEpaymentRate) return;

        // Show payment methods
        $('#epay-rates-list').addClass('d-none');
        $('#epay-methods').removeClass('d-none');

        // Show/hide payment options based on rate settings
        if (selectedEpaymentRate.gcash) {
            $('#epay-gcash-option').removeClass('d-none');
        } else {
            $('#epay-gcash-option').addClass('d-none');
        }

        if (selectedEpaymentRate.maya) {
            $('#epay-maya-option').removeClass('d-none');
        } else {
            $('#epay-maya-option').addClass('d-none');
        }
    }

    // Create e-payment
    async function createEpayment(method) {
        if (!selectedEpaymentRate) return;

        // Show processing
        $('#epay-methods').addClass('d-none');
        $('#epay-processing').removeClass('d-none');

        try {
            const response = await fetch(`${EPAYMENT_API_BASE}/portal-epayment/create?mac=${encodeURIComponent(macAddress)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rate_id: selectedEpaymentRate.ID,
                    success_redirect_url: window.location.origin + '/',
                    failure_redirect_url: window.location.origin + '/'
                })
            });

            const data = await response.json();
            if (data.status === 'success' && data.data?.payment) {
                const payment = data.data.payment;

                // Get checkout URL based on method
                let checkoutUrl = null;
                let methodName = method === 'gcash' ? 'GCash' : 'Maya';
                let methodColor = method === 'gcash' ? '#007bff' : '#00b900';
                if (method === 'gcash' && payment.gcash?.checkout_url) {
                    checkoutUrl = payment.gcash.checkout_url;
                } else if (method === 'maya' && payment.maya?.checkout_url) {
                    checkoutUrl = payment.maya.checkout_url;
                }

                if (checkoutUrl) {
                    // Always show checkout UI with open-in-browser button
                    // Android captive portal WebView can't redirect to external HTTPS URLs
                    // iOS CNA also has restrictions - always show the button approach
                    var isAndroid = /Android/i.test(navigator.userAgent);
                    var isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
                    var isMobile = isAndroid || isiOS;

                    // Detect captive portal popup (iOS CNA / Android mini-browser)
                    var isCaptivePortal = /CaptiveNetworkSupport|CaptivePortal/i.test(navigator.userAgent) ||
                        (navigator.standalone === false && isiOS) ||
                        (isAndroid && (window.innerHeight < 800 || !window.chrome));

                    // On mobile, always show the button UI (safer for captive portal WebViews)
                    if (!isMobile && !isCaptivePortal) {
                        // Desktop browser — redirect directly
                        window.location.href = checkoutUrl;
                    } else {
                        // Mobile / captive portal — show button to open in system browser
                        $('#epay-processing').addClass('d-none');
                        $('#epay-methods').addClass('d-none');
                        $('#epay-rates-list').addClass('d-none');
                        $('#epay-checkout-container').remove();

                        var checkoutHtml = '<div id="epay-checkout-container" class="text-center py-3">' +
                            '<div class="mb-3"><i class="fa-solid fa-circle-check fa-3x" style="color: ' + methodColor + ';"></i></div>' +
                            '<h6 class="fw-bold mb-2">Payment Ready!</h6>' +
                            '<p class="text-muted small mb-3">Tap below to pay via ' + methodName + '</p>' +
                            '<div class="mb-3 p-2 bg-white rounded border"><small class="text-muted">Rate:</small> <strong>' + (selectedEpaymentRate ? selectedEpaymentRate.name : '') + '</strong><br><small class="text-muted">Amount:</small> <strong class="text-success">₱' + (selectedEpaymentRate ? selectedEpaymentRate.amount : '') + '</strong></div>' +
                            '<a href="' + checkoutUrl + '" target="_blank" rel="noopener" class="btn btn-lg w-100 text-white fw-bold mb-2" id="epay-open-browser-btn" style="background: ' + methodColor + '; text-decoration: none;">' +
                            '<i class="fa-solid fa-external-link-alt me-2"></i>Pay with ' + methodName + '</a>' +
                            '<button class="btn btn-outline-secondary btn-sm w-100 mt-2" id="epay-copy-link-btn"><i class="fa-solid fa-copy me-1"></i>Copy Payment Link</button>' +
                            '<button class="btn btn-outline-secondary btn-sm w-100 mt-1" id="epay-done-btn"><i class="fa-solid fa-check me-1"></i>Done</button>' +
                            '</div>';

                        $('#epaymentModal .modal-body').append(checkoutHtml);

                        // Copy link fallback for Android captive portal WebView
                        $('#epay-copy-link-btn').on('click', function() {
                            if (navigator.clipboard && navigator.clipboard.writeText) {
                                navigator.clipboard.writeText(checkoutUrl).then(function() {
                                    $('#epay-copy-link-btn').html('<i class="fa-solid fa-check me-1"></i>Link Copied!');
                                    showNotification('Copied', 'Payment link copied! Open your browser and paste the link.');
                                }).catch(function() {
                                    // Fallback: select + copy
                                    promptCopyLink(checkoutUrl);
                                });
                            } else {
                                promptCopyLink(checkoutUrl);
                            }
                        });

                        $('#epay-open-browser-btn').on('click', function(e) {
                            // Try multiple methods to escape captive portal WebView
                            if (isAndroid) {
                                e.preventDefault();
                                // Method 1: intent to open in default browser
                                var intentUrl = 'intent://' + checkoutUrl.replace(/^https?:\/\//, '') + '#Intent;scheme=https;end';
                                window.location.href = intentUrl;
                                // Method 2: fallback after short delay - try window.open
                                setTimeout(function() {
                                    window.open(checkoutUrl, '_system');
                                }, 500);
                            }
                            // For iOS/others: the <a> tag with target="_blank" handles it
                        });

                        $('#epay-done-btn').on('click', function() {
                            $('#epay-checkout-container').remove();
                            resetEpaymentModal();
                        });
                    }
                } else {
                    showNotification('Error', 'No checkout URL available');
                    resetEpaymentModal();
                }
            } else {
                showNotification('Error', data.error || 'Failed to create payment');
                resetEpaymentModal();
            }
        } catch (error) {
            console.error('[E-Payment] Error creating payment:', error);
            showNotification('Error', 'Failed to create payment');
            resetEpaymentModal();
        }
    }

    // Fallback copy link for browsers without clipboard API
    function promptCopyLink(url) {
        var input = document.createElement('input');
        input.value = url;
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();
        input.setSelectionRange(0, 99999);
        try {
            document.execCommand('copy');
            $('#epay-copy-link-btn').html('<i class="fa-solid fa-check me-1"></i>Link Copied!');
            showNotification('Copied', 'Payment link copied! Open your browser and paste the link.');
        } catch (e) {
            showNotification('Payment Link', url, false);
        }
        document.body.removeChild(input);
    }

    // Reset e-payment modal
    function resetEpaymentModal() {
        selectedEpaymentRate = null;
        $('#epay-rates-list').removeClass('d-none');
        $('#epay-methods').addClass('d-none');
        $('#epay-processing').addClass('d-none');
    }

    // E-Payment modal event handlers
    $('#epaymentModal').on('show.bs.modal', function() {
        // Reset modal state
        resetEpaymentModal();

        // Load rates
        loadEpaymentRates();
    });

    // Rate selection
    $(document).on('click', '.epay-rate-item', function() {
        const rateId = $(this).data('rate-id');
        selectEpaymentRate(rateId);
    });

    // Back button
    $('#epay-back-btn').on('click', function() {
        resetEpaymentModal();
    });

    // Payment method buttons (using option divs from HTML)
    $('#epay-gcash-option').on('click', function() {
        createEpayment('gcash');
    });

    $('#epay-maya-option').on('click', function() {
        createEpayment('maya');
    });

});