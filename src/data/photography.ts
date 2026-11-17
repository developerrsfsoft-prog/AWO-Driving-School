export type SitePhoto = {
  src: string
  alt: string
}

export const photos = {
  instructor: {
    src: '/images/driving-test-instructor.jpg',
    alt: 'A driving instructor explains a route beside a car and training cone.',
  },
  inCarLesson: {
    src: '/images/in-car-lesson.jpg',
    alt: 'Two people share a drive in a modern car; illustrative stock photography.',
  },
  learnerDriver: {
    src: '/images/learner-driver.jpg',
    alt: 'A driver checks the road ahead from behind the steering wheel.',
  },
  daytimeDriver: {
    src: '/images/daytime-driver.jpg',
    alt: 'A driver practises with both hands on the steering wheel.',
  },
  roadAwareness: {
    src: '/images/driver-road.jpg',
    alt: 'A driver keeps both hands on the wheel while looking through the windscreen.',
  },
  steeringWheel: {
    src: '/images/lesson-in-car.jpg',
    alt: 'A driver holds the steering wheel inside a modern car.',
  },
  compactCar: {
    src: '/images/driving-practice.jpg',
    alt: 'A compact blue car parked on a quiet street.',
  },
  sharedDrive: {
    src: '/images/two-drivers.jpg',
    alt: 'Two people share a conversation while riding in a modern car; illustrative stock photography.',
  },
} satisfies Record<string, SitePhoto>

export type PagePhotoSet = {
  hero: SitePhoto
  sections: SitePhoto[]
  cta: SitePhoto
}

const pagePhotoSets: Record<string, PagePhotoSet> = {
  about: { hero: photos.instructor, sections: [photos.inCarLesson, photos.sharedDrive], cta: photos.compactCar },
  'driving-lessons': { hero: photos.inCarLesson, sections: [photos.learnerDriver, photos.instructor], cta: photos.roadAwareness },
  'beginner-driving-lessons': { hero: photos.daytimeDriver, sections: [photos.sharedDrive, photos.learnerDriver], cta: photos.instructor },
  'pay-as-you-go': { hero: photos.compactCar, sections: [photos.inCarLesson, photos.steeringWheel], cta: photos.sharedDrive },
  'intensive-courses': { hero: photos.learnerDriver, sections: [photos.roadAwareness, photos.instructor], cta: photos.compactCar },
  'fast-track-courses': { hero: photos.sharedDrive, sections: [photos.instructor, photos.daytimeDriver], cta: photos.roadAwareness },
  'refresher-lessons': { hero: photos.steeringWheel, sections: [photos.daytimeDriver, photos.sharedDrive], cta: photos.instructor },
  'test-preparation': { hero: photos.instructor, sections: [photos.learnerDriver, photos.roadAwareness], cta: photos.compactCar },
  'areas-we-cover': { hero: photos.roadAwareness, sections: [photos.compactCar, photos.daytimeDriver], cta: photos.sharedDrive },
  faqs: { hero: photos.learnerDriver, sections: [photos.inCarLesson, photos.instructor], cta: photos.roadAwareness },
  contact: { hero: photos.sharedDrive, sections: [photos.instructor, photos.compactCar], cta: photos.inCarLesson },
  booking: { hero: photos.inCarLesson, sections: [photos.instructor, photos.learnerDriver], cta: photos.sharedDrive },
  'privacy-policy': { hero: photos.roadAwareness, sections: [photos.steeringWheel], cta: photos.compactCar },
  'cookie-policy': { hero: photos.compactCar, sections: [photos.roadAwareness], cta: photos.inCarLesson },
  'terms-and-conditions': { hero: photos.daytimeDriver, sections: [photos.instructor], cta: photos.sharedDrive },
}

export function getPagePhotoSet(slug: string): PagePhotoSet {
  return pagePhotoSets[slug] ?? {
    hero: photos.inCarLesson,
    sections: [photos.learnerDriver, photos.instructor],
    cta: photos.roadAwareness,
  }
}

export function resolvePhoto(
  url: string | null | undefined,
  fallback: SitePhoto,
  alt?: string | null,
): SitePhoto {
  const src = (url ?? '').trim()
  if (!src) return fallback
  return { src, alt: (alt ?? '').trim() || fallback.alt }
}
