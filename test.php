<?php
// voucher.php — generate vouchers via the router API.
// Token + router call stay server-side; browser only talks to this file.

declare(strict_types=1);

$routerBase = 'http://10.0.0.254/admin/api/generateVouchers';
$token      = getenv('ROUTER_API_TOKEN') ?: '12345';

// Fixed params per the spec; only `amt` comes from the user.
$FIXED = ['pfx' => 'VC', 'qty' => '1', 'sales' => '0', 'print' => '0'];

function callRouter(string $base, string $token, array $params): array
{
    $url = $base . '?' . http_build_query($params);
    $ch  = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => ['X-TOKEN: ' . $token],
        CURLOPT_TIMEOUT        => 5,
        CURLOPT_CONNECTTIMEOUT => 3,
    ]);
    $raw  = curl_exec($ch);
    $err  = curl_error($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($raw === false) { return [null, 'Router unreachable: ' . $err]; }
    if ($code !== 200)  { return [null, 'Router returned HTTP ' . $code . ' — ' . $raw]; }
    return [$raw, null];
}

// Extract the voucher code from the router response.
// Response looks like: "JuanFi Vendo|5|3600|VC5418"
// We want the part that starts with the prefix (VC...), or fall back
// to the last pipe-separated segment.
function extractCode(?string $raw, string $prefix): ?string
{
    if ($raw === null) { return null; }
    $raw = trim($raw);
    if ($raw === '') { return null; }

    if (preg_match('/\b' . preg_quote($prefix, '/') . '[A-Za-z0-9]+\b/', $raw, $m)) {
        return $m[0];
    }

    if (strpos($raw, '|') !== false) {
        $parts = explode('|', $raw);
        return trim(end($parts));
    }

    return $raw;
}

