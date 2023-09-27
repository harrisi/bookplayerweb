const syncObj = async (e: { data: { resp: any, token: string }}) => {
  const { data } = e
  const { resp, token } = data
  const synced = await (await navigator.storage.getDirectory()).getDirectoryHandle('synced', { create: true })

  if (resp.type == 0) { // directory
    await synced.getDirectoryHandle(resp.title, { create: true })
  } else if (resp.type == 1) { // it's a volume
    // ?
  } else if (resp.type == 2) { // file
    const pathParts = resp.relativePath.split('/')
    /** @type {FileSystemDirectoryHandle} */
    let dir = synced
    for (let dirName of pathParts.slice(0, pathParts.length - 1)) {
      dir = await dir.getDirectoryHandle(dirName, { create: true })
    }
    const fh = await dir.getFileHandle(resp.originalFileName, { create: true })
    const f = await fh.getFile()
    if (f.size > 0) {
      console.log(`${f.name} is not empty`)
      // for now, assume it's the same file, do nothing
    } else {
      // @ts-ignore; typescript doesn't know about `FileSystemSyncAccessHandle`s
      const ah: FileSystemSyncAccessHandle = await fh.createSyncAccessHandle()
      const { url } = await fetch(`https://api.tortugapower.com/v1/library?relativePath=${encodeURIComponent(resp.relativePath)}&sign=true`, {
        headers: { 'Authorization': `Bearer ${token}`},
        method: 'GET',
      }).then(res => res.json()).then(res => res.content[0])
      const file = await fetch(url).then(res => res.blob())
      const buf = await file?.arrayBuffer()
      // this is annoying, but currently (2023-09-18) chromium-based browsers don't implement the spec correctly and don't accept ArrayBuffers.
      const dv = new DataView(buf);
      ah.write(dv)
      ah.close()
    }
  } else {
    // ?
  }
}

const view = async (dir?: FileSystemDirectoryHandle, indent = 0) => {
  if (dir == undefined) dir = await navigator.storage.getDirectory()
  // @ts-ignore; typescript doesn't think I can call `values` but I can.
  for await (const value of dir.values()) {
    switch (value.kind) {
      case 'file': {
        const f = await value.getFile()
        console.log(`${'.'.repeat(indent)}${value.name}: ${f.size}`)
        break
      }
      case 'directory': {
        console.log(`${'.'.repeat(indent)}${value.name}`)
        view(value, indent + 2)
        break
      }
      default: console.log('got something else?')
    }
  }
}

const viewX = async () => {
  view()
}

self.addEventListener('message', console.log)