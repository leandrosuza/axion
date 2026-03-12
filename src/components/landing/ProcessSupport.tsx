'use client'

import { useState, useRef } from 'react'
import Image, { StaticImageData } from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Antifraude from '@/assets/Antifraude.avif'
import PldKycCompliance from '@/assets/PLD, KYC e Compliance.avif'
import Enriquecimento from '@/assets/Higienização e Enriquecimento.avif'
import CreditoRisco from '@/assets/Crédito e Risco.avif'
import InteligenciaArtificial from '@/assets/Inteligência Artificial.avif'
import OnboardingDigital from '@/assets/Onboarding Digital.avif'
import MapeamentoMercado from '@/assets/Mapeamento de Mercado.avif'
import GeracaoLeads from '@/assets/Geração de Leads.avif'

interface ProcessData {
  id: string
  title: string
  description: string
  buttonText: string
  imagePath: StaticImageData
  tags: string[]
}

const processesData: ProcessData[] = [
  {
    id: 'antifraud',
    title: 'Antifraude',
    description:
      'Valide a identidade de qualquer pessoa ou empresa de forma rápida e sem qualquer análise manual. Economize tempo e dinheiro e aumente a conversão de vendas e cadastros sem gerar incômodo para seus clientes.',
    buttonText: 'Saiba mais',
    imagePath: Antifraude,
    tags: ['Dados comportamentais', 'Dados de localização', 'Dados de dispositivo'],
  },
  {
    id: 'kyc',
    title: 'PLD, KYC e Compliance',
    description:
      'Incorpore a mais completa e atualizada coleção de dados regulatórios e de compliance em seus processos de KYC, KYB e PLD. Tenha análises de padrão global sem fricção e com uma excelente relação custo x benefício.',
    buttonText: 'Saiba mais',
    imagePath: PldKycCompliance,
    tags: ['Dados regulatórios', 'Padrões globais', 'Avaliação de risco'],
  },
  {
    id: 'enrichment',
    title: 'Higienização e Enriquecimento',
    description:
      'Refine, valide, corrija, enriqueça e atualize informações de qualquer base ou sistema em tempo real. Utilize dados públicos altamente qualificados sobre pessoas, empresas e produtos para a sua empresa.',
    buttonText: 'Saiba mais',
    imagePath: Enriquecimento,
    tags: ['Validação de dados', 'Atualizações em tempo real', 'Enriquecimento'],
  },
  {
    id: 'credit',
    title: 'Crédito e Risco',
    description:
      'Transforme o seu processo de análise de crédito e de risco. Vá além das informações tradicionais, utilizando dados alternativos, ou aproveite os scores e modelos já disponíveis em nosso marketplace.',
    buttonText: 'Saiba mais',
    imagePath: CreditoRisco,
    tags: ['Score de crédito', 'Análise de risco', 'Dados alternativos'],
  },
  {
    id: 'ai',
    title: 'Inteligência Artificial',
    description:
      'A Inteligência Artificial só é possível com dados, e a BigDataCorp oferece os melhores! Crie ou customize modelos de IA e descubra como dados incrementados por IA Generativa podem ajudar o seu negócio.',
    buttonText: 'Saiba mais',
    imagePath: InteligenciaArtificial,
    tags: ['Modelos de IA', 'IA Generativa', 'Modelos customizados'],
  },
  {
    id: 'onboarding',
    title: 'Onboarding Digital',
    description:
      'Elimine a fricção do seu processo de cadastro de clientes, usando dados públicos para gerar uma experiência incrível para seu usuário. Converta mais clientes sem abrir mão da segurança.',
    buttonText: 'Saiba mais',
    imagePath: OnboardingDigital,
    tags: ['Experiência do usuário', 'Conversão', 'Segurança'],
  },
  {
    id: 'mapping',
    title: 'Mapeamento de Mercado',
    description:
      'Esteja sempre bem informado e à frente da concorrência! Acesse indicadores e séries baseadas em dados alternativos, que permitem a identificação de tendências, de movimentos dos concorrentes, da variação de preços, do lançamentos de produtos e muito mais.',
    buttonText: 'Saiba mais',
    imagePath: MapeamentoMercado,
    tags: ['Tendências de mercado', 'Análise da concorrência', 'Monitoramento de preços'],
  },
  {
    id: 'leads',
    title: 'Geração de Leads',
    description:
      'Gere bases e listas para prospecção comercial baseadas nos milhares de atributos sobre empresas que temos disponíveis. Encontre contatos assertivos e fale com o seu público-alvo!',
    buttonText: 'Saiba mais',
    imagePath: GeracaoLeads,
    tags: ['Geração de leads', 'Prospecção', 'Público-alvo'],
  },
]

export function ProcessSupport() {
  const [activeProcess, setActiveProcess] = useState<ProcessData>(processesData[0])
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300
      const currentScroll = scrollContainerRef.current.scrollLeft
      const newPosition = direction === 'left'
        ? currentScroll - scrollAmount
        : currentScroll + scrollAmount

      scrollContainerRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
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
            Nossos dados apoiam os mais diversos processos
          </h2>
        </div>

        {/* Tabs with Navigation */}
        <div className="relative mb-12 max-w-5xl mx-auto">
          {/* Previous Button */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-[#8B4513] text-white rounded-full flex items-center justify-center hover:bg-[#6B3410] transition-all shadow-lg"
            aria-label="Previous"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex gap-4 pb-2">
              {processesData.map((process) => (
                <button
                  key={process.id}
                  onClick={() => setActiveProcess(process)}
                  className={`flex-shrink-0 px-6 py-4 rounded-lg font-semibold text-[15px] transition-all duration-300 border-2 whitespace-nowrap ${
                    activeProcess.id === process.id
                      ? 'bg-[#0069FF] text-white border-[#0069FF] shadow-xl scale-[1.02]'
                      : 'bg-white text-[#1D203A] border-gray-200 hover:border-[#0069FF] hover:text-[#0069FF]'
                  }`}
                >
                  {process.title}
                </button>
              ))}
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-[#8B4513] text-white rounded-full flex items-center justify-center hover:bg-[#6B3410] transition-all shadow-lg"
            aria-label="Next"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={activeProcess.imagePath}
              alt={activeProcess.title}
              fill
              className="object-cover"
            />
          </div>

          <div>
            <h3 className="text-[35px] font-bold text-[#1D203A] mb-6">
              {activeProcess.title}
            </h3>
            <p className="text-[16px] text-[#555866] leading-[1.7em] mb-6">
              {activeProcess.description}
            </p>
            <Link href="/register">
              <Button className="bg-[#0069FF] hover:bg-[#0055DD] text-white text-[15px] font-semibold px-8 h-12 rounded-md transition-all duration-300 hover:scale-105">
                {activeProcess.buttonText}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
