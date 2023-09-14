import { redirect } from '@sveltejs/kit'

/** @type {import('./$types').RequestHandler} */
export async function GET({ cookies }) {
  cookies.delete('token', { path: '/'})
  throw redirect(308, '/')
}