import { fallbackPages, type PageContent } from '../data/fallbackPages'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    ...init,
  })

  if (!response.ok) {
    throw new Error(`Request failed for ${path}: ${response.status}`)
  }

  return (await response.json()) as T
}

export async function getPageBySlug(slug: string): Promise<PageContent> {
  try {
    const page = await request<PageContent>(`/pages/${slug}`)
    return page
  } catch {
    const fallback = fallbackPages.find((entry) => entry.slug === slug)
    if (fallback) {
      return fallback
    }
    return {
      slug,
      title: 'Page',
      description: 'Page content unavailable.',
      seoTitle: 'Page',
      metaDescription: 'Page content unavailable.',
      sections: [{ heading: 'Page unavailable', body: 'The content for this page is not currently available.', items: [] }],
    }
  }
}

export async function getPublicSettings(): Promise<Record<string, string>> {
  try {
    return await request<Record<string, string>>('/site-settings')
  } catch {
    return {
      site_name: 'AWO Driving School',
      phone: '+44 7465 664828',
      email: 'Awodivingschool@gmail.com',
    }
  }
}

export async function submitBooking(payload: Record<string, string>) {
  return request<{ ok: boolean; message: string; bookingReference?: string }>(`/bookings`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function submitContact(payload: Record<string, string>) {
  return request<{ ok: boolean; message: string }>(`/contact`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
