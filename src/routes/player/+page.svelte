<script lang='ts'>
  import { onDestroy, onMount } from "svelte";
  import { page } from "$app/stores";
  import { apiCall } from "$lib";
  import { getStore } from '$lib/store'
  const { token } = $page.data

  // const worker = new Worker(new URL('./worker.ts', import.meta.url), {type: 'module'})

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

  let loading = false
  let lastUpdate: number | undefined
  let store = getStore(relativePath, percentCompleted)
  let playable = false
  let skipTime = 30

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
  //     const a = document.querySelector('audio')
  //     if (a == null)
  //       throw new Error('could not find audio element')
  //     a.src = url ?? ''
  //     a.play().then(() => console.log('played')).catch(console.error)
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
    apiCall('POST', '/library', {
      relativePath,
      // originalFileName,
      // title,
      // details,
      currentTime,
      // duration,
      percentCompleted: (currentTime / duration) * 100,
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

  const saveNode = () => {
    const ac = new AudioContext()
    const mediaElement = document.querySelector('audio')
    if (mediaElement == null) throw new Error('Could not find audio element')
    const sourceNode = ac.createMediaElementSource(mediaElement)

  }

  const canplay = (e: Event) => {
    let { target } = e
    const a = target as HTMLAudioElement
    if ((Math.abs(a.currentTime - currentTime) > 1)) {
      a.currentTime = currentTime
    }
    if (playable) {
      a.play()
      a.removeEventListener('canplay', canplay)
      a.addEventListener('play', canplay)
    }
  }

  onMount(() => {
    const a = document.querySelector('audio')
    a?.addEventListener('audioprocess', () => console.log(`audioprocess; ${currentTime}, ${a.currentTime}`))
    a?.addEventListener('canplay', e => console.log(`canplay; ${currentTime}, ${a.currentTime}`))
    a?.addEventListener('canplaythrough', () => console.log(`canplaythrough; ${currentTime}, ${a.currentTime}`))
    a?.addEventListener('complete', () => console.log(`complete; ${currentTime}, ${a.currentTime}`))
    a?.addEventListener('durationchange', () => console.log(`durationchange; ${currentTime}, ${a.currentTime}`))
    a?.addEventListener('emptied', () => console.log(`emptied; ${currentTime}, ${a.currentTime}`))

    a?.addEventListener('ended', updateMetadata)

    a?.addEventListener('loadeddata', () => console.log(`loadeddata; ${currentTime}, ${a.currentTime}`))
    a?.addEventListener('loadedmetadata', () => console.log(`loadedmetadata; ${currentTime}, ${a.currentTime}`))
    a?.addEventListener('loadstart', () => console.log(`loadstart; ${currentTime}, ${a.currentTime}`))

    a?.addEventListener('pause', updateMetadata)

    a?.addEventListener('play', () => console.log(`play; ${currentTime}, ${a.currentTime}`))
    a?.addEventListener('playing', () => console.log(`playing; ${currentTime}, ${a.currentTime}`))
    a?.addEventListener('ratechange', () => console.log(`ratechange; ${currentTime}, ${a.currentTime}`))
    a?.addEventListener('seeked', () => console.log(`seeked; ${currentTime}, ${a.currentTime}`))
    a?.addEventListener('seeking', () => console.log(`seeking; ${currentTime}, ${a.currentTime}`))
    a?.addEventListener('stalled', () => console.log(`stalled; ${currentTime}, ${a.currentTime}`))
    a?.addEventListener('suspend', () => console.log(`suspend; ${currentTime}, ${a.currentTime}`))

    a?.addEventListener('timeupdate', () => { console.log(`timeupdate; ${currentTime}, ${a.currentTime}`); $store = (a.currentTime / a.duration) * 100 })

    a?.addEventListener('volumechange', () => console.log(`volumechange; ${currentTime}, ${a.currentTime}`))
    a?.addEventListener('waiting', () => console.log(`waiting; ${currentTime}, ${a.currentTime}`))

    a?.play().then(() => playable = true).catch(() => playable = false)
  })

  const playPause = () => {
    const a = document.querySelector('audio')
    if (a?.paused) {
      a.play()
    } else {
      a?.pause()
    }
  }

  const skip = forward => {
    const a = document.querySelector('audio')
    if (forward) {
      a.currentTime += skipTime
    } else {
      a.currentTime -= skipTime
    }
  }

</script>

{#if loading}
<h1>LOADING...</h1>
{/if}

<div id='player'>
  <p id='title'>{title}</p>
  <img id='artwork' src="{thumbnail}" alt="thumbnail for book"/>

  <input id='progress' type='range' min=0 max={Math.ceil(duration)} bind:value={currentTime} />

  <button on:click={() => skip(false)}>
    <svg id='skipReverse' viewBox='0 0 144 156'>
      <path class='reverse'
        d="M 58,154.44025 C 28.852681,148.15898 7.5137784,126.73372 1.5802444,97.792158 -3.4171776,73.416601 5.1212992,47.791696 23.883454,30.85778 35.229927,20.61694 47.839792,14.851346 63.587396,12.703992 l 8.32303,-1.134933 0.294787,-5.0251639 c 0.223199,-3.8048282 0.710918,-5.1042516 2.008353,-5.350837 1.71821,-0.32655597 25.709002,13.0936899 26.943914,15.0721969 1.4137,2.264944 -0.85459,4.06878 -12.38409,9.848341 -14.691884,7.364817 -16.160579,7.365183 -16.580237,0.0041 l -0.306847,-5.382271 -6.693153,0.685218 C 51.250872,22.848028 38.033046,29.265703 27.649374,39.649374 20.363481,46.935268 15.826422,54.142891 12.217015,64.165396 9.8938523,70.616292 9.5756023,73.006059 9.5756023,84 c 0,10.993941 0.31825,13.383708 2.6414127,19.8346 3.609407,10.02251 8.146466,17.23013 15.432359,24.51603 7.285894,7.28589 14.493517,11.82295 24.516022,15.43235 6.450896,2.32317 8.840663,2.64142 19.834604,2.64142 10.993941,0 13.383708,-0.31825 19.834604,-2.64142 10.022506,-3.6094 17.230126,-8.14646 24.516026,-15.43235 10.65058,-10.65059 16.97839,-23.96819 18.26348,-38.437577 C 135.34036,81.735875 136.18235,80 139.42244,80 c 4.94178,0 5.71005,4.560474 2.99732,17.792158 C 138.4493,117.15856 127.49241,133.3571 110.93527,144.33842 96.040366,154.2173 75.316862,158.17204 58,154.44025 Z"
        id="path2" />
      <text x='50%' y='50%' dominant-baseline='central' baseline-shift=-5 text-anchor='middle'>-{skipTime}</text>
    </svg>
  </button>

  <button on:click={playPause} id='playPause'>play/pause</button>

  <button on:click={() => skip(true)}>
    <svg id='skip' viewBox='0 0 144 156'>
      <path
        d="M 58,154.44025 C 28.852681,148.15898 7.5137784,126.73372 1.5802444,97.792158 -3.4171776,73.416601 5.1212992,47.791696 23.883454,30.85778 35.229927,20.61694 47.839792,14.851346 63.587396,12.703992 l 8.32303,-1.134933 0.294787,-5.0251639 c 0.223199,-3.8048282 0.710918,-5.1042516 2.008353,-5.350837 1.71821,-0.32655597 25.709002,13.0936899 26.943914,15.0721969 1.4137,2.264944 -0.85459,4.06878 -12.38409,9.848341 -14.691884,7.364817 -16.160579,7.365183 -16.580237,0.0041 l -0.306847,-5.382271 -6.693153,0.685218 C 51.250872,22.848028 38.033046,29.265703 27.649374,39.649374 20.363481,46.935268 15.826422,54.142891 12.217015,64.165396 9.8938523,70.616292 9.5756023,73.006059 9.5756023,84 c 0,10.993941 0.31825,13.383708 2.6414127,19.8346 3.609407,10.02251 8.146466,17.23013 15.432359,24.51603 7.285894,7.28589 14.493517,11.82295 24.516022,15.43235 6.450896,2.32317 8.840663,2.64142 19.834604,2.64142 10.993941,0 13.383708,-0.31825 19.834604,-2.64142 10.022506,-3.6094 17.230126,-8.14646 24.516026,-15.43235 10.65058,-10.65059 16.97839,-23.96819 18.26348,-38.437577 C 135.34036,81.735875 136.18235,80 139.42244,80 c 4.94178,0 5.71005,4.560474 2.99732,17.792158 C 138.4493,117.15856 127.49241,133.3571 110.93527,144.33842 96.040366,154.2173 75.316862,158.17204 58,154.44025 Z"
        id="path1" />
      <text x='50%' y='50%' dominant-baseline='middle' baseline-shift=-5 text-anchor='middle'>+{skipTime}</text>
    </svg>
  </button>

</div>
<audio src={url} bind:currentTime on:canplay={canplay} >
  <!-- <source src={url} type="audio/mp3"> -->
</audio>

<style>
  button {
    background-color: var(--systemBackground);
    color: var(--primary);
  }

  #player {
    display: grid;
    justify-content: center;
    align-items: center;
    /* this can definitely be improved, but I don't want to spend too much time on it. */
    grid-template:
      't t t'
      'a a a'
      'a a a'
      'a a a'
      'g g g'
      'r p s';
  }

  #title {
    grid-area: t;
  }

  #artwork {
    grid-area: a
  }

  #progress {
    grid-area: g;
    width: 100%;
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
</style>