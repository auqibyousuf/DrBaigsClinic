import { Metadata } from 'next';
import Image from 'next/image';
import Section from '@/components/Section';
import Button from '@/components/Button';

export const metadata: Metadata = {
  title: 'Hair Transplantation',
  description: 'State-of-the-art FUE and FUT hair transplantation techniques for permanent hair restoration. Expert surgical team.',
  keywords: ['hair transplant', 'FUE', 'FUT', 'hair restoration surgery', 'hair transplant clinic'],
};

export default function TransplantationPage() {
  return (
    <>
      <section className="pt-24 pb-16 bg-primary-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Hair Transplantation</h1>
            <p className="text-xl md:text-2xl leading-relaxed opacity-90">
              Permanent, natural-looking hair restoration using advanced FUE and FUT techniques.
              Regain your confidence with our expert surgical team.
            </p>
          </div>
        </div>
      </section>

      <Section className="bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200"
                alt="Hair Transplantation"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized
              />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Advanced Hair Restoration</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Our hair transplantation service offers permanent solutions for hair loss using the latest
                FUE (Follicular Unit Extraction) and FUT (Follicular Unit Transplantation) techniques.
                Performed by experienced surgeons, we ensure natural-looking results with minimal downtime.
              </p>
              <div className="space-y-4 mb-6">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-primary-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Natural-looking hairline design</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-primary-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Minimal scarring techniques</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-primary-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Expert surgical team</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-primary-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Comprehensive aftercare support</span>
                </div>
              </div>
              <Button href="#contact" variant="primary" size="lg">
                Schedule Consultation
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="Transplantation Techniques"
        subtitle="Advanced methods for optimal results"
        className="bg-gray-50"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">FUE (Follicular Unit Extraction)</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                A minimally invasive technique where individual hair follicles are extracted from the donor
                area and transplanted to the recipient area. Ideal for patients who prefer minimal scarring
                and faster recovery.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">No linear scar</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Faster recovery time</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Suitable for shorter haircuts</span>
                </li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">FUT (Follicular Unit Transplantation)</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Traditional strip method where a strip of tissue is removed from the donor area and then
                dissected into individual follicular units. Excellent for patients requiring maximum graft count.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Higher graft yield</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Cost-effective option</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Ideal for extensive hair loss</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="The Transplantation Process"
        subtitle="What to expect during your journey"
        className="bg-white"
      >
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div className="ml-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Initial Consultation</h3>
                <p className="text-gray-700 leading-relaxed">
                  Comprehensive evaluation of your hair loss pattern, donor area assessment, and discussion
                  of treatment goals. We'll determine the best technique for your specific case.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div className="ml-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Pre-Procedure Planning</h3>
                <p className="text-gray-700 leading-relaxed">
                  Hairline design consultation, graft count estimation, and pre-operative instructions
                  to ensure optimal results and smooth procedure.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div className="ml-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Surgical Procedure</h3>
                <p className="text-gray-700 leading-relaxed">
                  Performed under local anesthesia in our state-of-the-art surgical facility. The procedure
                  typically takes 4-8 hours depending on graft count, ensuring precision and care throughout.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                4
              </div>
              <div className="ml-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Recovery & Follow-up</h3>
                <p className="text-gray-700 leading-relaxed">
                  Detailed post-operative care instructions, regular follow-up appointments, and progress
                  monitoring. New hair growth typically begins after 3-4 months, with full results visible
                  after 12-18 months.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section
        id="contact"
        title="Ready for Permanent Hair Restoration?"
        subtitle="Book your consultation today"
        className="bg-gradient-to-br from-primary-600 to-accent-600 text-white"
      >
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xl mb-8">
            Take the first step towards permanent hair restoration. Schedule a consultation with our
            expert surgical team to discuss your options.
          </p>
          <Button href="/#contact" variant="secondary" size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
            Book Consultation
          </Button>
        </div>
      </Section>
    </>
  );
}
