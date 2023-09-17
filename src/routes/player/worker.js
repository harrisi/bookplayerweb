const get = async ({ data }) => {
  const root = await navigator.storage.getDirectory()
  const synced = await root.getDirectoryHandle('synced')
  .catch(err => {
    // this should (hopefully) only happen on first load, and that means I need to create synced
    console.log(err)
    return
  })

  const pathParts = data.split('/')
  /** @type {FileSystemDirectoryHandle} */
  let dir = synced
  for (let dirName of pathParts.slice(0, pathParts.length - 1)) {
    dir = await dir.getDirectoryHandle(dirName)
    .catch(err => {
      // same thing as above, if it doesn't exist, we need to sync
      console.log(err)
    })
  }

  const fh = await dir.getFileHandle(data.split('/').at(-1))
  .catch(err => console.log(err)) // again, if it doesn't exist..
  const f = await fh.getFile()
  postMessage(URL.createObjectURL(f))
}

self.addEventListener('message', get)