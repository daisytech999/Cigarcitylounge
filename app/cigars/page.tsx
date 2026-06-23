import { createAdminClient } from '@/lib/supabase/admin'
import PublicLayout from '@/components/layout/PublicLayout'
import CigarCatalog from '@/components/cigars/CigarCatalog'

export const revalidate = 60

export default async function CigarsPage() {
  const supabase = createAdminClient()
  const { data: cigars } = await supabase
    .from('cigars')
    .select('*, images:cigar_images(*), category:cigar_categories(*)')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('brand')

  const brands = [...new Set((cigars || []).map((c: any) => c.brand))].filter(Boolean).sort()
  const countries = [...new Set((cigars || []).map((c: any) => c.country_of_origin))].filter(Boolean).sort()
  const wrappers = [...new Set((cigars || []).map((c: any) => c.wrapper))].filter(Boolean).sort()

  return (
    <PublicLayout>
      <div className="pt-24 min-h-screen bg-charcoal-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <p className="text-gold-500 text-sm tracking-widest uppercase mb-4">Cigar Collection</p>
            <h1 className="text-5xl md:text-6xl font-serif text-white mb-6">
              Our <span className="text-gold-500">Cigar Catalog</span>
            </h1>
            <div className="w-20 h-1 bg-gold-500 mx-auto mb-6" />
            <p className="text-gray-400 text-xl max-w-2xl mx-auto">
              Browse our curated selection of premium cigars. Ask our staff for recommendations.
            </p>
          </div>
          <CigarCatalog cigars={cigars || []} brands={brands} countries={countries} wrappers={wrappers} />
        </div>
      </div>
    </PublicLayout>
  )
}
