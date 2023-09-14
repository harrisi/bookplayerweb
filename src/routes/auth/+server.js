import { json } from '@sveltejs/kit'
import { apiCall } from '$lib'

/** @type {import('./$types').RequestHandler} */
export async function POST({ cookies, request }) {
  const data = await request.formData()
  const id_token = data.get('id_token')

  const f = await apiCall('POST', '/user/login', { body: JSON.stringify({token_id: id_token}) })
  .catch(error => error)
  const { token } = f

  cookies.set('token', token, { path: '/' })
  return json({status: 200})
}
