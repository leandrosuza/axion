import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, checkAndDeductCredits, enforceRateLimit, logApiUsage } from '@/lib/utils/rate-limiter'

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  // Validate API key
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
    '/api/v1/cpf',
    validation.planType!
  )

  if (!creditCheck.allowed) {
    const responseTime = Date.now() - startTime
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    await logApiUsage(
      validation.userId!,
      validation.apiKeyId!,
      '/api/v1/cpf',
      'GET',
      creditCheck.response?.status || 402,
      responseTime,
      ipAddress
    )

    return creditCheck.response!
  }

  // Enforce rate limiting
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
      '/api/v1/cpf',
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

    // Validate CPF format (11 digits)
    if (!/^\d{11}$/.test(cpf)) {
      return NextResponse.json(
        { error: 'Invalid CPF format. Must be 11 digits' },
        { status: 400 }
      )
    }

    // Call real BigDataCorp API with main API key
    // Note: Uncomment and configure when you have the real API key
    // const { bigDataCorpClient } = await import('@/lib/bigdatacorp/client')
    // const realData = await bigDataCorpClient.queryCPF(cpf)

    // For now, return mock data (remove this when integrating real API)
    const data = {
      status: 'ok',
      data: {
        dadosBasicos: {
          cpf: cpf,
          cns: '701008848399692',
          nome: 'EXAMPLE USER NAME',
          dataNasc: '1990-01-01',
          sexo: 'M',
          estCivil: 'SOLTEIRO(A)',
          faixaScore: 'ACIMA DE 600',
          rendaAtual: '3500',
          escolaridade: 'ENSINO SUPERIOR',
          naturalidade: 'SAO PAULO - SP',
          nacionalidade: 'BRASIL',
          desaparecido: false,
          biometria: {
            racaCor: 'BRANCA',
            altura: '175.0',
            olhos: 'CASTANHOS',
            cabelo: 'PRETOS'
          },
          filiacao: {
            nomeMae: 'MARIA SILVA',
            nomePai: 'JOSE SILVA'
          },
          situacaoCadastral: {
            descricaoSit: 'REGULAR',
            dataSit: new Date().toISOString(),
            obito: {}
          }
        },
        registroGeral: {
          rgNumero: '123456789',
          orgaoEmissor: 'SSP',
          ufEmissao: 'SP',
          dataEmissao: '2010-01-01'
        },
        telefones: [],
        emails: [],
        enderecos: [],
        empregos: [],
        empresas: [],
        contasBancarias: [],
        beneficios: {},
        dividas: {},
        vacinas: [],
        relacionados: [],
        veiculos: [],
        imoveis: [],
        processos: [],
        consumos: [],
        interesses: {}
      },
      meta: {
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      }
    }

    const responseTime = Date.now() - startTime

    // Log successful request
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    await logApiUsage(
      validation.userId!,
      validation.apiKeyId!,
      '/api/v1/cpf',
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
    console.error('Error processing CPF request:', error)

    const responseTime = Date.now() - startTime
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    await logApiUsage(
      validation.userId!,
      validation.apiKeyId!,
      '/api/v1/cpf',
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
