export type SitePhoto = {
  src: string
  alt: string
}

export const photos = {
  instructor: {
    src: '/images/driving-test-instructor.jpg',
    alt: 'An instructor reviews a practice route with a learner beside a training cone.',
  },
  inCarLesson: {
    src: '/images/in-car-lesson.jpg',
    alt: 'Two people share a calm conversation during a drive in a modern car.',
  },
  learnerDriver: {
    src: '/images/learner-driver.jpg',
    alt: 'A driver checks the road ahead from behind the steering wheel.',
  },
  daytimeDriver: {
    src: '/images/daytime-driver.jpg',
    alt: 'A driver practises with both hands on the steering wheel in daylight.',
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
    alt: 'Two people talk together while riding in a modern car.',
  },
  duskDrive: {
    src: '/images/premium/wheel-highway.jpg',
    alt: 'A driver holds the wheel as evening city lights blur beyond the windscreen.',
  },
  villageCar: {
    src: '/images/premium/white-sedan.jpg',
    alt: 'A small light-blue car parked beside a stone building.',
  },
  redHatch: {
    src: '/images/premium/car-keys.jpg',
    alt: 'A red hatchback parked on a quiet street in warm evening light.',
  },
  countryConvertible: {
    src: '/images/premium/day-steering.jpg',
    alt: 'A grey convertible parked on a leafy country lane.',
  },
  blueSaloon: {
    src: '/images/premium/keys-hand.jpg',
    alt: 'A blue saloon parked in front of a hedge.',
  },
  estateLake: {
    src: '/images/premium/wheel-close.jpg',
    alt: 'A blue estate car parked beside a lake and trees.',
  },
  whiteSuv: {
    src: '/images/premium/parked-hatch.jpg',
    alt: 'A white compact SUV parked against a backdrop of green trees.',
  },
  streetCoupe: {
    src: '/images/premium/audi-front.jpg',
    alt: 'A blue coupe parked along a city street.',
  },
  studioSaloon: {
    src: '/images/premium/woman-driving.jpg',
    alt: 'A dark saloon car shown in side profile under studio lighting.',
  },
  countryLane: {
    src: '/images/premium/road-ahead.jpg',
    alt: 'A red car travels along a tree-lined country road.',
  },
} satisfies Record<string, SitePhoto>

export type PagePhotoSet = {
  hero: SitePhoto
  sections: SitePhoto[]
  cta: SitePhoto
}

const pagePhotoSets: Record<string, PagePhotoSet> = {
  about: { hero: photos.instructor, sections: [photos.inCarLesson, photos.sharedDrive], cta: photos.villageCar },
  'driving-lessons': { hero: photos.redHatch, sections: [photos.learnerDriver, photos.instructor], cta: photos.roadAwareness },
  'beginner-driving-lessons': { hero: photos.daytimeDriver, sections: [photos.sharedDrive, photos.learnerDriver], cta: photos.compactCar },
  'pay-as-you-go': { hero: photos.villageCar, sections: [photos.inCarLesson, photos.steeringWheel], cta: photos.whiteSuv },
  'intensive-courses': { hero: photos.countryLane, sections: [photos.roadAwareness, photos.instructor], cta: photos.estateLake },
  'fast-track-courses': { hero: photos.countryConvertible, sections: [photos.duskDrive, photos.daytimeDriver], cta: photos.blueSaloon },
  'refresher-lessons': { hero: photos.steeringWheel, sections: [photos.daytimeDriver, photos.sharedDrive], cta: photos.whiteSuv },
  'test-preparation': { hero: photos.instructor, sections: [photos.learnerDriver, photos.roadAwareness], cta: photos.streetCoupe },
  'areas-we-cover': { hero: photos.estateLake, sections: [photos.villageCar, photos.compactCar], cta: photos.countryLane },
  faqs: { hero: photos.sharedDrive, sections: [photos.inCarLesson, photos.instructor], cta: photos.redHatch },
  contact: { hero: photos.blueSaloon, sections: [photos.instructor, photos.villageCar], cta: photos.inCarLesson },
  booking: { hero: photos.duskDrive, sections: [photos.instructor, photos.learnerDriver], cta: photos.sharedDrive },
  'privacy-policy': { hero: photos.studioSaloon, sections: [photos.steeringWheel], cta: photos.compactCar },
  'cookie-policy': { hero: photos.streetCoupe, sections: [photos.roadAwareness], cta: photos.villageCar },
  'terms-and-conditions': { hero: photos.whiteSuv, sections: [photos.instructor], cta: photos.blueSaloon },
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
