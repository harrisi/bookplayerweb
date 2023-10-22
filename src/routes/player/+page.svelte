<script context='module'>
  let userInteracted = false
</script>

<script lang='ts'>
  import { onDestroy, onMount } from "svelte";
  import { library } from "$lib/api";
  import { getStore } from '$lib/store'
  import type { Item } from "$lib/types"
  import Overlay from "$lib/components/Overlay.svelte";
  import { Buffer } from 'buffer'
  import { parseBuffer } from 'music-metadata'
  import { read } from 'node-id3'
  import Slider from "./Slider.svelte";

  // const worker = new Worker(new URL('./worker.ts', import.meta.url), {type: 'module'})

  export let item: Item
  let {
    relativePath,
    originalFileName,
    title,
    details,
    speed = 1,
    currentTime = 0,
    duration = 1,
    percentCompleted = 0,
    isFinished,
    orderRank,
    lastPlayDateTimestamp,
    type,
    url,
    thumbnail,
    synced,
    expires_in,
  } = item

  let loading = false
  let lastUpdate: number | undefined
  let store = getStore(relativePath, percentCompleted)
  let playable = false
  let skipTime = 30
  let audioEl: HTMLAudioElement
  let sleepTimer: string
  let sleepTimerEl: HTMLSelectElement
  let playing = false

  // worker.postMessage({ relativePath })
  // worker.addEventListener('message', ({ data }) => {
  //   if (data.length === 0) {
  //     loading = true
  //     setTimeout(() => {
  //       worker.postMessage({ relativePath })
  //     }, 500)
  //     return
  //   }
  //   loading = false
  //   // I don't believe this will throw, so just blindly revoke whatever to save memory
  //   try {
  //     URL.revokeObjectURL(url ?? '')
  //   } catch (err) {
  //     console.error(err)
  //   }
  //   url = data
  //   try {
  //     if (audioEl == null)
  //       throw new Error('could not find audio element')
  //     audioEl.src = url ?? ''
  //     aduioEl.play().then(() => console.log('played')).catch(console.error)
  //   } catch (err) {
  //     console.error('got err in player')
  //     console.error(err)
  //   }
  // })

  const updateMetadata = () => {
    // don't update more than once every 10s
    if (lastUpdate && Date.now() - lastUpdate < 10000) return
    lastUpdate = Date.now()
    console.log(relativePath)
    library.updateMetadata({
      relativePath,
      currentTime,
      percentCompleted: (currentTime / duration) * 100,
      isFinished: Math.abs(currentTime - duration) < 1,
      lastPlayDateTimestamp: Math.round(Date.now() / 1000),
      speed,
    }, true)
  }

  onDestroy(() => {
    if (url)
      URL.revokeObjectURL(url.toString())
    updateMetadata()
  })

  const saveNode = () => {
    const ac = new AudioContext()
    if (audioEl == null) throw new Error('Could not find audio element')
    const sourceNode = ac.createMediaElementSource(audioEl)
  }

  const canplay = (e: Event) => {
    let { target } = e
    const a = target as HTMLAudioElement
    if ((Math.abs(a.currentTime - currentTime) > 1)) {
      a.currentTime = currentTime
    }
    if (playable && userInteracted) {
      a.play()
      a.removeEventListener('canplay', canplay)
      a.addEventListener('play', canplay)
    }
  }

  const loadedMetadata = async () => {
    return;
    console.log('loadedMetadata')
    if (url == null) {
      console.log('no url')
      return
    }
    const res = await fetch(url).then(res => res.blob())
    let arrBuf = await res.arrayBuffer()
    let buf = Buffer.from(arrBuf)
    parseBuffer(buf, undefined, {includeChapters: true}).then(console.log).catch(console.error)
    let tags = read(buf)
    console.dir(tags)
  }

  onMount(() => {
    window.Buffer = Buffer
    audioEl.preservesPitch = true
    audioEl.webkitPreservesPitch = true
    audioEl.addEventListener('audioprocess', () => console.log(`audioprocess; ${currentTime}, ${audioEl.currentTime}`))
    audioEl.addEventListener('canplay', e => console.log(`canplay; ${currentTime}, ${audioEl.currentTime}`))
    audioEl.addEventListener('canplaythrough', () => console.log(`canplaythrough; ${currentTime}, ${audioEl.currentTime}`))
    audioEl.addEventListener('complete', () => console.log(`complete; ${currentTime}, ${audioEl.currentTime}`))
    audioEl.addEventListener('durationchange', () => console.log(`durationchange; ${currentTime}, ${audioEl.currentTime}`))
    audioEl.addEventListener('emptied', () => console.log(`emptied; ${currentTime}, ${audioEl.currentTime}`))

    audioEl.addEventListener('ended', updateMetadata)

    audioEl.addEventListener('loadeddata', () => console.log(`loadeddata; ${currentTime}, ${audioEl.currentTime}`))
    audioEl.addEventListener('loadedmetadata', () => { console.log(`loadedmetadata; ${currentTime}, ${audioEl.currentTime}`); loadedMetadata() })
    audioEl.addEventListener('loadstart', () => console.log(`loadstart; ${currentTime}, ${audioEl.currentTime}`))

    audioEl.addEventListener('pause', updateMetadata)

    audioEl.addEventListener('play', () => console.log(`play; ${currentTime}, ${audioEl.currentTime}`))
    audioEl.addEventListener('playing', () => console.log(`playing; ${currentTime}, ${audioEl.currentTime}`))
    audioEl.addEventListener('ratechange', () => console.log(`ratechange; ${currentTime}, ${audioEl.currentTime}`))
    audioEl.addEventListener('seeked', () => console.log(`seeked; ${currentTime}, ${audioEl.currentTime}`))
    audioEl.addEventListener('seeking', () => console.log(`seeking; ${currentTime}, ${audioEl.currentTime}`))
    audioEl.addEventListener('stalled', () => console.log(`stalled; ${currentTime}, ${audioEl.currentTime}`))
    audioEl.addEventListener('suspend', () => console.log(`suspend; ${currentTime}, ${audioEl.currentTime}`))

    audioEl.addEventListener('timeupdate', () => { console.log(`timeupdate; ${currentTime}, ${audioEl.currentTime}`); $store = (audioEl.currentTime / audioEl.duration) * 100 })

    audioEl.addEventListener('volumechange', () => console.log(`volumechange; ${currentTime}, ${audioEl.currentTime}`))
    audioEl.addEventListener('waiting', () => console.log(`waiting; ${currentTime}, ${audioEl.currentTime}`))

    if (userInteracted) {
      audioEl.play().then(() => playable = true).catch(() => playable = false)
    }
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title,
        artist: details,
        album: title,
        artwork: [{ src: thumbnail?.toString() ?? '' }],
      })
    }
  })

  const playPause = () => {
    if (!userInteracted) userInteracted = true
    if (audioEl.paused) {
      audioEl.play()
    } else {
      audioEl.pause()
    }
  }

  const skip = (time: number) => {
    audioEl.currentTime += time
  }

  const sleep = () => {
    if (sleepTimer === 'Sleep timer') return
    if (sleepTimer === 'current chapter') return
    if (sleepTimer === 'custom') return
    if (sleepTimer.includes('h')) {
      setTimeout(() => {
        audioEl.pause()
        sleepTimerEl.value = 'Sleep timer'
      }, 1 * 60 * 60 * 1000)
    }
    let minutes = sleepTimer.match(/\d+/)?.at(0)!
    setTimeout(() => {
      audioEl.pause()
      sleepTimerEl.value = 'Sleep timer'
    }, parseInt(minutes) * 1000)
  }

