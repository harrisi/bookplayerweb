<script lang='ts'>
  import { onDestroy, onMount } from "svelte";
  import { page } from "$app/stores";
  import { apiCall } from "$lib";
  const { token } = $page.data

  const worker = new Worker(new URL('./worker.ts', import.meta.url), {type: 'module'})

  export let
    relativePath: string,
    originalFileName: string,
    title: string,
    details: string,
    speed: number,
    currentTime: number,
    duration: number,
    percentCompleted: number,
    isFinished: boolean,
    orderRank, number,
    lastPlayDateTimestamp: number,
    type: 0 | 1 | 2,
    url: string|null|undefined,
    thumbnail: string|null|undefined,
    synced: boolean,
    expires_in: number

  const canplay = (e: Event) => {
    const { target } = e
    if (target)
      (target as HTMLAudioElement).currentTime = currentTime
  }

  let loading = false
  let lastUpdate = Date.now()

  worker.postMessage({ relativePath })
  worker.addEventListener('message', ({ data }) => {
    if (data.length === 0) {
      loading = true
      setTimeout(() => {
        worker.postMessage({ relativePath })
      }, 500)
      return
    }
    loading = false

    // I don't believe this will throw, so just blindly revoke whatever to save memory
    try {
      URL.revokeObjectURL(url ?? '')
    } catch (err) {
      console.error(err)
    }
    url = data
    try {
      const a = document.querySelector('audio')
      if (a == null)
        throw new Error('could not find audio element')
      a.src = url ?? ''
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
    if (url)
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