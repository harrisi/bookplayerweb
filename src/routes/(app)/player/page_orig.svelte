<script context='module'>
  let userInteracted = false
</script>

<script lang='ts'>
  import { onDestroy, onMount } from "svelte";
  import { library } from "$lib/api";
  import { getStore } from '$lib/store'
  import { ItemType, type Item } from "$lib/types"
  import Overlay from "$lib/components/Overlay.svelte";
  import Slider from "./Slider.svelte";
  import { settings } from "$lib/settings";
  import { formatTime, getMetadata } from "$lib/util"
  import type NodeID3 from "node-id3"
  import type { IAudioMetadata } from "music-metadata-browser"

  // const worker = new Worker(new URL('./worker.ts', import.meta.url), {type: 'module'})

  // this will be either a volume or individual file
  export let item: Item
  // either way, we get all the data here
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
  } = item

  /**
   * we're not using this currently
   */
  let loading = false

  /**
   * Used to keep track of when the last metadata was sent, so we don't send updates too often.
   */
  let lastUpdate: number | undefined

  /**
   * percentCompleted store for the item, so we can update the progress in the grid view
   */
  let store = getStore(relativePath, percentCompleted)

  /**
   * Is the file playable, used for enabling/disabling play on click
   */
  let playable = false

  /**
   * Reference to the audio element for the currently playing item.
   * For volumes this is a reference to whichever file is currently playing.
   */
  // let audioEl: HTMLAudioElement

  /**
   * An array of all the current audio elements.
   */
  let audioEls: HTMLAudioElement[] = []

  /**
   * Holds the value of sleepTimerEl. This isn't strictly necessary but it's helpful.
   */
  let sleepTimer: string

  /**
   * Sleep timer html element.
   */
  let sleepTimerEl: HTMLSelectElement

  /**
   * Currently unused.
   */
  let metadata: any | undefined

  /**
   * Chapters. I need to define a representation for all the different libraries to make this more useful.
   */
  let chapters: any[] = []

  /**
   * Currently unused.
   */
  let playing = false

  // const captureStream: MediaStream
  // const contextOpts: AudioContextOptions = {
  //   latencyHint: 'playback', // 'balanced', 'interactive' (default), 'playback'
  // }
  // const context = new AudioContext()
  // let track: MediaElementAudioSourceNode
  // const gainNode = context.createGain()
  // gainNode.gain.value = $settings.playback.boostVolume.opt ? 2 : 1

  let currentItems: {start: number, end: number, item: Item}[] = []
  let currenTimes: number[] = []

  let currentItemIndex = 0

  // let currentItemTime = 0

  // let currentItemDuration = 0

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

  const updateMetadata = async () => {
    // don't update more than once every 10s
    if (lastUpdate && Date.now() - lastUpdate < 10000) return
    lastUpdate = Date.now()
    console.log(relativePath)
    await library.updateMetadata({
      relativePath,
      currentTime,
      percentCompleted: (currentTime / duration) * 100,
      isFinished: Math.abs(currentTime - duration) < 1,
      lastPlayDateTimestamp: Math.round(Date.now() / 1000),
      speed,
    }, true)

    // the following is not how volumes work. the underlying file time isn't updated.

    // if (type == ItemType.Volume) {
    //   const volumePath = relativePath.split('/').slice(0, -1).join('/')
    //   const volumeItems: Item[] = await library.getContent({ relativePath: `${volumePath}/` }).then(res => res.content[0])

    //   let volumeTime = 0
    //   let volumeDuration = 0
    //   for (let item of volumeItems) {
    //     const { currentTime = 0, duration = 0 } = item
    //     volumeTime += currentTime
    //     volumeDuration += duration
    //   }

    //   library.updateMetadata({
    //     relativePath: volumePath,
    //     currentTime: volumeTime,
    //     percentCompleted: (volumeTime / volumeDuration) * 100,
    //     isFinished: Math.abs(volumeTime - volumeDuration) < 1,
    //     lastPlayDateTimestamp: Math.round(Date.now() / 1000),
    //     speed,
    //   }, true)
    // }
  }

  onDestroy(() => {
    if (url)
      URL.revokeObjectURL(url.toString())
    updateMetadata()
  })

  const saveNode = () => {
    const ac = new AudioContext()
    if (audioEls[currentItemIndex] == null) throw new Error('Could not find audio element')
    const sourceNode = ac.createMediaElementSource(audioEls[currentItemIndex])
  }

  const canplay = (e: Event) => {
    console.log('canplay')
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

  const logTimes = (s: string) => {
    console.log(`${s}; ${currentTime}, ${audioEls[currentItemIndex] && (audioEls[currentItemIndex].currentTime || '(N/A)')}, ${new Date()}`)
  }

  const ended = async () => {
    currentItemIndex++;
    // if (item.type === ItemType.Volume) {
      // currentTime += 0.5
      // await updateMetadata()
      // document.dispatchEvent(new CustomEvent('next', {
      //   detail: item,
      // }))
    // }
    // if (item.type === ItemType.Volume)
    //   setPlayer(items[currentItemIndex + 1])
    // const path = item.relativePath.split('/').slice(0, -1).join('/')
    // let inVolume = false
    // let parent: Item = await library.getContent({ relativePath: path }).then(res => res.content[0])
    // inVolume = parent && parent.type === ItemType.Volume
    // if (inVolume) {
    //   console.log('in volume')
    //   const items: Item[] = await library.getContent({
    //     relativePath: `${path}/`,
    //     sign: true
    //   }).then(res => res.content)
    //   items.sort((a, b) => (a.orderRank ?? 0) - (b.orderRank ?? 0))
    //   let index = items.findIndex(val => val.relativePath == item.relativePath)
    //   if (index == -1) {
    //     console.error('could not find item', item)
    //     return
    //   }
    //   const maybeItem = items.at(index + 1)
    //   if (!maybeItem) {
    //     console.log('no more items')
    //     return
    //   }
    //   if (!maybeItem.url) {
    //     console.log('item has no url')
    //     return
    //   }
    // }
  }

  const setPlayer = async (item: Item) => {
    console.log('setting player')
    if (!item.url) return;
    console.log(`item.url ${item.url}`)
    // audioEl = audioEls[currentItemIndex]
    audioEls[currentItemIndex].src = item.url.toString()
    // audioEl.currentTime = 0
    // console.log('loading')
    audioEls[currentItemIndex].load()
    // console.log('playing')
    // track = context.createMediaElementSource(audioEl)
    // track.disconnect(context.destination)
    // track.connect(gainNode).connect(context.destination)
    await audioEls[currentItemIndex].play().then(console.log).catch(err => {
      console.error(err)
    })
  }

  const setupPlayer = async () => {
    console.log('player onMount')
    // handle items that have never been played.
    if (!currentTime) currentTime = 0

    if (type !== ItemType.Volume) {
      const metadata = await getMetadata(item)
      if (metadata?.artwork)
      thumbnail = typeof metadata.artwork === 'string' ?
        metadata.artwork :
        URL.createObjectURL(new Blob([metadata.artwork]))

      if (item.relativePath?.endsWith('.mp3')) {
        const meta = metadata?.meta as NodeID3.Tags
        chapters = meta.chapter ?? []
      } else {
        const meta = metadata?.meta as IAudioMetadata
        chapters = meta.format.chapters ?? []
      }
    } else {
      console.log('setting up volume')
      const resp: Item = await library.getContent({ relativePath: item.relativePath }).then(res => res.content[0])
      let { currentTime = 0 } = resp

      // find which file we're in
      const itemsResp: Item[] = await library.getContent({
        relativePath: `${item.relativePath}/`,
        sign: true,
      }).then(res => res.content)
      itemsResp.sort((a, b) => (a.orderRank ?? 0) - (b.orderRank ?? 0))
      let prevDurations = 0
      let currentItem: Item | undefined
      for (let [index, item] of itemsResp.entries()) {
        let { duration = 0 } = item
        if ((duration + prevDurations) >= currentTime) {
          if (currentItem == undefined) {
            currentItem = item
            currentItemIndex = index
            // console.log('setting player for volume')
            // console.log(itemsResp[index])

          }
        }
        currentItems.push({start: prevDurations, end: prevDurations + duration, item})
        audioEls.push(new Audio())
        console.log(`pushing {elementID: '${item.title}', startTimeMs: ${prevDurations * 1000}, endTimeMs: ${(prevDurations + duration) * 1000}} to chapters`)
        chapters.push({
          elementID: item.title,
          startTimeMs: prevDurations * 1000,
          endTimeMs: (prevDurations + duration) * 1000,
        })
        prevDurations += duration
      }
    }

    console.log('audioEls')
    console.dir(audioEls)
    console.log('currentItems')
    console.dir(currentItems)

    // if (type === ItemType.File) {
    //   audioEl = audioEls.at(0)
    // } else if (type === ItemType.Volume) {
    //   audioEl = audioEls.at(currentItemIndex)
    // }
    setPlayer(currentItems[currentItemIndex].item)

    console.log('finished getting metadata/setting up volume')


    audioEls.forEach(audioEl => {
    audioEl.preservesPitch = true
    audioEl.addEventListener('audioprocess', () => logTimes('audioprocess'))
    audioEl.addEventListener('canplay', e => logTimes('canplay'))
    audioEl.addEventListener('canplaythrough', () => logTimes('canplaythrough'))
    audioEl.addEventListener('complete', () => logTimes('complete'))
    audioEl.addEventListener('durationchange', () => logTimes('durationchange'))
    audioEl.addEventListener('emptied', () => logTimes('emptied'))

    audioEl.addEventListener('ended', async () => { logTimes('ended'); await updateMetadata(); ended() })

    audioEl.addEventListener('loadeddata', () => logTimes('loadeddata'))
    audioEl.addEventListener('loadedmetadata', () => logTimes('loadedmetadata'))
    audioEl.addEventListener('loadstart', () => logTimes('loadstart'))

    audioEl.addEventListener('pause', () => { logTimes('pause'); updateMetadata() })

    audioEl.addEventListener('play', () => logTimes('play'))
    audioEl.addEventListener('playing', () => logTimes('playing'))
    audioEl.addEventListener('ratechange', () => logTimes('ratechange'))
    audioEl.addEventListener('seeked', () => logTimes('seeked'))
    audioEl.addEventListener('seeking', () => logTimes('seeking'))
    audioEl.addEventListener('stalled', () => logTimes('stalled'))
    audioEl.addEventListener('suspend', () => logTimes('suspend'))

    audioEl.addEventListener('timeupdate', () => { /* logTimes('timeupdate'); */ $store = (audioEl.currentTime / audioEl.duration) * 100 })

    audioEl.addEventListener('volumechange', () => logTimes('volumechange'))
    audioEl.addEventListener('waiting', () => logTimes('waiting'))
    })

    if (userInteracted) {
      audioEls[currentItemIndex].play().then(() => playable = true).catch(() => playable = false)
    }
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title,
        artist: details,
        album: title,
        artwork: [{ src: thumbnail?.toString() ?? '' }],
      })
    }
  }

  onMount(setupPlayer)

  const playPause = () => {
    // if (context.state === 'suspended') context.resume()
    if (!userInteracted) userInteracted = true
    if (audioEls[currentItemIndex].paused) {
      audioEls[currentItemIndex].play()
    } else {
      audioEls[currentItemIndex].pause()
    }
  }

  const skip = (time: number) => {
    audioEls[currentItemIndex].currentTime += time
  }

  const sleep = () => {
    if (sleepTimer === 'Sleep timer') return
    if (sleepTimer === 'current chapter') {
      setTimeout(() => {
        audioEls[currentItemIndex].pause()
        sleepTimerEl.value = 'Sleep timer'
      }, currentChapter.endTimeMs - (currentTime * 1000))
    }
    if (sleepTimer === 'custom') {
      return
    }
    if (sleepTimer.includes('h')) {
      setTimeout(() => {
        audioEls[currentItemIndex].pause()
        sleepTimerEl.value = 'Sleep timer'
      }, 1 * 60 * 60 * 1000)
    }
    let minutes = sleepTimer.match(/\d+/)?.at(0)!
    setTimeout(() => {
      audioEls[currentItemIndex].pause()
      sleepTimerEl.value = 'Sleep timer'
    }, parseInt(minutes) * 60 * 1000)
  }

  let currentChapter = {}

  $: {
    if (currentTime && chapters) {
      currentChapter = chapters.find((val, index) => {
        let foundRes = (val.startTimeMs <= currentTime * 1000 &&
          val.endTimeMs >= currentTime * 1000)
        if (foundRes) {
          if (currentItemIndex !== index) {
            currentItemIndex = index
            audioEls[currentItemIndex].currentTime = currentTime - currentItems[currentItemIndex].start
            setPlayer(currentItems[currentItemIndex].item)
          }
        }
        return foundRes
      })
    }
  }

  // $: {
  //   // console.log('setting player and audioEl.currentTime')
  //   console.dir(audioEls)
  // }
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

      <div class='progressContainer'>
        <div class='times'>
          <div class='currentTime'>{formatTime(currentTime)}</div>
          <div class='currentChapter'>{(currentChapter && ((currentChapter.tags && currentChapter.tags?.title) || currentChapter.elementID)) ?? ''}</div>
          <div class='duration'>{formatTime(duration)}</div>
        </div>
        <Slider min=0 max={Math.ceil(duration)} bind:value={currentTime} />
      </div>
    </div>


    <div id='right'>
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label id='speed'>
        {speed}
        <Slider min='0.5' max=4 step='0.1' bind:value={speed} on:change={() => audioEls[currentItemIndex].playbackRate = speed} />
      </label>

      <button on:click={() => skip(-$settings.playback.skipIntervals.rewind.opt)}>
        <svg id='skipReverse' viewBox='0 0 144 156'>
          <path class='reverse'
            d="M 58,154.44025 C 28.852681,148.15898 7.5137784,126.73372 1.5802444,97.792158 -3.4171776,73.416601 5.1212992,47.791696 23.883454,30.85778 35.229927,20.61694 47.839792,14.851346 63.587396,12.703992 l 8.32303,-1.134933 0.294787,-5.0251639 c 0.223199,-3.8048282 0.710918,-5.1042516 2.008353,-5.350837 1.71821,-0.32655597 25.709002,13.0936899 26.943914,15.0721969 1.4137,2.264944 -0.85459,4.06878 -12.38409,9.848341 -14.691884,7.364817 -16.160579,7.365183 -16.580237,0.0041 l -0.306847,-5.382271 -6.693153,0.685218 C 51.250872,22.848028 38.033046,29.265703 27.649374,39.649374 20.363481,46.935268 15.826422,54.142891 12.217015,64.165396 9.8938523,70.616292 9.5756023,73.006059 9.5756023,84 c 0,10.993941 0.31825,13.383708 2.6414127,19.8346 3.609407,10.02251 8.146466,17.23013 15.432359,24.51603 7.285894,7.28589 14.493517,11.82295 24.516022,15.43235 6.450896,2.32317 8.840663,2.64142 19.834604,2.64142 10.993941,0 13.383708,-0.31825 19.834604,-2.64142 10.022506,-3.6094 17.230126,-8.14646 24.516026,-15.43235 10.65058,-10.65059 16.97839,-23.96819 18.26348,-38.437577 C 135.34036,81.735875 136.18235,80 139.42244,80 c 4.94178,0 5.71005,4.560474 2.99732,17.792158 C 138.4493,117.15856 127.49241,133.3571 110.93527,144.33842 96.040366,154.2173 75.316862,158.17204 58,154.44025 Z"
            id="path2" />
          <text x='50%' y='50%' dominant-baseline='central' baseline-shift=-5 text-anchor='middle'>-{$settings.playback.skipIntervals.rewind.opt}</text>
        </svg>
      </button>

      <button on:click={playPause} id='playPause'>
        {#if (audioEls[currentItemIndex] && audioEls[currentItemIndex].paused)}
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

      <button on:click={() => skip(+$settings.playback.skipIntervals.forward.opt)}>
        <svg id='skip' viewBox='0 0 144 156'>
          <path
            d="M 58,154.44025 C 28.852681,148.15898 7.5137784,126.73372 1.5802444,97.792158 -3.4171776,73.416601 5.1212992,47.791696 23.883454,30.85778 35.229927,20.61694 47.839792,14.851346 63.587396,12.703992 l 8.32303,-1.134933 0.294787,-5.0251639 c 0.223199,-3.8048282 0.710918,-5.1042516 2.008353,-5.350837 1.71821,-0.32655597 25.709002,13.0936899 26.943914,15.0721969 1.4137,2.264944 -0.85459,4.06878 -12.38409,9.848341 -14.691884,7.364817 -16.160579,7.365183 -16.580237,0.0041 l -0.306847,-5.382271 -6.693153,0.685218 C 51.250872,22.848028 38.033046,29.265703 27.649374,39.649374 20.363481,46.935268 15.826422,54.142891 12.217015,64.165396 9.8938523,70.616292 9.5756023,73.006059 9.5756023,84 c 0,10.993941 0.31825,13.383708 2.6414127,19.8346 3.609407,10.02251 8.146466,17.23013 15.432359,24.51603 7.285894,7.28589 14.493517,11.82295 24.516022,15.43235 6.450896,2.32317 8.840663,2.64142 19.834604,2.64142 10.993941,0 13.383708,-0.31825 19.834604,-2.64142 10.022506,-3.6094 17.230126,-8.14646 24.516026,-15.43235 10.65058,-10.65059 16.97839,-23.96819 18.26348,-38.437577 C 135.34036,81.735875 136.18235,80 139.42244,80 c 4.94178,0 5.71005,4.560474 2.99732,17.792158 C 138.4493,117.15856 127.49241,133.3571 110.93527,144.33842 96.040366,154.2173 75.316862,158.17204 58,154.44025 Z"
            id="path1" />
          <text x='50%' y='50%' dominant-baseline='middle' baseline-shift=-5 text-anchor='middle'>+{$settings.playback.skipIntervals.forward.opt}</text>
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
  .progressContainer {
    margin: 10px;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
    width: 100%;
    justify-content: center;
    align-items: center;
  }

  .progressContainer .times {
    display: flex;
    justify-content: space-between;
  }

  button {
    background-color: var(--systemBackground);
    color: var(--primary);
    border-radius: 5px;
    border: 1px solid var(--primary);
    box-shadow: 1px 1px 1px gray;
    cursor: pointer;
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

{#each currentItems as currentItem, i (currentItem.item.relativePath)}
  <audio
    crossorigin=anonymous
    bind:this={audioEls[i]}
    bind:playbackRate={speed}
    bind:currentTime={currentTimes[i]}
    src={currentItem.item.url?.toString() ?? ''}
  >
    <!-- on:canplay={canplay} -->
  </audio>
{/each}

<!-- <audio crossorigin="anonymous" bind:this={audioEl} bind:playbackRate={speed} bind:currentTime on:canplay={canplay}>
</audio> -->