<script lang='ts'>
  import { onMount } from 'svelte'

  function scanFiles(item: FileSystemEntry) {
    if (item instanceof FileSystemDirectoryEntry /*.isDirectory*/) {
      let directoryReader = item.createReader()
      // console.log(`directory:`)
      // console.dir(item)
      directoryReader.readEntries((entries) => {
        entries.forEach((entry) => {
          scanFiles(entry)
        })
      })
    } else {
      // sync()
      // console.log(`file:`)
      // console.dir(item)
    }
  }

  const drop = (e: DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer == null) return

    let items = e.dataTransfer.items

    for (let i = 0; i < items.length; i++) {
      let item = items[i].webkitGetAsEntry()

      if (item) {
        scanFiles(item)
      }
    }
  }

  export let dragging = false

  onMount(() => {

    document.addEventListener('dragover', e => {
      e.preventDefault() // Prevent default to allow drop
      e.stopPropagation()
      dragging = true
      console.log('dragging = true')
    })

    document.addEventListener('dragleave', e => {
      // document.body.classList.remove('drag-over')
      console.log('dragging = false')
      dragging = false
    })

    document.addEventListener('dragend', e => {
      // document.body.classList.remove('drag-over')
      console.log('dragging = false')
      dragging = false
    })

    document.addEventListener('drop', e => {
      e.preventDefault()
      e.stopPropagation()
      // document.body.classList.remove('drag-over')

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        // Handle the files
        // console.log("Files dropped:", e.dataTransfer.files)
        // Reset the drag data
        e.dataTransfer.clearData()
      }

      let items = e.dataTransfer.items

      for (let i = 0; i < items.length; i++) {
        let item = items[i].webkitGetAsEntry()

        if (item) {
          scanFiles(item)
        }
      }
    
      console.log('dragging = false')
      dragging = false
    })

  })

</script>

<div class='overlay'>
  drag files here
</div>

<style>
  div {
    width: 100%;
    height: 100%;
    padding: 0;
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
  }

  .overlay {
    /* background-color: red; */
  }

</style>