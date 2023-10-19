import type { Writable } from 'svelte/store'
import { createWritable, getStore } from './store'

type Setting<T> = {
  opt: T,
  text?: string,
}

interface Settings {
  general: {
    text: string,
    contextMenu: Setting<boolean>,
  },
  appearance: {
    text: string,
    theme: Setting<string>,
  },
  autoplay: {
    text: string,
    library: Setting<boolean>,
    restartFinished: Setting<boolean>,
  },
  privacy: {
    text: string,
    disableCrashReports: Setting<boolean>,
  },
  playback: {
    text: string,
    skipIntervals: {
      text: string,
      rewind: Setting<number>,
      forward: Setting<number>,
    },
    smartRewind: Setting<boolean>,
    boostVolume: Setting<boolean>,
    globalSpeed: Setting<boolean>,
    progressLabels: {
      text: string,
      remainingTime: Setting<boolean>,
      chapterContext: Setting<boolean>,
    }
  },
}

let _default: Settings = {
  general: {
    text: 'General',
    contextMenu: {
      opt: true,
      text: 'Use custom context menu',
    },
  },
  appearance: {
    text: 'Appearance',
    theme: {
      opt: 'default',
      text: 'Select theme',
    },
  },
  autoplay: {
    text: 'Autoplay',
    library: {
      opt: true,
      text: 'library',
    },
    restartFinished: {
      opt: true,
      text: 'restart after finished',
    },
  },
  privacy: {
    text: 'Privacy',
    disableCrashReports: {
      opt: true,
      text: 'Disable crash reporting',
    },
  },
  playback: {
    text: 'Playback',
    skipIntervals: {
      text: 'Skip intervals',
      rewind: {
        opt: 30,
        text: 'rewind amount',
      },
      forward: {
        opt: 30,
        text: 'skip amount',
      },
    },
    smartRewind: {
      opt: true,
      text: 'rewind 30 seconds when paused for over 10 minutes',
    },
    boostVolume: {
      opt: false,
      text: 'boost volume',
    },
    globalSpeed: {
      opt: true,
      text: 'set speed for all books',
    },
    progressLabels: {
      text: 'Progress labels',
      remainingTime: {
        opt: true,
        text: 'show remaining time',
      },
      chapterContext: {
        opt: true,
        text: 'show chapter context',
      },
    },
  },
}

const settings: Writable<Settings> = getStore('settings', _default)

export { type Setting, type Settings, settings }