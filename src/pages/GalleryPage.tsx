import { ArrowRight, Camera, ImageOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import Reveal from '../components/common/Reveal'
import { photos } from '../data/photography'
import { getPublicGallery, type PublicGalleryItem } from '../services/api'

function GalleryPage() {
  const [items, setItems] = useState<PublicGalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getPublicGallery()
      .then((data) => {
        if (active) setItems(data)
      })
      .catch(() => {
        if (active) setError('Gallery images could not be loaded. Please try again.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <>
      <Helmet>
        <title>Gallery | AWO Driving School</title>
        <meta name="description" content="Browse the AWO Driving School photo gallery." />
      </Helmet>

      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <img
          src={items[0]?.image_url || photos.instructor.src}
          alt={items[0]?.alt_text || 'AWO Driving School gallery'}
          width={1440}
          height={1000}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = photos.instructor.src }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/40" />
        <div className="mx-auto flex min-h-[68vh] max-w-7xl flex-col justify-end px-4 pb-16 pt-36 sm:px-6 lg:px-8">
          <Reveal className="max-w-3xl">
            <p className="eyebrow inline-flex items-center gap-2 text-[#e8cf8e]">
              <Camera className="h-4 w-4" /> Gallery
            </p>
            <h1 className="display mt-5 text-5xl text-white sm:text-6xl lg:text-7xl">Our Gallery</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
              A look at AWO Driving School. Images are managed from the admin dashboard.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-slate-50 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {error ? (
            <p role="status" className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>
          ) : null}
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-200" />
              ))}
            </div>
          ) : null}
          {!loading && !error && items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">
              <ImageOff className="h-10 w-10 text-slate-400" />
              <p className="text-lg font-semibold text-slate-800">No gallery images yet</p>
              <p className="max-w-md text-sm text-slate-500">Images added from the admin dashboard (Gallery) will appear here automatically.</p>
            </div>
          ) : null}
          {!loading && items.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item, index) => (
                <Reveal key={item.id ?? `${item.image_url}-${index}`} delay={(index % 4) * 0.04}>
                  <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                    <div className="relative overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.alt_text || item.title || 'Gallery image'}
                        width={1200}
                        height={900}
                        loading="lazy"
                        decoding="async"
                        className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement
                          img.onerror = null
                          img.src = photos.compactCar.src
                        }}
                      />
                    </div>
                    {(item.title || item.description) ? (
                      <div className="p-4">
                        {item.title ? <h3 className="text-base font-bold text-slate-900">{item.title}</h3> : null}
                        {item.description ? <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p> : null}
                      </div>
                    ) : null}
                  </article>
                </Reveal>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="bg-slate-950 py-14 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-4 text-center sm:px-6 md:flex-row md:text-left lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Get started</p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">Ready to start your driving journey?</h2>
          </div>
          <Link to="/book" className="btn btn-brass">
            Book a lesson <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  )
}

export default GalleryPage
