import { writable, type StartStopNotifier, type Writable, type Readable } from 'svelte/store'

const stores = new Map<string, Readable<any> | Writable<any>>()

function createWritable<T>(key: string, init?: T, start?: StartStopNotifier<T>): Writable<T> {
  let w = writable(init, start)
  stores.set(key, w)
  return w
}

function getStore(key: string): Readable<any> | Writable<any> {
  let store = stores.get(key)
  if (store == undefined) {
    store = createWritable(key)
  }
  return store
}

export { createWritable, getStore }