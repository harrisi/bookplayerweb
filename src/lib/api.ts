// place files you want to import through the `$lib` alias in this folder.
import { browser, dev } from '$app/environment'

const root = dev ? 'http://localhost:5003/v1' : 'https://api.tortugapower.com/v1'

const apiCall = async (method: string, path: string, body?: BodyInit | object | null, keepalive?: boolean) => {
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

const library = Object.freeze({
  getContent: async ({relativePath, sign}: {relativePath?: string, sign?: boolean}) => {
    let path = '/library'
    let params = []
    if (relativePath) params.push(`relativePath=${encodeURIComponent(relativePath)}`)
    if (sign != undefined) params.push(`sign=${encodeURIComponent(sign)}`)
    if (params.length) path += '?' + params.join('&')
    return await apiCall('GET', path).catch(console.error)
  },

  getKeys: async () => {
    return await apiCall('GET', '/library/keys').catch(console.error)
  },

  createItem: async () => {
    return await Promise.resolve('not yet implemented')
  },

  updateMetadata: async (opts: {
    relativePath: string,
    originalFileName?: string,
    title?: string,
    details?: string,
    currentTime?: number,
    duration?: number,
    percentCompleted?: number,
    isFinished?: boolean,
    orderRank?: number,
    type?: 0 | 1 | 2,
    lastPlayDateTimestamp?: number,
    speed?: number,
  }, keepAlive?: boolean) => {
    return await apiCall('POST', '/library', opts, keepAlive).catch(console.error)
  },

  moveItem: async () => {
    return await Promise.resolve('not yet implemented')
  },

  renameFolder: async () => {
    return await Promise.resolve('not yet implemented')
  },

  deleteItem: async () => {
    return await Promise.resolve('not yet implemented')
  },

  deleteFolder: async () => {
    return await Promise.resolve('not yet implemented')
  },

  uploadArtwork: async () => {
    return await Promise.resolve('not yet implemented')
  },

  getBookmarks: async () => {
    return await Promise.resolve('not yet implemented')
  },

  updateBookmarks: async () => {
    return await Promise.resolve('not yet implemented')
  },

  getLastPlayed: async () => {
    return await Promise.resolve('not yet implemented')
  },
})


const user = Object.freeze({
  login: async ({id_token}: {id_token: string}) => {
    return await apiCall('POST', `/user/login`, {token_id: id_token})
  },

  getInfo: async () => {
    return await Promise.resolve('not yet implemented')
  },

  deleteUser: async () => {
    return await Promise.resolve('not yet implemented')
  },
})

export { user, library }