'use client'
import { useState, useMemo } from 'react'
import { Search, Filter, X } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'
import type { Cigar } from '@/types'
import Link from 'next/link'

interface Props {
  cigars: Cigar[]
  brands: string[]
  countries: string[]
  wrappers: string[]
}

export default function CigarCatalog({ cigars, brands, countries, wrappers }: Props) {
  const [search, setSearch] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedStrength, setSelectedStrength] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedWrapper, setSelectedWrapper] = useState('')
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)

  const filtered = useMemo(() => {
    return cigars.filter(cigar => {
      if (search && !`${cigar.brand} ${cigar.name} ${cigar.flavor_notes || ''}`.toLowerCase().includes(search.toLowerCase())) return false
      if (selectedBrand && cigar.brand !== selectedBrand) return false
      if (selectedStrength && cigar.strength !== selectedStrength) return false
      if (selectedCountry && cigar.country_of_origin !== selectedCountry) return false
      if (selectedWrapper && cigar.wrapper !== selectedWrapper) return false
      if (showAvailableOnly && cigar.availability_status !== 'available') return false
      if (showFeaturedOnly && !cigar.is_featured) return false
      return true
    })
  }, [cigars, search, selectedBrand, selectedStrength, selectedCountry, selectedWrapper, showAvailableOnly, showFeaturedOnly])

  const clearFilters = () => {
    setSearch(''); setSelectedBrand(''); setSelectedStrength('');
    setSelectedCountry(''); setSelectedWrapper('');
    setShowAvailableOnly(false); setShowFeaturedOnly(false);
  }

  const hasFilters = search || selectedBrand || selectedStrength || selectedCountry || selectedWrapper || showAvailableOnly || showFeaturedOnly

  const availabilityColor = (status: string) => {
    if (status === 'available') return 'green'
    if (status === 'limited') return 'orange'
    return 'red'
  }

  return (
    <div>
      {/* Filters */}
      <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" size={20} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search cigars by name, brand, or flavor..."
              className="w-full bg-charcoal-950 border border-charcoal-700 text-white placeholder-charcoal-400 rounded-lg pl-12 pr-4 py-3 text-base focus:outline-none focus:border-gold-500"
            />
          </div>

          {/* Filter selects */}
          <div className="flex flex-wrap gap-3">
            {[
              { value: selectedBrand, setter: setSelectedBrand, options: brands, placeholder: 'All Brands' },
              { value: selectedStrength, setter: setSelectedStrength, options: ['mild', 'medium', 'full'], placeholder: 'Strength' },
              { value: selectedCountry, setter: setSelectedCountry, options: countries, placeholder: 'Country' },
              { value: selectedWrapper, setter: setSelectedWrapper, options: wrappers, placeholder: 'Wrapper' },
            ].map((filter, i) => (
              <select
                key={i}
                value={filter.value}
                onChange={e => filter.setter(e.target.value)}
                className="bg-charcoal-950 border border-charcoal-700 text-white rounded-lg px-4 py-3 text-base focus:outline-none focus:border-gold-500 capitalize"
              >
                <option value="">{filter.placeholder}</option>
                {filter.options.map(opt => (
                  <option key={opt} value={opt} className="capitalize">{opt}</option>
                ))}
              </select>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-4">
          <label className="flex items-center gap-2 cursor-pointer text-gray-300 text-base">
            <input type="checkbox" checked={showAvailableOnly} onChange={e => setShowAvailableOnly(e.target.checked)} className="w-5 h-5 accent-gold-500" />
            Available Only
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-gray-300 text-base">
            <input type="checkbox" checked={showFeaturedOnly} onChange={e => setShowFeaturedOnly(e.target.checked)} className="w-5 h-5 accent-gold-500" />
            Featured Only
          </label>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-gold-500 hover:text-gold-400 text-sm ml-auto">
              <X size={16} />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <p className="text-gray-400 text-base mb-6">
        Showing <span className="text-white font-medium">{filtered.length}</span> of {cigars.length} cigars
      </p>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🚭</div>
          <h3 className="text-2xl font-serif text-white mb-2">No Cigars Found</h3>
          <p className="text-gray-400 mb-6">Try adjusting your filters or search term.</p>
          <button onClick={clearFilters} className="btn-gold">Clear Filters</button>
        </div>
      )}

      {/* Cigars grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(cigar => {
          const primaryImage = cigar.images?.find(img => img.is_primary) || cigar.images?.[0]
          return (
            <Link
              key={cigar.id}
              href={`/cigars/${cigar.id}`}
              className="bg-charcoal-900 border border-charcoal-700 hover:border-gold-500/50 rounded-xl overflow-hidden transition-all hover:shadow-lg hover:shadow-gold-500/5 group"
            >
              {/* Image */}
              <div className="aspect-video bg-gradient-to-br from-leather-700/20 to-charcoal-950 relative">
                {primaryImage ? (
                  <img src={primaryImage.image_url} alt={cigar.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-5xl">🚭</div>
                )}
                <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                  {cigar.is_featured && <Badge variant="gold">Featured</Badge>}
                  {cigar.is_new_arrival && <Badge variant="blue">New</Badge>}
                  {cigar.is_member_only && <Badge variant="gray">Members Only</Badge>}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <p className="text-gold-400 text-sm font-medium uppercase tracking-wider mb-1">{cigar.brand}</p>
                <h3 className="text-white font-serif text-xl mb-3 group-hover:text-gold-400 transition-colors">{cigar.name}</h3>

                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  {cigar.size && (
                    <div><span className="text-charcoal-400">Size:</span> <span className="text-gray-300">{cigar.size}</span></div>
                  )}
                  {cigar.strength && (
                    <div><span className="text-charcoal-400">Strength:</span> <span className="text-gray-300 capitalize">{cigar.strength}</span></div>
                  )}
                  {cigar.wrapper && (
                    <div><span className="text-charcoal-400">Wrapper:</span> <span className="text-gray-300">{cigar.wrapper}</span></div>
                  )}
                  {cigar.country_of_origin && (
                    <div><span className="text-charcoal-400">Origin:</span> <span className="text-gray-300">{cigar.country_of_origin}</span></div>
                  )}
                </div>

                {cigar.flavor_notes && (
                  <p className="text-gray-400 text-sm italic mb-4 line-clamp-2">{cigar.flavor_notes}</p>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-gold-500 font-bold text-lg">
                      {cigar.price ? formatCurrency(cigar.price) : cigar.price_display}
                    </span>
                  </div>
                  <Badge variant={availabilityColor(cigar.availability_status) as any}>
                    {cigar.availability_status === 'out_of_stock' ? 'Out of Stock' : cigar.availability_status === 'limited' ? 'Limited' : 'Available'}
                  </Badge>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* No cigars in DB yet */}
      {cigars.length === 0 && (
        <div className="text-center py-20 bg-charcoal-900 border border-charcoal-700 rounded-xl">
          <div className="text-6xl mb-4">🚭</div>
          <h3 className="text-2xl font-serif text-white mb-2">Catalog Coming Soon</h3>
          <p className="text-gray-400 text-lg">Our cigar catalog is being prepared. Please visit us in-lounge or contact us for current selections.</p>
        </div>
      )}
    </div>
  )
}
