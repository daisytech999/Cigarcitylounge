import PublicLayout from '@/components/layout/PublicLayout'

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <div className="pt-24 min-h-screen bg-charcoal-950">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-serif text-gold-500 mb-4">Privacy Policy</h1>
          <p className="text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          <div className="prose prose-invert max-w-none space-y-8 text-gray-300 text-base leading-relaxed">
            {[
              { title: '1. Information We Collect', content: 'We collect information you provide directly to us when you register for membership, subscribe to our services, or contact us. This includes your name, email address, phone number, date of birth, address, payment information (processed securely by Stripe), and emergency contact details.' },
              { title: '2. How We Use Your Information', content: 'We use your information to provide and manage your membership, process payments, communicate with you about your account and events, send membership renewal reminders and locker assignments, and comply with legal obligations.' },
              { title: '3. Information Sharing', content: 'We do not sell, trade, or rent your personal information to third parties. We may share your information with service providers who assist in our operations (such as Stripe for payment processing), subject to confidentiality agreements.' },
              { title: '4. Payment Security', content: 'All payment information is processed securely by Stripe. We do not store credit card numbers or full payment details on our servers. Stripe is PCI-DSS compliant.' },
              { title: '5. Data Retention', content: 'We retain your personal information for as long as your membership is active and as required by law. You may request deletion of your account by contacting us.' },
              { title: '6. Your Rights', content: 'You have the right to access, update, or delete your personal information. You may also opt out of marketing communications at any time by contacting us or updating your preferences in your member dashboard.' },
              { title: '7. Cookies', content: 'We use essential cookies to maintain your login session and provide core functionality. We do not use tracking cookies for advertising purposes.' },
              { title: '8. Contact Us', content: 'If you have questions about this Privacy Policy, please contact us at [ADD BUSINESS EMAIL] or [ADD PHONE NUMBER].' },
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
