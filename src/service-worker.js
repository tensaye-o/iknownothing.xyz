import { manifest, version } from '@parcel/service-worker'

async function install() {
  const cache = await caches.open(version)
  await cache.addAll(manifest)
}

async function activate() {
  const keys = await caches.keys()
  await Promise.all(keys.map((key) => key !== version && caches.delete(key)))
}

async function match(e) {
  const res = await caches.match(e.request)
  return res || fetch(e.request)
}

addEventListener('install', (e) => e.waitUntil(install()))
addEventListener('activate', (e) => e.waitUntil(activate()))
addEventListener('fetch', (e) => e.respondWith(match(e)))
