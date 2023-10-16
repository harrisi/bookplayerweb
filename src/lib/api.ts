// place files you want to import through the `$lib` alias in this folder.
import { browser, dev } from '$app/environment'
import type { HttpMethod } from '@sveltejs/kit'
import type { Bookmark, Item } from './types'

const root = dev ? 'http://localhost:5003/v1' : 'https://api.tortugapower.com/v1'

const raw = async (method: HttpMethod, path: string, body?: BodyInit | object | null, keepalive?: boolean) => {
  const token = browser ? localStorage.getItem('token') : ''
  let headers = new Headers()
  if (token) {
    headers.append('Authorization', `Bearer ${token}`)
  }
  if (body) {
    headers.append('Content-Type', 'application/json')
  }
  if (browser) {
    headers.append('Origin', dev ? 'https://bp.fofgof.xyz' : window.location.href)
  }
  const opts: RequestInit = {headers, method}
  if (body) {
    opts.body = JSON.stringify(body)
  }
  if (keepalive) {
    opts.keepalive = true
  }
  const f = await fetch(`${root}${path}`, opts).then(resp => resp.json())
  .catch(err => console.error(err))

  return f
}

const apiCall = Object.freeze({
  get: async (path: string, keepalive?: boolean) => {
    return raw('GET', path, null, keepalive)
  },

  put: async (path: string, body: BodyInit | object, keepalive?: boolean) => {
    return raw('PUT', path, body, keepalive)
  },

  post: async (path: string, body: BodyInit | object, keepalive?: boolean) => {
    return raw('POST', path, body, keepalive)
  },

  delete: async (path: string, body?: BodyInit | object | null, keepalive?: boolean) => {
    return raw('DELETE', path, body, keepalive)
  },
})

const library = Object.freeze({
  getContent: async ({relativePath, sign, noLastItemPlayed}: {relativePath?: string, sign?: boolean, noLastItemPlayed?: boolean}, keepalive?: boolean) => {
    let path = '/library'
    let inCache: string | null | undefined
    let params = []
    const expired = (e: string) => {
      const asInt = parseInt(e)
      // set now as 30 seconds in the future. if expires_in is that close, just get a new url anyway.
      const now = Math.round(Date.now() / 1000) + 30
      return asInt <= now
    }

    if (relativePath) params.push(`relativePath=${encodeURIComponent(relativePath)}`)
    // we want the url
    if (sign != undefined) {
      inCache = localStorage.getItem(`relativePath=${relativePath ?? '/'}`)
      const expiresIn = localStorage.getItem(`expiresIn=${relativePath ?? '/'}`)
      if (inCache) {
        if (!expiresIn || expired(expiresIn)) {
          params.push(`sign=${encodeURIComponent(sign)}`)
        }
      } else {
        params.push(`sign=${encodeURIComponent(sign)}`)
      }
    }
    if (noLastItemPlayed != undefined) params.push(`noLastItemPlayed=${encodeURIComponent(noLastItemPlayed)}`)

    if (params.length) path += '?' + params.join('&')
    let res = await apiCall.get(path, keepalive).catch(console.error)
    let i = 0
    for (let item of res.content) {
      // this will happen if sign=true and the url isn't expired
      if (item.url) {
        console.log(`${item.relativePath}.url: ${item.url}`)
        localStorage.setItem(`relativePath=${item.relativePath ?? '/'}`, item.url)
        localStorage.setItem(`expiresIn=${item.relativePath ?? '/'}`, item.expires_in)
      } else {
        // but if we passed sign, we still want to add the url from cache.
        if (sign) {
          const itemInCache = localStorage.getItem(`relativePath=${item.relativePath ?? '/'}`)
          res.content[i].url = itemInCache
        }
      }
      i++
    }
    return res
  },

  getKeys: async (keepalive?: boolean) => {
    return await apiCall.get('/library/keys', keepalive)
    .then(res => res.content)
    .catch(console.error)
  },

  createItem: async (item: Item, keepalive?: boolean) => {
    return await apiCall.put('/library', item, keepalive)
  },

  updateMetadata: async (metadata: Item, keepAlive?: boolean) => {
    return await apiCall.post('/library', metadata, keepAlive).catch(console.error)
  },

  moveItem: async (src: Item | string, dest: Item | string, keepalive?: boolean) => {
    let origin = (typeof src === 'string') ? src : src.relativePath
    let destination = (typeof dest === 'string') ? dest : dest.relativePath
    return await apiCall.post('/library/move', { origin, destination }, keepalive)
  },

  renameFolder: async (src: Item | string, dest: Item | string, keepalive?: boolean) => {
    let relativePath = (typeof src === 'string') ? src : src.relativePath
    let newName = (typeof dest === 'string') ? dest : dest.relativePath
    return await apiCall.post('/library/rename', { relativePath, newName }, keepalive)
  },

  deleteItem: async (item: Item | string, keepalive?: boolean) => {
    let relativePath = (typeof item === 'string') ? item : item.relativePath
    return await apiCall.delete('/library', { relativePath }, keepalive)
  },

  deleteFolder: async (item: Item | string, keepalive?: boolean) => {
    let relativePath = (typeof item === 'string') ? item : item.relativePath
    return await apiCall.delete(`/library/folder_in_out?relativePath=${encodeURIComponent(relativePath)}`, null, keepalive)
  },

  uploadArtwork: async (item: Item | string, thumbnail: string, artwork: BodyInit, keepalive?: boolean) => {
    let relativePath = (typeof item === 'string') ? item : item.relativePath
    let thumbnail_name = thumbnail
    let url = await apiCall.post('/library/thumbnail_set', { relativePath, thumbnail_name, uploaded: false }, keepalive)
      .then(res => res.thumbnail_url)
    await fetch(url, {
      method: 'POST',
      body: artwork,
    })
    return await apiCall.post('/library/thumbnail_set', { relativePath, thumbnail_name, uploaded: true }, keepalive)
  },

  getBookmarks: async (item?: Item | string, keepalive?: boolean): Promise<Bookmark[]> => {
    let relativePath = (typeof item === 'string') ? item : (item?.relativePath ?? '')
    return await apiCall.post('/library/bookmarks', { relativePath }, keepalive).then(res => res.bookmarks)
  },

  updateBookmarks: async (item: Item | string, bookmark: Bookmark, keepalive?: boolean) => {
    let key = (typeof item === 'string') ? item : (item.relativePath)
    return await apiCall.put('/library/bookmark', { key, ...bookmark }, keepalive)
  },

  getLastPlayed: async (keepalive?: boolean) => {
    return await apiCall.get('/library/last_played', keepalive).then(res => res.lastItemPlayed)
  },
})

const user = Object.freeze({
  login: async ({id_token}: {id_token: string}, keepalive?: boolean) => {
    return await apiCall.post('/user/login', {token_id: id_token}, keepalive)
  },

  getInfo: async (keepalive?: boolean) => {
    return await apiCall.get('/user', keepalive).then(res => res.user)
  },

  delete: async (keepalive?: boolean) => {
    return await apiCall.delete('/user/delete', null, keepalive)
  }
})

export { user, library }