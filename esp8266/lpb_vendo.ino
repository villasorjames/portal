/*
 * LPB Wireless Vendo - Custom ESP8266 Firmware
 * Compatible with LPB Piso WiFi Hotspot Portal
 *
 * No coin slot hardware needed — wireless only.
 * All voucher generation is handled via MikroTik REST API.
 *
 * Required Libraries (install via Arduino Library Manager):
 *   - ESP8266WiFi        (built-in with ESP8266 board package)
 *   - ESP8266WebServer   (built-in)
 *   - ESP8266HTTPClient  (built-in)
 *   - ArduinoJson        v6.x  https://arduinojson.org
 *
 * Board: NodeMCU 1.0 (ESP-12E Module)  or any ESP8266
 */

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>

// ================================================================
//  CONFIGURATION  — edit before flashing
// ================================================================

// WiFi credentials (connect to your MikroTik router)
const char* WIFI_SSID     = "YourWiFiSSID";
const char* WIFI_PASS     = "YourWiFiPassword";

// MikroTik router — REST API
const char* MIKROTIK_IP   = "10.0.0.1";   // router LAN IP
const char* MIKROTIK_USER = "admin";
const char* MIKROTIK_PASS = "";            // admin password (blank if none)
const char* HS_SERVER     = "hotspot1";    // hotspot server name in MikroTik
const char* HS_PROFILE    = "default";     // default hotspot user profile

// Static IP for this ESP8266 (must match vendo_ip in portal setting.json)
IPAddress STATIC_IP(10, 0, 0, 254);
IPAddress GATEWAY  (10, 0, 0,   1);
IPAddress SUBNET   (255, 255, 255, 0);

// Token for /admin/api/generateVouchers  (must match vendo_api_token in setting.json)
const char* VENDO_TOKEN   = "12345";

// Voucher prefix
const char* VOUCHER_PFX   = "VC";

// WiFi rates — format per entry: "DisplayName#Amount#TimeMinutes#ValidityMinutes"
// Separate entries with |
// Example: PHP5 = 1 hour session, valid for 1 day
const char* RATES =
    "5 Piso#5#60#1440|"
    "10 Piso#10#120#2880|"
    "20 Piso#20#300#4320";

// ================================================================
//  SESSION STORAGE  (in-memory, up to MAX_SESSIONS concurrent)
// ================================================================
#define MAX_SESSIONS 20

struct Session {
    String       voucher;
    String       mac;
    String       ip;
    unsigned long startMs;
    bool         active;
};

Session sessions[MAX_SESSIONS];

// ================================================================
//  WEB SERVER
// ================================================================
ESP8266WebServer server(80);

// ----------------------------------------------------------------
//  Helpers
// ----------------------------------------------------------------
void corsHeaders() {
    server.sendHeader("Access-Control-Allow-Origin",  "*");
    server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "X-TOKEN, Content-Type");
}

void sendJson(int code, const String& json) {
    corsHeaders();
    server.send(code, "application/json", json);
}

bool tokenOk() {
    // collect headers must be set before — see setup()
    if (server.header("X-TOKEN") == String(VENDO_TOKEN)) return true;
    server.send(401, "text/plain", "Need to Login");
    return false;
}

// ----------------------------------------------------------------
//  Session helpers
// ----------------------------------------------------------------
int sessionFind(const String& v) {
    for (int i = 0; i < MAX_SESSIONS; i++)
        if (sessions[i].active && sessions[i].voucher == v) return i;
    return -1;
}

void sessionRemove(const String& v) {
    int i = sessionFind(v);
    if (i >= 0) sessions[i].active = false;
}

void sessionCreate(const String& v, const String& mac, const String& ip) {
    sessionRemove(v);
    for (int i = 0; i < MAX_SESSIONS; i++) {
        if (!sessions[i].active) {
            sessions[i] = { v, mac, ip, millis(), true };
            return;
        }
    }
    // All slots full — evict oldest
    unsigned long oldest = 0xFFFFFFFF;
    int idx = 0;
    for (int i = 0; i < MAX_SESSIONS; i++)
        if (sessions[i].startMs < oldest) { oldest = sessions[i].startMs; idx = i; }
    sessions[idx] = { v, mac, ip, millis(), true };
}

