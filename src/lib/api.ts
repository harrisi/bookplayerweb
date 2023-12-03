import { browser, dev } from '$app/environment'
import type { HttpMethod } from '@sveltejs/kit'
import type { Bookmark, Item } from './types'
import { settings } from '$lib/settings'
import { get } from 'svelte/store'

const root = dev
  ? 'http://localhost:5003/v1'
  : (get(settings).experimental.apiBeta.opt
  ? 'https://api-staging.tortugapower.com/v1'
  : 'https://api.tortugapower.com/v1')

const thenResp = (resp: Response) => {
  if (resp.ok) {
    return resp.json()
  }
  else {
    console.log(`fetch failed:`)
    console.dir(resp)
    return resp.status
  }
}

const raw = async (method: HttpMethod, path: string, body?: BodyInit | object | null, headers?: HeadersInit) => {
  const token = browser ? localStorage.getItem('token') : ''
  headers = new Headers(headers)
  if (token) {
    headers.append('Authorization', `Bearer ${token}`)
  }
  if (body) {
    headers.append('Content-Type', 'application/json')
  }
  if (browser) {
    headers.append('Origin', dev ? 'https://bp.fofgof.xyz' : window.location.href)
  }
  if (get(settings).experimental.apiBeta.opt) {
    headers.append('Accept-Version', 'latest')
  }
  const opts: RequestInit = {headers, method}
  if (body) {
    opts.body = JSON.stringify(body)
  }
  // headers.append('If-Modified-Since', new Date().toUTCString())
  const f = await fetch(`${root}${path}`, opts)
    .then(thenResp)
    .catch(console.error)

  return f
}

const apiCall = Object.freeze({
  get: (path: string, headers?: HeadersInit) => {
    return raw('GET', path, null, headers)
  },

  put: async (path: string, body: BodyInit | object, headers?: HeadersInit) => {
    return raw('PUT', path, body, headers)
  },

  post: async (path: string, body: BodyInit | object, headers?: HeadersInit) => {
    return raw('POST', path, body, headers)
  },

  delete: async (path: string, body?: BodyInit | object | null, headers?: HeadersInit) => {
    return raw('DELETE', path, body, headers)
  },
})

