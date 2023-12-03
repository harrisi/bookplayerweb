<script lang='ts'>
  import { versioned, settings } from '$lib/settings'
  import * as devalue from 'devalue'
  import { onDestroy, onMount } from 'svelte'
  import Percent from '../library/Percent.svelte'

  let estimate: StorageEstimate

  const onChange = () => {
    versioned.settings = devalue.stringify($settings)
  }

  onMount(async () => {
    document.querySelectorAll('input').forEach(el => {
      el.addEventListener('change', onChange)
    })

    estimate = await navigator.storage.estimate()
  })

  onDestroy(() => {
    document.querySelectorAll('input').forEach(el => {
      el.removeEventListener('change', onChange)
    })
  })
</script>

<div id='container'>
  <h1>Settings</h1>

  <ul>
    <h2>{$settings.general.text}</h2>
    <label>
      <li>
        {$settings.general.contextMenu.text}
        <input type='checkbox' bind:checked={$settings.general.contextMenu.opt} />
      </li>
    </label>

  <hr />
  <h2>{$settings.appearance.text}</h2>
    <label>
      <li>
        {$settings.appearance.theme.text}
        <!-- radio button -->
        <input type='text' bind:value={$settings.appearance.theme.opt} />
      </li>
    </label>

  <hr />
  <h2>{$settings.autoplay.text}</h2>
  {#each Object.entries($settings.autoplay) as [_, val]}
    {#if typeof val !== 'string'}
    <label>
      <li>
        {val.text}
        <input type='checkbox' bind:checked={val.opt} />
      </li>
    </label>
    {/if}
  {/each}

  <hr />
  <h2>{$settings.playback.text}</h2>
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
        <input type='number' min=0 bind:value={$settings.playback.skipIntervals.forward.opt} />
      </li>
    </label>
    <label>
      <li>
        {$settings.playback.skipIntervals.rewind.text}
        <div>
          <span>-</span>
          <input type='number' min=0 bind:value={$settings.playback.skipIntervals.rewind.opt} />
        </div>
      </li>
    </label>
    <label>
      <li>
        {$settings.playback.smartRewind.text}
        <input type='checkbox' bind:checked={$settings.playback.smartRewind.opt} />
      </li>
    </label>

  <hr />
  <h2>{$settings.privacy.text}</h2>
    <label>
      <li>
        {$settings.privacy.disableCrashReports.text}
        <input type='checkbox' bind:checked={$settings.privacy.disableCrashReports.opt} />
      </li>
    </label>

  <hr />
  <h2>{$settings.experimental.text}</h2>
  {#each Object.entries($settings.experimental) as [_, val]}
    <!-- this is to ignore experimental.text -->
    {#if typeof val !== 'string'}
    <label>
      <li>
        {val.text}
        <input type='checkbox' bind:checked={val.opt} />
      </li>
    </label>
    {/if}
  {/each}
  </ul>

  <div id='cacheInfo'>
    {#if estimate}
      {((estimate?.usage ?? 1) / (estimate?.quota ?? 1) * 100).toFixed(2)}%
      <Percent relativePath='cacheInfo' percentCompleted={(estimate?.usage ?? 1) / (estimate?.quota ?? 1) * 100} />
    {/if}
    <p>Usage: {((estimate?.usage ?? 0) / 1024 / 1024).toFixed(2)}MiB</p>
    <p>Quota: {((estimate?.quota ?? 1) / 1024 / 1024).toFixed(2)}MiB</p>
  </div>
</div>

<style>
  #container {
    margin-left: 8px;
    display: grid;
    width: 70%;
    justify-self: center;
    font-size: 22px;
  }

  hr {
    margin-top: 15px;
    margin-bottom: 15px;
    width: 100%;
  }
  ul {
    list-style: none;
    list-style-position: outside;
    padding-left: 0;
  }

  h3 {
    padding-left: 10px;
  }

  h3 ~ label li {
    padding-left: 30px;
  }

  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    height: 50px;
    padding-left: 10px;
    background: var(--tertiarySystemBackground);
  }

  input[type=checkbox] {
    width: 50px;
    height: 50px;
    cursor: pointer;
  }

  /* input[type='checkbox'] {
    width: 100px;
    height: 50px;
    appearance: none;
    display: grid;
    grid-template-columns: 1fr 1fr;
    text-align: center;
    margin: 0;
    color: var(--lightPrimary);
  } */

  input[type=text],input[type=number] {
    height: 100%;
    font-size: 30px;
    width: 100px;
    border: 0;
    padding: 0;
  }

  /* input[type='checkbox']:not(:checked)::before {
    width: 50;
    height: 50px;
    appearance: none;
    background: lightcoral;
    content: 'x';
    font: 34px bold;
  }

  input[type='checkbox']:not(:checked)::after {
    width: 50px;
    height: 50px;
    appearance: none;
    content: '';
  }

  input[type='checkbox']:checked::before {
    width: 50px;
    height: 50px;
    appearance: none;
    content: '';
  }

  input[type='checkbox']:checked::after {
    width: 50px;
    height: 50px;
    appearance: none;
    background: lightblue;
    content: '✓';
    font: 38px bold;
  } */
</style>