// ----------------------------------------------------------------
//  Base64 encode (for MikroTik Basic Auth)
// ----------------------------------------------------------------
String b64(const String& s) {
    static const char* T =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    String out;
    int len = s.length();
    const uint8_t* d = (const uint8_t*)s.c_str();
    for (int i = 0; i < len; i += 3) {
        uint32_t v = ((uint32_t)d[i] << 16)
                   | ((i+1 < len ? (uint32_t)d[i+1] : 0) << 8)
                   | ( i+2 < len ? (uint32_t)d[i+2] : 0);
        out += T[(v >> 18) & 63];
        out += T[(v >> 12) & 63];
        out += (i+1 < len) ? T[(v >>  6) & 63] : '=';
        out += (i+2 < len) ? T[ v        & 63] : '=';
    }
    return out;
}

// ----------------------------------------------------------------
//  MikroTik REST API caller
// ----------------------------------------------------------------
String mikrotik(const String& method, const String& path,
                const String& body, int* outCode) {
    WiFiClient   client;
    HTTPClient   http;
    String url = "http://" + String(MIKROTIK_IP) + path;
    http.begin(client, url);
    http.addHeader("Authorization", "Basic " + b64(String(MIKROTIK_USER) + ":" + String(MIKROTIK_PASS)));
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(6000);

    int code = -1;
    String resp;
    if      (method == "GET")    code = http.GET();
    else if (method == "POST")   code = http.POST(body);
    else if (method == "DELETE") code = http.sendRequest("DELETE");
    else if (method == "PATCH")  code = http.sendRequest("PATCH", body);

    if (code > 0) resp = http.getString();
    http.end();
    if (outCode) *outCode = code;
    return resp;
}

// ----------------------------------------------------------------
//  MikroTik hotspot user helpers
// ----------------------------------------------------------------

// Return .id of a hotspot user by name, or "" if not found
String hsUserId(const String& name) {
    int code = 0;
    String r = mikrotik("GET",
        "/rest/ip/hotspot/user?name=" + name, "", &code);
    if (code != 200 || r.length() < 3) return "";
    DynamicJsonDocument doc(512);
    if (deserializeJson(doc, r) != DeserializationError::Ok) return "";
    if (doc.is<JsonArray>() && doc.size() > 0)
        return doc[0][".id"] | String("");
    return "";
}

// Create a hotspot user. timeMin=0 means unlimited.
bool hsUserCreate(const String& name, int timeMin) {
    String body = "{\"name\":\"" + name +
                  "\",\"password\":\"" + name +
                  "\",\"profile\":\"" + String(HS_PROFILE) +
                  "\",\"server\":\""  + String(HS_SERVER)  + "\"";
    if (timeMin > 0) {
        int h = timeMin / 60, m = timeMin % 60;
        String t = (h > 0 ? String(h) + "h" : "") + (m > 0 ? String(m) + "m" : "");
        body += ",\"limit-uptime\":\"" + t + "\"";
    }
    body += "}";
    int code = 0;
    mikrotik("POST", "/rest/ip/hotspot/user", body, &code);
    return (code == 200 || code == 201);
}

// Delete a hotspot user by .id
void hsUserDelete(const String& id) {
    mikrotik("DELETE", "/rest/ip/hotspot/user/" + id, "", nullptr);
}

// Get limit-uptime of a user
String hsUserUptime(const String& id) {
    int code = 0;
    String r = mikrotik("GET", "/rest/ip/hotspot/user/" + id, "", &code);
    if (code != 200) return "";
    DynamicJsonDocument doc(512);
    if (deserializeJson(doc, r) != DeserializationError::Ok) return "";
    return doc["limit-uptime"] | String("");
}

// Patch a hotspot user's limit-uptime
void hsUserPatchUptime(const String& id, const String& uptime) {
    String body = "{\"limit-uptime\":\"" + uptime + "\"}";
    mikrotik("PATCH", "/rest/ip/hotspot/user/" + id, body, nullptr);
}

