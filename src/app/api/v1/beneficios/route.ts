import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, checkAndDeductCredits, enforceRateLimit, logApiUsage } from '@/lib/utils/rate-limiter'

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  const authHeader = request.headers.get('authorization')
  const validation = await validateApiKey(authHeader)

  if (!validation.isValid) {
    return NextResponse.json(
      { error: validation.error || 'Unauthorized' },
      { status: 401 }
    )
  }

  // Check credits and deduct if needed
  const creditCheck = await checkAndDeductCredits(
    validation.userId!,
    '/api/v1/beneficios',
    validation.planType!
  )

  if (!creditCheck.allowed) {
    const responseTime = Date.now() - startTime
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    await logApiUsage(
      validation.userId!,
      validation.apiKeyId!,
      '/api/v1/beneficios',
      'GET',
      creditCheck.response?.status || 402,
      responseTime,
      ipAddress
    )
    return creditCheck.response!
  }

  const rateLimitCheck = await enforceRateLimit(
    validation.userId!,
    validation.planType!
  )

  if (!rateLimitCheck.allowed) {
    const responseTime = Date.now() - startTime
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    await logApiUsage(
      validation.userId!,
      validation.apiKeyId!,
      '/api/v1/beneficios',
      'GET',
      429,
      responseTime,
      ipAddress
    )
    return rateLimitCheck.response!
  }

  try {
    const { searchParams } = new URL(request.url)
    const cpf = searchParams.get('cpf')

    if (!cpf) {
      return NextResponse.json(
        { error: 'CPF parameter is required' },
        { status: 400 }
      )
    }

    if (!/^\d{11}$/.test(cpf)) {
      return NextResponse.json(
        { error: 'Invalid CPF format. Must be 11 digits' },
        { status: 400 }
      )
    }

    const data = {
      status: 'ok',
      data: {
        cpf: cpf,
        nome: 'BENEFICIARIO EXEMPLO',
        nis: '12345678901',
        beneficios: {
          auxilioBrasil: {
            descricao: 'AUXÍLIO BRASIL',
            tipoAcesso: 'PÚBLICO',
            status: 'INATIVO',
            parcelasRecebidas: []
          },
          auxilioEmergencial: {
            descricao: 'AUXÍLIO EMERGENCIAL',
            tipoAcesso: 'PÚBLICO',
            status: 'INATIVO',
            parcelasRecebidas: []
          },
          auxilioBpc: {
            descricao: 'BENEFÍCIO DE PRESTAÇÃO CONTINUADA',
            tipoAcesso: 'PÚBLICO',
            status: 'INATIVO',
            parcelasRecebidas: []
          },
          bolsaFamilia: {
            descricao: 'BOLSA FAMÍLIA',
            tipoAcesso: 'PÚBLICO',
            status: 'ATIVO',
            valorMensal: '600.00',
            dataInicio: '2023-01-01',
            parcelasRecebidas: [
              {
                valor: '600.00',
                nisFavorecido: '12345678901',
                mesSituacao: '01',
                anoSituacao: '2024',
                dataPagamento: '2024-01-20'
              },
              {
                valor: '600.00',
                nisFavorecido: '12345678901',
                mesSituacao: '02',
                anoSituacao: '2024',
                dataPagamento: '2024-02-20'
              }
            ]
          },
          planoSaude: {
            descricao: 'PLANOS DE SAÚDE PRIVADOS',
            tipoAcesso: 'PRIVADO',
            registroContratos: []
          },
          histLoas: {
            descricao: 'LEI ORGÂNICA DE ASSISTÊNCIA SOCIAL',
            tipoAcesso: 'PÚBLICO',
            status: 'INATIVO',
            parcelasRecebidas: []
          },
          histInss: {
            descricao: 'INSTITUTO NACIONAL DO SEGURO SOCIAL',
            tipoAcesso: 'PÚBLICO',
            status: 'INATIVO',
            beneficios: []
          },
          seguroDesemprego: {
            descricao: 'SEGURO DESEMPREGO',
            tipoAcesso: 'PÚBLICO',
            status: 'INATIVO',
            parcelasRecebidas: []
          }
        },
        resumo: {
          totalBeneficios: 1,
          beneficiosAtivos: 1,
          valorTotalMensal: '600.00',
          ultimaAtualizacao: new Date().toISOString()
        }
      },
      meta: {
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      }
    }

    const responseTime = Date.now() - startTime
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    await logApiUsage(
      validation.userId!,
      validation.apiKeyId!,
      '/api/v1/beneficios',
      'GET',
      200,
      responseTime,
      ipAddress
    )

    // Build response headers
    const headers: Record<string, string> = {
        'X-Request-Id': data.meta.requestId,
        'X-Response-Time': `${responseTime}ms`,
    }

    // Add credit information if credits were deducted
    if (creditCheck.creditsCost) {
      headers['X-Credits-Used'] = creditCheck.creditsCost.toString()
      headers['X-Credits-Remaining'] = creditCheck.creditsRemaining!.toString()
    }

    return NextResponse.json(data, { headers })
  } catch (error) {
    console.error('Error processing beneficios request:', error)

    const responseTime = Date.now() - startTime
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    await logApiUsage(
      validation.userId!,
      validation.apiKeyId!,
      '/api/v1/beneficios',
      'GET',
      500,
      responseTime,
      ipAddress
    )

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
