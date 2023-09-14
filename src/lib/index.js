// place files you want to import through the `$lib` alias in this folder.
import { dev } from '$app/environment'

const root = dev ? 'http://localhost:5003/v1' : 'https://api.tortugapower.com/v1'

const apiCall = async (method, path, args, token) => {
  let headers = Object.create(null)
  if (token) headers.Authorization = `Bearer ${token}`
  if (dev) headers.Origin = 'https://bp.fofgof.xyz'
  const f = fetch(`${root}${path}`, { headers, method, ...args }).then(resp => resp.json())

  return f
}

export { apiCall }