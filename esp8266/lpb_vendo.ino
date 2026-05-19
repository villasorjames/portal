/*
 * LPB Wireless Vendo  v2.0
 * ESP8266 Custom Firmware — Wireless Only (no coin slot)
 *
 * Features:
 *   - Admin + Operator web interface
 *   - Generate vouchers via MikroTik REST API
 *   - Full config via browser (no reflashing needed)
 *   - CORS-enabled API endpoints (compatible with LPB hotspot portal)
 *
 * NO extra libraries needed — only built-in ESP8266 libraries.
 *
 * Board: NodeMCU 1.0  (ESP8266 Arduino Core 3.x)
 */

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <EEPROM.h>

// ================================================================
//  CONFIG — saved to EEPROM, editable via web UI
// ================================================================
#define CFG_MAGIC 0xBEEF1234

struct Config {
    uint32_t magic;
    char wifiSsid   [33];
    char wifiPass   [65];
    char mikrotikIp [17];
    char mikrotikUser[33];
    char mikrotikPass[65];
    char hsServer   [33];
    char hsProfile  [33];
    char vendoToken [33];
    char adminPass  [33];
    char operPass   [33];
    char vendoName  [33];
    char rates      [512];  // "Name#amt#mins#validMins|..."
    uint8_t staticIp[4];
    uint8_t gateway [4];
};
Config cfg;

void cfgDefaults() {
    cfg.magic = CFG_MAGIC;
    strlcpy(cfg.wifiSsid,    "YourWiFiSSID",     sizeof cfg.wifiSsid);
    strlcpy(cfg.wifiPass,    "YourWiFiPassword", sizeof cfg.wifiPass);
    strlcpy(cfg.mikrotikIp,  "10.0.0.1",         sizeof cfg.mikrotikIp);
    strlcpy(cfg.mikrotikUser,"admin",             sizeof cfg.mikrotikUser);
    strlcpy(cfg.mikrotikPass,"",                  sizeof cfg.mikrotikPass);
    strlcpy(cfg.hsServer,    "hotspot1",          sizeof cfg.hsServer);
    strlcpy(cfg.hsProfile,   "default",           sizeof cfg.hsProfile);
    strlcpy(cfg.vendoToken,  "12345",             sizeof cfg.vendoToken);
    strlcpy(cfg.adminPass,   "admin123",          sizeof cfg.adminPass);
    strlcpy(cfg.operPass,    "oper123",           sizeof cfg.operPass);
    strlcpy(cfg.vendoName,   "LPB Vendo",         sizeof cfg.vendoName);
    strlcpy(cfg.rates,
        "5 Piso#5#60#1440|10 Piso#10#120#2880|20 Piso#20#300#4320",
        sizeof cfg.rates);
    cfg.staticIp[0]=10; cfg.staticIp[1]=0; cfg.staticIp[2]=0; cfg.staticIp[3]=254;
    cfg.gateway [0]=10; cfg.gateway [1]=0; cfg.gateway [2]=0; cfg.gateway [3]=1;
}
void cfgLoad() {
    EEPROM.begin(sizeof(Config));
    EEPROM.get(0, cfg);
    if (cfg.magic != CFG_MAGIC) cfgDefaults();
}
void cfgSave() {
    cfg.magic = CFG_MAGIC;
    EEPROM.put(0, cfg);
    EEPROM.commit();
}

// ================================================================
//  WEB SERVER + UI SESSIONS
// ================================================================
ESP8266WebServer server(80);

#define MAX_UI_SESS 5
struct UISession { String token; bool isAdmin; bool active; unsigned long ts; };
UISession uiSess[MAX_UI_SESS];

String rndToken() {
    String t; for (int i=0;i<16;i++) t += String(random(16),HEX); return t;
}
String uiLogin(bool isAdmin) {
    String tok = rndToken();
    for (int i=0;i<MAX_UI_SESS;i++) {
        if (!uiSess[i].active) { uiSess[i]={tok,isAdmin,true,millis()}; return tok; }
    }
    uiSess[0]={tok,isAdmin,true,millis()}; return tok;
}
bool uiAuth(bool* admin=nullptr) {
    String cookie = server.header("Cookie");
    int p = cookie.indexOf("lpbs=");
    if (p<0) return false;
    String tok = cookie.substring(p+5);
    int e = tok.indexOf(';'); if (e>=0) tok=tok.substring(0,e); tok.trim();
    for (int i=0;i<MAX_UI_SESS;i++) {
        if (uiSess[i].active && uiSess[i].token==tok) {
            if (millis()-uiSess[i].ts > 7200000UL) { uiSess[i].active=false; return false; }
            uiSess[i].ts=millis();
            if (admin) *admin=uiSess[i].isAdmin;
            return true;
        }
    }
    return false;
}
void uiLogout() {
    String cookie = server.header("Cookie");
    int p = cookie.indexOf("lpbs=");
    if (p<0) return;
    String tok = cookie.substring(p+5);
    int e = tok.indexOf(';'); if (e>=0) tok=tok.substring(0,e); tok.trim();
    for (int i=0;i<MAX_UI_SESS;i++)
        if (uiSess[i].active && uiSess[i].token==tok) { uiSess[i].active=false; }
}
void redirectLogin() {
    server.sendHeader("Location","/login"); server.send(302);
}

