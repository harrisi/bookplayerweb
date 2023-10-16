import { library } from '$lib/api'

const sync = async (relativePath: string) => {
  const worker = new Worker(new URL('./sync.worker.ts', import.meta.url), {type: 'module'})
  const resp = await library.getContent({relativePath}).then(res => res.content[0]).catch(console.error)
  
  worker.postMessage({resp})
  worker.onmessage = msg => {
    console.log(`(sync) got message from ww: ${JSON.stringify(msg.data)}`)
  }
}

export { sync }