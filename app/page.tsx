'use client';

import { useState } from 'react';
import Hero from '@/components/Hero';
import Section from '@/components/Section';
import ServiceCard from '@/components/ServiceCard';
import Button from '@/components/Button';
import ScrollReveal from '@/components/ScrollReveal';
import { useToast } from '@/components/ToastProvider';
import FloatingLabelInput from '@/components/FloatingLabelInput';
import Image from 'next/image';
import { useCMSData } from '@/lib/cms-client';

const defaultServices = [
  {
    id: 'hair-restoration',
    title: 'Hair Restoration',
    description: 'Advanced hair restoration treatments to help you regain confidence with natural-looking results.',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'hair-transplantation',
    title: 'Hair Transplantation',
    description: 'State-of-the-art FUE and FUT hair transplantation techniques for permanent hair restoration.',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'hair-treatments',
    title: 'Hair Treatments',
    description: 'Comprehensive hair care solutions including PRP therapy, scalp treatments, and hair loss prevention.',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b7d?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'skin-care',
    title: 'Skin Care',
    description: 'Professional skincare treatments including facials, chemical peels, and anti-aging solutions.',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'acne-treatment',
    title: 'Acne Treatment',
    description: 'Effective acne treatment plans tailored to your skin type for clear, healthy skin.',
    image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'anti-aging',
    title: 'Anti-Aging',
    description: 'Revolutionary anti-aging treatments including botox, fillers, and skin rejuvenation therapies.',
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'pigmentation',
    title: 'Pigmentation Treatment',
    description: 'Advanced solutions for hyperpigmentation, melasma, and uneven skin tone.',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'hijama',
    title: 'Hijama Therapy',
    description: 'Traditional cupping therapy for detoxification, pain relief, and overall wellness.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'laser-therapy',
    title: 'Laser Therapy',
    description: 'Cutting-edge laser treatments for hair removal, skin resurfacing, and scar reduction.',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d4c09?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'prp-therapy',
    title: 'PRP Therapy',
    description: 'Platelet-Rich Plasma therapy to stimulate natural hair growth and improve hair density.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'scalp-treatment',
    title: 'Scalp Treatment',
    description: 'Specialized scalp treatments for dandruff, psoriasis, and other scalp conditions.',
    image: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'hair-thickening',
    title: 'Hair Thickening',
    description: 'Effective treatments to add volume and thickness to thinning or fine hair.',
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?q=80&w=800&auto=format&fit=crop',
  },
];

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  message?: string;
}

