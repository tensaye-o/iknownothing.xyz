import { manifest, version } from '@parcel/service-worker'

async function install() {
  const cache = await caches.open(version)
  await cache.addAll(manifest)
}

async function activate() {
  const keys = await caches.keys()
  await Promise.all(keys.map((key) => key !== version && caches.delete(key)))
}

async function fetching(e) {
  const req = e.request
  const res = await caches.match(req)
  return res || fetch(req)
}

addEventListener('install', (e) => e.waitUntil(install()))
addEventListener('fetch', (e) => e.respondWith(fetching(e)))
addEventListener('activate', (e) => e.waitUntil(activate()))
