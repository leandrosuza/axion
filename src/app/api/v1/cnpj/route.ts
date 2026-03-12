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
    '/api/v1/cnpj',
    validation.planType!
  )

  if (!creditCheck.allowed) {
    const responseTime = Date.now() - startTime
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    await logApiUsage(
      validation.userId!,
      validation.apiKeyId!,
      '/api/v1/cnpj',
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
      '/api/v1/cnpj',
      'GET',
      429,
      responseTime,
      ipAddress
    )
    return rateLimitCheck.response!
  }

  try {
    const { searchParams } = new URL(request.url)
    const cnpj = searchParams.get('cnpj')

    if (!cnpj) {
      return NextResponse.json(
        { error: 'CNPJ parameter is required' },
        { status: 400 }
      )
    }

    if (!/^\d{14}$/.test(cnpj)) {
      return NextResponse.json(
        { error: 'Invalid CNPJ format. Must be 14 digits' },
        { status: 400 }
      )
    }

    const data = {
      status: 'ok',
      data: {
        cnpj: cnpj,
        razaoSocial: 'EMPRESA EXEMPLO LTDA',
        nomeFantasia: 'EMPRESA EXEMPLO',
        dataAbertura: '2015-01-15',
        situacaoCadastral: 'ATIVA',
        dataSituacao: '2015-01-15',
        naturezaJuridica: '206-2 - SOCIEDADE EMPRESÁRIA LIMITADA',
        capitalSocial: '100000.00',
        porte: 'MÉDIO',
        atividadePrincipal: {
          codigo: '6201-5/00',
          descricao: 'DESENVOLVIMENTO DE PROGRAMAS DE COMPUTADOR SOB ENCOMENDA'
        },
        atividadesSecundarias: [
          {
            codigo: '6202-3/00',
            descricao: 'DESENVOLVIMENTO E LICENCIAMENTO DE PROGRAMAS DE COMPUTADOR'
          }
        ],
        endereco: {
          logradouro: 'RUA EXEMPLO',
          numero: '123',
          complemento: 'SALA 01',
          bairro: 'CENTRO',
          municipio: 'SAO PAULO',
          uf: 'SP',
          cep: '01000000'
        },
        telefone: {
          ddd: '11',
          numero: '30001000'
        },
        email: 'contato@exemplo.com.br',
        socios: [
          {
            nome: 'SOCIO EXEMPLO',
            cpfCnpj: '12345678901',
            qualificacao: 'SÓCIO-ADMINISTRADOR',
            dataEntrada: '2015-01-15'
          }
        ],
        quadroSocietario: [],
        inscricoesEstaduais: [],
        simples: {
          optante: true,
          dataOpcao: '2015-02-01',
          dataExclusao: null
        },
        mei: false
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
      '/api/v1/cnpj',
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
    console.error('Error processing CNPJ request:', error)

    const responseTime = Date.now() - startTime
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    await logApiUsage(
      validation.userId!,
      validation.apiKeyId!,
      '/api/v1/cnpj',
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
