<script>
  import { onDestroy } from "svelte";
  import { page } from "$app/stores";
  const { token } = $page.data
  // import { onMount } from "svelte";

  const worker = new Worker(new URL('./worker.js', import.meta.url), {type: 'module'})

  export let
    relativePath, // "foo/bar/{originalFileName}"
    originalFileName, // "3byjackwilliamson_01_williamson_64kb.mp3"
    title, // "01 - The Cosmic Express",
    details, // "Jack Williamson"
    speed, // 1
    currentTime, // 805.000971829
    duration, // 1769.1689795918367
    percentCompleted, // float
    isFinished, // bool
    orderRank, // 18; this is interesting. gotta think more about this.
    lastPlayDateTimestamp, // 1694534463
    type, // 2 == file, this should always be 2?
          // or maybe not..
    url, // url | null (? when would this be null? for folders? no)
    thumbnail, // url | null
    synced, // true,
    expires_in // 1695267885

  /** @param e {Event} */
  const canplay = e => {
    const target = /** @type {HTMLAudioElement} */ (e.target)
    target.currentTime = currentTime
  }

  let loading = false

  worker.postMessage({ relativePath, token })
  worker.addEventListener('message', ({ data }) => {
    if (data.length === 0) {
      loading = true
      setTimeout(() => {
        worker.postMessage({ relativePath, token })
      }, 500)
      return
    }
    loading = false

    // I don't believe this will throw, so just blindly revoke whatever to save memory
    URL.revokeObjectURL(url)
    url = data
    document.querySelector('source').src = url
    document.querySelector('audio')?.play()
  })

  onDestroy(() => {
    URL.revokeObjectURL(url)
  })
</script>

{#if loading}
<h1>LOADING...</h1>
{/if}

{title}
<div>
  <img src="{thumbnail}" alt="thumbnail for book"/>
  <audio controls on:canplay={canplay}>
    <source src={url} type="audio/mp3">
  </audio>
</div>