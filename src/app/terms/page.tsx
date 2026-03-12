import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-6 py-4 max-w-[1200px]">
          <Link href="/" className="inline-flex items-center text-[#0069FF] hover:text-[#0055DD] transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-6 py-16 max-w-[900px]">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <h1 className="text-4xl font-bold text-[#1D203A] mb-4">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last updated: January 20, 2025</p>

          <div className="prose prose-lg max-w-none space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold text-[#1D203A] mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Welcome to BigDataCorp. By accessing or using our API services, data platforms, and related services (collectively, the &quot;Services&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not use our Services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                These Terms constitute a legally binding agreement between you (whether personally or on behalf of an entity) and BigDataCorp regarding your use of the Services.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-[#1D203A] mb-4">2. Service Description</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                BigDataCorp provides data and information analysis services, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>API access to datasets covering individuals, companies, and properties in Brazil</li>
                <li>Real-time and batch data query capabilities</li>
                <li>Data enrichment and validation services</li>
                <li>Analytics and reporting tools</li>
                <li>Custom data solutions for enterprise clients</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-[#1D203A] mb-4">3. Account Registration</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To access our Services, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Keep your password secure and confidential</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Accept responsibility for all activities that occur under your account</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-[#1D203A] mb-4">4. API Keys and Security</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Upon registration, you will receive API keys to access our Services. You must:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Keep your API keys confidential and secure</li>
                <li>Not share, publish, or expose your API keys publicly</li>
                <li>Immediately regenerate keys if you suspect they have been compromised</li>
                <li>Use API keys only for your authorized purposes</li>
                <li>Comply with all rate limits and usage restrictions for your plan</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-[#1D203A] mb-4">5. Acceptable Use Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree not to use our Services to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon intellectual property rights of others</li>
                <li>Distribute malware, viruses, or harmful code</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Reverse engineer, decompile, or disassemble our Services</li>
                <li>Resell or redistribute our data without authorization</li>
                <li>Use data for discriminatory or illegal purposes</li>
                <li>Scrape or crawl our Services beyond API usage</li>
                <li>Overload or interfere with our infrastructure</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold text-[#1D203A] mb-4">6. Data Compliance</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You acknowledge that our data is sourced from official and proprietary sources in compliance with Brazilian data protection laws, including the Lei Geral de Proteção de Dados (LGPD). You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Use data only for lawful purposes</li>
                <li>Comply with LGPD and other applicable privacy laws</li>
                <li>Implement appropriate security measures for data you access</li>
                <li>Not combine our data with personal data in ways that violate privacy laws</li>
                <li>Respond to data subject requests in accordance with applicable law</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold text-[#1D203A] mb-4">7. Subscription Plans and Billing</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We offer various subscription plans with different usage limits and features:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Free Plan:</strong> Limited API calls per month with basic features</li>
                <li><strong>Basic Plan:</strong> Increased limits suitable for small businesses</li>
                <li><strong>Pro Plan:</strong> Advanced features and higher limits</li>
                <li><strong>Enterprise Plan:</strong> Custom solutions with dedicated support</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Payment terms are specified during subscription. We reserve the right to change pricing with 30 days&apos; notice.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-bold text-[#1D203A] mb-4">8. Rate Limits</h2>
              <p className="text-gray-700 leading-relaxed">
                Each subscription plan has rate limits (requests per minute, day, and month). Exceeding these limits may result in temporary service suspension. Contact us to upgrade your plan if you need higher limits.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-bold text-[#1D203A] mb-4">9. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                All data, technology, trademarks, and materials provided through our Services are owned by BigDataCorp or our licensors. You receive a limited, non-exclusive, non-transferable license to use our Services according to these Terms.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You may not claim ownership of our data or use our trademarks without written permission.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-bold text-[#1D203A] mb-4">10. Service Availability</h2>
              <p className="text-gray-700 leading-relaxed">
                We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service. We reserve the right to modify, suspend, or discontinue any aspect of the Services with reasonable notice. Scheduled maintenance will be communicated in advance when possible.
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-2xl font-bold text-[#1D203A] mb-4">11. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>We provide Services &quot;as is&quot; without warranties of any kind</li>
                <li>We are not liable for indirect, incidental, or consequential damages</li>
                <li>Our total liability shall not exceed the amount you paid in the past 12 months</li>
                <li>We are not responsible for decisions made based on our data</li>
                <li>You are responsible for verifying data accuracy for your use case</li>
              </ul>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-2xl font-bold text-[#1D203A] mb-4">12. Termination</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Either party may terminate this agreement:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>You may cancel your subscription at any time from your account settings</li>
                <li>We may suspend or terminate your account for Terms violations</li>
                <li>We may terminate with 30 days&apos; notice for any reason</li>
                <li>Upon termination, you must cease using our Services and delete any cached data</li>
              </ul>
            </section>

            {/* Section 13 */}
            <section>
              <h2 className="text-2xl font-bold text-[#1D203A] mb-4">13. Dispute Resolution</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms are governed by the laws of Brazil. Any disputes shall be resolved in the courts of São Paulo, Brazil. Before initiating legal proceedings, parties agree to attempt good-faith negotiations for 30 days.
              </p>
            </section>

            {/* Section 14 */}
            <section>
              <h2 className="text-2xl font-bold text-[#1D203A] mb-4">14. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update these Terms from time to time. We will notify you of material changes via email or through our platform. Continued use of Services after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            {/* Section 15 */}
            <section>
              <h2 className="text-2xl font-bold text-[#1D203A] mb-4">15. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                For questions about these Terms, please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700"><strong>BigDataCorp</strong></p>
                <p className="text-gray-700">Rua Dr. Renato Paes de Barros, 33 - 4° andar</p>
                <p className="text-gray-700">Itaim Bibi - São Paulo - SP - Brazil</p>
                <p className="text-gray-700">Zip Code: 04530-904</p>
                <p className="text-gray-700 mt-2">Email: legal@bigdatacorp.com</p>
              </div>
            </section>

            {/* Agreement */}
            <section className="border-t pt-8 mt-12">
              <p className="text-gray-700 leading-relaxed font-medium">
                By using BigDataCorp Services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row gap-4 justify-between items-center">
            <Link href="/">
              <Button variant="outline" className="w-full sm:w-auto">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link href="/privacy">
              <Button variant="link" className="text-[#0069FF]">
                View Privacy Policy →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
