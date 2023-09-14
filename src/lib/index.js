// place files you want to import through the `$lib` alias in this folder.
import { dev } from '$app/environment'

const root = dev ? 'http://localhost:5003/v1' : 'https://api.tortugapower.com/v1'

const apiCall = async (method, path, args, token) => {
  const f = fetch(`${root}${path}`, { headers: {'Authorization': `Bearer ${token}`}, method, }).then(resp => resp.json())

  return f
}

export { apiCall }