// ================================================================
//  VENDO API SESSIONS
// ================================================================
#define MAX_VENDO_SESS 20
struct VSession { String voucher; unsigned long startMs; bool active; };
VSession vsess[MAX_VENDO_SESS];

int  vFind(const String& v) { for(int i=0;i<MAX_VENDO_SESS;i++) if(vsess[i].active&&vsess[i].voucher==v) return i; return -1; }
void vRemove(const String& v){ int i=vFind(v); if(i>=0) vsess[i].active=false; }
void vCreate(const String& v){ vRemove(v); for(int i=0;i<MAX_VENDO_SESS;i++) if(!vsess[i].active){vsess[i]={v,millis(),true};return;} vsess[0]={v,millis(),true}; }

// ================================================================
//  HELPERS
// ================================================================
void cors() {
    server.sendHeader("Access-Control-Allow-Origin","*");
    server.sendHeader("Access-Control-Allow-Methods","GET,POST,OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers","X-TOKEN,Content-Type");
}
void jsonResp(int c, const String& j){ cors(); server.send(c,"application/json",j); }

bool tokenOk() {
    if (server.header("X-TOKEN")==String(cfg.vendoToken)) return true;
    server.send(401,"text/plain","Need to Login"); return false;
}

String b64(const String& s) {
    static const char* T="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    String o; int len=s.length(); const uint8_t* d=(const uint8_t*)s.c_str();
    for(int i=0;i<len;i+=3){
        uint32_t v=((uint32_t)d[i]<<16)|((i+1<len?(uint32_t)d[i+1]:0)<<8)|(i+2<len?(uint32_t)d[i+2]:0);
        o+=T[(v>>18)&63]; o+=T[(v>>12)&63];
        o+=(i+1<len)?T[(v>>6)&63]:'='; o+=(i+2<len)?T[v&63]:'=';
    } return o;
}

// ================================================================
//  MIKROTIK REST
// ================================================================
String mtCall(const String& method, const String& path, const String& body, int* code=nullptr) {
    WiFiClient cl; HTTPClient h;
    h.begin(cl,"http://"+String(cfg.mikrotikIp)+path);
    h.addHeader("Authorization","Basic "+b64(String(cfg.mikrotikUser)+":"+String(cfg.mikrotikPass)));
    h.addHeader("Content-Type","application/json");
    h.setTimeout(6000);
    int c=-1; String r;
    if      (method=="GET")    c=h.GET();
    else if (method=="POST")   c=h.POST(body);
    else if (method=="DELETE") c=h.sendRequest("DELETE");
    else if (method=="PATCH")  c=h.sendRequest("PATCH",body);
    if(c>0) r=h.getString(); h.end();
    if(code) *code=c; return r;
}

// Extract a JSON string value: find "key":"VALUE" and return VALUE
String jsonStr(const String& json, const String& key) {
    String needle = "\"" + key + "\":\"";
    int p = json.indexOf(needle);
    if (p < 0) return "";
    p += needle.length();
    int e = json.indexOf('"', p);
    if (e < 0) return "";
    return json.substring(p, e);
}

String mtUserId(const String& name) {
    int c = 0;
    String r = mtCall("GET", "/rest/ip/hotspot/user?name=" + name, "", &c);
    if (c != 200 || r.length() < 3) return "";
    return jsonStr(r, ".id");
}
bool mtUserCreate(const String& name, int mins) {
    String b = "{\"name\":\"" + name + "\",\"password\":\"" + name +
               "\",\"profile\":\"" + String(cfg.hsProfile) +
               "\",\"server\":\""  + String(cfg.hsServer)  + "\"";
    if (mins > 0) {
        int h = mins/60, m = mins%60;
        String t = (h ? String(h)+"h" : "") + (m ? String(m)+"m" : "");
        b += ",\"limit-uptime\":\"" + t + "\"";
    }
    b += "}";
    int c = 0; mtCall("POST", "/rest/ip/hotspot/user", b, &c);
    return (c == 200 || c == 201);
}
void mtUserDelete(const String& id) {
    mtCall("DELETE", "/rest/ip/hotspot/user/" + id, "");
}
String mtUserUptime(const String& id) {
    int c = 0;
    String r = mtCall("GET", "/rest/ip/hotspot/user/" + id, "", &c);
    if (c != 200) return "";
    return jsonStr(r, "limit-uptime");
}
void mtUserPatch(const String& id, const String& uptime) {
    mtCall("PATCH", "/rest/ip/hotspot/user/" + id,
           "{\"limit-uptime\":\"" + uptime + "\"}");
}

