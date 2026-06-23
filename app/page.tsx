import Link from 'next/link'
import { ArrowRight, Star, MapPin, Phone, Mail } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'

export default function HomePage() {
  return (
    <PublicLayout>
      {/* HERO - full screen */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient (placeholder for actual image) */}
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal-950 via-charcoal-900 to-leather-700/20" />
        {/* Decorative overlay pattern */}
        <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'repeating-linear-gradient(45deg, #B8860B 0, #B8860B 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px'}} />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 border border-gold-500/40 text-gold-400 px-4 py-2 rounded-full text-sm tracking-widest mb-8">
            <Star size={14} fill="currentColor" />
            PREMIUM MEMBERS CLUB
            <Star size={14} fill="currentColor" />
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-6 leading-tight">
            Cigar City
            <span className="block text-gold-500">Lounge</span>
          </h1>

          {/* Divider */}
          <div className="w-32 h-px bg-gold-500 mx-auto mb-8" />

          {/* Subheading */}
          <p className="text-xl md:text-2xl lg:text-3xl text-gray-300 mb-4 font-light">
            Relax. Connect. Enjoy the Finest Cigars.
          </p>
          <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-12">
            A premium cigar lounge experience for the discerning enthusiast.
            Join our exclusive members club and discover a world of exceptional cigars,
            camaraderie, and relaxation.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/membership" className="btn-gold text-lg px-10 py-5 flex items-center gap-2">
              Become a Member
              <ArrowRight size={20} />
            </Link>
            <Link href="/cigars" className="btn-outline-gold text-lg px-10 py-5">
              Explore Our Cigars
            </Link>
          </div>

          {/* Age notice */}
          <p className="mt-10 text-gray-500 text-sm">Must be 21 or older to enter. Please enjoy responsibly.</p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500">
          <span className="text-xs tracking-widest">SCROLL</span>
          <div className="w-px h-12 bg-gradient-to-b from-gold-500 to-transparent" />
        </div>
      </section>

      {/* SECTION 1: Cigars */}
      <section className="py-24 bg-charcoal-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-gold-500 text-sm tracking-widest uppercase mb-4">Our Collection</p>
              <h2 className="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight">
                Explore Our<br />
                <span className="text-gold-500">Cigar Collection</span>
              </h2>
              <div className="w-20 h-1 bg-gold-500 mb-8" />
              <p className="text-gray-300 text-xl leading-relaxed mb-6">
                Discover premium cigars selected for every taste and occasion.
                From mild and smooth to bold and complex, our curated collection
                features the world's finest brands.
              </p>
              <p className="text-gray-400 text-base leading-relaxed mb-10">
                Our knowledgeable staff is always available to help you find the perfect cigar,
                whether you're a seasoned aficionado or just beginning your journey.
              </p>
              <Link href="/cigars" className="btn-gold inline-flex items-center gap-2">
                View Cigar List
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Cigar gallery grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Premium Selections', desc: 'Hand-rolled excellence' },
                { label: 'Cuban Heritage', desc: 'Traditional craftsmanship' },
                { label: 'New Arrivals', desc: 'Latest additions' },
                { label: 'Featured Blends', desc: 'Staff favorites' },
              ].map((item, i) => (
                <div key={i} className={`${i === 0 ? 'col-span-2' : ''} relative bg-gradient-to-br from-charcoal-800 to-charcoal-900 border border-charcoal-700 rounded-lg overflow-hidden aspect-video flex items-end`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-leather-700/20 to-charcoal-950/80" />
                  <div className="relative p-4">
                    <p className="text-white font-medium text-sm">{item.label}</p>
                    <p className="text-gold-400 text-xs">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Lounge */}
      <section className="py-24 bg-charcoal-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-gold-500 text-sm tracking-widest uppercase mb-4">Our Space</p>
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">
              Experience the <span className="text-gold-500">Lounge</span>
            </h2>
            <div className="w-20 h-1 bg-gold-500 mx-auto mb-8" />
            <p className="text-gray-300 text-xl max-w-3xl mx-auto leading-relaxed">
              A comfortable, upscale place to relax, meet friends, and enjoy your favorite cigar.
              Our lounge features premium leather seating, a full bar, and an expertly maintained humidor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { title: 'Premium Seating', desc: 'Luxurious leather chairs and private seating areas for members' },
              { title: 'Full Bar Service', desc: 'Curated selection of spirits, whiskeys, and fine beverages' },
              { title: 'Member Lockers', desc: 'Secure personal lockers for your private cigar collection' },
            ].map((item, i) => (
              <div key={i} className="bg-charcoal-950 border border-charcoal-700 rounded-lg overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-leather-600/20 to-charcoal-900" />
                <div className="p-6">
                  <h3 className="text-gold-500 font-serif text-xl mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/membership" className="btn-gold inline-flex items-center gap-2">
              Explore the Lounge
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 3: Events */}
      <section className="py-24 bg-charcoal-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Events grid */}
            <div className="grid grid-cols-2 gap-4 order-2 lg:order-1">
              {[
                { title: 'Cigar Tastings', tag: 'Members Only' },
                { title: 'Live Music Nights', tag: 'Monthly' },
                { title: 'Watch Parties', tag: 'Seasonal' },
                { title: 'Private Events', tag: 'By Request' },
              ].map((item, i) => (
                <div key={i} className="relative bg-gradient-to-br from-charcoal-800 to-charcoal-900 border border-charcoal-700 rounded-lg overflow-hidden aspect-square flex flex-col justify-between p-4">
                  <span className="inline-block bg-gold-500/20 text-gold-400 text-xs px-2 py-1 rounded border border-gold-500/30">{item.tag}</span>
                  <p className="text-white font-medium">{item.title}</p>
                </div>
              ))}
            </div>

            <div className="order-1 lg:order-2">
              <p className="text-gold-500 text-sm tracking-widest uppercase mb-4">Members Events</p>
              <h2 className="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight">
                Events at<br />
                <span className="text-gold-500">Cigar City Lounge</span>
              </h2>
              <div className="w-20 h-1 bg-gold-500 mb-8" />
              <p className="text-gray-300 text-xl leading-relaxed mb-6">
                Join exclusive events, tastings, gatherings, and member experiences
                throughout the year.
              </p>
              <p className="text-gray-400 text-base leading-relaxed mb-10">
                From intimate cigar tastings to lively watch parties and live music nights,
                there's always something happening at Cigar City Lounge.
              </p>
              <Link href="/events" className="btn-gold inline-flex items-center gap-2">
                See Upcoming Events
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* WHY JOIN section */}
      <section className="py-24 bg-gradient-to-b from-charcoal-900 to-charcoal-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gold-500 text-sm tracking-widest uppercase mb-4">Membership Benefits</p>
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">
            Why Join <span className="text-gold-500">Cigar City Lounge?</span>
          </h2>
          <div className="w-20 h-1 bg-gold-500 mx-auto mb-16" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '🏛️', title: 'Exclusive Access', desc: 'Members-only lounge access and priority seating' },
              { icon: '🔐', title: 'Personal Locker', desc: 'Secure storage for your private cigar collection' },
              { icon: '🎉', title: 'VIP Events', desc: 'Invitations to exclusive tastings and private events' },
              { icon: '💰', title: 'Member Pricing', desc: 'Special member discounts on all premium cigars' },
            ].map((item, i) => (
              <div key={i} className="bg-charcoal-900 border border-charcoal-700 hover:border-gold-500/50 rounded-lg p-8 transition-colors">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-gold-500 font-serif text-xl mb-3">{item.title}</h3>
                <p className="text-gray-400 text-base leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16">
            <Link href="/membership" className="btn-gold text-lg px-12 py-5 inline-flex items-center gap-2">
              View Membership Plans
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* NEED HELP */}
      <section className="py-16 bg-charcoal-900 border-t border-charcoal-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif text-white mb-4">Need Help or Have Questions?</h2>
          <p className="text-gray-400 text-lg mb-8">Our team is here for you. Contact us anytime.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:ADD_PHONE" className="btn-gold inline-flex items-center gap-2 justify-center">
              <Phone size={20} />
              Call Us
            </a>
            <a href="mailto:ADD_EMAIL" className="btn-outline-gold inline-flex items-center gap-2 justify-center">
              <Mail size={20} />
              Email Us
            </a>
            <Link href="/contact" className="btn-dark inline-flex items-center gap-2 justify-center">
              Contact Form
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
