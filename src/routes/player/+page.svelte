<script>
  export let
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

  /** @param e {Event} */
  const loaded = e => {
    const target = /** @type {HTMLAudioElement} */ (e.target)
    target.currentTime = currentTime
  }
</script>

{title}
<div>
  <img src="{thumbnail}" alt="thumbnail for book"/>
  <audio controls on:loadedmetadata={loaded}>
    <source src={url} type="audio/mp3">
  </audio>
</div>