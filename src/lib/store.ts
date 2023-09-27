import { writable, type StartStopNotifier, type Writable } from 'svelte/store'

const stores = new Map<string, Writable<any>>()

function createWritable<T>(key: string, init?: T, start?: StartStopNotifier<T>): void {
  console.log(`creating store for ${key}, ${init}`)
  let w = writable(init, start)
  stores.set(key, w)
}

function getStore<T>(key: string, init?: T): Writable<any> {
  console.log(`getStore(${key})`)
  if (!stores.has(key)) {
    console.log(`didn't have ${key}, creating with ${init}`)
    createWritable(key, init)
  }
  return stores.get(key)!
}

export { createWritable, getStore }