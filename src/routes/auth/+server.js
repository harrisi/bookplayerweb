import { json } from '@sveltejs/kit'

/** @type {import('./$types').RequestHandler} */
export async function POST({ cookies, request }) {
  const data = await request.formData()
  const id_token = data.get('id_token')

  const f = await fetch('https://api.tortugapower.com/v1/user/login',
    {
      body: JSON.stringify({
        token_id: id_token,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    }
  ).then(resp => resp.text())
  .catch(error => error)
  console.log(f)
  const { token } = f

  cookies.set('id_token', token)
  return json({status: 200})
}
