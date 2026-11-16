import { useEffect, useState } from 'react'
import type { PageContent } from '../data/fallbackPages'
import { getPageBySlug } from '../services/api'

type PageResult = {
  slug: string
  page: PageContent | null
  error: string
}

export function usePublicPage(slug: string) {
  const [result, setResult] = useState<PageResult | null>(null)
  const loading = result?.slug !== slug
  const page = result?.slug === slug ? result.page : null
  const error = result?.slug === slug ? result.error : ''

  useEffect(() => {
    let active = true
    getPageBySlug(slug)
      .then((data) => {
        if (active) {
          setResult({ slug, page: data, error: '' })
        }
      })
      .catch((requestError) => {
        if (active) {
          setResult({
            slug,
            page: null,
            error: requestError instanceof Error ? requestError.message : 'Page content could not be loaded.',
          })
        }
      })
    return () => {
      active = false
    }
  }, [slug])

  return { page, loading, error }
}
