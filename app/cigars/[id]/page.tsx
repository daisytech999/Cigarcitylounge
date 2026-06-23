import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import Badge from '@/components/ui/Badge'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatCurrency } from '@/lib/utils'

export default async function CigarDetailPage({ params }: { params: { id: string } }) {
  const supabase = createAdminClient()
  const { data: cigar } = await supabase
    .from('cigars')
    .select('*, images:cigar_images(*), category:cigar_categories(*)')
    .eq('id', params.id)
    .eq('is_active', true)
    .single()

  if (!cigar) notFound()

  const primaryImage = cigar.images?.find((img: any) => img.is_primary) || cigar.images?.[0]

  return (
    <PublicLayout>
      <div className="pt-24 min-h-screen bg-charcoal-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/cigars" className="inline-flex items-center gap-2 text-gold-500 hover:text-gold-400 mb-8 text-base">
            <ArrowLeft size={18} />
            Back to Cigar List
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image */}
            <div className="aspect-square bg-gradient-to-br from-leather-700/20 to-charcoal-900 rounded-xl overflow-hidden border border-charcoal-700 flex items-center justify-center">
              {primaryImage ? (
                <img src={primaryImage.image_url} alt={cigar.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-9xl">🚭</span>
              )}
            </div>

            {/* Details */}
            <div>
              <div className="flex gap-2 mb-3 flex-wrap">
                {cigar.is_featured && <Badge variant="gold">Featured</Badge>}
                {cigar.is_new_arrival && <Badge variant="blue">New Arrival</Badge>}
                {cigar.is_member_only && <Badge variant="gray">Members Only</Badge>}
              </div>

              <p className="text-gold-400 text-sm font-medium uppercase tracking-wider mb-2">{cigar.brand}</p>
              <h1 className="text-4xl font-serif text-white mb-4">{cigar.name}</h1>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-gold-500 font-bold text-3xl">
                  {cigar.price ? formatCurrency(cigar.price) : cigar.price_display}
                </span>
                <Badge variant={cigar.availability_status === 'available' ? 'green' : cigar.availability_status === 'limited' ? 'orange' : 'red'}>
                  {cigar.availability_status === 'out_of_stock' ? 'Out of Stock' : cigar.availability_status === 'limited' ? 'Limited' : 'Available'}
                </Badge>
              </div>

              {cigar.description && (
                <p className="text-gray-300 text-lg leading-relaxed mb-8">{cigar.description}</p>
              )}

              {/* Specs */}
              <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-6">
                <h3 className="text-gold-500 font-serif text-lg mb-4">Cigar Details</h3>
                <dl className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Size', value: cigar.size },
                    { label: 'Strength', value: cigar.strength },
                    { label: 'Wrapper', value: cigar.wrapper },
                    { label: 'Binder', value: cigar.binder },
                    { label: 'Filler', value: cigar.filler },
                    { label: 'Country', value: cigar.country_of_origin },
                  ].filter(item => item.value).map(item => (
                    <div key={item.label}>
                      <dt className="text-charcoal-400 text-sm">{item.label}</dt>
                      <dd className="text-white text-base capitalize">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {cigar.flavor_notes && (
                <div className="mt-4 bg-charcoal-900 border border-charcoal-700 rounded-xl p-6">
                  <h3 className="text-gold-500 font-serif text-lg mb-2">Flavor Notes</h3>
                  <p className="text-gray-300 italic">{cigar.flavor_notes}</p>
                </div>
              )}

              <div className="mt-8">
                <Link href="/membership" className="btn-gold text-lg w-full flex items-center justify-center gap-2">
                  Become a Member to Enjoy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
