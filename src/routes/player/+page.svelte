<script>
    import { onMount } from 'svelte';

  export let data
  const { token } = data
  const root = 'https://api.tortugapower.com/v1'
  const opts = {
    headers: {
      'Origin': 'https://bp.fofgof.xyz',
      'Authorization': `Bearer ${token}`,
    },
  }

  /** @type {HTMLTextAreaElement} */
  let argsEl

  const previews = Object.create(null)
  previews.GET = {
    '/library/keys': 'GET /library/keys preview',
    '/library': 'GET /library preview',
    '/user': 'GET /user preview',
  }

  previews.POST = {
    '/library': 'POST /library preview',
    '/library/move': 'POST /library/move preview',
    '/library/rename': 'POST /library/rename preview',
    '/library/thumbnail_set': 'POST /library/thumbnail_set preview',
    '/library/bookmarks': 'POST /library/bookmarks',
  }

  previews.PUT = {
    '/library': 'PUT /library preview',
    '/library/bookmark': 'PUT /library/bookmark preview',
  }

  previews.DELETE = {
    '/library': 'DELETE /library preview',
    '/library/folder_in_out': 'DELETE /library/folder_in_out preview',
    '/user/delete': 'DELETE /user/delete preview',
  }

  /** @param {string} path */
  const GET = path => call('GET', path)

  /** @param {string} path */
  const POST = path => call('POST', path)

  /** @param {string} path */
  const PUT = path => call('PUT', path)

  /** @param {string} path */
  const DELETE = path => call('DELETE', path)

  /**
   * @param {'GET'|'PUT'|'POST'|'DELETE'} method
   * @param {string} path
   * @param {RequestInit|undefined} args
   * */
  const call = async (method, path, args = undefined) => {
    const a = argsEl.value
    console.log(a)
    const f = await fetch(`${root}${path}`, { ...opts, method, ...args}).then(resp => resp.json())
    console.dir(f)

    const pre = /** @type {HTMLPreElement} */ (document.querySelector('#results'))
    pre.textContent = JSON.stringify(f, null, '  ')
    return f
  }

  /**
   * @param e {MouseEvent|FocusEvent}
   */
  const previewCall = e => {
    if (e.target === null) return
    const which = /** @type {HTMLButtonElement} */ (e.target)
    const method = which.className.split(' ')[0]
    const pre = previews[method][which.id] // textContent?
    if (argsEl.textLength == 0) {
      argsEl.innerText = pre
      if (e.type === 'mouseenter') {
        which.addEventListener('mouseleave', () => argsEl.textContent = null, { once: true })
      } else {
        which.addEventListener('blur', () => argsEl.textContent = null, { once: true })
      }
    }
  }

  /**
   * @param e {MouseEvent}
   */
  const apiCall = e => {
    if (e.target === null) return
    const el = (/** @type {HTMLButtonElement} */ (e.target))
    call(el.className.split(' ')[0], el.id)
  }

  onMount(() => {
    argsEl = /** @type {HTMLTextAreaElement} */ (document.querySelector('#args'))
    const buttons = document.querySelectorAll('button')
    for (const button of buttons) {
      button.addEventListener('focus', previewCall)
      button.addEventListener('mouseenter', previewCall)
      button.addEventListener('click', apiCall)
    }
  })
</script>

<button class='GET' id='/library/keys'>GET library identifiers</button>
<button class='GET' id='/library'>GET library contents</button>
<button class='PUT' id='/library'>PUT item</button>
<button class='POST' id='/library'>POST item metadata</button>
<button class='POST' id='/library/move'>POST item move</button>
<button class='POST' id='/library/rename'>POST item rename</button>
<button class='DELETE' id='/library'>DELETE item</button>
<button class='DELETE' id='/library/folder_in_out'>DELETE folder shallow</button>
<button class='POST' id='/library/thumbnail_set'>POST thumbnail art</button>
<button class='POST' id='/library/bookmarks'>POST fetch bookmarks</button>
<button class='PUT' id='/library/bookmark'>PUT bookmark</button>
<button class='GET' id='/user'>GET user</button>
<button disabled class='DELETE' id='/user/delete'>DELETE user</button>

<br />

args: <textarea id='args'></textarea>

<pre id='results'></pre>

<style>
  pre {
    border: solid 1px black;
  }
</style>