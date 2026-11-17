import type { PageContent } from '../data/fallbackPages'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export type PublicService = {
  id: number
  slug: string
  title: string
  summary: string
  description: string
  image_url?: string | null
  image_alt?: string | null
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

export type PublicGalleryItem = {
  id: number
  title: string
  description: string
  image_url: string
  alt_text?: string | null
  sort_order?: number
  published?: boolean
}

export type MediaItem = {
  id: number
  kind: string
  filename: string
  original_name: string
  url: string
  alt_text: string
  mime_type: string
  file_size: number
  width?: number | null
  height?: number | null
  folder?: string
  usage_count?: number
  created_at?: string
  updated_at?: string
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const isForm = typeof FormData !== 'undefined' && init?.body instanceof FormData
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...init?.headers,
    },
  })

  if (!response.ok) {
    let message = `Request failed (${response.status}).`
    try {
      const body = (await response.json()) as { error?: unknown; usage?: unknown }
      if (typeof body.error === 'string') {
        message = body.usage ? `${body.error} (${body.usage} use${body.usage === 1 ? '' : 's'})` : body.error
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
    hero_image_url?: string | null
    hero_image_alt?: string | null
    banner_image_url?: string | null
    banner_image_alt?: string | null
  }>(`/pages/${encodeURIComponent(slug)}`)
  return {
    ...page,
    seoTitle: page.seoTitle ?? page.seo_title ?? page.title,
    metaDescription: page.metaDescription ?? page.meta_description ?? page.description,
    heroImageUrl: page.heroImageUrl ?? page.hero_image_url ?? '',
    heroImageAlt: page.heroImageAlt ?? page.hero_image_alt ?? '',
    bannerImageUrl: page.bannerImageUrl ?? page.banner_image_url ?? '',
    bannerImageAlt: page.bannerImageAlt ?? page.banner_image_alt ?? '',
    sections: page.sections.map((section) => ({
      ...section,
      items: Array.isArray(section.items) ? section.items : [],
      imageUrl: section.imageUrl ?? (section as { image_url?: string }).image_url ?? '',
      imageAlt: section.imageAlt ?? (section as { image_alt?: string }).image_alt ?? '',
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

export function getPublicGallery(): Promise<PublicGalleryItem[]> {
  return request<PublicGalleryItem[]>('/gallery')
}

export type PublicTestimonial = {
  id: number
  customer_name?: string | null
  name?: string | null
  quote?: string | null
  review?: string | null
  image_url?: string | null
  image_alt?: string | null
  rating?: number | null
}

export function getPublicTestimonials(): Promise<PublicTestimonial[]> {
  return request<PublicTestimonial[]>('/testimonials')
}

export function getAdminMedia(token: string, q = '', type = ''): Promise<MediaItem[]> {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (type) params.set('type', type)
  const qs = params.toString()
  return request<MediaItem[]>(`/admin/media${qs ? `?${qs}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function uploadAdminMedia(token: string, files: File[], altText = '') {
  const form = new FormData()
  files.forEach((f) => form.append('files', f))
  if (altText) form.append('alt_text', altText)
  return request<{ ok: boolean; items: MediaItem[]; item: MediaItem }>('/admin/media/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })
}

export async function replaceAdminMedia(token: string, id: number, file: File) {
  const form = new FormData()
  form.append('file', file)
  return request<{ ok: boolean; item: MediaItem }>(`/admin/media/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })
}

export async function updateAdminMediaMeta(token: string, id: number, altText: string) {
  return request<{ ok: boolean; item: MediaItem }>(`/admin/media/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ alt_text: altText }),
  })
}

export async function deleteAdminMedia(token: string, id: number, force = false) {
  return request<{ ok: boolean }>(`/admin/media/${id}${force ? '?force=true' : ''}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}