// Parse rates string and return time-minutes for a given amount
int rateTimeFor(int amt) {
    String r = String(RATES);
    int pos = 0;
    while (pos < (int)r.length()) {
        int sep = r.indexOf('|', pos);
        String e = (sep < 0) ? r.substring(pos) : r.substring(pos, sep);
        // name#amount#timeMin#validityMin
        int a = e.indexOf('#');
        int b = e.indexOf('#', a + 1);
        int c = e.indexOf('#', b + 1);
        if (a > 0 && b > a && c > b) {
            if (e.substring(a + 1, b).toInt() == amt)
                return e.substring(b + 1, c).toInt();
        }
        if (sep < 0) break;
        pos = sep + 1;
    }
    return 60; // fallback 1 hour
}

// ================================================================
//  ROUTE HANDLERS
// ================================================================

// GET /getRates?rateType=1
void onGetRates() {
    corsHeaders();
    server.send(200, "text/plain", RATES);
}

// GET /topUp?voucher=X&ipAddress=X&mac=X&extendTime=0
void onTopUp() {
    String voucher = server.arg("voucher");
    String ip      = server.arg("ipAddress");
    String mac     = server.arg("mac");

    if (voucher.isEmpty()) {
        sendJson(400, "{\"status\":\"false\",\"errorCode\":\"invalid.request\"}");
        return;
    }
    sessionCreate(voucher, mac, ip);
    sendJson(200, "{\"status\":\"true\",\"voucher\":\"" + voucher + "\"}");
}

// GET /cancelTopUp?voucher=X&mac=X
void onCancelTopUp() {
    sessionRemove(server.arg("voucher"));
    sendJson(200, "{\"status\":\"true\"}");
}

/*
 * GET /checkCoin?voucher=X
 *
 * Wireless mode — no physical coin slot.
 * Returns a 30-second countdown. Since no coin is ever inserted
 * the portal will close the modal automatically after the timer.
 * The main payment path is via voucher code (modal[6]).
 */
void onCheckCoin() {
    String voucher = server.arg("voucher");
    int    idx     = sessionFind(voucher);

    const int WAIT_MS = 30000;

    if (idx < 0) {
        sendJson(200, "{\"status\":\"false\","
                      "\"errorCode\":\"coin.not.inserted\","
                      "\"remainTime\":0,\"waitTime\":" + String(WAIT_MS) + ","
                      "\"timeAdded\":0,\"totalCoin\":0}");
        return;
    }

    long elapsed   = (long)(millis() - sessions[idx].startMs);
    int  remainMs  = max(0L, (long)WAIT_MS - elapsed);

    String resp = "{\"status\":\"false\","
                  "\"errorCode\":\"coin.not.inserted\","
                  "\"remainTime\":" + String(remainMs) + ","
                  "\"waitTime\":"   + String(WAIT_MS)  + ","
                  "\"timeAdded\":0,\"totalCoin\":0}";
    sendJson(200, resp);
}

// GET /useVoucher?voucher=X
void onUseVoucher() {
    String voucher = server.arg("voucher");

    // Ensure MAC-based user exists on MikroTik
    if (hsUserId(voucher).isEmpty()) hsUserCreate(voucher, 0);
    sessionRemove(voucher);
    sendJson(200, "{\"status\":\"true\"}");
}

// GET /convertVoucher?voucher=MAC&convertVoucher=CODE
void onConvertVoucher() {
    String macV  = server.arg("voucher");
    String codeV = server.arg("convertVoucher");

    String codeId = hsUserId(codeV);
    if (codeId.isEmpty()) {
        sendJson(200, "{\"status\":\"false\",\"errorCode\":\"voucher.not.found\"}");
        return;
    }

    // Get the time from the voucher code user
    String uptime = hsUserUptime(codeId);
    if (uptime.isEmpty()) uptime = "1h";

    // Delete the voucher code user
    hsUserDelete(codeId);

    // Apply time to MAC user
    String macId = hsUserId(macV);
    if (macId.isEmpty()) {
        hsUserCreate(macV, 0);
        macId = hsUserId(macV);
    }
    if (!macId.isEmpty()) hsUserPatchUptime(macId, uptime);

    sessionRemove(macV);
    sendJson(200, "{\"status\":\"true\"}");
}