export default function Home() {
  const [showAllServices, setShowAllServices] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const { data: heroData } = useCMSData('hero');
  const { data: servicesData } = useCMSData('services');
  const { data: aboutData } = useCMSData('about');
  const { data: contactData } = useCMSData('contact');

  const services = servicesData?.items || defaultServices;
  const displayedServices = showAllServices ? services : services.slice(0, 8);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    // Name validation - Custom validation
    const nameTrimmed = formData.name.trim();
    if (!nameTrimmed) {
      newErrors.name = 'Full name is required';
    } else if (nameTrimmed.length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    } else if (nameTrimmed.length > 50) {
      newErrors.name = 'Name cannot exceed 50 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(nameTrimmed)) {
      newErrors.name = 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }

    // Email validation - Custom validation
    const emailTrimmed = formData.email.trim();
    if (!emailTrimmed) {
      newErrors.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailTrimmed)) {
        newErrors.email = 'Please enter a valid email address (e.g., name@example.com)';
      } else if (emailTrimmed.length > 100) {
        newErrors.email = 'Email address cannot exceed 100 characters';
      } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailTrimmed)) {
        newErrors.email = 'Email format is invalid. Please check and try again';
      }
    }

    // Phone validation - Custom validation
    const phoneTrimmed = formData.phone.trim();
    if (!phoneTrimmed) {
      newErrors.phone = 'Phone number is required';
    } else {
      const phoneDigits = phoneTrimmed.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        newErrors.phone = 'Phone number must contain at least 10 digits';
      } else if (phoneDigits.length > 15) {
        newErrors.phone = 'Phone number cannot exceed 15 digits';
      } else if (!/^[\d\s\-\+\(\)]+$/.test(phoneTrimmed)) {
        newErrors.phone = 'Phone number can only contain digits, spaces, hyphens, parentheses, and + sign';
      }
    }

    // Service validation
    if (!formData.service || formData.service === '') {
      newErrors.service = 'Please select a service';
    }

    // Message validation (optional but with custom validation if provided)
    const messageTrimmed = formData.message.trim();
    if (messageTrimmed.length > 0) {
      if (messageTrimmed.length < 10) {
        newErrors.message = 'Message must be at least 10 characters if provided';
      } else if (messageTrimmed.length > 500) {
        newErrors.message = 'Message cannot exceed 500 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    if (!validateForm()) {
      showToast('error', 'Please fix the validation errors in the form before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare email data
      const selectedService = services.find(s => s.id === formData.service);
      const serviceName = selectedService ? selectedService.title : 'Unknown Service';

      const emailSubject = encodeURIComponent(`Appointment Booking Request - ${serviceName}`);
      const emailBody = encodeURIComponent(
        `New Appointment Booking Request\n\n` +
        `Name: ${formData.name}\n` +
        `Email: ${formData.email}\n` +
        `Phone: ${formData.phone}\n` +
        `Service: ${serviceName}\n` +
        `Message: ${formData.message || 'No message provided'}\n\n` +
        `Submitted on: ${new Date().toLocaleString()}`
      );

      // Open email client with mailto link
      const contactEmail = contactData?.email || 'yauqib@gmail.com';
      window.location.href = `mailto:${contactEmail}?subject=${emailSubject}&body=${emailBody}`;

      // Simulate sending (you can replace this with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000));

      showToast('success', 'Thank you! Your appointment request has been submitted successfully. We will contact you soon.');

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: '',
      });
      setErrors({});
    } catch (error) {
      showToast('error', 'Failed to submit your appointment request. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const heroTitle = heroData?.title || "Transform Your Skin & Hair";
  const heroSubtitle = heroData?.subtitle || "Experience world-class treatments at Dr Baig's Clinic. Your journey to confidence starts here.";
  const heroCtaText = heroData?.ctaText || "Book Consultation";
  const heroCtaHref = heroData?.ctaHref || "#contact";
  const heroBackgroundImage = heroData?.backgroundImage;

  const servicesTitle = servicesData?.title || "Our Services";
  const servicesSubtitle = servicesData?.subtitle || "Comprehensive skin and hair care solutions tailored to your needs";

  const aboutTitle = aboutData?.title || "Why Choose Baig's Clinic?";
  const aboutSubtitle = aboutData?.subtitle || "Excellence in every treatment";
  const aboutFeatures = aboutData?.features || [
    {
      id: "expert-team",
      title: "Expert Team",
      description: "Board-certified specialists with years of experience in dermatology and trichology.",
      icon: "shield"
    },
    {
      id: "advanced-tech",
      title: "Advanced Technology",
      description: "Latest medical-grade equipment and innovative treatment protocols for best results.",
      icon: "lightning"
    },
    {
      id: "personalized-care",
      title: "Personalized Care",
      description: "Customized treatment plans designed specifically for your unique needs and goals.",
      icon: "heart"
    }
  ];

  const contactTitle = contactData?.title || "Book Your Appointment";
  const contactSubtitle = contactData?.subtitle || "Start your journey to healthier skin and hair today";

  const iconMap: Record<string, JSX.Element> = {
    shield: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    lightning: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    heart: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    )
  };

  return (
    <>
      <Hero
        title={heroTitle}
        subtitle={heroSubtitle}
        ctaText={heroCtaText}
        ctaHref={heroCtaHref}
        backgroundImage={heroBackgroundImage}
      />

      <Section
        id="services"
        title={servicesTitle}
        subtitle={servicesSubtitle}
        className="bg-gray-50 dark:bg-gray-900"
      >
        {/* Mobile Slider */}
        <div className="block md:hidden overflow-x-auto pb-4 px-4 -mx-4 scrollbar-hide" style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
          <div className="flex gap-4 px-4" style={{ width: 'max-content' }}>
            {displayedServices.map((service, index) => (
              <div key={service.id} className="flex-shrink-0 w-[280px]" style={{ scrollSnapAlign: 'start' }}>
                <ServiceCard service={service} index={index} />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6 px-4 sm:px-0">
          {displayedServices.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>

        {services.length > 8 && (
          <div className="mt-8 sm:mt-10 text-center px-4 sm:px-0">
            <Button
              onClick={() => setShowAllServices(!showAllServices)}
              variant="outline"
              size="lg"
              className="mx-auto"
            >
              <span className="flex items-center space-x-2">
                <span>{showAllServices ? 'Show Less' : 'View All Services'}</span>
                <svg
                  className={`w-5 h-5 transition-transform duration-300 ${showAllServices ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </Button>
          </div>
        )}
      </Section>

      <Section
        id="about"
        title={aboutTitle}
        subtitle={aboutSubtitle}
        className="bg-white dark:bg-gray-900"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-0">
          {aboutFeatures.map((feature: any, index: number) => (
            <ScrollReveal key={feature.id} direction="up" delay={index * 100}>
              <article className="group relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-700 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary-100 dark:from-primary-900/30 to-primary-50 dark:to-primary-900/20 rounded-bl-3xl rounded-tr-2xl opacity-50" aria-hidden="true"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300" aria-hidden="true">
                    {iconMap[feature.icon] || iconMap.shield}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-gray-100">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </Section>

      <Section
        id="contact"
        title={contactTitle}
        subtitle={contactSubtitle}
        className="bg-primary-600 dark:bg-primary-700 text-white"
      >
        <ScrollReveal direction="up" delay={0}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border border-gray-100 dark:border-gray-700">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate aria-label="Appointment booking form">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-field">
                    <FloatingLabelInput
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Full Name *"
                      value={formData.name}
                      onChange={handleChange}
                      error={errors.name}
                      icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      }
                    />
                  </div>
                  <div className="form-field" style={{ animationDelay: '0.1s' }}>
                    <FloatingLabelInput
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Email Address *"
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-field" style={{ animationDelay: '0.2s' }}>
                    <FloatingLabelInput
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Phone Number *"
                      value={formData.phone}
                      onChange={handleChange}
                      error={errors.phone}
                      icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      }
                    />
                  </div>
                  <div className="form-field" style={{ animationDelay: '0.3s' }}>
                    <FloatingLabelInput
                      id="service"
                      name="service"
                      placeholder="Select a service *"
                      value={formData.service}
                      onChange={handleChange}
                      error={errors.service}
                      as="select"
                      options={[
                        { value: '', label: 'Select a service' },
                        ...services.map(s => ({ value: s.id, label: s.title }))
                      ]}
                      icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      }
                    />
                  </div>
                </div>
                <div className="form-field" style={{ animationDelay: '0.4s' }}>
                  <FloatingLabelInput
                    id="message"
                    name="message"
                    placeholder="Message (Optional)"
                    value={formData.message}
                    onChange={handleChange}
                    error={errors.message}
                    as="textarea"
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    }
                  />
                </div>
                <div className="pt-1">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto mx-auto shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      {isSubmitting ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Book Appointment</span>
                        </>
                      )}
                    </span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </ScrollReveal>
      </Section>
    </>
  );
}
