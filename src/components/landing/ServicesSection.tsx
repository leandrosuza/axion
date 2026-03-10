import { Card } from '@/components/ui/card'
import Image from 'next/image'

const services = [
  {
    title: 'Consulta de CPF',
    description: 'Dados completos de pessoas físicas incluindo informações básicas, endereços, telefones, vínculos e histórico.',
    icon: '👤',
    features: ['Dados cadastrais', 'Histórico de endereços', 'Telefones e emails', 'Score e renda estimada']
  },
  {
    title: 'Consulta de CNPJ',
    description: 'Informações empresariais completas com dados da Receita Federal, sócios, atividades e situação cadastral.',
    icon: '🏢',
    features: ['Razão social e nome fantasia', 'Quadro societário', 'Atividades econômicas', 'Situação cadastral']
  },
  {
    title: 'Consulta de Telefone',
    description: 'Dados de telefonia incluindo operadora, tipo de linha, WhatsApp e informações do titular.',
    icon: '📱',
    features: ['Operadora e tipo', 'Status WhatsApp', 'Dados do titular', 'Histórico de portabilidade']
  },
  {
    title: 'Consulta de Veículos',
    description: 'Informações sobre veículos vinculados a CPF ou CNPJ, incluindo débitos, restrições e licenciamento.',
    icon: '🚗',
    features: ['Dados do veículo', 'Débitos e multas', 'Histórico de proprietários', 'Status de licenciamento']
  },
  {
    title: 'Pessoas Relacionadas',
    description: 'Mapeamento de vínculos familiares, profissionais e sociais baseado em múltiplas fontes de dados.',
    icon: '👥',
    features: ['Vínculos familiares', 'Sócios e parceiros', 'Endereços compartilhados', 'Grau de confiança']
  },
  {
    title: 'Benefícios Sociais',
    description: 'Consulta de programas sociais e benefícios governamentais vinculados ao CPF.',
    icon: '💰',
    features: ['Bolsa Família', 'Auxílio Brasil', 'BPC/LOAS', 'Seguro desemprego']
  },
]

export function ServicesSection() {
  return (
    <section id="services" className="py-20 bg-white">
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
            Complete Data Solutions
          </h2>
          <p className="text-[18px] text-[#555866] max-w-3xl mx-auto">
            Access Brazil&apos;s most comprehensive data platform with 6 powerful API endpoints
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Card key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-shadow p-6">
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-[20px] font-bold text-[#1D203A] mb-3">
                {service.title}
              </h3>
              <p className="text-[15px] text-[#555866] leading-[1.6em] mb-4">
                {service.description}
              </p>
              <ul className="space-y-2">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-[14px] text-[#555866]">
                    <svg className="w-4 h-4 text-[#0069FF] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