/*
 * GET /admin/api/generateVouchers?pfx=VC&amt=5&qty=1&sales=0&print=0
 * Header: X-TOKEN: <VENDO_TOKEN>
 *
 * Returns JuanFi-format string: "LPB Vendo|5|3600|VC1234"
 * Also has CORS headers so the hotspot portal can call it directly.
 */
void onGenerateVouchers() {
    if (!tokenOk()) return;

    String pfx  = server.arg("pfx");
    String amtS = server.arg("amt");
    if (pfx.isEmpty())  pfx  = String(VOUCHER_PFX);
    if (amtS.isEmpty()) { sendJson(400, "{\"error\":\"amt required\"}"); return; }

    int amt     = amtS.toInt();
    int timeMins = rateTimeFor(amt);

    // Generate unique code (retry if already exists on MikroTik)
    String code;
    for (int t = 0; t < 10; t++) {
        code = pfx + String(random(1000, 9999));
        if (hsUserId(code).isEmpty()) break;
    }

    if (!hsUserCreate(code, timeMins)) {
        sendJson(500, "{\"error\":\"MikroTik create user failed\"}");
        return;
    }

    // JuanFi response format: "Name|amount|seconds|CODE"
    String result = "LPB Vendo|" + String(amt) + "|" +
                    String(timeMins * 60) + "|" + code;
    corsHeaders();
    server.send(200, "text/plain", result);
}

// OPTIONS preflight for all routes
void onOptions() {
    corsHeaders();
    server.send(204);
}

// ================================================================
//  SETUP & LOOP
// ================================================================
void setup() {
    Serial.begin(115200);
    Serial.println("\n\nLPB Wireless Vendo booting...");

    randomSeed(analogRead(A0));
    for (int i = 0; i < MAX_SESSIONS; i++) sessions[i].active = false;

    // Static IP + connect to WiFi
    WiFi.mode(WIFI_STA);
    WiFi.config(STATIC_IP, GATEWAY, SUBNET, GATEWAY);
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    Serial.print("Connecting to WiFi");
    int tries = 0;
    while (WiFi.status() != WL_CONNECTED && tries < 40) {
        delay(500); Serial.print("."); tries++;
    }
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nWiFi OK  IP: " + WiFi.localIP().toString());
    } else {
        Serial.println("\nWiFi FAILED — restarting");
        ESP.restart();
    }

    // Tell the server which request headers to collect
    const char* headers[] = { "X-TOKEN" };
    server.collectHeaders(headers, 1);

    // Register routes
    server.on("/getRates",                    HTTP_GET,     onGetRates);
    server.on("/topUp",                       HTTP_GET,     onTopUp);
    server.on("/cancelTopUp",                 HTTP_GET,     onCancelTopUp);
    server.on("/checkCoin",                   HTTP_GET,     onCheckCoin);
    server.on("/useVoucher",                  HTTP_GET,     onUseVoucher);
    server.on("/convertVoucher",              HTTP_GET,     onConvertVoucher);
    server.on("/admin/api/generateVouchers",  HTTP_GET,     onGenerateVouchers);

    // CORS OPTIONS preflight
    server.on("/getRates",                    HTTP_OPTIONS, onOptions);
    server.on("/topUp",                       HTTP_OPTIONS, onOptions);
    server.on("/cancelTopUp",                 HTTP_OPTIONS, onOptions);
    server.on("/checkCoin",                   HTTP_OPTIONS, onOptions);
    server.on("/useVoucher",                  HTTP_OPTIONS, onOptions);
    server.on("/convertVoucher",              HTTP_OPTIONS, onOptions);
    server.on("/admin/api/generateVouchers",  HTTP_OPTIONS, onOptions);

    server.onNotFound([]() {
        if (server.method() == HTTP_OPTIONS) { onOptions(); return; }
        corsHeaders();
        server.send(404, "text/plain", "Not found");
    });

    server.begin();
    Serial.println("HTTP server started on port 80");
    Serial.println("Vendo IP: " + WiFi.localIP().toString());
}

void loop() {
    server.handleClient();

    // Reconnect WiFi if dropped
    static unsigned long lastCheck = 0;
    if (millis() - lastCheck > 10000) {
        lastCheck = millis();
        if (WiFi.status() != WL_CONNECTED) {
            Serial.println("WiFi lost, reconnecting...");
            WiFi.reconnect();
        }
    }
}