const library = Object.freeze({
  getContent: async ({relativePath, sign, noLastItemPlayed}: {relativePath?: string, sign?: boolean, noLastItemPlayed?: boolean}, headers?: HeadersInit) => {
    let path = '/library'
    // let inCache: string | null | undefined
    let params = []
    // const getDate = (c: string) => Date.parse(`${c.substring(0, 4)}-${c.substring(4,6)}-${c.substring(6,11)}:${c.substring(11,13)}:${c.substring(13)}`) / 1000
    // const expired = (e: string) => {
    //   let url = new URL(e)
    //   let createdAt = url.searchParams.get('X-Amz-Date')
    //   let expiresIn = url.searchParams.get('X-Amz-Expires')
    //   if (!createdAt || !expiresIn) return true
    //   return (getDate(createdAt) + parseInt(expiresIn)) >= (Date.now() / 1000) + 30
    // }

    if (relativePath) params.push(`relativePath=${encodeURIComponent(relativePath)}`)
    // we want the url
    if (sign) {
      // inCache = localStorage.getItem(`relativePath=${relativePath ?? '/'}`)
      // if (!inCache) {
        params.push(`sign=${encodeURIComponent(sign)}`)
      // } else {
        // if (expired(inCache)) {
          params.push(`sign=${encodeURIComponent(sign)}`)
        // }
      // }
    }
    if (noLastItemPlayed != undefined) params.push(`noLastItemPlayed=${encodeURIComponent(noLastItemPlayed)}`)

    if (params.length) path += '?' + params.join('&')
    let res
    try {
      res = await apiCall.get(path, headers).catch(err => {
        console.log('got err from getContent')
        console.error(err)
      })
    } catch (err) {
      console.log('getContent try')
      console.error(err)
    }
    // let i = 0
    // for (let item of res.content) {
    //   // this will happen if sign=true and the url isn't expired
    //   if (item.url) {
    //     localStorage.setItem(`relativePath=${item.relativePath ?? '/'}`, item.url)
    //   } else {
    //     // but if we passed sign, we still want to add the url from cache.
    //     if (sign) {
    //       const itemInCache = localStorage.getItem(`relativePath=${item.relativePath ?? '/'}`)
    //       res.content[i].url = itemInCache
    //     }
    //   }
    //   i++
    // }
    return res
  },

  getKeys: async (headers?: HeadersInit) => {
    return await apiCall.get('/library/keys', headers)
    .then(res => res.content)
    .catch(console.error)
  },

  createItem: async (item: Item, headers?: HeadersInit) => {
    return await apiCall.put('/library', item, headers).then(res => res.content)
  },

  updateMetadata: async (metadata: Item, headers?: HeadersInit) => {
    return await apiCall.post('/library', metadata, headers).then(res => res.content)
  },

  moveItem: async (src: Item | string, dest: Item | string, headers?: HeadersInit) => {
    let origin = (typeof src === 'string') ? src : src.relativePath
    let destination = (typeof dest === 'string') ? dest : dest.relativePath
    return await apiCall.post('/library/move', { origin, destination }, headers)
  },

  renameFolder: async (src: Item | string, dest: Item | string, headers?: HeadersInit) => {
    let relativePath = (typeof src === 'string') ? src : src.relativePath
    let newName = (typeof dest === 'string') ? dest : dest.relativePath
    return await apiCall.post('/library/rename', { relativePath, newName }, headers)
  },

  deleteItem: async (item: Item | string, headers?: HeadersInit) => {
    let relativePath = (typeof item === 'string') ? item : item.relativePath
    return await apiCall.delete('/library', { relativePath }, headers)
  },

  deleteFolder: async (item: Item | string, headers?: HeadersInit) => {
    let relativePath = (typeof item === 'string') ? item : item.relativePath
    return await apiCall.delete(`/library/folder_in_out?relativePath=${encodeURIComponent(relativePath)}`, null, headers)
  },

  uploadArtwork: async (item: Item | string, thumbnail: string, artwork: BodyInit, headers?: HeadersInit) => {
    let relativePath = (typeof item === 'string') ? item : item.relativePath
    let thumbnail_name = thumbnail
    let url = await apiCall.post('/library/thumbnail_set', { relativePath, thumbnail_name, uploaded: false }, headers)
      .then(res => res.thumbnail_url)
    await fetch(url, {
      method: 'POST',
      body: artwork,
    })
    return await apiCall.post('/library/thumbnail_set', { relativePath, thumbnail_name, uploaded: true }, headers)
  },

  getBookmarks: async (item?: Item | string, headers?: HeadersInit): Promise<Bookmark[]> => {
    let relativePath = (typeof item === 'string') ? item : (item?.relativePath ?? '')
    return await apiCall.post('/library/bookmarks', { relativePath }, headers).then(res => res.bookmarks)
  },

  updateBookmarks: async (item: Item | string, bookmark: Bookmark, headers?: HeadersInit) => {
    let key = (typeof item === 'string') ? item : (item.relativePath)
    return await apiCall.put('/library/bookmark', { key, ...bookmark }, headers)
  },

  getLastPlayed: async (sign = true, headers?: HeadersInit) => {
    return await apiCall.get(`/library/last_played${sign ? '?sign=true' : ''}`, headers).then(res => res.lastItemPlayed)
  },
})

const user = Object.freeze({
  login: async ({id_token}: {id_token: string}, headers?: HeadersInit) => {
    return await apiCall.post('/user/login', {token_id: id_token}, headers)
  },

  getInfo: async (headers?: HeadersInit) => {
    return await apiCall.get('/user', headers).then(res => res.user)
  },

  delete: async (headers?: HeadersInit) => {
    return await apiCall.delete('/user/delete', null, headers)
  }
})

const storage = Object.freeze({
  getFile: async(item: {relativePath: string}, range?: string, headers?: HeadersInit) => {
    if (!get(settings).experimental.apiBeta.opt) return Promise.reject('unreachable')
    const h = new Headers(headers)
    if (range) h.set('Range', range)
    return await apiCall.get(`/storage/${encodeURIComponent(item.relativePath)}`, h)
  }
})

export { user, library, storage }