import PublicLayout from '@/components/layout/PublicLayout'
import Link from 'next/link'

export default function MembershipTermsPage() {
  return (
    <PublicLayout>
      <div className="pt-24 min-h-screen bg-charcoal-950">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-serif text-gold-500 mb-4">Membership Terms</h1>
          <p className="text-gray-400 mb-8">Please read these membership terms carefully before joining.</p>
          <div className="space-y-8 text-gray-300 text-base leading-relaxed">
            {[
              { title: 'Membership Eligibility', content: 'Membership is open to individuals who are 21 years of age or older. All members must complete the registration process including identity verification and acceptance of our rules.' },
              { title: 'Membership Plans', content: 'We offer Classic, Premium, and Elite membership plans. Each plan includes different benefits and pricing. See our Membership page for current pricing and features.' },
              { title: 'Complimentary Locker', content: 'Each active membership includes one complimentary locker. Lockers are assigned by our team based on availability after membership activation. Locker assignment may take up to 7 business days. Additional lockers may be available for an additional monthly fee.' },
              { title: 'Guest Passes', content: 'Guest passes are included with Premium and Elite memberships as noted in your plan. Guests must be accompanied by the member at all times and must also be 21 or older.' },
              { title: 'Cancellation Policy', content: 'You may cancel your membership at any time. Cancellation takes effect at the end of your current billing period. No refunds are issued for partial months. Your locker must be vacated within 30 days of cancellation.' },
              { title: 'Membership Suspension', content: 'Memberships may be suspended for non-payment. Members have a 7-day grace period after a failed payment before suspension. Accounts can be reactivated by updating payment information.' },
              { title: 'Lounge Rules', content: 'All members must follow posted lounge rules including maintaining a respectful environment, proper handling of cigars and equipment, and adherence to dress code when required for special events.' },
              { title: 'Privacy', content: 'Member information is kept confidential as described in our Privacy Policy. We do not share member lists or personal information with third parties.' },
            ].map(section => (
              <div key={section.title} className="bg-charcoal-900 border border-charcoal-800 rounded-xl p-6">
                <h2 className="text-xl font-serif text-gold-500 mb-3">{section.title}</h2>
                <p>{section.content}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/membership" className="btn-gold text-lg px-10 py-4">View Membership Plans</Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
