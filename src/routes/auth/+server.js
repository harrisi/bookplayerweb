import { json } from '@sveltejs/kit'
import { dev } from '$app/environment'

/** @type {import('./$types').RequestHandler} */
export async function POST({ cookies, request }) {
  const data = await request.formData()
  const id_token = data.get('id_token')

  const f = await fetch(dev ? 'http://localhost:5003/v1/user/login' : 'https://api.tortugapower.com/v1/user/login',
    {
      body: JSON.stringify({
        token_id: id_token,
      }),
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://bp.fofgof.xyz'
      },
      method: 'POST',
    }
  ).then(async resp => await resp.json())
  .catch(error => error)
  const { token } = f

  cookies.set('token', token)
  return json({status: 200})
}
