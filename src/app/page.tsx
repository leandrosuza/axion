'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LandingHeader } from '@/components/landing/Header'
import { ProcessSupport } from '@/components/landing/ProcessSupport'
import { ServicesSection } from '@/components/landing/ServicesSection'
import { PricingSection } from '@/components/landing/PricingSection'
import { PhoneInputField } from '@/components/ui/phone-input'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { hasValidSession } from '@/lib/utils/session'

export default function HomePage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (hasValidSession()) {
      router.push('/dashboard')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />

      {/* Hero Section */}
      <section className="relative min-h-screen bg-[#394afa] pt-[70px] overflow-hidden">
        {/* Full Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/dashboard.avif"
            alt="Professional woman smiling"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Dark overlay for better text readability */}
          {/* <div className="absolute inset-0 bg-gradient-to-r from-[#1A1D3B] via-[#1A1D3B]/80 to-transparent"></div> */}
        </div>

        {/* Content on top of image */}
        <div className="relative z-10 container mx-auto px-6 max-w-[1200px] min-h-[calc(100vh-70px)] flex items-center">
          <div className="max-w-xl py-24 md:py-32">
            <h1 className="text-[48px] md:text-[56px] font-bold text-white mb-6 leading-[1.1em]">
              The most revolutionary datatech in the country!
            </h1>
            <p className="text-[16px] text-white/90 mb-8 leading-[1.7em] max-w-md">
              We capture and deliver the best data on the market to help companies address their diverse challenges, providing the insights they need to drive their businesses forward. Meet BigDataCorp!
            </p>
            <Link href="#get-in-touch">
              <Button className="bg-[#0069FF] hover:bg-[#0055DD] text-white text-[16px] font-semibold px-8 h-14 rounded-md inline-flex items-center gap-3 shadow-xl transition-all duration-300 hover:scale-105">
                Try it now
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 60 60">
                  <path d="M46.5 28.9L20.6 3c-.6-.6-1.6-.6-2.2 0l-4.8 4.8c-.6.6-.6 1.6 0 2.2l19.8 20-19.9 19.9c-.6.6-.6 1.6 0 2.2l4.8 4.8c.6.6 1.6.6 2.2 0l21-21 4.8-4.8c.8-.6.8-1.6.2-2.2z" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Get in touch Section */}
      <section id="get-in-touch" className="py-20 bg-[#23264A]">
        <div className="container mx-auto px-6 max-w-[1200px]">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left side */}
            <div className="text-white">
              <h2 className="text-[45px] font-bold mb-6 leading-tight">
                Transform yours company with BigDataCorp!
              </h2>
              <p className="text-[16px] mb-10 leading-[1.7em] opacity-90">
                Join over 6,000 companies that trust in the power of data. Take advantage of 500 free monthly consultations for your company!
              </p>
              <div className="space-y-4 mb-8">
                {[
                  'Get started, it\'s easy and free!',
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-[#0069FF] rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[16px] font-medium">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Partner Logos */}
              <div className="grid grid-cols-3 gap-8 mt-12">
                {[
                  { name: 'Votorantim', src: '/assets/votorantim.avif' },
                  { name: 'B3', src: '/assets/B3_logo.avif' },
                  { name: 'Certisign', src: '/assets/certisign-logo.avif' },
                  { name: 'VTEX', src: '/assets/VTEX_Logo_svg.avif' },
                  { name: 'Azul', src: '/assets/azul.avif' },
                  { name: 'Quod', src: '/assets/Logo-_-Quod (1).avif' },
                ].map((company, index) => (
                  <div key={index} className="flex items-center justify-center h-10 opacity-60 hover:opacity-100 transition-opacity">
                    <Image
                      src={company.src}
                      alt={company.name}
                      width={100}
                      height={50}
                      className="max-w-full max-h-8 w-auto h-auto object-contain brightness-0 invert"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Form */}
            <Card className="bg-white shadow-2xl border-0 rounded-lg">
              <CardHeader className="p-8 pb-6">
                <CardTitle className="text-[25px] text-[#1D203A] font-bold">
                  Get in touch
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <form className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-[14px] font-semibold text-[#1D203A] mb-2 block">
                        *Your name
                      </Label>
                      <Input
                        id="name"
                        className="h-12 border-gray-200 focus:border-[#0069FF] focus:ring-[#0069FF] rounded-md text-[15px]"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="surname" className="text-[14px] font-semibold text-[#1D203A] mb-2 block">
                        *Your last name
                      </Label>
                      <Input
                        id="surname"
                        className="h-12 border-gray-200 focus:border-[#0069FF] focus:ring-[#0069FF] rounded-md text-[15px]"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="company" className="text-[14px] font-semibold text-[#1D203A] mb-2 block">
                      *Company name
                    </Label>
                    <Input
                      id="company"
                      className="h-12 border-gray-200 focus:border-[#0069FF] focus:ring-[#0069FF] rounded-md text-[15px]"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-[14px] font-semibold text-[#1D203A] mb-2 block">
                      *E-mail
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      className="h-12 border-gray-200 focus:border-[#0069FF] focus:ring-[#0069FF] rounded-md text-[15px]"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-[14px] font-semibold text-[#1D203A] mb-2 block">
                      Phone number
                    </Label>
                    <PhoneInputField
                      id="phone"
                      value={phoneNumber}
                      onChange={setPhoneNumber}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message" className="text-[14px] font-semibold text-[#1D203A] mb-2 block">
                      *Message
                    </Label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-md focus:border-[#0069FF] focus:ring-[#0069FF] focus:ring-1 focus:outline-none text-[15px]"
                      required
                    ></textarea>
                  </div>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="privacy"
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-[#0069FF] focus:ring-[#0069FF] cursor-pointer"
                      required
                    />
                    <label htmlFor="privacy" className="text-[14px] text-[#555866] cursor-pointer">
                      I accept the website&apos;s{' '}
                      <Link href="/privacy" className="text-[#0069FF] hover:underline" target="_blank">
                        privacy policy
                      </Link>.
                    </label>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#0069FF] hover:bg-[#0055DD] text-white text-[16px] font-semibold h-14 rounded-md shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  >
                    Submit
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Reliable data takes you further Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-[1200px]">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-4">
              <Image
                src="/assets/bolinha-vermelho.avif"
                alt=""
                width={60}
                height={40}
                className="w-auto h-10"
              />
            </div>
            <h2 className="text-[45px] font-bold text-[#1D203A] mb-4">
              Reliable data takes you further!
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: (
                  <svg className="w-12 h-12 text-[#0069FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                ),
                title: '+500 datasets',
                description: 'Hundreds of datasets updated from official and proprietary sources.'
              },
              {
                icon: (
                  <svg className="w-12 h-12 text-[#0069FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ),
                title: 'Always updated base',
                description: 'Updated data from multiple sources, processed and available to you.'
              },
              {
                icon: (
                  <svg className="w-12 h-12 text-[#0069FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: '100% coverage',
                description: 'Accurate information on all people, companies and real estate in the country.'
              },
              {
                icon: (
                  <svg className="w-12 h-12 text-[#0069FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                ),
                title: 'Data for all processes',
                description: 'Our solutions serve different sectors and processes in your company.'
              },
            ].map((item, index) => (
              <Card key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-shadow p-6">
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-[20px] font-bold text-[#1D203A] mb-3">
                  {item.title}
                </h3>
                <p className="text-[15px] text-[#555866] leading-[1.6em]">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Blue Stats Section with Video */}
      <section className="py-20 bg-[#0069FF]">
        <div className="container mx-auto px-6 max-w-[1200px]">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-white">
              <h2 className="text-[45px] font-bold mb-6 leading-tight">
                The first datatech in Brazil
              </h2>
              <p className="text-[16px] mb-10 leading-[1.7em] opacity-95">
                BigDataCorp is the leading data and information analysis company in the country. Count on accurate data to drive your innovations.
              </p>

              <div className="grid grid-cols-2 gap-8">
                {[
                  { value: '30 million', label: 'of queries per day' },
                  { value: '250 million', label: 'of property data' },
                  { value: '60 million', label: 'of company data' },
                  { value: '500 million', label: 'product data' }
                ].map((stat, index) => (
                  <div key={index}>
                    <div className="text-[36px] font-bold mb-2">
                      {stat.value}
                    </div>
                    <div className="text-[15px] opacity-90">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative aspect-video bg-[#1D203A] rounded-lg overflow-hidden shadow-2xl">
              <Image
                src="/assets/dashboard.avif"
                alt="Video thumbnail"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-black/70 p-4 rounded">
                <p className="text-white text-[14px] font-semibold">Earn extra income as the global datatech revolution unfolds!</p>
                <p className="text-white/80 text-[12px] mt-1">#bigdatacorp</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our data supports Section */}
      <ProcessSupport />

      {/* Services Section */}
      <ServicesSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* Hire the biggest one Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-[1200px]">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-4">
              <Image
                src="/assets/bolinha-vermelho.avif"
                alt=""
                width={60}
                height={40}
                className="w-auto h-10"
              />
            </div>
            <h2 className="text-[45px] font-bold text-[#1D203A] mb-4">
              Hire the biggest one right now
            </h2>
            <p className="text-[18px] text-[#1D203A] font-semibold">
              Latin American datatech
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                icon: (
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
                title: 'Simple access',
                description: 'Easily query our data using APIs and ready-to-use dashboards.'
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'Consult our data in less than a second',
                description: 'Whether in batches or in real time, access the data instantly and accelerate your processes.'
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: 'Coverage from structured sources',
                description: 'Dozens of ready-to-query datasets, all of the highest quality and accuracy.'
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Pay only for what you use',
                description: 'Plans that adapt to your needs, allowing you to scale safely with your business.'
              },
            ].map((item, index) => (
              <Card key={index} className="bg-white border-0 rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 text-center">
                <div className="w-16 h-16 bg-[#0069FF] rounded-full flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="text-[18px] font-bold text-[#1D203A] mb-3">
                  {item.title}
                </h3>
                <p className="text-[14px] text-[#555866] leading-[1.6em]">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link href="/register">
              <Button className="bg-[#0069FF] hover:bg-[#0055DD] text-white text-[16px] font-semibold px-10 h-14 rounded-md shadow-lg">
                Talk with us now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Blue CTA Section */}
      <section className="py-24 bg-[#0069FF]">
        <div className="container mx-auto px-6 max-w-[1200px] text-center">
          <h2 className="text-[48px] font-bold text-white mb-4 leading-tight">
            The future is now: revolutionize your business with BigDataCorp!
          </h2>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white py-16">
        <div className="container mx-auto px-6 max-w-[1200px]">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="lg:col-span-2">
              <Link href="/" className="inline-block mb-6">
                <Image
                  src="/assets/bdc-branco-01.avif"
                  alt="BigDataCorp"
                  width={180}
                  height={26}
                  className="h-[26px] w-auto"
                />
              </Link>

              {/* Social Links */}
              <div className="flex gap-4 mb-6">
                <a
                  href="#linkedin"
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                <a
                  href="#twitter"
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a
                  href="#facebook"
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                  </svg>
                </a>
                <a
                  href="#instagram"
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a
                  href="#youtube"
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                  aria-label="YouTube"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                  </svg>
                </a>
              </div>

              <div className="mb-6">
                <h4 className="font-bold mb-4 text-[16px]">By Address</h4>
                <p className="text-[14px] text-gray-400">
                  Rua Dr. Renato Paes de Barros, 33 - 4° andar<br />
                  Itaim Bibi - São Paulo - SP - Brazil<br />
                  Zip Code: 04530-904
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-4 text-[16px]">Product</h3>
              <ul className="space-y-3 text-[15px] text-gray-400">
                {['Platforms', 'Apps', 'Solutions', 'Pricing', 'Documentation'].map((item, index) => (
                  <li key={index}>
                    <Link href="#" className="hover:text-white transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4 text-[16px]">Company</h3>
              <ul className="space-y-3 text-[15px] text-gray-400">
                {['About us', 'Careers', 'Blog', 'Contact'].map((item, index) => (
                  <li key={index}>
                    <Link href="#" className="hover:text-white transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Partner Logos Section */}
          <div className="border-t border-gray-800 pt-12 mb-8">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center mb-8">
              {[
                { name: 'Bradesco', src: '/assets/Banco_Bradesco_logo_(horizontal).avif' },
                { name: 'Google', src: '/assets/Logo-_-Google (1).avif' },
                { name: 'Adidas', src: '/assets/Logo-_-Adidas (1).avif' },
                { name: 'Nubank', src: '/assets/Logo-_-Nubank.avif' },
                { name: 'Cloudwalk', src: '/assets/Logo-_-Cloudwalk (1).avif' },
                { name: 'XP', src: '/assets/Logo-_-XP (1).avif' },
              ].map((partner, index) => (
                <div key={index} className="flex items-center justify-center h-12 opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
                  <Image
                    src={partner.src}
                    alt={partner.name}
                    width={120}
                    height={60}
                    className="max-w-full max-h-10 w-auto h-auto object-contain brightness-0 invert"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[14px] text-gray-400">
              © 2025 BigDataCorp. All rights reserved.
            </p>
            <div className="flex gap-6 text-[14px] text-gray-400">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
