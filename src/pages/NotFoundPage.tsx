import { Link } from 'react-router-dom'
import { photos } from '../data/photography'

function NotFoundPage() {
  return (
    <section className="relative isolate flex min-h-[78vh] items-end overflow-hidden bg-[#10211c] text-white">
      <img
        src={photos.countryLane.src}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-[#10211c]/75" />
      <div className="mx-auto w-full max-w-4xl px-4 pb-20 pt-40 sm:px-6">
        <p className="eyebrow text-[#e8cf8e]">404 · Page not found</p>
        <h1 className="display mt-4 text-5xl sm:text-6xl">This road ends here.</h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-white/75">
          The page may have moved, or the address may be incorrect.
        </p>
        <Link to="/" className="btn btn-brass mt-8">
          Return home
        </Link>
      </div>
    </section>
  )
}

export default NotFoundPage
