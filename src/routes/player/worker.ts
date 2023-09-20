const get = async ({ data }: {data: {relativePath: string }}) => {
  const { relativePath } = data
  const root = await navigator.storage.getDirectory()
  const synced = await root.getDirectoryHandle('synced', { create: true }).catch((err) => {
    // this should (hopefully) only happen on first load, and that means I need to create synced
    console.log(err)
    throw new Error(err)
  })

  const pathParts = relativePath.split('/')
  let dir = synced
  for (let dirName of pathParts.slice(0, pathParts.length - 1)) {
    dir = await dir.getDirectoryHandle(dirName, { create: true }).catch((err) => {
      // same thing as above, if it doesn't exist, we need to sync
      throw new Error(err)
    })
  }

  const fh = await dir.getFileHandle(relativePath.split('/').at(-1) ?? '')
  const f = await fh.getFile()
  if (f.size == 0) {
    postMessage('')
    return
  }
  const u = URL.createObjectURL(f)
  postMessage(u)
}

self.addEventListener('message', get)
