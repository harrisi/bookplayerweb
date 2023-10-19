<script lang='ts'>
  import { settings } from '$lib/settings'
  import * as devalue from 'devalue'
  import { onDestroy, onMount } from 'svelte'

  const onChange = () => {
    let str = devalue.stringify($settings)
    try {
      localStorage.setItem('settings', str)
    } catch (err) {
      console.error(err)
    }
  }

  onMount(() => {
    document.querySelectorAll('input').forEach(el => {
      el.addEventListener('change', onChange)
    })
  })

  onDestroy(() => {
    document.querySelectorAll('input').forEach(el => {
      el.removeEventListener('change', onChange)
    })
  })
</script>

<h1>Settings</h1>

<h2>{$settings.general.text}</h2>
<ul>
  <label>
    <li>
      {$settings.general.contextMenu.text}
      <input type='checkbox' bind:checked={$settings.general.contextMenu.opt} />
    </li>
  </label>
</ul>

<h2>{$settings.appearance.text}</h2>
<ul>
  <label>
    <li>
      {$settings.appearance.theme.text}
      <!-- radio button -->
      <input type='text' bind:value={$settings.appearance.theme.opt} />
    </li>
  </label>
</ul>

<h2>{$settings.autoplay.text}</h2>
<ul>
  <label>
    <li>
      {$settings.autoplay.library.text}
      <input type='checkbox' bind:checked={$settings.autoplay.library.opt} />
    </li>
  </label>
  <label>
    <li>
      {$settings.autoplay.restartFinished.text}
      <input type='checkbox' bind:checked={$settings.autoplay.restartFinished.opt} />
    </li>
  </label>
</ul>

<h2>{$settings.playback.text}</h2>
<ul>
  <label>
    <li>
      {$settings.playback.boostVolume.text}
      <input type='checkbox' bind:checked={$settings.playback.boostVolume.opt} />
    </li>
  </label>
  <h3>{$settings.playback.progressLabels.text}</h3>
  <label>
    <li>
      {$settings.playback.progressLabels.chapterContext.text}
      <input type='checkbox' bind:checked={$settings.playback.progressLabels.chapterContext.opt} />
    </li>
  </label>
  <label>
    <li>
      {$settings.playback.progressLabels.remainingTime.text}
      <input type='checkbox' bind:checked={$settings.playback.progressLabels.remainingTime.opt} />
    </li>
  </label>
  <h3>{$settings.playback.skipIntervals.text}</h3>
  <label>
    <li>
      {$settings.playback.skipIntervals.forward.text}
      <input type='number' bind:value={$settings.playback.skipIntervals.forward.opt} />
    </li>
  </label>
  <label>
    <li>
      {$settings.playback.skipIntervals.rewind.text}
      <input type='number' bind:value={$settings.playback.skipIntervals.rewind.opt} />
    </li>
  </label>
  <label>
    <li>
      {$settings.playback.smartRewind.text}
      <input type='checkbox' bind:checked={$settings.playback.smartRewind.opt} />
    </li>
  </label>
</ul>

<h2>{$settings.privacy.text}</h2>
<ul>
  <label>
    <li>
      {$settings.privacy.disableCrashReports.text}
      <input type='checkbox' bind:checked={$settings.privacy.disableCrashReports.opt} />
    </li>
  </label>
</ul>

<style>

</style>