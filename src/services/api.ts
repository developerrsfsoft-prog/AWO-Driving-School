import type { PageContent } from '../data/fallbackPages'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export type PublicService = {
  id: number
  slug: string
  title: string
  summary: string
  description: string
}

export type PublicFaq = {
  id: number
  question: string
  answer: string
}

export type PublicArea = {
  id: number
  name: string
  description: string
}

export type PublicPricingPlan = {
  id: number
  name: string
  description: string
  price: string | null
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    ...init,
  })

  if (!response.ok) {
    let message = `Request failed (${response.status}).`
    try {
      const body = (await response.json()) as { error?: unknown }
      if (typeof body.error === 'string') {
        message = body.error
      }
    } catch {
      // Keep the HTTP status message when the server does not return JSON.
    }
    throw new Error(message)
  }

  return (await response.json()) as T
}

export async function getPageBySlug(slug: string): Promise<PageContent> {
  const page = await request<Omit<PageContent, 'seoTitle' | 'metaDescription'> & {
    seo_title?: string | null
    meta_description?: string | null
    seoTitle?: string | null
    metaDescription?: string | null
  }>(`/pages/${encodeURIComponent(slug)}`)
  return {
    ...page,
    seoTitle: page.seoTitle ?? page.seo_title ?? page.title,
    metaDescription: page.metaDescription ?? page.meta_description ?? page.description,
    sections: page.sections.map((section) => ({
      ...section,
      items: Array.isArray(section.items) ? section.items : [],
    })),
  }
}

export async function getPublicSettings(): Promise<Record<string, string>> {
  return request<Record<string, string>>('/site-settings')
}

export function getPublicServices(): Promise<PublicService[]> {
  return request<PublicService[]>('/services')
}

export function getPublicFaqs(): Promise<PublicFaq[]> {
  return request<PublicFaq[]>('/faqs')
}

export function getPublicAreas(): Promise<PublicArea[]> {
  return request<PublicArea[]>('/areas')
}

export function getPublicPricing(): Promise<PublicPricingPlan[]> {
  return request<PublicPricingPlan[]>('/pricing')
}

export async function submitBooking(payload: {
  fullName: string
  email: string
  phone: string
  drivingExperience: string
  lessonType: string
  preferredDate: string
  preferredTime: string
  contactPreference: string
  message?: string
}) {
  return request<{ ok: boolean; message: string; bookingReference: string }>(`/bookings`, {
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
