import type { Writable } from 'svelte/store'
import { getStore } from './store'
import * as devalue from 'devalue'
import { version } from '$app/environment'

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
      text: 'Library',
    },
    restartFinished: {
      opt: true,
      text: 'Restart after finished',
    },
  },
  privacy: {
    text: 'Privacy',
    disableCrashReports: {
      opt: false,
      text: 'Disable crash reporting',
    },
  },
  playback: {
    text: 'Playback',
    skipIntervals: {
      text: 'Skip intervals',
      rewind: {
        opt: 30,
        text: 'Rewind amount',
      },
      forward: {
        opt: 30,
        text: 'Skip amount',
      },
    },
    smartRewind: {
      opt: true,
      text: 'Rewind 30 seconds when paused for over 10 minutes',
    },
    boostVolume: {
      opt: false,
      text: 'Boost volume',
    },
    globalSpeed: {
      opt: true,
      text: 'Set speed for all books',
    },
    progressLabels: {
      text: 'Progress labels',
      remainingTime: {
        opt: true,
        text: 'Show remaining time',
      },
      chapterContext: {
        opt: true,
        text: 'Show chapter context',
      },
    },
  },
}

const settingsStr = `settings-${version}`

let prevVersion = localStorage.getItem('prevVersion')
if (prevVersion !== version)
  localStorage.removeItem(`settings-${prevVersion}`)
localStorage.setItem('prevVersion', version)

const versioned = {
  get settings() { return localStorage.getItem(settingsStr) ?? ''},
  set settings(val: string) { localStorage.setItem(settingsStr, val) },
}

const settings: Writable<Settings> = getStore('settings', versioned.settings && devalue.parse(versioned.settings) || _default)

if (!versioned.settings)
  versioned.settings = devalue.stringify(_default)

export { type Setting, type Settings, settings, versioned }