</script>

{#if loading}
<h1>LOADING...</h1>
{/if}

<Overlay --bottom='5px'>
  <div id='player'>
    <div id='left'>
      <img id='artwork' src='{thumbnail?.toString()}' alt='thumbnail for book' />

      <div id='info'>
        <span id='title'>{title}</span>
        <span id='author'>{details}</span>
      </div>

      <Slider min=0 max={Math.ceil(duration)} bind:value={currentTime} />
    </div>

    <div id='right'>
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label id='speed'>
        {speed}
        <Slider min='0.5' max=4 step='0.1' bind:value={speed} on:change={() => audioEl.playbackRate = speed} />
      </label>

      <button on:click={() => skip(-skipTime)}>
        <svg id='skipReverse' viewBox='0 0 144 156'>
          <path class='reverse'
            d="M 58,154.44025 C 28.852681,148.15898 7.5137784,126.73372 1.5802444,97.792158 -3.4171776,73.416601 5.1212992,47.791696 23.883454,30.85778 35.229927,20.61694 47.839792,14.851346 63.587396,12.703992 l 8.32303,-1.134933 0.294787,-5.0251639 c 0.223199,-3.8048282 0.710918,-5.1042516 2.008353,-5.350837 1.71821,-0.32655597 25.709002,13.0936899 26.943914,15.0721969 1.4137,2.264944 -0.85459,4.06878 -12.38409,9.848341 -14.691884,7.364817 -16.160579,7.365183 -16.580237,0.0041 l -0.306847,-5.382271 -6.693153,0.685218 C 51.250872,22.848028 38.033046,29.265703 27.649374,39.649374 20.363481,46.935268 15.826422,54.142891 12.217015,64.165396 9.8938523,70.616292 9.5756023,73.006059 9.5756023,84 c 0,10.993941 0.31825,13.383708 2.6414127,19.8346 3.609407,10.02251 8.146466,17.23013 15.432359,24.51603 7.285894,7.28589 14.493517,11.82295 24.516022,15.43235 6.450896,2.32317 8.840663,2.64142 19.834604,2.64142 10.993941,0 13.383708,-0.31825 19.834604,-2.64142 10.022506,-3.6094 17.230126,-8.14646 24.516026,-15.43235 10.65058,-10.65059 16.97839,-23.96819 18.26348,-38.437577 C 135.34036,81.735875 136.18235,80 139.42244,80 c 4.94178,0 5.71005,4.560474 2.99732,17.792158 C 138.4493,117.15856 127.49241,133.3571 110.93527,144.33842 96.040366,154.2173 75.316862,158.17204 58,154.44025 Z"
            id="path2" />
          <text x='50%' y='50%' dominant-baseline='central' baseline-shift=-5 text-anchor='middle'>-{skipTime}</text>
        </svg>
      </button>

      <button on:click={playPause} id='playPause'>
        {#if (audioEl && audioEl.paused)}
          <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512">
          <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/>
          </svg>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 320 512">
          <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/>
          </svg>
        {/if}
      </button>

      <button on:click={() => skip(+skipTime)}>
        <svg id='skip' viewBox='0 0 144 156'>
          <path
            d="M 58,154.44025 C 28.852681,148.15898 7.5137784,126.73372 1.5802444,97.792158 -3.4171776,73.416601 5.1212992,47.791696 23.883454,30.85778 35.229927,20.61694 47.839792,14.851346 63.587396,12.703992 l 8.32303,-1.134933 0.294787,-5.0251639 c 0.223199,-3.8048282 0.710918,-5.1042516 2.008353,-5.350837 1.71821,-0.32655597 25.709002,13.0936899 26.943914,15.0721969 1.4137,2.264944 -0.85459,4.06878 -12.38409,9.848341 -14.691884,7.364817 -16.160579,7.365183 -16.580237,0.0041 l -0.306847,-5.382271 -6.693153,0.685218 C 51.250872,22.848028 38.033046,29.265703 27.649374,39.649374 20.363481,46.935268 15.826422,54.142891 12.217015,64.165396 9.8938523,70.616292 9.5756023,73.006059 9.5756023,84 c 0,10.993941 0.31825,13.383708 2.6414127,19.8346 3.609407,10.02251 8.146466,17.23013 15.432359,24.51603 7.285894,7.28589 14.493517,11.82295 24.516022,15.43235 6.450896,2.32317 8.840663,2.64142 19.834604,2.64142 10.993941,0 13.383708,-0.31825 19.834604,-2.64142 10.022506,-3.6094 17.230126,-8.14646 24.516026,-15.43235 10.65058,-10.65059 16.97839,-23.96819 18.26348,-38.437577 C 135.34036,81.735875 136.18235,80 139.42244,80 c 4.94178,0 5.71005,4.560474 2.99732,17.792158 C 138.4493,117.15856 127.49241,133.3571 110.93527,144.33842 96.040366,154.2173 75.316862,158.17204 58,154.44025 Z"
            id="path1" />
          <text x='50%' y='50%' dominant-baseline='middle' baseline-shift=-5 text-anchor='middle'>+{skipTime}</text>
        </svg>
      </button>

      <select name='sleep' id='sleep' bind:this={sleepTimerEl} bind:value={sleepTimer} on:change={sleep}>
        {#each ['Sleep timer', '5m', '10m', '15m', '30m', '1h', 'current chapter', 'custom'] as val}
          <option value={val}>{val}</option>
        {/each}
      </select>
    </div>
  </div>
</Overlay>

<style>
  button {
    background-color: var(--systemBackground);
    color: var(--primary);
    border-radius: 5px;
    border: 1px solid var(--primary);
    box-shadow: 1px 1px 1px gray;
  }

  #player {
    display: grid;
    grid-template-columns: 2fr 1fr;
    width: 100%;
  }

  #left {
    display: flex;
    justify-content: start;
    align-items: center;
  }

  #progress {
    width: 100%;
  }

  #right {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
  }

  #info {
    display: grid;
    margin-left: 10px;
    margin-top: 10px;
  }

  img {
    height: min(10vh, 10vw);
    background: linear-gradient(#37398c, #537bc4);
    border-radius: 5px;
    aspect-ratio: 1;
  }

  svg {
    fill: var(--primary);
    width: 50px;
    aspect-ratio: 1;
    height: auto;
  }

  svg text {
    font-size: 48px;
  }

  .reverse {
    transform: scaleX(-1);
    translate: 100%;
  }
</style>

<!-- <div id='player'>
  <p id='title'>{title}</p>

  <img id='artwork' src="{thumbnail?.toString()}" alt="thumbnail for book"/>

  <input id='progress' type='range' min=0 max={Math.ceil(duration)} bind:value={currentTime} />

  <label id='speed'>
    {speed}
    <input type='range' min='0.5' max=4 step='0.1' bind:value={speed} on:change={() => audioEl.playbackRate = speed}/>
  </label>

  <button on:click={() => skip(-skipTime)}>
    <svg id='skipReverse' viewBox='0 0 144 156'>
      <path class='reverse'
        d="M 58,154.44025 C 28.852681,148.15898 7.5137784,126.73372 1.5802444,97.792158 -3.4171776,73.416601 5.1212992,47.791696 23.883454,30.85778 35.229927,20.61694 47.839792,14.851346 63.587396,12.703992 l 8.32303,-1.134933 0.294787,-5.0251639 c 0.223199,-3.8048282 0.710918,-5.1042516 2.008353,-5.350837 1.71821,-0.32655597 25.709002,13.0936899 26.943914,15.0721969 1.4137,2.264944 -0.85459,4.06878 -12.38409,9.848341 -14.691884,7.364817 -16.160579,7.365183 -16.580237,0.0041 l -0.306847,-5.382271 -6.693153,0.685218 C 51.250872,22.848028 38.033046,29.265703 27.649374,39.649374 20.363481,46.935268 15.826422,54.142891 12.217015,64.165396 9.8938523,70.616292 9.5756023,73.006059 9.5756023,84 c 0,10.993941 0.31825,13.383708 2.6414127,19.8346 3.609407,10.02251 8.146466,17.23013 15.432359,24.51603 7.285894,7.28589 14.493517,11.82295 24.516022,15.43235 6.450896,2.32317 8.840663,2.64142 19.834604,2.64142 10.993941,0 13.383708,-0.31825 19.834604,-2.64142 10.022506,-3.6094 17.230126,-8.14646 24.516026,-15.43235 10.65058,-10.65059 16.97839,-23.96819 18.26348,-38.437577 C 135.34036,81.735875 136.18235,80 139.42244,80 c 4.94178,0 5.71005,4.560474 2.99732,17.792158 C 138.4493,117.15856 127.49241,133.3571 110.93527,144.33842 96.040366,154.2173 75.316862,158.17204 58,154.44025 Z"
        id="path2" />
      <text x='50%' y='50%' dominant-baseline='central' baseline-shift=-5 text-anchor='middle'>-{skipTime}</text>
    </svg>
  </button>

  <button on:click={playPause} id='playPause'>play/pause</button>

  <button on:click={() => skip(+skipTime)}>
    <svg id='skip' viewBox='0 0 144 156'>
      <path
        d="M 58,154.44025 C 28.852681,148.15898 7.5137784,126.73372 1.5802444,97.792158 -3.4171776,73.416601 5.1212992,47.791696 23.883454,30.85778 35.229927,20.61694 47.839792,14.851346 63.587396,12.703992 l 8.32303,-1.134933 0.294787,-5.0251639 c 0.223199,-3.8048282 0.710918,-5.1042516 2.008353,-5.350837 1.71821,-0.32655597 25.709002,13.0936899 26.943914,15.0721969 1.4137,2.264944 -0.85459,4.06878 -12.38409,9.848341 -14.691884,7.364817 -16.160579,7.365183 -16.580237,0.0041 l -0.306847,-5.382271 -6.693153,0.685218 C 51.250872,22.848028 38.033046,29.265703 27.649374,39.649374 20.363481,46.935268 15.826422,54.142891 12.217015,64.165396 9.8938523,70.616292 9.5756023,73.006059 9.5756023,84 c 0,10.993941 0.31825,13.383708 2.6414127,19.8346 3.609407,10.02251 8.146466,17.23013 15.432359,24.51603 7.285894,7.28589 14.493517,11.82295 24.516022,15.43235 6.450896,2.32317 8.840663,2.64142 19.834604,2.64142 10.993941,0 13.383708,-0.31825 19.834604,-2.64142 10.022506,-3.6094 17.230126,-8.14646 24.516026,-15.43235 10.65058,-10.65059 16.97839,-23.96819 18.26348,-38.437577 C 135.34036,81.735875 136.18235,80 139.42244,80 c 4.94178,0 5.71005,4.560474 2.99732,17.792158 C 138.4493,117.15856 127.49241,133.3571 110.93527,144.33842 96.040366,154.2173 75.316862,158.17204 58,154.44025 Z"
        id="path1" />
      <text x='50%' y='50%' dominant-baseline='middle' baseline-shift=-5 text-anchor='middle'>+{skipTime}</text>
    </svg>
  </button>

  <select name='sleep' id='sleep' bind:this={sleepTimerEl} bind:value={sleepTimer} on:change={sleep}>
    {#each ['Sleep timer', '5m', '10m', '15m', '30m', '1h', 'current chapter', 'custom'] as val}
      <option value={val}>{val}</option>
    {/each}
  </select>

</div> -->

<audio bind:this={audioEl} bind:playbackRate={speed} src={url?.toString()} bind:currentTime on:canplay={canplay}>
  <!-- <source src={url} type="audio/mp3"> -->
</audio>

<!-- <style>
  button {
    background-color: var(--systemBackground);
    color: var(--primary);
  }

  img {
    height: max(10vh, 10vw);
    background: linear-gradient(#37398c, #537bc4);
    border-radius: 5px;
    aspect-ratio: 1;
  }

  #player {
    display: grid;
    justify-content: center;
    align-items: center;
    /* this can definitely be improved, but I don't want to spend too much time on it. */
    grid-template:
      't t t t t'
      '. a a a .'
      '. a a a .'
      '. a a a .'
      'g g g g g'
      'e r p s l';
  }

  #sleep {
    grid-area: l;
  }

  #speed {
    grid-area: e;
  }

  #title {
    grid-area: t;
  }

  #artwork {
    grid-area: a
  }

  #progress {
    grid-area: g;
  }

  #skipReverse {
    grid-area: r;
  }

  #playPause {
    height: 65px;
    grid-area: p;
  }

  #skip {
    grid-area: s;
  }

  svg {
    fill: var(--primary);
    width: 50px;
  }

  svg text {
    font-size: 48px;
  }

  .reverse {
    transform: scaleX(-1);
    translate: 100%;
  }
</style> -->