import Link from 'next/link'
import { MapPin, Phone, Mail, Clock, Instagram, Facebook } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-charcoal-950 border-t border-charcoal-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h3 className="text-gold-500 font-serif text-2xl font-bold tracking-widest">CIGAR CITY</h3>
            <p className="text-gray-500 text-xs tracking-[0.3em] uppercase mt-1">Lounge</p>
            <p className="text-gray-400 text-base leading-relaxed mt-4">A premium cigar lounge experience for the discerning enthusiast.</p>
          </div>
          <div>
            <h4 className="text-white font-serif text-lg mb-6 pb-2 border-b border-gold-500/30">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex gap-3 text-gray-400"><MapPin size={20} className="text-gold-500 shrink-0 mt-0.5" />[ADD BUSINESS ADDRESS]</li>
              <li className="flex gap-3 text-gray-400"><Phone size={20} className="text-gold-500 shrink-0" /><a href="tel:ADD_PHONE" className="hover:text-gold-500">[ADD PHONE NUMBER]</a></li>
              <li className="flex gap-3 text-gray-400"><Mail size={20} className="text-gold-500 shrink-0" /><a href="mailto:ADD_EMAIL" className="hover:text-gold-500">[ADD BUSINESS EMAIL]</a></li>
              <li className="flex gap-3 text-gray-400"><Clock size={20} className="text-gold-500 shrink-0 mt-0.5" />[ADD BUSINESS HOURS]</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-serif text-lg mb-6 pb-2 border-b border-gold-500/30">Quick Links</h4>
            <ul className="space-y-3">
              {[{href:'/membership',label:'Membership Plans'},{href:'/cigars',label:'Cigar Collection'},{href:'/events',label:'Events'},{href:'/contact',label:'Contact Us'},{href:'/login',label:'Member Login'}].map(l => (
                <li key={l.href}><Link href={l.href} className="text-gray-400 hover:text-gold-500 transition-colors text-base">{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-serif text-lg mb-6 pb-2 border-b border-gold-500/30">Information</h4>
            <ul className="space-y-3 mb-8">
              {[{href:'/privacy',label:'Privacy Policy'},{href:'/terms',label:'Terms & Conditions'},{href:'/membership-terms',label:'Membership Terms'}].map(l => (
                <li key={l.href}><Link href={l.href} className="text-gray-400 hover:text-gold-500 transition-colors text-base">{l.label}</Link></li>
              ))}
            </ul>
            <h4 className="text-white font-serif text-lg mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-charcoal-800 hover:bg-gold-500 hover:text-black text-gray-400 rounded-full flex items-center justify-center transition-all"><Instagram size={18} /></a>
              <a href="#" className="w-10 h-10 bg-charcoal-800 hover:bg-gold-500 hover:text-black text-gray-400 rounded-full flex items-center justify-center transition-all"><Facebook size={18} /></a>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} Cigar City Lounge. All rights reserved. | Must be 21+ to enter.</p>
        </div>
      </div>
    </footer>
  )
}
