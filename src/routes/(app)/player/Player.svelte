<script context='module'>
  let userInteracted = false
</script>

<script lang='ts'>
  import { onDestroy, onMount } from "svelte"
  import { library } from "$lib/api"
  import { getStore } from '$lib/store'
  import { ItemType, type Item } from "$lib/types"
  import Overlay from "$lib/components/Overlay.svelte"
  import Slider from "./Slider.svelte"
  import SliderSpeed from './SliderSpeed.svelte'
  import { settings } from "$lib/settings"
  import { formatTime, getMetadata } from "$lib/util"
  import type NodeID3 from "node-id3"
  import type { IAudioMetadata } from "music-metadata-browser"
  import Popup from "$lib/components/Popup.svelte"
  import Bookmarks from "$lib/components/Bookmarks.svelte"

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
  } = item

  let mounted = false

  /**
   * Used to keep track of when the last metadata was sent, so we don't send updates too often.
   */
  let lastUpdate: number | undefined

  /**
   * percentCompleted store for the item, so we can update the progress in the grid view
   */
  let store = getStore(relativePath, percentCompleted)

  let playing = false

  /**
   * Audio element handle.
  */
  let audioEl: HTMLAudioElement

  /**
   * Reference to the audio element for the currently playing item.
   * For volumes this is a reference to whichever file is currently playing.
   */
  // let audioEl: HTMLAudioElement

  /**
   * Holds the value of sleepTimerEl. This isn't strictly necessary but it's helpful.
   */
  let sleepTimer: string

  /**
   * Sleep timer html element.
   */
  let sleepTimerEl: HTMLSelectElement

  /**
   * Chapters. I need to define a representation for all the different libraries to make this more useful.
   */
  let chapters: any[] = []

  let currentItems: {start: number, end: number, item: Item}[] = []

  let currentItemIndex = 0

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
    }, [['Keep-Alive', 'true']])
  }

  onDestroy(() => {
    if (url)
      URL.revokeObjectURL(url.toString())
    updateMetadata()
  })

  const logTimes = (s: string, n = currentItemIndex) => {
    console.log(`${s}; currentTime: ${currentTime}, audioEl.currentTime: ${audioEl && (audioEl.currentTime || '(N/A)')}, new Date(): ${new Date()}`)
  }

  const ended = async () => {
    if (Math.abs(currentTime - currentItems[currentItems.length - 1].end) > 1) {
      currentTime += 0.1
    }
  }

  const setupPlayer = async () => {
    if (!audioEl) {
      audioEl = document.querySelector('audio')!
    }
    setListeners()

    console.log('player onMount')
    // handle items that have never been played.
    if (!currentTime) currentTime = 0

    if (type === ItemType.File) {
      currentItems.push({start: 0, end: duration, item})
      currentItemIndex = 0
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
    } else if (type === ItemType.Volume) {
      console.log('setting up volume')

      // find which file we're in
      let volumeChildren: Item[] = await library.getContent({
        relativePath: `${item.relativePath}/`,
        sign: true,
      }).then(res => res.content)

      volumeChildren.sort((a, b) => (a.orderRank ?? 0) - (b.orderRank ?? 0))

      let prevDurations = 0
      let found = false

      for (let [index, item] of volumeChildren.entries()) {
        let { duration = 0 } = item

        currentItems.push({start: prevDurations, end: prevDurations + duration, item})
        console.log(`pushing {elementID: '${item.title}', startTimeMs: ${prevDurations * 1000}, endTimeMs: ${(prevDurations + duration) * 1000}} to chapters`)
        chapters.push({
          elementID: item.title,
          startTimeMs: prevDurations * 1000,
          endTimeMs: (prevDurations + duration) * 1000,
        })

        if ((duration + prevDurations) >= currentTime) {
          if (!found) {
            found = true
            currentItemIndex = index
          }
        }
        prevDurations += duration
      }
    }

    setSrc()

    if ('mediaSession' in navigator) {
      // this doesn't work correctly with volumes, if each item has it's own artwork.
      navigator.mediaSession.metadata = new MediaMetadata({
        title,
        artist: details,
        album: title,
        artwork: [{ src: thumbnail?.toString() ?? '' }],
      })
    }

    mounted = true

  }

  onMount(setupPlayer)

  let wasPlaying = false

  const setListeners = () => {
      audioEl.preservesPitch = true

      // audioEvents.forEach(ev => {
      //   // console.log(ev)
      //   if (!['ended', 'paused', 'play', 'playing', 'timeupdate'].includes(ev))
      //     audioEl.addEventListener(ev, () => logTimes(ev, index))
      // })
      // console.log('the rest')

      // audioEl.addEventListener('canplay', canplay)
      audioEl.addEventListener('ended', async () => { logTimes('ended'); await updateMetadata(); ended() })
      audioEl.addEventListener('pause', () => { logTimes('pause'); playing = false; updateMetadata() })
      // audioEl.addEventListener('playing', () => playing = true)
      audioEl.addEventListener('play', () => playing = true)
      audioEl.addEventListener('timeupdate', () => {
        if (!changing) {
          currentTime = currentItems[currentItemIndex].start + audioEl.currentTime
          $store = (currentTime / duration) * 100
        }
        changing = false
      })
  }

  const playPause = async () => {
    console.log(`playPause, playing: ${playing}`)
    if (!userInteracted) userInteracted = true
    if (playing) {
      audioEl.pause()
    } else {
      audioEl.play().then(console.log).catch(console.error)
    }
    playing = !playing
  }

  $: {
    if (!playing) {
      console.log('setting wasPlaying to false in 100ms')
      setTimeout(() => wasPlaying = false, 100)
    } else {
      console.log('setting wasPlaying to true')
      wasPlaying = true
    }
  }

  const skip = (time: number) => {
    changing = true

    currentTime += time
  }

  const sleep = () => {
    if (sleepTimer === 'Sleep timer') return

    if (sleepTimer === 'current chapter') {
      if (type === ItemType.Volume) {
        audioEl.addEventListener('ended', () => {
          console.log('sleep timer finished')
          audioEl.pause()
          wasPlaying = false
          sleepTimer = 'Sleep timer'
        }, {
          once: true,
        })
      } else { // file
        let f: { (this: HTMLAudioElement, ev: Event): any; (): void; (this: HTMLAudioElement, ev: Event): any }
        const sleepFn = (currentChapter: {endTimeMs?: number}) => {
          return () => {
            if (currentChapter.endTimeMs === undefined) return;
            console.log('currentTime * 1000', currentTime * 1000)
            console.log('currentChapter.endTimeMs', currentChapter.endTimeMs)
            if (currentTime * 1000 >= currentChapter.endTimeMs) {
              console.log('sleep timer finished')
              audioEl.pause()
              wasPlaying = false
              sleepTimer = 'Sleep timer'
              audioEl.removeEventListener('timeupdate', f)
            }
          }
        }
        f = sleepFn(currentChapter)
        audioEl.addEventListener('timeupdate', f)
      }

      return
    }

    if (sleepTimer === 'custom') {
      return
    }

    if (sleepTimer.includes('h')) {
      setTimeout(() => {
        audioEl.pause()
        sleepTimer = 'Sleep timer'
      }, 1 * 60 * 60 * 1000)
    }

    let minutes = sleepTimer.match(/\d+/)?.at(0)!
    setTimeout(() => {
      audioEl.pause()
      sleepTimer = 'Sleep timer'
    }, parseInt(minutes) * 60 * 1000)
  }

  let currentChapter: {startTimeMs?: number, endTimeMs?: number, item?: Item} = {}

  const setSrc = () => {

    console.log('setSrc')

    let token = localStorage.getItem('token')

    if (navigator.serviceWorker.controller) {
      console.log('sending service worker token')
      navigator.serviceWorker.controller.postMessage({
        type: 'SET_TOKEN',
        token,
      })
    } else {
      console.log('not sending token')
    }

    console.log('setting src')
    let res = currentItems[currentItemIndex].item.url?.toString() ?? ''

    // if ($settings.experimental.apiBeta.opt) {
    //   res += res ? `?token=${localStorage.getItem('token')}` : ''
    // }
    audioEl.src = res
  }

  $: {
    let targetIndex = currentItems.findIndex(item => 
      currentTime >= item.start && currentTime < item.end
    )

    if (targetIndex !== -1 && targetIndex !== currentItemIndex) {
      // I want this in case wasPlaying changes to false between pause/play.
      let wp = playing || wasPlaying
      audioEl.pause()
      currentItemIndex = targetIndex
      setSrc()
      audioEl.load()
      audioEl.currentTime = currentTime - currentItems[currentItemIndex].start
      if (wp) {
        audioEl.play().catch(console.error)
      }
    } else if (targetIndex === currentItemIndex) {
      let adjustedCurrentTime = currentTime - currentItems[currentItemIndex].start
      if (Math.abs(audioEl.currentTime - adjustedCurrentTime) > 0.1) {
        audioEl.currentTime = adjustedCurrentTime
      }
    }
  }

  $: {
    currentChapter = chapters.find(chapter => 
      chapter.startTimeMs <= currentTime * 1000 && chapter.endTimeMs >= currentTime * 1000
    )
  }

  let changing = false

  function onSliderChange(e: Event) {
    changing = true
    const { valueAsNumber } = e.target! as HTMLInputElement

    currentItemIndex = currentItems.findIndex((item) => {
      return item.start <= valueAsNumber && item.end >= valueAsNumber
    })
  }

  let showing: { top: number, left: number } | undefined
  let sleepShowing: { top: number, left: number } | undefined
  let bookmarksShowing: { top: number, left: number } | undefined