int rateTime(int amt){
    String r=String(cfg.rates); int pos=0;
    while(pos<(int)r.length()){
        int sep=r.indexOf('|',pos); String e=(sep<0)?r.substring(pos):r.substring(pos,sep);
        int a=e.indexOf('#'),b=e.indexOf('#',a+1),c=e.indexOf('#',b+1);
        if(a>0&&b>a&&c>b&&e.substring(a+1,b).toInt()==amt) return e.substring(b+1,c).toInt();
        if(sep<0) break; pos=sep+1;
    } return 60;
}

int gVoucherCount = 0; // generated today counter

// ================================================================
//  VENDO API ENDPOINTS
// ================================================================
void onOptions(){ cors(); server.send(204); }

void onGetRates(){
    cors(); server.send(200,"text/plain",cfg.rates);
}
void onTopUp(){
    String v=server.arg("voucher");
    if(v.isEmpty()){ jsonResp(400,"{\"status\":\"false\",\"errorCode\":\"invalid.request\"}"); return; }
    vCreate(v);
    jsonResp(200,"{\"status\":\"true\",\"voucher\":\""+v+"\"}");
}
void onCancelTopUp(){
    vRemove(server.arg("voucher")); jsonResp(200,"{\"status\":\"true\"}");
}
void onCheckCoin(){
    String v=server.arg("voucher"); int idx=vFind(v);
    const int W=30000;
    if(idx<0){ jsonResp(200,"{\"status\":\"false\",\"errorCode\":\"coin.not.inserted\",\"remainTime\":0,\"waitTime\":"+String(W)+",\"timeAdded\":0,\"totalCoin\":0}"); return; }
    int rem=max(0L,(long)W-(long)(millis()-vsess[idx].startMs));
    jsonResp(200,"{\"status\":\"false\",\"errorCode\":\"coin.not.inserted\",\"remainTime\":"+String(rem)+",\"waitTime\":"+String(W)+",\"timeAdded\":0,\"totalCoin\":0}");
}
void onUseVoucher(){
    String v=server.arg("voucher");
    if(mtUserId(v).isEmpty()) mtUserCreate(v,0);
    vRemove(v); jsonResp(200,"{\"status\":\"true\"}");
}
void onConvertVoucher(){
    String macV=server.arg("voucher"), codeV=server.arg("convertVoucher");
    String cid=mtUserId(codeV);
    if(cid.isEmpty()){ jsonResp(200,"{\"status\":\"false\",\"errorCode\":\"voucher.not.found\"}"); return; }
    String up=mtUserUptime(cid); if(up.isEmpty()) up="1h";
    mtUserDelete(cid);
    String mid=mtUserId(macV);
    if(mid.isEmpty()){ mtUserCreate(macV,0); mid=mtUserId(macV); }
    if(!mid.isEmpty()) mtUserPatch(mid,up);
    vRemove(macV); jsonResp(200,"{\"status\":\"true\"}");
}
void onGenerateVouchers(){
    if(!tokenOk()) return;
    String pfx=server.arg("pfx"); if(pfx.isEmpty()) pfx=String("VC");
    String amtS=server.arg("amt"); if(amtS.isEmpty()){ jsonResp(400,"{\"error\":\"amt required\"}"); return; }
    int amt=amtS.toInt(), mins=rateTime(amt);
    String code;
    for(int t=0;t<10;t++){ code=pfx+String(random(1000,9999)); if(mtUserId(code).isEmpty()) break; }
    if(!mtUserCreate(code,mins)){ jsonResp(500,"{\"error\":\"MikroTik failed\"}"); return; }
    gVoucherCount++;
    cors(); server.send(200,"text/plain",String(cfg.vendoName)+"|"+String(amt)+"|"+String(mins*60)+"|"+code);
}

