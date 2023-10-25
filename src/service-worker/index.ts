/// <reference types="@sveltejs/kit" />
import { build, files, version } from '$service-worker'

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`

const ASSETS = [
  ...build, // the app itself
  ...files, // everything in `static`
]

self.addEventListener('install', (event) => {
  // Create a new cache and add all files to it
  async function addFilesToCache() {
    const cache = await caches.open(CACHE)
    await cache.addAll(ASSETS)
  }

	// @ts-ignore
  event.waitUntil(addFilesToCache())
})

self.addEventListener('activate', (event) => {
  // Remove previous cached data from disk
  async function deleteOldCaches() {
    for (const key of await caches.keys()) {
      if (key !== CACHE) await caches.delete(key)
    }
  }

	// @ts-ignore
  event.waitUntil(deleteOldCaches())
})

self.addEventListener('fetch', (event) => {
  // ignore POST requests etc
	// @ts-ignore
  if (event.request.method !== 'GET') return
	// @ts-ignore
  const url = new URL(event.request.url)
  // don't cache S3 fetches here because we're using OPFS for this
  // if (url.hostname.includes('amazonaws.com')) return

  async function respond() {
    const cache = await caches.open(CACHE)

    // `build`/`files` can always be served from the cache
    if (ASSETS.includes(url.pathname)) {
      return cache.match(url.pathname)
    }

    // for everything else, try the network first, but
    // fall back to the cache if we're offline
    try {
      // @ts-ignore
      const response = await fetch(event.request)

      if (response.status === 200 && !url.hostname.includes('amazonaws.com')) {
        // @ts-ignore
        cache.put(event.request, response.clone())
      }

      return response
    } catch {
      // @ts-ignore
      return cache.match(event.request)
    }
  }

	// @ts-ignore
  event.respondWith(respond())
})
