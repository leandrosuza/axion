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
    '/api/v1/veiculos',
    validation.planType!
  )

  if (!creditCheck.allowed) {
    const responseTime = Date.now() - startTime
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    await logApiUsage(
      validation.userId!,
      validation.apiKeyId!,
      '/api/v1/veiculos',
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
      '/api/v1/veiculos',
      'GET',
      429,
      responseTime,
      ipAddress
    )
    return rateLimitCheck.response!
  }

  try {
    const { searchParams } = new URL(request.url)
    const cpfCnpj = searchParams.get('cpf') || searchParams.get('cnpj')

    if (!cpfCnpj) {
      return NextResponse.json(
        { error: 'CPF or CNPJ parameter is required' },
        { status: 400 }
      )
    }

    const data = {
      status: 'ok',
      data: {
        proprietario: {
          cpfCnpj: cpfCnpj,
          nome: 'PROPRIETARIO EXEMPLO',
          tipo: cpfCnpj.length === 11 ? 'PESSOA FÍSICA' : 'PESSOA JURÍDICA'
        },
        veiculos: [
          {
            placa: 'ABC1D23',
            renavam: '12345678901',
            chassi: '9BWZZZ377VT004251',
            anoFabricacao: '2020',
            anoModelo: '2021',
            marca: 'VOLKSWAGEN',
            modelo: 'GOL',
            cor: 'PRATA',
            combustivel: 'FLEX',
            categoria: 'PARTICULAR',
            especie: 'PASSAGEIRO',
            tipo: 'AUTOMOVEL',
            potencia: '80',
            cilindradas: '1000',
            capacidadePassageiros: '5',
            municipio: 'SAO PAULO',
            uf: 'SP',
            situacao: 'CIRCULAÇÃO',
            restricoes: [],
            debitos: {
              ipva: [],
              multas: [],
              licenciamento: {
                ano: '2024',
                situacao: 'PAGO',
                dataVencimento: '2024-12-31',
                valor: '350.00'
              }
            },
            historicoProprietarios: [
              {
                nome: 'PROPRIETARIO EXEMPLO',
                cpfCnpj: cpfCnpj,
                dataInicio: '2021-01-15',
                dataFim: null
              }
            ]
          }
        ],
        totalVeiculos: 1
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
      '/api/v1/veiculos',
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
    console.error('Error processing veiculos request:', error)

    const responseTime = Date.now() - startTime
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    await logApiUsage(
      validation.userId!,
      validation.apiKeyId!,
      '/api/v1/veiculos',
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
