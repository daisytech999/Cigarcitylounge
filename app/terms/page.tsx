import PublicLayout from '@/components/layout/PublicLayout'

export default function TermsPage() {
  return (
    <PublicLayout>
      <div className="pt-24 min-h-screen bg-charcoal-950">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-serif text-gold-500 mb-4">Terms & Conditions</h1>
          <p className="text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          <div className="space-y-8 text-gray-300 text-base leading-relaxed">
            {[
              { title: '1. Acceptance of Terms', content: 'By accessing or using the Cigar City Lounge website and services, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.' },
              { title: '2. Age Requirement', content: 'You must be 21 years of age or older to become a member and access our lounge facilities. By registering, you confirm you meet this age requirement and agree to provide truthful information.' },
              { title: '3. Membership', content: 'Membership is personal and non-transferable. You are responsible for maintaining the security of your account credentials. Membership benefits are subject to change with reasonable notice.' },
              { title: '4. Payments and Billing', content: 'Memberships are billed monthly or annually as selected. Payments are processed securely through Stripe. By subscribing, you authorize recurring charges. You may cancel anytime, effective at the end of the current billing period.' },
              { title: '5. Locker Policy', content: 'Complimentary lockers are assigned by lounge staff based on availability. The lounge reserves the right to reassign lockers with reasonable notice. Locker contents are the responsibility of the member.' },
              { title: '6. Code of Conduct', content: 'Members are expected to behave respectfully toward staff and other members. The lounge reserves the right to revoke membership without refund for violations of our code of conduct.' },
              { title: '7. Limitation of Liability', content: 'Cigar City Lounge is not liable for any indirect, incidental, or consequential damages arising from your use of our services. Our total liability is limited to the amount paid in the preceding month.' },
              { title: '8. Changes to Terms', content: 'We reserve the right to modify these terms at any time. Members will be notified of significant changes via email.' },
            ].map(section => (
              <div key={section.title}>
                <h2 className="text-2xl font-serif text-white mb-3">{section.title}</h2>
                <p>{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
