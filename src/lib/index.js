// place files you want to import through the `$lib` alias in this folder.
import { dev } from '$app/environment'

const root = dev ? 'http://localhost:5003/v1' : 'https://api.tortugapower.com/v1'

const apiCall = async (method, path, body, token) => {
  let headers = new Headers()
  if (token) headers.append('Authorization', `Bearer ${token}`)
  if (body) headers.append('Content-Type', 'application/json')
  headers.append('Origin', 'https://bp.fofgof.xyz')
  const opts = {headers, method}
  if (body) {
    opts.body = JSON.stringify(body)
  }
  const f = await fetch(`${root}${path}`, opts).then(resp => resp.json())
  .catch(err => console.error(err))

  return f
}

const library = Object.create(null)

/**
 * @param {Object} args
 * @param {string} [args.relativePath]
 * @param {boolean} [args.sign]
 */
library.getContent = async ({relativePath = '', sign} = {}) => {
  // @ts-ignore
  const searchParams = new URLSearchParams({ relativePath, sign })
  return await apiCall('GET', `/library${searchParams.size ? '' : '?'}${searchParams.toString()}`)
}

const user = Object.create(null)

/**
 * @param {Object} args
 * @param {string} args.id_token
 */
user.login = async ({id_token}) => {
  // @ts-ignore
  return await apiCall('POST', `/user/login`, {body: {token_id: id_token}})
}


export { apiCall, user, library }