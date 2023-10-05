import { apiCall } from '$lib/api'

const sync = async (path: string, token: string) => {
  return;
  const worker = new Worker(new URL('./sync.worker.ts', import.meta.url), {type: 'module'})
  const resp = await apiCall('GET', `/library?relativePath=${encodeURIComponent(path)}`, null, token)
    .then(res => res.content[0]) // should only ever be one element
    .catch(err => console.log(err))
  
  worker.postMessage({resp, token})
  worker.onmessage = msg => {
    console.log(`(sync) got message from ww: ${JSON.stringify(msg.data)}`)
  }
}

export { sync }