// ================================================================
//  HTML HELPERS
// ================================================================
// Shared CSS
const char CSS[] PROGMEM = R"CSS(
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0d1117;color:#e6edf3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh}
a{color:#58a6ff;text-decoration:none}
.topbar{background:#161b22;border-bottom:1px solid #30363d;padding:12px 20px;display:flex;align-items:center;justify-content:space-between}
.topbar .logo{font-weight:700;font-size:16px;color:#f0f6fc}
.topbar .info{font-size:12px;color:#8b949e}
.topbar .logout{font-size:13px;color:#f85149}
.wrap{max-width:480px;margin:0 auto;padding:24px 16px}
.card{background:#161b22;border:1px solid #30363d;border-radius:12px;padding:20px;margin-bottom:16px}
.card h2{font-size:14px;color:#8b949e;letter-spacing:.08em;text-transform:uppercase;margin-bottom:16px}
.badge{display:inline-block;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:.06em}
.badge.admin{background:rgba(248,81,73,.15);color:#f85149;border:1px solid rgba(248,81,73,.3)}
.badge.oper{background:rgba(88,166,255,.15);color:#58a6ff;border:1px solid rgba(88,166,255,.3)}
label{display:block;font-size:11px;color:#8b949e;margin-bottom:6px;letter-spacing:.06em;text-transform:uppercase}
input,select,textarea{width:100%;background:#0d1117;border:1px solid #30363d;border-radius:8px;color:#e6edf3;font-size:14px;padding:10px 12px;outline:none;transition:border-color .15s;margin-bottom:12px}
input:focus,select:focus,textarea:focus{border-color:#58a6ff}
textarea{resize:vertical;min-height:80px;font-family:monospace;font-size:12px}
.btn{display:block;width:100%;padding:12px;border:0;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:filter .15s;letter-spacing:.04em;text-transform:uppercase}
.btn:active{filter:brightness(.85)}
.btn-green{background:#238636;color:#fff}
.btn-blue{background:#1f6feb;color:#fff}
.btn-red{background:#da3633;color:#fff;margin-top:8px}
.btn-gray{background:#21262d;color:#e6edf3;border:1px solid #30363d}
.stat-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}
.stat{background:#161b22;border:1px solid #30363d;border-radius:12px;padding:16px;text-align:center}
.stat .val{font-size:28px;font-weight:700;color:#f0f6fc}
.stat .lbl{font-size:11px;color:#8b949e;margin-top:4px;text-transform:uppercase;letter-spacing:.06em}
.voucher-box{background:#0d1117;border:1px solid #238636;border-radius:8px;padding:16px;text-align:center;margin-top:12px;display:none}
.voucher-box .code{font-size:32px;font-weight:700;color:#3fb950;letter-spacing:.1em;font-family:monospace}
.voucher-box .meta{font-size:11px;color:#8b949e;margin-top:6px}
.copy-btn{margin-top:10px;background:transparent;border:1px solid #3fb950;color:#3fb950;border-radius:8px;padding:8px 0;font-size:13px;font-weight:600;cursor:pointer;width:100%;letter-spacing:.06em;text-transform:uppercase}
.copy-btn.copied{background:#238636;color:#fff;border-color:#238636}
.alert{border-radius:8px;padding:12px 14px;font-size:13px;margin-bottom:12px}
.alert-ok{background:rgba(35,134,54,.15);border:1px solid rgba(35,134,54,.4);color:#3fb950}
.alert-err{background:rgba(248,81,73,.15);border:1px solid rgba(248,81,73,.4);color:#f85149}
.tabs{display:flex;gap:4px;margin-bottom:16px;background:#161b22;border:1px solid #30363d;border-radius:10px;padding:4px}
.tab{flex:1;padding:8px;text-align:center;font-size:12px;font-weight:600;border-radius:7px;cursor:pointer;letter-spacing:.04em;text-transform:uppercase;color:#8b949e;border:none;background:transparent}
.tab.active{background:#21262d;color:#f0f6fc}
.section{display:none}.section.show{display:block}
.info-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #21262d;font-size:13px}
.info-row:last-child{border-bottom:none}
.info-row .k{color:#8b949e}
.info-row .v{color:#e6edf3;font-weight:500;text-align:right;word-break:break-all;max-width:60%}
)CSS";

// Login page
void sendLogin(const String& err=""){
    String h = "<!DOCTYPE html><html><head><meta charset='utf-8'>"
               "<meta name='viewport' content='width=device-width,initial-scale=1'>"
               "<title>LPB Vendo — Login</title>"
               "<style>"; h+=FPSTR(CSS); h+="</style></head><body>"
               "<div style='max-width:360px;margin:60px auto;padding:0 16px'>"
               "<div style='text-align:center;margin-bottom:28px'>"
               "<div style='font-size:22px;font-weight:700;color:#f0f6fc'>LPB Vendo</div>"
               "<div style='font-size:12px;color:#8b949e;margin-top:4px'>Wireless Management System</div>"
               "</div>";
    if(err.length()) h+="<div class='alert alert-err'>"+err+"</div>";
    h+="<div class='card'>"
       "<h2>Login</h2>"
       "<form method='POST' action='/login'>"
       "<label>Username</label><input name='user' autocomplete='username' required>"
       "<label>Password</label><input name='pass' type='password' autocomplete='current-password' required>"
       "<button type='submit' class='btn btn-blue'>Sign In</button>"
       "</form></div>"
       "<div style='text-align:center;margin-top:16px;font-size:11px;color:#484f58'>"
       "IP: "; h+=WiFi.localIP().toString();
    h+="</div></div></body></html>";
    server.send(200,"text/html",h);
}

// Shared topbar HTML
String topbar(bool isAdmin, const String& page){
    String s="<div class='topbar'><div class='logo'>LPB Vendo";
    s+=" <span class='badge "+(isAdmin?String("admin"):String("oper"))+"'>"+(isAdmin?"ADMIN":"OPERATOR")+"</span></div>";
    s+="<a class='logout' href='/logout'>Logout</a></div>";
    return s;
}

// Generate voucher card (used by both admin + operator)
const char GEN_CARD[] PROGMEM = R"HTML(
<div class='card'>
<h2>Generate Voucher</h2>
<label>Amount (PHP)</label>
<select id='amt'>__RATE_OPTIONS__</select>
<button class='btn btn-green' onclick='doGen()'>Generate</button>
<div class='voucher-box' id='vbox'>
  <div style='font-size:11px;color:#8b949e;margin-bottom:6px;text-transform:uppercase;letter-spacing:.06em'>Voucher Code</div>
  <div class='code' id='vcode'></div>
  <div class='meta' id='vmeta'></div>
  <button class='copy-btn' id='cpybtn' onclick='doCopy()'>Copy</button>
</div>
<div id='verr' style='display:none' class='alert alert-err' style='margin-top:10px'></div>
</div>
<script>
function rateOpts(){
  var s=document.getElementById('amt');
  if(!s) return;
}
function doGen(){
  var amt=document.getElementById('amt').value;
  var vbox=document.getElementById('vbox');
  var verr=document.getElementById('verr');
  vbox.style.display='none'; verr.style.display='none';
  fetch('/api/gen?amt='+amt,{headers:{'X-TOKEN':'__TOKEN__'}})
    .then(r=>r.text()).then(t=>{
      var parts=t.split('|');
      var code=parts[parts.length-1].trim();
      if(!code||code.length<3){verr.textContent='Failed: '+t;verr.style.display='block';return;}
      document.getElementById('vcode').textContent=code;
      var secs=parseInt(parts[2])||3600;
      var h=Math.floor(secs/3600),m=Math.floor((secs%3600)/60);
      document.getElementById('vmeta').textContent='PHP'+parts[1]+' — '+(h?h+'h ':'')+m+'m';
      vbox.style.display='block';
      document.getElementById('cpybtn').textContent='Copy';
      document.getElementById('cpybtn').classList.remove('copied');
    }).catch(e=>{verr.textContent='Request failed';verr.style.display='block';});
}
function doCopy(){
  var code=document.getElementById('vcode').textContent;
  var btn=document.getElementById('cpybtn');
  if(navigator.clipboard){navigator.clipboard.writeText(code).then(()=>{btn.textContent='Copied ✓';btn.classList.add('copied');setTimeout(()=>{btn.textContent='Copy';btn.classList.remove('copied');},2000)});}
  else{var t=document.createElement('textarea');t.value=code;document.body.appendChild(t);t.select();document.execCommand('copy');document.body.removeChild(t);btn.textContent='Copied ✓';btn.classList.add('copied');}
}
</script>
)HTML";

String buildRateOptions(){
    String s=String(cfg.rates); String out=""; int pos=0;
    while(pos<(int)s.length()){
        int sep=s.indexOf('|',pos); String e=(sep<0)?s.substring(pos):s.substring(pos,sep);
        int a=e.indexOf('#'),b=e.indexOf('#',a+1),c=e.indexOf('#',b+1);
        if(a>0&&b>a){
            String name=e.substring(0,a), amt=e.substring(a+1,b);
            out+="<option value='"+amt+"'>"+name+" (PHP"+amt+")</option>";
        }
        if(sep<0) break; pos=sep+1;
    } return out;
}

String genCard(){
    String h=FPSTR(GEN_CARD);
    h.replace("__RATE_OPTIONS__",buildRateOptions());
    h.replace("__TOKEN__",String(cfg.vendoToken));
    return h;
}

// ================================================================
//  WEB UI ROUTE HANDLERS
// ================================================================

void onUIRoot(){ server.sendHeader("Location","/dashboard"); server.send(302); }

void onUILogin(){
    if(server.method()==HTTP_GET){ sendLogin(); return; }
    String user=server.arg("user"), pass=server.arg("pass");
    bool isAdmin=false;
    if(user==String("admin")&&pass==String(cfg.adminPass)) isAdmin=true;
    else if(user==String("operator")&&pass==String(cfg.operPass)) isAdmin=false;
    else { sendLogin("Invalid username or password."); return; }
    String tok=uiLogin(isAdmin);
    server.sendHeader("Set-Cookie","lpbs="+tok+"; Path=/; HttpOnly");
    server.sendHeader("Location","/dashboard"); server.send(302);
}

void onUILogout(){
    uiLogout();
    server.sendHeader("Set-Cookie","lpbs=; Path=/; Max-Age=0");
    server.sendHeader("Location","/login"); server.send(302);
}

// ---- Operator dashboard ----
void sendOperDash(){
    String h="<!DOCTYPE html><html><head><meta charset='utf-8'>"
             "<meta name='viewport' content='width=device-width,initial-scale=1'>"
             "<title>LPB Vendo — Operator</title>"
             "<style>"; h+=FPSTR(CSS); h+="</style></head><body>";
    h+=topbar(false,"");
    h+="<div class='wrap'>";
    h+=genCard();
    h+="</div></body></html>";
    server.send(200,"text/html",h);
}

// ---- Admin dashboard ----
void sendAdminDash(){
    int activeSess=0;
    for(int i=0;i<MAX_VENDO_SESS;i++) if(vsess[i].active) activeSess++;

    String h="<!DOCTYPE html><html><head><meta charset='utf-8'>"
             "<meta name='viewport' content='width=device-width,initial-scale=1'>"
             "<title>LPB Vendo — Admin</title>"
             "<style>"; h+=FPSTR(CSS); h+="</style></head><body>";
    h+=topbar(true,"");
    h+="<div class='wrap'>"
       "<div class='stat-row'>"
       "<div class='stat'><div class='val'>"+String(activeSess)+"</div><div class='lbl'>Active Sessions</div></div>"
       "<div class='stat'><div class='val'>"+String(gVoucherCount)+"</div><div class='lbl'>Vouchers Generated</div></div>"
       "</div>";

    // Tabs
    h+="<div class='tabs'>"
       "<button class='tab active' onclick='showTab(0,this)'>Generate</button>"
       "<button class='tab' onclick='showTab(1,this)'>Rates</button>"
       "<button class='tab' onclick='showTab(2,this)'>Config</button>"
       "<button class='tab' onclick='showTab(3,this)'>System</button>"
       "</div>";

    // Tab 0: Generate
    h+="<div class='section show' id='tab0'>";
    h+=genCard();
    h+="</div>";

    // Tab 1: Rates
    h+="<div class='section' id='tab1'>"
       "<div class='card'><h2>WiFi Rates</h2>"
       "<p style='font-size:12px;color:#8b949e;margin-bottom:12px'>Format: Name#Amount#TimeMinutes#ValidityMinutes<br>Separate with |</p>"
       "<form method='POST' action='/rates'>"
       "<textarea name='rates'>"+String(cfg.rates)+"</textarea>"
       "<button type='submit' class='btn btn-blue'>Save Rates</button>"
       "</form></div></div>";

    // Tab 2: Config
    h+="<div class='section' id='tab2'>"
       "<div class='card'><h2>System Config</h2>"
       "<form method='POST' action='/config'>"
       "<label>WiFi SSID</label><input name='wifiSsid' value='"+String(cfg.wifiSsid)+"'>"
       "<label>WiFi Password</label><input name='wifiPass' type='password' placeholder='(unchanged)' autocomplete='new-password'>"
       "<label>MikroTik IP</label><input name='mikrotikIp' value='"+String(cfg.mikrotikIp)+"'>"
       "<label>MikroTik User</label><input name='mikrotikUser' value='"+String(cfg.mikrotikUser)+"'>"
       "<label>MikroTik Password</label><input name='mikrotikPass' type='password' placeholder='(unchanged)' autocomplete='new-password'>"
       "<label>Hotspot Server</label><input name='hsServer' value='"+String(cfg.hsServer)+"'>"
       "<label>Hotspot Profile</label><input name='hsProfile' value='"+String(cfg.hsProfile)+"'>"
       "<label>Vendo Name</label><input name='vendoName' value='"+String(cfg.vendoName)+"'>"
       "<label>Portal Token (X-TOKEN)</label><input name='vendoToken' value='"+String(cfg.vendoToken)+"'>"
       "<label>Vendo IP (restart required)</label><input name='staticIp' value='"+WiFi.localIP().toString()+"'>"
       "<button type='submit' class='btn btn-blue'>Save Config</button>"
       "</form></div>"

       "<div class='card'><h2>Change Passwords</h2>"
       "<form method='POST' action='/passwd'>"
       "<label>Admin Password</label><input name='adminPass' type='password' autocomplete='new-password'>"
       "<label>Operator Password</label><input name='operPass' type='password' autocomplete='new-password'>"
       "<button type='submit' class='btn btn-gray'>Update Passwords</button>"
       "</form></div></div>";

    // Tab 3: System
    h+="<div class='section' id='tab3'>"
       "<div class='card'><h2>System Info</h2>"
       "<div class='info-row'><span class='k'>IP Address</span><span class='v'>"+WiFi.localIP().toString()+"</span></div>"
       "<div class='info-row'><span class='k'>MAC Address</span><span class='v'>"+WiFi.macAddress()+"</span></div>"
       "<div class='info-row'><span class='k'>Free Heap</span><span class='v'>"+String(ESP.getFreeHeap())+" bytes</span></div>"
       "<div class='info-row'><span class='k'>Uptime</span><span class='v'>"+String(millis()/60000)+" min</span></div>"
       "<div class='info-row'><span class='k'>WiFi RSSI</span><span class='v'>"+String(WiFi.RSSI())+" dBm</span></div>"
       "<div class='info-row'><span class='k'>MikroTik IP</span><span class='v'>"+String(cfg.mikrotikIp)+"</span></div>"
       "</div>"
       "<div class='card'>"
       "<button class='btn btn-red' onclick=\"if(confirm('Restart ESP8266?'))fetch('/api/restart')\">Restart Device</button>"
       "</div></div>";

    // Tab JS
    h+="<script>"
       "function showTab(n,btn){"
       "document.querySelectorAll('.section').forEach(s=>s.classList.remove('show'));"
       "document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));"
       "document.getElementById('tab'+n).classList.add('show');"
       "btn.classList.add('active');}"
       "</script>";

    h+="</div></body></html>";
    server.send(200,"text/html",h);
}

void onUIDashboard(){
    bool isAdmin=false;
    if(!uiAuth(&isAdmin)){ redirectLogin(); return; }
    if(isAdmin) sendAdminDash(); else sendOperDash();
}

void onUIConfig(){
    bool isAdmin=false;
    if(!uiAuth(&isAdmin)||!isAdmin){ server.send(403,"text/plain","Forbidden"); return; }
    if(server.hasArg("wifiSsid")) strlcpy(cfg.wifiSsid,  server.arg("wifiSsid").c_str(),  sizeof cfg.wifiSsid);
    if(server.hasArg("wifiPass")&&server.arg("wifiPass").length()) strlcpy(cfg.wifiPass, server.arg("wifiPass").c_str(), sizeof cfg.wifiPass);
    if(server.hasArg("mikrotikIp"))   strlcpy(cfg.mikrotikIp,   server.arg("mikrotikIp").c_str(),   sizeof cfg.mikrotikIp);
    if(server.hasArg("mikrotikUser")) strlcpy(cfg.mikrotikUser, server.arg("mikrotikUser").c_str(), sizeof cfg.mikrotikUser);
    if(server.hasArg("mikrotikPass")&&server.arg("mikrotikPass").length()) strlcpy(cfg.mikrotikPass,server.arg("mikrotikPass").c_str(),sizeof cfg.mikrotikPass);
    if(server.hasArg("hsServer"))    strlcpy(cfg.hsServer,   server.arg("hsServer").c_str(),   sizeof cfg.hsServer);
    if(server.hasArg("hsProfile"))   strlcpy(cfg.hsProfile,  server.arg("hsProfile").c_str(),  sizeof cfg.hsProfile);
    if(server.hasArg("vendoName"))   strlcpy(cfg.vendoName,  server.arg("vendoName").c_str(),  sizeof cfg.vendoName);
    if(server.hasArg("vendoToken"))  strlcpy(cfg.vendoToken, server.arg("vendoToken").c_str(), sizeof cfg.vendoToken);
    cfgSave();
    server.sendHeader("Location","/dashboard"); server.send(302);
}

void onUIRates(){
    bool isAdmin=false;
    if(!uiAuth(&isAdmin)||!isAdmin){ server.send(403,"text/plain","Forbidden"); return; }
    if(server.hasArg("rates")) strlcpy(cfg.rates, server.arg("rates").c_str(), sizeof cfg.rates);
    cfgSave();
    server.sendHeader("Location","/dashboard"); server.send(302);
}

void onUIPasswd(){
    bool isAdmin=false;
    if(!uiAuth(&isAdmin)||!isAdmin){ server.send(403,"text/plain","Forbidden"); return; }
    if(server.hasArg("adminPass")&&server.arg("adminPass").length()) strlcpy(cfg.adminPass, server.arg("adminPass").c_str(), sizeof cfg.adminPass);
    if(server.hasArg("operPass") &&server.arg("operPass").length())  strlcpy(cfg.operPass,  server.arg("operPass").c_str(),  sizeof cfg.operPass);
    cfgSave();
    server.sendHeader("Location","/dashboard"); server.send(302);
}

// Internal gen endpoint used by web UI (same as vendo API but via session auth)
void onUIGenApi(){
    bool loggedIn=uiAuth(nullptr);
    bool tokenValid=(server.header("X-TOKEN")==String(cfg.vendoToken));
    if(!loggedIn&&!tokenValid){ server.send(401,"text/plain","Unauthorized"); return; }
    // Reuse vendo generate logic
    String amtS=server.arg("amt"); if(amtS.isEmpty()){ server.send(400,"text/plain","amt required"); return; }
    int amt=amtS.toInt(), mins=rateTime(amt);
    String pfx="VC", code;
    for(int t=0;t<10;t++){ code=pfx+String(random(1000,9999)); if(mtUserId(code).isEmpty()) break; }
    if(!mtUserCreate(code,mins)){ cors(); server.send(500,"text/plain","MikroTik failed"); return; }
    gVoucherCount++;
    cors();
    server.send(200,"text/plain",String(cfg.vendoName)+"|"+String(amt)+"|"+String(mins*60)+"|"+code);
}

void onRestart(){
    server.send(200,"text/plain","Restarting..."); delay(500); ESP.restart();
}

// ================================================================
//  SETUP & LOOP
// ================================================================
void setup() {
    Serial.begin(115200);
    Serial.println("\nLPB Wireless Vendo v2.0 booting...");

    randomSeed(analogRead(A0));
    for(int i=0;i<MAX_VENDO_SESS;i++) vsess[i].active=false;
    for(int i=0;i<MAX_UI_SESS;i++)    uiSess[i].active=false;

    cfgLoad();

    // Static IP
    IPAddress ip(cfg.staticIp[0],cfg.staticIp[1],cfg.staticIp[2],cfg.staticIp[3]);
    IPAddress gw(cfg.gateway[0], cfg.gateway[1], cfg.gateway[2], cfg.gateway[3]);
    IPAddress sn(255,255,255,0);
    WiFi.mode(WIFI_STA);
    WiFi.config(ip,gw,sn,gw);
    WiFi.begin(cfg.wifiSsid,cfg.wifiPass);
    Serial.print("Connecting");
    int tries=0;
    while(WiFi.status()!=WL_CONNECTED&&tries<40){ delay(500); Serial.print("."); tries++; }
    if(WiFi.status()==WL_CONNECTED){
        Serial.println("\nWiFi OK  IP: "+WiFi.localIP().toString());
    } else {
        Serial.println("\nWiFi FAILED");
    }

    // Collect headers
    const char* hdrs[]={"X-TOKEN","Cookie"};
    server.collectHeaders(hdrs,2);

    // ---- Web UI routes ----
    server.on("/",          HTTP_GET,  onUIRoot);
    server.on("/login",     HTTP_GET,  onUILogin);
    server.on("/login",     HTTP_POST, onUILogin);
    server.on("/logout",    HTTP_GET,  onUILogout);
    server.on("/dashboard", HTTP_GET,  onUIDashboard);
    server.on("/config",    HTTP_POST, onUIConfig);
    server.on("/rates",     HTTP_POST, onUIRates);
    server.on("/passwd",    HTTP_POST, onUIPasswd);
    server.on("/api/gen",   HTTP_GET,  onUIGenApi);
    server.on("/api/restart",HTTP_GET, onRestart);

    // ---- Vendo API routes ----
    server.on("/getRates",                   HTTP_GET,     onGetRates);
    server.on("/topUp",                      HTTP_GET,     onTopUp);
    server.on("/cancelTopUp",                HTTP_GET,     onCancelTopUp);
    server.on("/checkCoin",                  HTTP_GET,     onCheckCoin);
    server.on("/useVoucher",                 HTTP_GET,     onUseVoucher);
    server.on("/convertVoucher",             HTTP_GET,     onConvertVoucher);
    server.on("/admin/api/generateVouchers", HTTP_GET,     onGenerateVouchers);

    // ---- OPTIONS preflight ----
    server.onNotFound([](){
        if(server.method()==HTTP_OPTIONS){ cors(); server.send(204); return; }
        cors(); server.send(404,"text/plain","Not found");
    });

    server.begin();
    Serial.println("HTTP server started");
    Serial.println("Open browser: http://"+WiFi.localIP().toString());
    Serial.println("Admin: admin / "+String(cfg.adminPass));
    Serial.println("Operator: operator / "+String(cfg.operPass));
}

void loop() {
    server.handleClient();
    static unsigned long lastWifi=0;
    if(millis()-lastWifi>15000){
        lastWifi=millis();
        if(WiFi.status()!=WL_CONNECTED){ WiFi.reconnect(); }
    }
}
