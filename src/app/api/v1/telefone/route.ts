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
    '/api/v1/telefone',
    validation.planType!
  )

  if (!creditCheck.allowed) {
    const responseTime = Date.now() - startTime
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    await logApiUsage(
      validation.userId!,
      validation.apiKeyId!,
      '/api/v1/telefone',
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
      '/api/v1/telefone',
      'GET',
      429,
      responseTime,
      ipAddress
    )
    return rateLimitCheck.response!
  }

  try {
    const { searchParams } = new URL(request.url)
    const telefone = searchParams.get('telefone')

    if (!telefone) {
      return NextResponse.json(
        { error: 'Telefone parameter is required' },
        { status: 400 }
      )
    }

    if (!/^\d{10,11}$/.test(telefone)) {
      return NextResponse.json(
        { error: 'Invalid telefone format. Must be 10-11 digits (DDD + number)' },
        { status: 400 }
      )
    }

    const ddd = telefone.substring(0, 2)
    const numero = telefone.substring(2)
    const tipo = telefone.length === 11 ? 'MÓVEL' : 'FIXO'

    const data = {
      status: 'ok',
      data: {
        telefone: telefone,
        ddd: ddd,
        numero: numero,
        tipo: tipo,
        operadora: tipo === 'MÓVEL' ? 'VIVO' : 'TELEFONICA',
        codigoOperadora: tipo === 'MÓVEL' ? '15' : '12',
        uf: 'SP',
        municipio: 'SAO PAULO',
        whatsapp: tipo === 'MÓVEL' ? true : false,
        linhaAtiva: true,
        portabilidade: false,
        titular: {
          nome: 'TITULAR EXEMPLO',
          cpfCnpj: '12345678901',
          tipo: 'PESSOA FÍSICA'
        },
        endereco: {
          logradouro: 'RUA EXEMPLO',
          numero: '100',
          bairro: 'CENTRO',
          cidade: 'SAO PAULO',
          uf: 'SP',
          cep: '01000000'
        },
        historico: [
          {
            dataInicio: '2020-01-01',
            dataFim: null,
            operadora: tipo === 'MÓVEL' ? 'VIVO' : 'TELEFONICA',
            status: 'ATIVA'
          }
        ]
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
      '/api/v1/telefone',
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
    console.error('Error processing telefone request:', error)

    const responseTime = Date.now() - startTime
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    await logApiUsage(
      validation.userId!,
      validation.apiKeyId!,
      '/api/v1/telefone',
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
