export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export async function generateFaqs(description, { timeoutMs = 20000 } = {}) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${BASE_URL}/generate_faq`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
      signal: controller.signal,
    })

    const contentType = res.headers.get('content-type') || ''
    let body
    if (contentType.includes('application/json')) {
      body = await res.json()
    } else {
      const text = await res.text()
      try { body = JSON.parse(text) } catch { body = { raw: text } }
    }

    if (!res.ok) {
      const message = body?.error || body?.message || (typeof body?.raw === 'string' && body.raw) || `Request failed with status ${res.status}`
      const error = new Error(message)
      error.status = res.status
      throw error
    }

    return body
  } catch (e) {
    if (e.name === 'AbortError') {
      const err = new Error('Request timed out. Please try again.')
      err.code = 'TIMEOUT'
      throw err
    }
    if (e instanceof TypeError) {
      // Network error (CORS, DNS, offline)
      const err = new Error('Cannot reach the backend. Check that it is running and CORS is configured.')
      err.code = 'NETWORK'
      throw err
    }
    throw e
  } finally {
    clearTimeout(timeoutId)
  }
}


