import { writable, type StartStopNotifier, type Writable } from 'svelte/store'

const stores = new Map<string, Writable<any>>()

function createWritable<T>(key: string, init?: T, start?: StartStopNotifier<T>): void {
  let w = writable(init, start)
  stores.set(key, w)
}

function getStore<T>(key: string, init?: T): Writable<any> {
  if (!stores.has(key)) {
    createWritable(key, init)
  }
  return stores.get(key)!
}

export { getStore }