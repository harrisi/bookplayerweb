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
  import Chapters from '$lib/components/Chapters.svelte'

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
  let chaptersShowing: { top: number, left: number } | undefined

</script>

<Overlay --bottom='0px'>
  <div class='player'>
    <div class='left'>
      <img class='artwork' src='{thumbnail?.toString()}' alt='thumbnail for book' />

      <div class='info'>
        <span class='title'>{title}</span>
        <span class='author'>{details}</span>
      </div>
    </div>

    <div class='center'>
      <div class='progressContainer'>
        <div class='controls'>
          <button class='jump previous' on:click={() => skip(-$settings.playback.skipIntervals.rewind.opt)}>
            <span class="material-symbols-outlined">
              forward_media
            </span>
          </button>
          <button class='skip previous' on:click={() => { currentTime = 0 }}>
            <span class="material-symbols-outlined">
              skip_next
            </span>
          </button>
          <button on:click={playPause} class='playPause'>
            <span class="material-symbols-outlined">
            {#if !playing}
              play_circle
            {:else}
              pause_circle
            {/if}
            </span>
          </button>
          <button class='skip forward' on:click={() => { currentTime = duration }}>
            <span class="material-symbols-outlined">
              skip_next
            </span>
          </button>
          <button class='jump forward' on:click={() => skip($settings.playback.skipIntervals.forward.opt)}>
            <span class="material-symbols-outlined">
              forward_media
            </span>
          </button>
        </div>
        <div class='progress'>
          <div class='currentTime'>{formatTime(currentTime)}</div>
          <div class='slider'>
            <Slider min=0 max={Math.ceil(duration)} bind:value={currentTime} bind:changing onChange={onSliderChange} />
          </div>
          <div class='duration'>{formatTime(duration)}</div>
        </div>
        <div class='currentChapter'>{(currentChapter && ((currentChapter.tags && currentChapter.tags?.title) || currentChapter.elementID)) ?? ''}</div>
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

      <button on:click|preventDefault|stopPropagation={e => {
        const target = e.target.tagName === 'DIV' ? e.target.parentNode : e.target
        chaptersShowing = chaptersShowing !== undefined ? undefined : { top: target.offsetTop, left: target.offsetLeft + target.offsetWidth / 2 }
        console.log(chaptersShowing)
      }}>
        <span class="material-symbols-outlined">
          list
        </span>
      </button>

      {#if chaptersShowing}
      <Popup bind:showing={chaptersShowing} title='Chapters'>
        <Chapters {item} {chapters} />
      </Popup>
      {/if}
    </div>
  </div>
</Overlay>

<style>
  .controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 32px;
    width: 100%;
    margin-top: 8px;
  }

  .previous {
    transform: scaleX(-1);
  }

  .progress {
    display: flex;
    height: 8px;
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  .slider {
    width: 100%;
  }

  .currentChapter {
    text-align: center;
  }

  .progressContainer {
    /* background-color: red; */
    display: grid;
    grid-template-rows: 1fr 1fr 1fr;
    gap: 10px;
    width: 100%;
    /* justify-content: center;
    align-items: center; */
    height: 69px;
  }

  /* .times {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
  } */

  button {
    background-color: var(--systemBackground);
    color: var(--primary);
    border-radius: 5px;
    border: 0;
    /* border: 1px solid var(--primary); */
    /* box-shadow: 1px 1px 1px gray; */
    cursor: pointer;
    transition: color 0.25s linear;
  }

  button:hover {
    color: var(--accent);
  }

  .player {
    box-shadow: 0px -2px 4px 0px rgba(0, 0, 0, 0.10);
    display: grid;
    grid-template-columns: 1fr 3fr 1fr;
    width: 100%;
    height: 93px;
  }

  .left {
    display: flex;
    justify-content: start;
    align-items: center;
    padding: 16px;
    gap: 16px;
  }

  .center {

  }

  .right {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
  }

  .info {
    display: grid;
  }

  img {
    height: 64px;
    width: 64px;
    background: linear-gradient(#37398c, #537bc4);
    border-radius: 4px;
    /* margin: 16px; */
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
</style>

<audio
  crossorigin=anonymous
  bind:this={audioEl}
  bind:playbackRate={speed}
>
</audio>