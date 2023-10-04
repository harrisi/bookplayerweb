<script lang='ts'>
  function scanFiles(item: FileSystemEntry) {
    if (item instanceof FileSystemDirectoryEntry /*.isDirectory*/) {
      let directoryReader = item.createReader();
      console.log(`directory:`)
      console.dir(item)
      directoryReader.readEntries((entries) => {
        entries.forEach((entry) => {
          scanFiles(entry);
        });
      });
    } else {
      // sync()
      console.log(`file:`)
      console.dir(item)
    }
  }

  const drop = (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer == null) return

    let items = e.dataTransfer.items;

    for (let i = 0; i < items.length; i++) {
      let item = items[i].webkitGetAsEntry();

      if (item) {
        scanFiles(item);
      }
    }
  }

  const dragOver = (e: DragEvent) => {
    e.preventDefault()

    // show popover modal?
    // NOTE: Popover API is very new, need a polyfill or just fallback to z-index
  }

</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div id="drop_zone"
  on:drop={drop}
  on:dragover={dragOver}
></div>

<style>
  div {
    width: 100%;
    height: 100%;
    padding: 0;
    position: absolute;
    top: 0;
    left: 0;
  }
</style>