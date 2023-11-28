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

let authToken: string | undefined = undefined

self.addEventListener('message', e => {
  console.log('message')
  console.log(e)
  if (e.data && e.data.type === 'SET_TOKEN') {
    authToken = e.data.token
  }
})

self.addEventListener('fetch', (event) => {
  // this is just here because I was having some weird typescript issues.
  const fe = event as FetchEvent
  // ignore POST requests etc
	// @ts-ignore
  if (fe.request.method !== 'GET') return
	// @ts-ignore
  // don't cache S3 fetches here because we're using OPFS for this
  // if (url.hostname.includes('amazonaws.com')) return

  async function respond() {
    const cache = await caches.open(CACHE)
    const url = new URL(fe.request.url)

    // `build`/`files` can always be served from the cache
    if (ASSETS.includes(url.pathname)) {
      return cache.match(url.pathname)
    }

    // for everything else, try the network first, but
    // fall back to the cache if we're offline
    let r = fe.request

    let headers: Headers | undefined
    // this is just for the audio player, to inject the auth header.
    if (url.pathname.startsWith('/v1/storage/')) {
      console.log('token', authToken)

      // url.searchParams.delete('token')

      headers = new Headers(fe.request.headers)
      headers.set('Authorization', `Bearer ${authToken}`)

      r = new Request(url, {
        method: fe.request.method,
        headers: headers,
        mode: fe.request.mode,
        credentials: fe.request.credentials,
        redirect: fe.request.redirect,
        referrer: fe.request.referrer,
        body: fe.request.bodyUsed ? fe.request.body : null
      })
    }

    try {
      // @ts-ignore
      const response = await fetch(r)

      if (response.status === 200) {
        // @ts-ignore
        cache.put(r, response.clone())
      }

      return response
    } catch {
      // @ts-ignore
      return cache.match(r)
    }
  }

	// @ts-ignore
  fe.respondWith(respond())
})