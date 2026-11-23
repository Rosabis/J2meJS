/**
 * evalNative 约定桥：
 * - 若宿主（KaiOS / App WebView 等）已注入 evalNative，则不覆盖，走本地实现；
 * - 否则安装 WebSocket 回退（同源 /ws/tcp）+ fetch HTTP。
 *
 * 兼容 midp/socket.js：connectSocket / onSocket / invokeSocket / request
 */
(function (global) {
  "use strict";

  if (typeof global.evalNative === "function" && !global.evalNative.__j2meWsFallback) {
    try {
      console.log("[evalNative] host-provided, skip WS fallback");
    } catch (e) {}
    return;
  }

  var WS_PATH = "/ws/tcp";
  /** EdgeOne 同源 WS 不可用时，走 qq 反代到私服 */
  var REMOTE_WS_HOST = "qq.zixing.fun";
  var nextId = 1;
  var sockets = Object.create(null);
  var ws = null;
  var wsQueue = [];
  var pingTimer = null;

  function wsUrl() {
    // ?ws=wss://host/ws/tcp 或 window.__J2ME_WS_URL 可强制覆盖
    try {
      if (typeof global.__J2ME_WS_URL === "string" && global.__J2ME_WS_URL) {
        return global.__J2ME_WS_URL;
      }
      var q = new URLSearchParams(location.search || "");
      var forced = q.get("ws");
      if (forced) {
        if (forced.indexOf("ws://") === 0 || forced.indexOf("wss://") === 0) return forced;
        return (location.protocol === "https:" ? "wss:" : "ws:") + "//" + forced.replace(/^\/\//, "") +
          (forced.indexOf("/") >= 0 ? "" : WS_PATH);
      }
    } catch (e) {}

    var host = (location.hostname || "").toLowerCase();
    // 本地调试：同源（本机 node 桥 / 私服）
    if (host === "127.0.0.1" || host === "localhost" || host === "qq.zixing.fun" || host === "music.zixing.fun") {
      var proto = location.protocol === "https:" ? "wss:" : "ws:";
      return proto + "//" + location.host + WS_PATH;
    }
    // java.zixing.fun 等：跨域连私服 WebSocket
    return "wss://" + REMOTE_WS_HOST + WS_PATH;
  }

  /** EdgeOne / 部分网关会把文本帧以 ArrayBuffer/Blob 下发 */
  function decodeWsText(data, cb) {
    try {
      if (data == null) {
        cb("");
        return;
      }
      if (typeof data === "string") {
        cb(data);
        return;
      }
      if (typeof Blob !== "undefined" && data instanceof Blob) {
        var fr = new FileReader();
        fr.onload = function () {
          cb(String(fr.result || ""));
        };
        fr.onerror = function () {
          cb("");
        };
        fr.readAsText(data);
        return;
      }
      if (typeof ArrayBuffer !== "undefined" && data instanceof ArrayBuffer) {
        cb(typeof TextDecoder !== "undefined" ? new TextDecoder("utf-8").decode(data) : ab2str(data));
        return;
      }
      if (data && data.buffer instanceof ArrayBuffer) {
        var u8 = data instanceof Uint8Array ? data : new Uint8Array(data.buffer, data.byteOffset || 0, data.byteLength || data.buffer.byteLength);
        cb(typeof TextDecoder !== "undefined" ? new TextDecoder("utf-8").decode(u8) : ab2str(u8.buffer));
        return;
      }
      cb(String(data));
    } catch (e) {
      console.error("[evalNative] decodeWsText", e);
      cb("");
    }
  }

  function ab2str(buf) {
    var u8 = new Uint8Array(buf);
    var out = "";
    for (var i = 0; i < u8.length; i++) out += String.fromCharCode(u8[i]);
    try {
      return decodeURIComponent(escape(out));
    } catch (e) {
      return out;
    }
  }

  function ensureWs(cb) {
    if (ws && ws.readyState === 1) {
      cb();
      return;
    }
    wsQueue.push(cb);
    if (ws && ws.readyState === 0) return;

    ws = new WebSocket(wsUrl());
    // 勿固定 arraybuffer：EdgeOne 常把 JSON 当二进制帧下发，需按类型解码
    ws.onopen = function () {
      var q = wsQueue.splice(0, wsQueue.length);
      for (var i = 0; i < q.length; i++) {
        try {
          q[i]();
        } catch (e) {
          console.error(e);
        }
      }
      if (pingTimer) clearInterval(pingTimer);
      pingTimer = setInterval(function () {
        if (ws && ws.readyState === 1) {
          try {
            ws.send(JSON.stringify({ type: "ping" }));
          } catch (e) {}
        }
      }, 25000);
    };
    ws.onmessage = function (ev) {
      decodeWsText(ev.data, function (text) {
        if (!text) return;
        var msg;
        try {
          msg = JSON.parse(text);
        } catch (e) {
          console.warn("[evalNative] bad ws json", text.slice(0, 80));
          return;
        }
        if (msg.type === "pong" || msg.type === "ready" || msg.type === "ack") {
          try { console.log("[evalNative] <<", msg.type, msg.v || "", msg.got || ""); } catch (e) {}
          return;
        }
        if (msg.type === "event" && msg.id != null) {
          try { console.log("[evalNative] << event", msg.event, msg.id, msg.message || ""); } catch (e) {}

          var sock = sockets[String(msg.id)];
          if (!sock) return;
          var payload = {
            event: msg.event,
            data: msg.data,
            message: msg.message,
            host: msg.host,
            port: msg.port,
          };
          var ls = sock.listeners.slice();
          for (var i = 0; i < ls.length; i++) {
            try {
              ls[i](payload);
            } catch (e) {
              console.error(e);
            }
          }
        }
      });
    };
    ws.onclose = function () {
      if (pingTimer) {
        clearInterval(pingTimer);
        pingTimer = null;
      }
      ws = null;
      Object.keys(sockets).forEach(function (id) {
        var sock = sockets[id];
        if (!sock) return;
        sock.listeners.forEach(function (fn) {
          try {
            fn({ event: "close" });
          } catch (e) {}
        });
      });
    };
    ws.onerror = function () {};
  }

  function send(obj) {
    ensureWs(function () {
      if (ws && ws.readyState === 1) ws.send(JSON.stringify(obj));
    });
  }

  function rewriteHttpUrl(url) {
    if (!url) return url;
    try {
      url = String(url)
        .replace(/^https?:\/\/music\.zixing\.fun(?::\d+)?/i, "https://qq.zixing.fun")
        .replace(/^https?:\/\/127\.0\.0\.1:14001/i, "https://qq.zixing.fun");
      if (url.indexOf("http://") === 0 || url.indexOf("https://") === 0) {
        var u = new URL(url, location.href);
        if (u.host === location.host) {
          return u.pathname + u.search + u.hash;
        }
      }
    } catch (e) {}
    return url;
  }

  function handleRequest(args, callback) {
    var url = rewriteHttpUrl(args.url || "");
    var method = (args.method || "GET").toUpperCase();
    var headers = args.headers || {};
    var body = undefined;
    if (method !== "GET" && method !== "HEAD" && args.data) {
      if (args.encoding === "base64") {
        var bin = atob(args.data);
        var u8 = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
        body = u8;
      } else {
        body = args.data;
      }
    }

    var cross =
      typeof url === "string" &&
      (url.indexOf("http://") === 0 || url.indexOf("https://") === 0);
    fetch(url, {
      method: method,
      headers: headers,
      body: body,
      credentials: cross ? "omit" : "same-origin",
      mode: cross ? "cors" : "same-origin",
    })
      .then(function (res) {
        return res.arrayBuffer().then(function (buf) {
          var u8 = new Uint8Array(buf);
          var CHUNK = 0x8000;
          var parts = [];
          for (var k = 0; k < u8.length; k += CHUNK) {
            var slice = u8.subarray(k, k + CHUNK);
            var str = "";
            for (var m = 0; m < slice.length; m++) str += String.fromCharCode(slice[m]);
            parts.push(str);
          }
          var dataB64 = btoa(parts.join(""));
          var hdrs = {};
          res.headers.forEach(function (v, k) {
            hdrs[k] = v;
          });
          callback &&
            callback({
              statusCode: res.status,
              headers: hdrs,
              data: dataB64,
              encoding: "base64",
            });
        });
      })
      .catch(function (err) {
        callback && callback({ error: String((err && err.message) || err), statusCode: -1 });
      });
  }

  function evalNative(cmd, args, callback) {
    args = args || {};
    if (cmd === "connectSocket") {
      var id = String(nextId++);
      sockets[id] = { listeners: [] };
      send({
        type: "connect",
        id: id,
        host: args.host || "127.0.0.1",
        port: args.port | 0,
        timeout: args.timeout || 3000,
      });
      return id;
    }
    if (cmd === "openDatagram") {
      var did = String(nextId++);
      sockets[did] = { listeners: [], udp: true };
      send({
        type: "udp_open",
        id: did,
        host: args.host || "0.0.0.0",
        port: args.port | 0,
        bindPort: args.bindPort | 0,
        timeout: args.timeout || 3000,
      });
      return did;
    }
    if (cmd === "onSocket") {
      var sid = String(args.id);
      if (!sockets[sid]) sockets[sid] = { listeners: [] };
      if (typeof callback === "function") sockets[sid].listeners.push(callback);
      return;
    }
    if (cmd === "invokeSocket") {
      var method = args.method || "";
      if (method === "write") {
        send({ type: "write", id: String(args.id), data: args.data || "" });
      } else if (method === "udpSend") {
        send({
          type: "udp_send",
          id: String(args.id),
          host: args.host || "127.0.0.1",
          port: args.port | 0,
          data: args.data || "",
        });
      } else if (method === "destroy" || method === "close") {
        send({ type: "destroy", id: String(args.id) });
        delete sockets[String(args.id)];
      }
      return;
    }
    if (cmd === "request") {
      handleRequest(args, callback);
      return;
    }
    console.warn("[evalNative] unknown cmd", cmd, args);
    if (typeof callback === "function") callback({ error: "unknown cmd " + cmd });
  }

  evalNative.__j2meWsFallback = true;
  global.evalNative = evalNative;
  try {
    console.log("[evalNative] WS fallback installed →", wsUrl());
  } catch (e) {}
})(typeof window !== "undefined" ? window : this);
