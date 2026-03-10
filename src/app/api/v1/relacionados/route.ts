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
    '/api/v1/relacionados',
    validation.planType!
  )

  if (!creditCheck.allowed) {
    const responseTime = Date.now() - startTime
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    await logApiUsage(
      validation.userId!,
      validation.apiKeyId!,
      '/api/v1/relacionados',
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
      '/api/v1/relacionados',
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
        cpfConsultado: cpf,
        nomeConsultado: 'PESSOA EXEMPLO',
        relacionados: [
          {
            cpf: '98765432109',
            nome: 'MARIA SILVA',
            tipoRelacao: 'MÃE',
            grauRelacionamento: 1,
            confianca: 100
          },
          {
            cpf: '12398765432',
            nome: 'JOSE SILVA',
            tipoRelacao: 'PAI',
            grauRelacionamento: 1,
            confianca: 100
          },
          {
            cpf: '45612378909',
            nome: 'JOAO SILVA',
            tipoRelacao: 'IRMÃO',
            grauRelacionamento: 2,
            confianca: 95
          },
          {
            cpf: '78945612301',
            nome: 'ANA SILVA',
            tipoRelacao: 'CÔNJUGE',
            grauRelacionamento: 1,
            confianca: 100
          },
          {
            cpf: '32165498709',
            nome: 'PEDRO SILVA',
            tipoRelacao: 'SÓCIO',
            grauRelacionamento: 3,
            confianca: 85
          },
          {
            cpf: '65478932109',
            nome: 'CARLOS SANTOS',
            tipoRelacao: 'VIZINHO',
            grauRelacionamento: 4,
            confianca: 70
          }
        ],
        totalRelacionados: 6,
        criteriosBusca: [
          'Vínculos familiares',
          'Endereços compartilhados',
          'Empresas em comum',
          'Telefones relacionados',
          'Contas bancárias vinculadas'
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
      '/api/v1/relacionados',
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
    console.error('Error processing relacionados request:', error)

    const responseTime = Date.now() - startTime
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    await logApiUsage(
      validation.userId!,
      validation.apiKeyId!,
      '/api/v1/relacionados',
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
