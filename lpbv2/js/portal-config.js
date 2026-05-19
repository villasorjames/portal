/**
 * Portal Configuration
 * API endpoints and constants
 */
window.Portal = window.Portal || {};

(function() {
    'use strict';

    Portal.Config = {
        // API endpoints
        AUTH_API: '/api/portal-user/auth',
        RATES_API: '/rates',
        DATA_RATES_API: '/datarates',
        NETWORK_API: '/api/portal-user/network',
        DEVICE_ID_API: '/api/portal-user/device-id',

        // SSE endpoints (Server-Sent Events)
        PORTAL_SSE_URL: '/api/sse/portal',
        COINSLOT_SSE_URL: '/api/sse/coinslot',

        // Portal session control
        PAUSE_API: '/api/portal-user/pause',
        RESUME_API: '/api/portal-user/resume',

        // Coin slot API
        COINSLOT_START_API: '/api/coinslot/start',
        COINSLOT_STOP_API: '/api/coinslot/stop',
        COINSLOT_COUNT_API: '/api/coinslot/count',
        COINSLOT_RESET_API: '/api/coinslot/reset',

        // E-loading API (public portal endpoints)
        ELOAD_PRODUCTS_API: '/api/portal-eload/products',
        ELOAD_RATES_API: '/api/portal-eload/rates',
        ELOAD_CASHIN_API: '/api/portal-eload/cashin',

        // Free Time API
        FREE_TIME_GENERATE_API: '/free-time/generate',

        // Portal Settings API (public endpoint - includes banners)
        PORTAL_SETTINGS_API: '/portal-settings',

        // Coin sounds
        COIN_BG_SOUND_URL: '/assets/sounds/coin_bg_sound.mp3',
        COIN_INSERT_SOUND_URL: '/assets/sounds/coin_insert_sound.mp3',

        // Constants
        MAX_SSE_RETRIES: 3,
        RECONNECT_DELAY: 5000,
        CHECK_INTERVAL_SECONDS: 5,
        MAX_WAIT_TIME: 120,

        // Device ID key
        DEVICE_ID_KEY: 'lpb_device_id'
    };
})();
