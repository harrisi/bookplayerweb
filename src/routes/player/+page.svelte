<script>
  import { onDestroy, onMount } from "svelte";
  import { page } from "$app/stores";
  import { apiCall } from "$lib";
  const { token } = $page.data

  const worker = new Worker(new URL('./worker.js', import.meta.url), {type: 'module'})

  export let// args
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
  // } = args

  /** @param e {Event} */
  const canplay = e => {
    // console.log('can play')
    const target = /** @type {HTMLAudioElement} */ (e.target)
    target.currentTime = currentTime
  }

  let loading = false
  let lastUpdate = Date.now()

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
    try {
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    }
    url = data
    try {
      const a = document.querySelector('audio')
      a.src = url
      a.play().then(() => console.log('played')).catch(console.error)
    } catch (err) {
      console.error('got err in player')
      console.error(err)
    }
  })

  const updateMetadata = () => {
    // don't update more than once every 10s
    if (Date.now() - lastUpdate < 10000) return
    lastUpdate = Date.now()
    apiCall('POST', '/library', {
      relativePath,
      // originalFileName,
      // title,
      // details,
      currentTime,
      // duration,
      percentCompleted: currentTime / duration,
      isFinished: Math.abs(currentTime - duration) < 1,
      // orderRank,
      // type,
      lastPlayDateTimestamp: Math.round(Date.now() / 1000),
      // speed,
    }, token, true)
  }

  onDestroy(() => {
    URL.revokeObjectURL(url)
    updateMetadata()
  })

  onMount(() => {
    const a = document.querySelector('audio')
  //   // a?.addEventListener('audioprocess', console.log)
  //   // a?.addEventListener('canplay', console.log)
  //   // a?.addEventListener('canplaythrough', console.log)
  //   // a?.addEventListener('complete', console.log)
  //   // a?.addEventListener('durationchange', console.log)
    // a?.addEventListener('emptied', console.log)
    a?.addEventListener('ended', updateMetadata)
  //   // a?.addEventListener('loadeddata', console.log)
  //   // a?.addEventListener('loadedmetadata', console.log)
  //   // a?.addEventListener('loadstart', console.log)
    a?.addEventListener('pause', updateMetadata)
  //   // a?.addEventListener('play', console.log)
  //   // a?.addEventListener('playing', console.log)
  //   // a?.addEventListener('ratechange', console.log)
  //   // a?.addEventListener('seeked', console.log)
  //   // a?.addEventListener('seeking', console.log)
  //   // a?.addEventListener('stalled', console.log)
  //   // a?.addEventListener('suspend', console.log)
    a?.addEventListener('timeupdate', () => currentTime = a.currentTime)
  //   // a?.addEventListener('volumechange', console.log)
  //   // a?.addEventListener('waiting', console.log)
  })

  document.addEventListener('visibilitychange',
  () => document.visibilityState === 'hidden' ? updateMetadata() : void 0)
</script>

{#if loading}
<h1>LOADING...</h1>
{/if}

{title}
<div>
  <img src="{thumbnail}" alt="thumbnail for book"/>
  <audio controls on:play={canplay}>
    <!-- <source src={url} type="audio/mp3"> -->
  </audio>
</div>