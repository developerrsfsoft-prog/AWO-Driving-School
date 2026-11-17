export const homepageSectionOptions = [
  { key: 'hero', label: 'Hero introduction' },
  { key: 'approach', label: 'Learning principles' },
  { key: 'counters', label: 'Verified counters' },
  { key: 'lessons', label: 'Lesson options' },
  { key: 'steps', label: 'Getting started' },
  { key: 'practice', label: 'Skills and FAQs' },
  { key: 'faq', label: 'Frequently asked questions' },
  { key: 'contact', label: 'Contact call to action' },
] as const

export type HomepageSectionKey = (typeof homepageSectionOptions)[number]['key']
export type HomepageSections = Record<HomepageSectionKey, boolean>

export type HomepageCounter = {
  value: number
  label: string
  prefix: string
  suffix: string
}

export type HomepagePresentation = {
  sections: HomepageSections
  counters: HomepageCounter[]
}

export const defaultHomepageSections: HomepageSections = {
  hero: true,
  approach: true,
  counters: true,
  lessons: true,
  steps: true,
  practice: true,
  faq: true,
  contact: true,
}

export function parseHomepagePresentation(value?: string): HomepagePresentation {
  if (!value) {
    return { sections: defaultHomepageSections, counters: [] }
  }

  try {
    const parsed: unknown = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { sections: defaultHomepageSections, counters: [] }
    }

    const record = parsed as Record<string, unknown>
    const sectionRecord = record.sections
    const sections = { ...defaultHomepageSections }
    if (sectionRecord && typeof sectionRecord === 'object' && !Array.isArray(sectionRecord)) {
      for (const { key } of homepageSectionOptions) {
        const enabled = (sectionRecord as Record<string, unknown>)[key]
        if (typeof enabled === 'boolean') {
          sections[key] = enabled
        }
      }
    }

    const counters = Array.isArray(record.counters)
      ? record.counters.flatMap((counter): HomepageCounter[] => {
          if (!counter || typeof counter !== 'object' || Array.isArray(counter)) {
            return []
          }
          const item = counter as Record<string, unknown>
          if (
            typeof item.value !== 'number'
            || !Number.isFinite(item.value)
            || item.value < 0
            || typeof item.label !== 'string'
            || !item.label.trim()
          ) {
            return []
          }
          return [{
            value: item.value,
            label: item.label.trim(),
            prefix: typeof item.prefix === 'string' ? item.prefix : '',
            suffix: typeof item.suffix === 'string' ? item.suffix : '',
          }]
        })
      : []

    return { sections, counters }
  } catch {
    return { sections: defaultHomepageSections, counters: [] }
  }
}
