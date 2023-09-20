// place files you want to import through the `$lib` alias in this folder.
import { dev } from '$app/environment'

const root = dev ? 'http://localhost:5003/v1' : 'https://api.tortugapower.com/v1'

const apiCall = async (method: string, path: string, body?: BodyInit | object | null, token?: string, keepalive?: boolean) => {
  let headers = new Headers()
  if (token) headers.append('Authorization', `Bearer ${token}`)
  if (body) headers.append('Content-Type', 'application/json')
  headers.append('Origin', 'https://bp.fofgof.xyz')
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

const library = Object.create(null)

library.getContent = async ({relativePath = '', sign}: {relativePath: string, sign?: boolean}) => {
  const searchParams = new URLSearchParams({relativePath})
  if (sign !== undefined) {
    searchParams.append('sign', String(sign))
  }
  return await apiCall('GET', `/library${searchParams.size ? '' : '?'}${searchParams.toString()}`)
}

const user = Object.create(null)

user.login = async ({id_token}: {id_token: string}) => {
  return await apiCall('POST', `/user/login`, {token_id: id_token})
}


export { apiCall, user, library }