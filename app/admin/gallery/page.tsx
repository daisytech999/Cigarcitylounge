'use client'
import { useState, useEffect } from 'react'
import { Upload, Trash2, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminGalleryPage() {
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<'cigar' | 'lounge' | 'event'>('lounge')
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => { loadImages() }, [category])

  async function loadImages() {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase.from('gallery_images').select('*').eq('category', category).order('display_order')
    setImages(data || [])
    setLoading(false)
  }

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const supabase = createClient()
    const fileName = `gallery/${category}/${Date.now()}-${file.name}`
    const { data: uploadData, error } = await supabase.storage.from('images').upload(fileName, file)
    if (!error && uploadData) {
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName)
      await supabase.from('gallery_images').insert({ image_url: publicUrl, caption, category, display_order: images.length })
      setCaption('')
      await loadImages()
    }
    setUploading(false)
    e.target.value = ''
  }

  const deleteImage = async (id: string, url: string) => {
    if (!confirm('Delete this image?')) return
    const supabase = createClient()
    await supabase.from('gallery_images').delete().eq('id', id)
    await loadImages()
  }

  const toggleFeatured = async (id: string, current: boolean) => {
    const supabase = createClient()
    await supabase.from('gallery_images').update({ is_featured: !current }).eq('id', id)
    await loadImages()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-gold-500 mb-1">Gallery</h1>
        <p className="text-gray-400">Manage lounge photos</p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2">
        {(['lounge', 'cigar', 'event'] as const).map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all capitalize ${category === cat ? 'bg-gold-500 text-black' : 'bg-charcoal-800 text-gray-300 hover:text-white'}`}>
            {cat} Photos
          </button>
        ))}
      </div>

      {/* Upload */}
      <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-6">
        <h2 className="text-lg font-serif text-gold-500 mb-4">Upload New Image</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Caption (optional)" className="flex-1 bg-charcoal-950 border border-charcoal-700 text-white placeholder-charcoal-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500" />
          <label className={`flex items-center gap-2 cursor-pointer bg-gold-500 hover:bg-gold-600 text-black font-bold py-2.5 px-5 rounded-lg text-sm transition-colors ${uploading ? 'opacity-50' : ''}`}>
            <Upload size={18} />
            {uploading ? 'Uploading...' : 'Choose & Upload'}
            <input type="file" accept="image/*" onChange={uploadImage} disabled={uploading} className="hidden" />
          </label>
        </div>
        <p className="text-charcoal-400 text-xs mt-2">Requires Supabase Storage bucket named "images" to be configured.</p>
      </div>

      {/* Images grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-charcoal-700 border-t-gold-500 rounded-full" /></div>
      ) : images.length === 0 ? (
        <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-12 text-center text-charcoal-400">No {category} images yet. Upload the first one!</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map(img => (
            <div key={img.id} className="relative group bg-charcoal-800 rounded-xl overflow-hidden aspect-square">
              <img src={img.image_url} alt={img.caption || ''} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button onClick={() => toggleFeatured(img.id, img.is_featured)} className={`p-2 rounded-full transition-colors ${img.is_featured ? 'bg-gold-500 text-black' : 'bg-white/20 text-white hover:bg-gold-500 hover:text-black'}`}>
                  <Star size={18} fill={img.is_featured ? 'currentColor' : 'none'} />
                </button>
                <button onClick={() => deleteImage(img.id, img.image_url)} className="p-2 bg-red-900/80 text-red-300 hover:bg-red-800 rounded-full transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
              {img.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
                  <p className="text-white text-xs truncate">{img.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
