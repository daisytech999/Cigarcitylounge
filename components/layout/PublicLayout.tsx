import Navbar from './Navbar'
import Footer from './Footer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-charcoal-950">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
