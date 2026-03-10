/**
 * Script to seed initial API modules
 * Usage: npx tsx scripts/seed-modules.ts
 */

import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

const API_MODULES = [
  // Personal Data
  {
    name: 'CPF Query',
    slug: 'cpf',
    description: 'Query CPF (Individual Taxpayer Registry) data from Brazilian Federal Revenue',
    category: 'Personal Data',
    endpoint: '/api/v1/cpf',
    method: 'GET',
    price_per_query: 1,
    example_request: { cpf: '12345678901' },
    example_response: { name: 'João Silva', birth_date: '1990-01-15', status: 'regular' }
  },
  {
    name: 'CPF Validation',
    slug: 'cpf-validation',
    description: 'Validate if a CPF number is valid and check its status',
    category: 'Personal Data',
    endpoint: '/api/v1/cpf/validate',
    method: 'GET',
    price_per_query: 1
  },
  {
    name: 'Name Search',
    slug: 'name-search',
    description: 'Search for people by name and get their basic information',
    category: 'Personal Data',
    endpoint: '/api/v1/person/search',
    method: 'GET',
    price_per_query: 2
  },
  {
    name: 'Person Complete',
    slug: 'person-complete',
    description: 'Get complete profile of a person including address, phone, and financial data',
    category: 'Personal Data',
    endpoint: '/api/v1/person/complete',
    method: 'GET',
    price_per_query: 5,
    is_premium: true
  },
  {
    name: 'Person Relatives',
    slug: 'person-relatives',
    description: 'Find relatives and family connections of a person',
    category: 'Personal Data',
    endpoint: '/api/v1/person/relatives',
    method: 'GET',
    price_per_query: 3
  },

  // Company Data
  {
    name: 'CNPJ Query',
    slug: 'cnpj',
    description: 'Query CNPJ (Company Registry) data from Brazilian Federal Revenue',
    category: 'Company Data',
    endpoint: '/api/v1/cnpj',
    method: 'GET',
    price_per_query: 1
  },
  {
    name: 'CNPJ Validation',
    slug: 'cnpj-validation',
    description: 'Validate if a CNPJ number is valid and check company status',
    category: 'Company Data',
    endpoint: '/api/v1/cnpj/validate',
    method: 'GET',
    price_per_query: 1
  },
  {
    name: 'Company Partners',
    slug: 'company-partners',
    description: 'Get list of partners and shareholders of a company',
    category: 'Company Data',
    endpoint: '/api/v1/company/partners',
    method: 'GET',
    price_per_query: 2
  },
  {
    name: 'Company Complete',
    slug: 'company-complete',
    description: 'Complete company profile with financial data, employees, and history',
    category: 'Company Data',
    endpoint: '/api/v1/company/complete',
    method: 'GET',
    price_per_query: 5,
    is_premium: true
  },
  {
    name: 'Company Search',
    slug: 'company-search',
    description: 'Search companies by name, activity, or location',
    category: 'Company Data',
    endpoint: '/api/v1/company/search',
    method: 'GET',
    price_per_query: 2
  },
  {
    name: 'Company Subsidiaries',
    slug: 'company-subsidiaries',
    description: 'Find subsidiaries and branches of a company',
    category: 'Company Data',
    endpoint: '/api/v1/company/subsidiaries',
    method: 'GET',
    price_per_query: 3
  },

  // Vehicle Data
  {
    name: 'Vehicle Plate Query',
    slug: 'vehicle-plate',
    description: 'Query vehicle data by license plate number',
    category: 'Vehicle Data',
    endpoint: '/api/v1/vehicle/plate',
    method: 'GET',
    price_per_query: 2
  },
  {
    name: 'Vehicle RENAVAM Query',
    slug: 'vehicle-renavam',
    description: 'Query vehicle data by RENAVAM code',
    category: 'Vehicle Data',
    endpoint: '/api/v1/vehicle/renavam',
    method: 'GET',
    price_per_query: 2
  },
  {
    name: 'Vehicle Owner History',
    slug: 'vehicle-owner-history',
    description: 'Get ownership history of a vehicle',
    category: 'Vehicle Data',
    endpoint: '/api/v1/vehicle/owner-history',
    method: 'GET',
    price_per_query: 3
  },
  {
    name: 'Vehicle Debts',
    slug: 'vehicle-debts',
    description: 'Check for debts, fines, and restrictions on a vehicle',
    category: 'Vehicle Data',
    endpoint: '/api/v1/vehicle/debts',
    method: 'GET',
    price_per_query: 2
  },
  {
    name: 'Vehicle Complete',
    slug: 'vehicle-complete',
    description: 'Complete vehicle profile including history, debts, and market value',
    category: 'Vehicle Data',
    endpoint: '/api/v1/vehicle/complete',
    method: 'GET',
    price_per_query: 5,
    is_premium: true
  },

  // Phone Data
  {
    name: 'Phone Lookup',
    slug: 'phone-lookup',
    description: 'Find owner information by phone number',
    category: 'Phone Data',
    endpoint: '/api/v1/phone/lookup',
    method: 'GET',
    price_per_query: 1
  },
  {
    name: 'Phone Validation',
    slug: 'phone-validation',
    description: 'Validate if a phone number is active and get carrier info',
    category: 'Phone Data',
    endpoint: '/api/v1/phone/validate',
    method: 'GET',
    price_per_query: 1
  },
  {
    name: 'Phone by CPF',
    slug: 'phone-by-cpf',
    description: 'Find phone numbers associated with a CPF',
    category: 'Phone Data',
    endpoint: '/api/v1/phone/by-cpf',
    method: 'GET',
    price_per_query: 2
  },

  // Address Data
  {
    name: 'CEP Query',
    slug: 'cep',
    description: 'Query address by CEP (postal code)',
    category: 'Address Data',
    endpoint: '/api/v1/address/cep',
    method: 'GET',
    price_per_query: 1
  },
  {
    name: 'Address Lookup',
    slug: 'address-lookup',
    description: 'Find addresses associated with a CPF or CNPJ',
    category: 'Address Data',
    endpoint: '/api/v1/address/lookup',
    method: 'GET',
    price_per_query: 1
  },
  {
    name: 'Geocoding',
    slug: 'geocoding',
    description: 'Convert address to geographic coordinates',
    category: 'Address Data',
    endpoint: '/api/v1/address/geocode',
    method: 'GET',
    price_per_query: 1
  },
  {
    name: 'Reverse Geocoding',
    slug: 'reverse-geocoding',
    description: 'Convert coordinates to address',
    category: 'Address Data',
    endpoint: '/api/v1/address/reverse-geocode',
    method: 'GET',
    price_per_query: 1
  },

  // Email Data
  {
    name: 'Email Validation',
    slug: 'email-validation',
    description: 'Validate if an email address is valid and deliverable',
    category: 'Email Data',
    endpoint: '/api/v1/email/validate',
    method: 'GET',
    price_per_query: 1
  },
  {
    name: 'Email Lookup',
    slug: 'email-lookup',
    description: 'Find person information by email address',
    category: 'Email Data',
    endpoint: '/api/v1/email/lookup',
    method: 'GET',
    price_per_query: 2
  },
  {
    name: 'Email by CPF',
    slug: 'email-by-cpf',
    description: 'Find email addresses associated with a CPF',
    category: 'Email Data',
    endpoint: '/api/v1/email/by-cpf',
    method: 'GET',
    price_per_query: 2
  },

  // Credit Data
  {
    name: 'Credit Score',
    slug: 'credit-score',
    description: 'Get credit score and risk analysis for a person',
    category: 'Credit Data',
    endpoint: '/api/v1/credit/score',
    method: 'GET',
    price_per_query: 5,
    is_premium: true
  },
  {
    name: 'Credit History',
    slug: 'credit-history',
    description: 'Get credit history and payment behavior',
    category: 'Credit Data',
    endpoint: '/api/v1/credit/history',
    method: 'GET',
    price_per_query: 5,
    is_premium: true
  },
  {
    name: 'Debt Check',
    slug: 'debt-check',
    description: 'Check for debts and negative records',
    category: 'Credit Data',
    endpoint: '/api/v1/credit/debts',
    method: 'GET',
    price_per_query: 3
  },
  {
    name: 'Company Credit',
    slug: 'company-credit',
    description: 'Get credit analysis for a company',
    category: 'Credit Data',
    endpoint: '/api/v1/credit/company',
    method: 'GET',
    price_per_query: 5,
    is_premium: true
  },

  // Financial Data
  {
    name: 'Bank Account Validation',
    slug: 'bank-validation',
    description: 'Validate bank account ownership',
    category: 'Financial Data',
    endpoint: '/api/v1/financial/bank-validate',
    method: 'POST',
    price_per_query: 2
  },
  {
    name: 'PIX Key Lookup',
    slug: 'pix-lookup',
    description: 'Find owner information by PIX key',
    category: 'Financial Data',
    endpoint: '/api/v1/financial/pix-lookup',
    method: 'GET',
    price_per_query: 2
  },
  {
    name: 'Income Estimate',
    slug: 'income-estimate',
    description: 'Estimate income range for a person',
    category: 'Financial Data',
    endpoint: '/api/v1/financial/income',
    method: 'GET',
    price_per_query: 3,
    is_premium: true
  },

  // Legal Data
  {
    name: 'Lawsuit Search',
    slug: 'lawsuit-search',
    description: 'Search for lawsuits involving a person or company',
    category: 'Legal Data',
    endpoint: '/api/v1/legal/lawsuits',
    method: 'GET',
    price_per_query: 3
  },
  {
    name: 'Criminal Records',
    slug: 'criminal-records',
    description: 'Check for criminal records (public data only)',
    category: 'Legal Data',
    endpoint: '/api/v1/legal/criminal',
    method: 'GET',
    price_per_query: 3
  },
  {
    name: 'Sanctions Check',
    slug: 'sanctions-check',
    description: 'Check against sanctions and PEP lists',
    category: 'Legal Data',
    endpoint: '/api/v1/legal/sanctions',
    method: 'GET',
    price_per_query: 2
  },
  {
    name: 'Labor Lawsuits',
    slug: 'labor-lawsuits',
    description: 'Search for labor lawsuits involving a company',
    category: 'Legal Data',
    endpoint: '/api/v1/legal/labor',
    method: 'GET',
    price_per_query: 3
  },

  // Social Data
  {
    name: 'Social Media Lookup',
    slug: 'social-lookup',
    description: 'Find social media profiles for a person',
    category: 'Social Data',
    endpoint: '/api/v1/social/lookup',
    method: 'GET',
    price_per_query: 2
  },
  {
    name: 'Professional Profile',
    slug: 'professional-profile',
    description: 'Get professional background and work history',
    category: 'Social Data',
    endpoint: '/api/v1/social/professional',
    method: 'GET',
    price_per_query: 3
  },

  // Benefits Data
  {
    name: 'Benefits Query',
    slug: 'benefits',
    description: 'Query government benefits received by a CPF',
    category: 'Financial Data',
    endpoint: '/api/v1/benefits',
    method: 'GET',
    price_per_query: 2
  },

  // Related Data
  {
    name: 'Related Persons',
    slug: 'related-persons',
    description: 'Find related persons by address, phone, or other connections',
    category: 'Personal Data',
    endpoint: '/api/v1/related/persons',
    method: 'GET',
    price_per_query: 3
  },
  {
    name: 'Related Companies',
    slug: 'related-companies',
    description: 'Find related companies by partners, address, or other connections',
    category: 'Company Data',
    endpoint: '/api/v1/related/companies',
    method: 'GET',
    price_per_query: 3
  },

  // Batch Operations
  {
    name: 'Batch CPF Query',
    slug: 'batch-cpf',
    description: 'Query multiple CPFs in a single request',
    category: 'Personal Data',
    endpoint: '/api/v1/batch/cpf',
    method: 'POST',
    price_per_query: 1,
    is_premium: true
  },
  {
    name: 'Batch CNPJ Query',
    slug: 'batch-cnpj',
    description: 'Query multiple CNPJs in a single request',
    category: 'Company Data',
    endpoint: '/api/v1/batch/cnpj',
    method: 'POST',
    price_per_query: 1,
    is_premium: true
  },
  {
    name: 'Batch Phone Validation',
    slug: 'batch-phone',
    description: 'Validate multiple phone numbers in a single request',
    category: 'Phone Data',
    endpoint: '/api/v1/batch/phone',
    method: 'POST',
    price_per_query: 1,
    is_premium: true
  },
  {
    name: 'Batch Email Validation',
    slug: 'batch-email',
    description: 'Validate multiple emails in a single request',
    category: 'Email Data',
    endpoint: '/api/v1/batch/email',
    method: 'POST',
    price_per_query: 1,
    is_premium: true
  }
]

