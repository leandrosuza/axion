import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Shield, Eye, Lock, UserCheck, Database, Bell } from 'lucide-react'

export default function PrivacyPolicyPage() {
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

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#0069FF] to-[#0055DD] text-white py-12">
        <div className="container mx-auto px-6 max-w-[900px]">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-10 h-10" />
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-lg opacity-90">
            Your privacy is important to us. Learn how we collect, use, and protect your information.
          </p>
          <p className="text-sm mt-4 opacity-75">Last updated: January 20, 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-16 max-w-[900px]">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <div className="prose prose-lg max-w-none space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-[#1D203A] mb-4">Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                BigDataCorp (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Services, including our website, APIs, and data platforms.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                This policy complies with the Brazilian General Data Protection Law (Lei Geral de Proteção de Dados - LGPD) and other applicable data protection regulations.
              </p>
            </section>

            {/* Section 1 */}
            <section className="border-l-4 border-[#0069FF] pl-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-6 h-6 text-[#0069FF]" />
                <h2 className="text-2xl font-bold text-[#1D203A]">1. Information We Collect</h2>
              </div>

              <h3 className="text-xl font-semibold text-[#1D203A] mt-6 mb-3">1.1 Information You Provide</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you create an account or use our Services, you may provide:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Account Information:</strong> Name, email address, phone number, company name, CPF/CNPJ</li>
                <li><strong>Payment Information:</strong> Billing address, payment method details (processed securely through Stripe)</li>
                <li><strong>Profile Information:</strong> Account type, preferences, notification settings</li>
                <li><strong>Communications:</strong> Messages you send us, support requests, feedback</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#1D203A] mt-6 mb-3">1.2 Information Collected Automatically</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you use our Services, we automatically collect:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Usage Data:</strong> API requests, endpoints accessed, query parameters, response times</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information, operating system</li>
                <li><strong>API Keys:</strong> Hashed versions of your API keys for authentication</li>
                <li><strong>Log Data:</strong> Access times, errors, performance metrics</li>
                <li><strong>Cookies:</strong> Session cookies, authentication tokens, preference cookies</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#1D203A] mt-6 mb-3">1.3 Data You Query Through Our Services</h3>
              <p className="text-gray-700 leading-relaxed">
                We provide access to datasets containing information about Brazilian individuals, companies, and properties. This data is sourced from official public records and proprietary sources in compliance with LGPD. We do not create this data; we aggregate and structure it for your use.
              </p>
            </section>

            {/* Section 2 */}
            <section className="border-l-4 border-[#0069FF] pl-6">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-6 h-6 text-[#0069FF]" />
                <h2 className="text-2xl font-bold text-[#1D203A]">2. How We Use Your Information</h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use your information for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Service Provision:</strong> To provide, maintain, and improve our Services</li>
                <li><strong>Authentication:</strong> To verify your identity and manage your account</li>
                <li><strong>Billing:</strong> To process payments and manage subscriptions</li>
                <li><strong>Communication:</strong> To send service updates, security alerts, and support messages</li>
                <li><strong>Analytics:</strong> To understand usage patterns and optimize performance</li>
                <li><strong>Security:</strong> To detect, prevent, and respond to fraud or security issues</li>
                <li><strong>Compliance:</strong> To comply with legal obligations and enforce our Terms</li>
                <li><strong>Product Development:</strong> To develop new features and improve existing ones</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="border-l-4 border-[#0069FF] pl-6">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-[#0069FF]" />
                <h2 className="text-2xl font-bold text-[#1D203A]">3. How We Share Your Information</h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Service Providers:</strong> With vendors who help us operate our Services (e.g., Stripe for payments, Supabase for database hosting, Upstash for rate limiting)</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>Protection of Rights:</strong> To protect our rights, property, or safety, or that of our users</li>
                <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                All third-party service providers are required to maintain appropriate security measures and use your information only for specified purposes.
              </p>
            </section>

            {/* Section 4 */}
            <section className="border-l-4 border-[#0069FF] pl-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-[#0069FF]" />
                <h2 className="text-2xl font-bold text-[#1D203A]">4. Data Security</h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Encryption:</strong> All data is encrypted in transit (TLS/SSL) and at rest</li>
                <li><strong>Access Controls:</strong> Strict access controls limit who can view your data</li>
                <li><strong>API Key Hashing:</strong> API keys are hashed using bcrypt before storage</li>
                <li><strong>Regular Audits:</strong> We conduct security audits and vulnerability assessments</li>
                <li><strong>Monitoring:</strong> 24/7 monitoring for suspicious activity</li>
                <li><strong>Secure Infrastructure:</strong> Hosted on secure cloud infrastructure with redundancy</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <strong>Important:</strong> While we strive to protect your information, no method of transmission over the internet is 100% secure. You are responsible for keeping your password and API keys confidential.
              </p>
            </section>

            {/* Section 5 */}
            <section className="border-l-4 border-[#0069FF] pl-6">
              <div className="flex items-center gap-3 mb-4">
                <UserCheck className="w-6 h-6 text-[#0069FF]" />
                <h2 className="text-2xl font-bold text-[#1D203A]">5. Your Rights Under LGPD</h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                Under Brazilian data protection law (LGPD), you have the following rights:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Access:</strong> Request access to your personal data we hold</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data (right to be forgotten)</li>
                <li><strong>Portability:</strong> Request your data in a structured, machine-readable format</li>
                <li><strong>Objection:</strong> Object to processing of your data for certain purposes</li>
                <li><strong>Restriction:</strong> Request restriction of processing under certain conditions</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing at any time</li>
                <li><strong>Information:</strong> Be informed about third parties with whom we share your data</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                To exercise any of these rights, please contact us at <a href="mailto:privacy@bigdatacorp.com" className="text-[#0069FF] hover:underline">privacy@bigdatacorp.com</a>. We will respond within 15 days as required by LGPD.
              </p>
            </section>

            {/* Section 6 */}
            <section className="border-l-4 border-[#0069FF] pl-6">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-6 h-6 text-[#0069FF]" />
                <h2 className="text-2xl font-bold text-[#1D203A]">6. Cookies and Tracking</h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Essential Cookies:</strong> Required for authentication and security</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how you use our Services</li>
                <li><strong>Performance Cookies:</strong> Monitor and improve performance</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                You can control cookies through your browser settings. However, disabling essential cookies may affect functionality.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold text-[#1D203A] mb-4">7. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We retain your information for as long as necessary to provide Services and comply with legal obligations:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Account Data:</strong> Retained while your account is active, plus 90 days after deletion</li>
                <li><strong>Usage Logs:</strong> Retained for 12 months for analytics and troubleshooting</li>
                <li><strong>Billing Records:</strong> Retained for 7 years as required by Brazilian tax law</li>
                <li><strong>Security Logs:</strong> Retained for 24 months for security purposes</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-bold text-[#1D203A] mb-4">8. International Data Transfers</h2>
              <p className="text-gray-700 leading-relaxed">
                Your data is primarily stored in Brazil. However, some service providers may process data outside Brazil (e.g., cloud infrastructure providers). We ensure adequate safeguards are in place for international transfers as required by LGPD.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-bold text-[#1D203A] mb-4">9. Children&apos;s Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our Services are not directed to individuals under 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-bold text-[#1D203A] mb-4">10. Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of material changes via email or through our platform. The &quot;Last updated&quot; date at the top indicates when changes were made. Continued use after changes constitutes acceptance.
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-2xl font-bold text-[#1D203A] mb-4">11. Data Protection Officer</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our Data Protection Officer (DPO) is responsible for overseeing our privacy practices:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700"><strong>Data Protection Officer</strong></p>
                <p className="text-gray-700">BigDataCorp</p>
                <p className="text-gray-700">Email: dpo@bigdatacorp.com</p>
                <p className="text-gray-700 mt-2">
                  For privacy-related questions, complaints, or to exercise your rights, please contact our DPO.
                </p>
              </div>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-2xl font-bold text-[#1D203A] mb-4">12. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                For questions about this Privacy Policy or our data practices:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700"><strong>BigDataCorp</strong></p>
                <p className="text-gray-700">Rua Dr. Renato Paes de Barros, 33 - 4° andar</p>
                <p className="text-gray-700">Itaim Bibi - São Paulo - SP - Brazil</p>
                <p className="text-gray-700">Zip Code: 04530-904</p>
                <p className="text-gray-700 mt-2">Email: privacy@bigdatacorp.com</p>
                <p className="text-gray-700">Support: support@bigdatacorp.com</p>
              </div>
            </section>

            {/* ANPD */}
            <section className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-bold text-[#1D203A] mb-2">Right to File a Complaint</h3>
              <p className="text-gray-700 leading-relaxed">
                If you believe your data protection rights have been violated, you have the right to file a complaint with the Brazilian National Data Protection Authority (ANPD):
              </p>
              <p className="text-gray-700 mt-2">
                <strong>ANPD:</strong> <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-[#0069FF] hover:underline">www.gov.br/anpd</a>
              </p>
            </section>

            {/* Agreement */}
            <section className="border-t pt-8 mt-12">
              <p className="text-gray-700 leading-relaxed font-medium">
                By using BigDataCorp Services, you acknowledge that you have read and understood this Privacy Policy and consent to the collection, use, and disclosure of your information as described herein.
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
            <Link href="/terms">
              <Button variant="link" className="text-[#0069FF]">
                View Terms of Service →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
