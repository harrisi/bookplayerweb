<script lang='ts'>
  import { versioned, settings } from '$lib/settings'
  import * as devalue from 'devalue'
  import { onDestroy, onMount } from 'svelte'

  const onChange = () => {
    versioned.settings = devalue.stringify($settings)
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

  <hr />
  <h2>{$settings.privacy.text}</h2>
    <label>
      <li>
        <p>
          {$settings.privacy.disableCrashReports.text}
        </p>
        <input type='checkbox' bind:checked={$settings.privacy.disableCrashReports.opt} />
      </li>
    </label>
  </ul>
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

  input[type='checkbox'] {
    width: 100px;
    height: 50px;
    appearance: none;
    display: grid;
    grid-template-columns: 1fr 1fr;
    text-align: center;
    line-height: 50px;
    margin: 0;
    color: var(--primary);
  }

  input[type='checkbox']:not(:checked)::before {
    width: 50;
    height: 50px;
    appearance: none;
    background: red;
    content: 'x';
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
    background: blue;
    content: '✓';
  }
</style>