// 앱 파일을 수정한 뒤에는 아래 버전 숫자를 올려 주세요 (v1 → v2).
const CACHE = "beopmusa-planner-v8";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png", "favicon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  // 페이지: 인터넷이 되면 최신 버전, 안 되면 저장된 버전
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(res => { caches.open(CACHE).then(c => c.put("index.html", res.clone())); return res; })
      .catch(() => caches.match("index.html")));
    return;
  }
  // 아이콘, 글꼴 등: 저장된 것을 먼저 쓰고 뒤에서 갱신
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(res => {
      if (res.ok || res.type === "opaque") { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => hit);
    return hit || net;
  }));
});