// --- API mode: ?do=1&amt=... returns JSON, called by the page via fetch ---
if (isset($_GET['do'])) {
    header('Content-Type: application/json; charset=utf-8');

    $amt = trim((string) ($_GET['amt'] ?? ''));
    if ($amt === '' || !preg_match('/^\d+(\.\d{1,2})?$/', $amt)) {
        http_response_code(400);
        echo json_encode(['error' => 'Enter a valid amount (numbers only).']);
        exit;
    }

    $params = array_merge($FIXED, ['amt' => $amt]);
    [$raw, $error] = callRouter($routerBase, $token, $params);

    $code = $error ? null : extractCode($raw, $FIXED['pfx']);

    echo json_encode([
        'error'  => $error,
        'amount' => $amt,
        'code'   => $code,
        'result' => $raw,
        'time'   => date('H:i:s'),
    ]);
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Generate Voucher - 10.0.0.254</title>
<style>
  :root{
    --bg:#0a0e0d;--panel:#111715;--line:#1f2a26;--ink:#d8e6df;
    --dim:#6f8278;--accent:#34e0a1;--warn:#e0a534;
    --mono:'SFMono-Regular',ui-monospace,'JetBrains Mono',Menlo,Consolas,monospace;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{background:var(--bg);color:var(--ink);font-family:var(--mono)}
  body{
    min-height:100vh;padding:24px 18px calc(28px + env(safe-area-inset-bottom));
    background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.012) 0 1px,transparent 1px 3px);
    -webkit-font-smoothing:antialiased;
  }
  .head{
    display:flex;align-items:baseline;justify-content:space-between;
    padding-bottom:14px;border-bottom:1px solid var(--line);margin-bottom:26px;
  }
  .title{font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:var(--dim)}
  .title b{color:var(--ink)}
  .host{font-size:11px;color:var(--dim)}
  label{display:block;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--dim);margin-bottom:9px}
  .amt-wrap{position:relative;margin-bottom:18px}
  .amt-wrap span{position:absolute;left:16px;top:50%;transform:translateY(-50%);color:var(--dim);font-size:20px}
  input{
    width:100%;background:var(--panel);border:1px solid var(--line);border-radius:12px;
    color:var(--ink);font-family:var(--mono);font-size:26px;font-weight:600;
    padding:18px 16px 18px 40px;outline:none;transition:border-color .15s;
  }
  input:focus{border-color:var(--accent)}
  button{
    width:100%;background:var(--accent);color:#06120c;border:0;border-radius:12px;
    font-family:var(--mono);font-size:15px;font-weight:700;letter-spacing:.14em;
    text-transform:uppercase;padding:18px;cursor:pointer;transition:filter .15s,opacity .15s;
  }
  button:active{filter:brightness(.9)}
  button:disabled{opacity:.5;cursor:not-allowed}
  .test-btn{
    width:100%;background:transparent;color:var(--warn);
    border:1px solid var(--warn);border-radius:12px;
    font-family:var(--mono);font-size:13px;font-weight:700;letter-spacing:.14em;
    text-transform:uppercase;padding:14px;cursor:pointer;
    transition:filter .15s,opacity .15s;margin-top:10px;
  }
  .test-btn:active{filter:brightness(.9)}
  .test-btn:disabled{opacity:.5;cursor:not-allowed}
  .meta{font-size:10px;color:var(--dim);margin:14px 2px 0;letter-spacing:.08em}
  .out{margin-top:22px;border-radius:12px;padding:20px 16px;font-size:13px;display:none;white-space:pre-wrap;word-break:break-word}
  .out.ok{display:block;background:rgba(52,224,161,.08);border:1px solid var(--accent);color:var(--ink);text-align:center}
  .out.bad{display:block;background:rgba(224,165,52,.08);border:1px solid var(--warn);color:var(--warn)}
  .out .lbl{font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--dim);display:block;margin-bottom:10px}
  .out .code{font-size:34px;font-weight:700;color:var(--accent);display:block;margin-bottom:18px;letter-spacing:.08em;user-select:all}
  .copy-btn{
    width:100%;background:transparent;color:var(--accent);
    border:1px solid var(--accent);border-radius:12px;
    font-family:var(--mono);font-size:14px;font-weight:700;letter-spacing:.14em;
    text-transform:uppercase;padding:16px;cursor:pointer;transition:all .15s;
  }
  .copy-btn:active{filter:brightness(.9)}
  .copy-btn.done{background:var(--accent);color:#06120c}
  .out .time{font-size:10px;color:var(--dim);margin-top:14px;display:block;letter-spacing:.08em}
</style>
</head>
<body>

  <div class="head">
    <div class="title"><b>Generate</b> Voucher</div>
    <div class="host">10.0.0.254</div>
  </div>

  <label for="amt">Enter Amount</label>
  <div class="amt-wrap">
    <span>₱</span>
    <input id="amt" type="text" inputmode="decimal" placeholder="0" autocomplete="off">
  </div>

  <button id="go">Generate</button>
  <button type="button" class="test-btn" id="test">Test Voucher Submit (₱5)</button>

  <div class="meta">PREFIX VC | QTY 1 | SALES 0 | PRINT 0</div>

  <div id="out" class="out"></div>

  <script>
    var elAmt  = document.getElementById('amt');
    var elGo   = document.getElementById('go');
    var elTest = document.getElementById('test');
    var elOut  = document.getElementById('out');

    function esc(v){
      return String(v == null ? '' : v).replace(/[&<>"]/g, function(c){
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];
      });
    }

    function showError(msg){
      elOut.className = 'out bad';
      elOut.textContent = '⚠ ' + msg;
    }

    function showCode(code, time){
      elOut.className = 'out ok';
      elOut.innerHTML =
        '<span class="lbl">Voucher Code</span>' +
        '<span class="code" id="vcode">' + esc(code) + '</span>' +
        '<button type="button" class="copy-btn" id="cpy">Copy</button>' +
        '<span class="time">' + esc(time) + '</span>';

      var cpy = document.getElementById('cpy');
      cpy.addEventListener('click', function(){
        var text = code;
        function done(){
          cpy.textContent = 'Copied ✓';
          cpy.classList.add('done');
          setTimeout(function(){
            cpy.textContent = 'Copy';
            cpy.classList.remove('done');
          }, 1800);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(fallback);
        } else {
          fallback();
        }
        function fallback(){
          var ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          try { document.execCommand('copy'); done(); }
          catch (e) { /* ignore */ }
          document.body.removeChild(ta);
        }
      });
    }

    function generate(){
      var amt = elAmt.value.trim();
      if (!/^\d+(\.\d{1,2})?$/.test(amt)) {
        showError('Enter a valid amount (numbers only).');
        elAmt.focus();
        return;
      }
      elGo.disabled   = true;
      elTest.disabled = true;
      elGo.textContent = 'Generating…';

      fetch('?do=1&amt=' + encodeURIComponent(amt), { cache:'no-store' })
        .then(function(r){ return r.json(); })
        .then(function(d){
          if (d.error) {
            showError(d.error);
          } else if (!d.code) {
            showError('No voucher code in response.');
          } else {
            showCode(d.code, d.time);
          }
        })
        .catch(function(){ showError('Request failed. Try again.'); })
        .finally(function(){
          elGo.disabled   = false;
          elTest.disabled = false;
          elGo.textContent = 'Generate';
        });
    }

    elGo.addEventListener('click', generate);

    // Test button: auto-fill ₱5 and submit
    elTest.addEventListener('click', function(){
      elAmt.value = '5';
      generate();
    });

    elAmt.addEventListener('keydown', function(e){
      if (e.key === 'Enter') generate();
    });
    elAmt.focus();
  </script>

</body>
</html>