</script>

<Overlay --bottom='5px'>
  <div class='player'>
    <div class='left'>
      <img class='artwork' src='{thumbnail?.toString()}' alt='thumbnail for book' />

      <div class='info'>
        <span class='title'>{title}</span>
        <span class='author'>{details}</span>
      </div>

      <div class='progressContainer'>
        <div class='times'>
          <div class='currentTime'>{formatTime(currentTime)}</div>
          <div class='currentChapter'>{(currentChapter && ((currentChapter.tags && currentChapter.tags?.title) || currentChapter.elementID)) ?? ''}</div>
          <div class='duration'>{formatTime(duration)}</div>
        </div>
        <Slider min=0 max={Math.ceil(duration)} bind:value={currentTime} bind:changing onChange={onSliderChange} />
      </div>
    </div>

    <div class='right'>
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class='speed'>
        <button on:click|preventDefault|stopPropagation={e => {
          const target = e.target.tagName === 'DIV' ? e.target.parentNode : e.target
          showing = showing !== undefined ? undefined : { top: target.offsetTop, left: target.offsetLeft + target.offsetWidth / 2 }
        }}>
          <div>
            {speed.toFixed(1)}x
          </div>
        </button>
        {#if showing}
          <Popup bind:showing title='Playback speed'>
            <SliderSpeed min=0.5 max=4 step=0.1 bind:value={speed} onChange={() => { audioEl.playbackRate = speed; console.log('change'); }} />
          </Popup>
        {/if}
      </label>

      <button on:click={() => skip(-$settings.playback.skipIntervals.rewind.opt)}>
        <svg class='skipReverse' viewBox='0 0 144 156'>
          <path class='reverse'
            d="M 58,154.44025 C 28.852681,148.15898 7.5137784,126.73372 1.5802444,97.792158 -3.4171776,73.416601 5.1212992,47.791696 23.883454,30.85778 35.229927,20.61694 47.839792,14.851346 63.587396,12.703992 l 8.32303,-1.134933 0.294787,-5.0251639 c 0.223199,-3.8048282 0.710918,-5.1042516 2.008353,-5.350837 1.71821,-0.32655597 25.709002,13.0936899 26.943914,15.0721969 1.4137,2.264944 -0.85459,4.06878 -12.38409,9.848341 -14.691884,7.364817 -16.160579,7.365183 -16.580237,0.0041 l -0.306847,-5.382271 -6.693153,0.685218 C 51.250872,22.848028 38.033046,29.265703 27.649374,39.649374 20.363481,46.935268 15.826422,54.142891 12.217015,64.165396 9.8938523,70.616292 9.5756023,73.006059 9.5756023,84 c 0,10.993941 0.31825,13.383708 2.6414127,19.8346 3.609407,10.02251 8.146466,17.23013 15.432359,24.51603 7.285894,7.28589 14.493517,11.82295 24.516022,15.43235 6.450896,2.32317 8.840663,2.64142 19.834604,2.64142 10.993941,0 13.383708,-0.31825 19.834604,-2.64142 10.022506,-3.6094 17.230126,-8.14646 24.516026,-15.43235 10.65058,-10.65059 16.97839,-23.96819 18.26348,-38.437577 C 135.34036,81.735875 136.18235,80 139.42244,80 c 4.94178,0 5.71005,4.560474 2.99732,17.792158 C 138.4493,117.15856 127.49241,133.3571 110.93527,144.33842 96.040366,154.2173 75.316862,158.17204 58,154.44025 Z"
            id="path2" />
          <text x='50%' y='50%' dominant-baseline='central' baseline-shift=-5 text-anchor='middle'>-{$settings.playback.skipIntervals.rewind.opt}</text>
        </svg>
      </button>

      <button on:click={playPause} class='playPause'>
        {#if (!playing)}
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
        <svg class='skip' viewBox='0 0 144 156'>
          <path
            d="M 58,154.44025 C 28.852681,148.15898 7.5137784,126.73372 1.5802444,97.792158 -3.4171776,73.416601 5.1212992,47.791696 23.883454,30.85778 35.229927,20.61694 47.839792,14.851346 63.587396,12.703992 l 8.32303,-1.134933 0.294787,-5.0251639 c 0.223199,-3.8048282 0.710918,-5.1042516 2.008353,-5.350837 1.71821,-0.32655597 25.709002,13.0936899 26.943914,15.0721969 1.4137,2.264944 -0.85459,4.06878 -12.38409,9.848341 -14.691884,7.364817 -16.160579,7.365183 -16.580237,0.0041 l -0.306847,-5.382271 -6.693153,0.685218 C 51.250872,22.848028 38.033046,29.265703 27.649374,39.649374 20.363481,46.935268 15.826422,54.142891 12.217015,64.165396 9.8938523,70.616292 9.5756023,73.006059 9.5756023,84 c 0,10.993941 0.31825,13.383708 2.6414127,19.8346 3.609407,10.02251 8.146466,17.23013 15.432359,24.51603 7.285894,7.28589 14.493517,11.82295 24.516022,15.43235 6.450896,2.32317 8.840663,2.64142 19.834604,2.64142 10.993941,0 13.383708,-0.31825 19.834604,-2.64142 10.022506,-3.6094 17.230126,-8.14646 24.516026,-15.43235 10.65058,-10.65059 16.97839,-23.96819 18.26348,-38.437577 C 135.34036,81.735875 136.18235,80 139.42244,80 c 4.94178,0 5.71005,4.560474 2.99732,17.792158 C 138.4493,117.15856 127.49241,133.3571 110.93527,144.33842 96.040366,154.2173 75.316862,158.17204 58,154.44025 Z"
            id="path1" />
          <text x='50%' y='50%' dominant-baseline='middle' baseline-shift=-5 text-anchor='middle'>+{$settings.playback.skipIntervals.forward.opt}</text>
        </svg>
      </button>

      <button on:click|preventDefault|stopPropagation={e => {
        const target = e.target.tagName === 'DIV' ? e.target.parentNode : e.target
        sleepShowing = sleepShowing !== undefined ? undefined : { top: target.offsetTop, left: target.offsetLeft + target.offsetWidth / 2 }
      }}>
      {#if sleepTimer && sleepTimer !== 'Sleep timer'}
        {sleepTimer}
      {:else}
        <span class="material-symbols-outlined">
          bedtime
        </span>
      {/if}
      </button>

      {#if sleepShowing}
      <Popup bind:showing={sleepShowing} title='Sleep timer'>
        <select name='sleep' class='sleep' bind:this={sleepTimerEl} bind:value={sleepTimer} on:change={e => { sleep(); sleepShowing = undefined; }}>
          {#each ['Sleep timer', '5m', '10m', '15m', '30m', '1h', 'current chapter', 'custom'] as val}
            <option value={val}>{val}</option>
          {/each}
        </select>
      </Popup>
      {/if}

      <button on:click|preventDefault|stopPropagation={e => {
        const target = e.target.tagName === 'DIV' ? e.target.parentNode : e.target
        bookmarksShowing = bookmarksShowing !== undefined ? undefined : { top: target.offsetTop, left: target.offsetLeft + target.offsetWidth / 2 }
      }}>
        <span class="material-symbols-outlined">
          bookmarks
        </span>
      </button>

      {#if bookmarksShowing}
      <Popup bind:showing={bookmarksShowing} title='Bookmarks'>
        <Bookmarks {item} />
      </Popup>
      {/if}
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
    margin-bottom: 5px;
  }

  button {
    background-color: var(--systemBackground);
    color: var(--primary);
    border-radius: 5px;
    border: 1px solid var(--primary);
    box-shadow: 1px 1px 1px gray;
    cursor: pointer;
  }

  .player {
    display: grid;
    grid-template-columns: 2fr 1fr;
    width: 100%;
  }

  .left {
    display: flex;
    justify-content: start;
    align-items: center;
  }

  .right {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
  }

  .info {
    display: grid;
    margin-left: 10px;
    margin-top: 10px;
  }

  img {
    height: 64px;
    width: 64px;
    background: linear-gradient(#37398c, #537bc4);
    border-radius: 4px;
    margin: 16px;
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

<audio
  crossorigin=anonymous
  bind:this={audioEl}
  bind:playbackRate={speed}
>
</audio>