import { handleErrorWithSentry, Replay } from "@sentry/sveltekit";
import * as Sentry from '@sentry/sveltekit';
import { settings } from "$lib/settings";
import { get } from 'svelte/store'

Sentry.init({
  dsn: 'https://edecafab5ca082c53d921812788e66e3@o241342.ingest.sentry.io/4505955981852672',
  tracesSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // If the entire session is not sampled, use the below sample rate to sample
  // sessions when an error occurs.
  replaysOnErrorSampleRate: 1.0,
  
  // If you don't want to use Session Replay, just remove the line below:
  integrations: [new Replay()],

  beforeSend(event, hint) {
    const error = hint.originalException
    if (error && error.message && error.message.match(/Fetch is aborted/)) {
      return null
    }
    let { disableCrashReports } = get(settings).privacy
    if (disableCrashReports.opt) {
      return null
    }
    return event
  }
});

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();