async function seedModules() {
  console.log('Seeding API modules...')

  let created = 0
  let skipped = 0

  for (const moduleData of API_MODULES) {
    try {
      const existing = await prisma.api_modules.findUnique({
        where: { slug: moduleData.slug }
      })

      if (existing) {
        console.log(`  Skipped: ${moduleData.name} (already exists)`)
        skipped++
        continue
      }

      await prisma.api_modules.create({
        data: {
          id: randomUUID(),
          name: moduleData.name,
          slug: moduleData.slug,
          description: moduleData.description,
          category: moduleData.category,
          endpoint: moduleData.endpoint,
          method: moduleData.method || 'GET',
          status: 'active',
          is_visible: true,
          is_premium: moduleData.is_premium || false,
          price_per_query: moduleData.price_per_query || 1,
          rate_limit_minute: 60,
          rate_limit_day: 1000,
          example_request: moduleData.example_request || null,
          example_response: moduleData.example_response || null,
          display_order: created
        }
      })

      console.log(`  Created: ${moduleData.name}`)
      created++
    } catch (error: any) {
      console.error(`  Error creating ${moduleData.name}:`, error.message)
    }
  }

  console.log('\n----------------------------------------')
  console.log(`Seeding complete!`)
  console.log(`  Created: ${created} modules`)
  console.log(`  Skipped: ${skipped} modules`)
  console.log('----------------------------------------\n')
}

seedModules()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
