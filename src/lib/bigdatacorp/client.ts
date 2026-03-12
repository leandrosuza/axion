/**
 * BigDataCorp External API Client
 * This service calls the REAL BigDataCorp API using the main API key
 * stored in environment variables.
 */

interface BigDataCorpConfig {
  apiKey: string
  baseUrl: string
}

class BigDataCorpClient {
  private config: BigDataCorpConfig

  constructor() {
    const apiKey = process.env.BIGDATACORP_API_KEY
    const baseUrl = process.env.BIGDATACORP_API_URL || 'https://api.bigdatacorp.com.br'

    if (!apiKey) {
      throw new Error('BIGDATACORP_API_KEY environment variable is not set')
    }

    this.config = {
      apiKey,
      baseUrl,
    }
  }

  /**
   * Generic method to make requests to BigDataCorp API
   */
  private async request<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const queryParams = new URLSearchParams(params)
    const url = `${this.config.baseUrl}${endpoint}?${queryParams.toString()}`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(`BigDataCorp API error: ${error.error || response.statusText}`)
      }

      return await response.json()
    } catch (error: any) {
      console.error('BigDataCorp API request failed:', error)
      throw error
    }
  }

  /**
   * Query CPF data from BigDataCorp
   */
  async queryCPF(cpf: string) {
    return this.request('/v1/cpf', { cpf })
  }

  /**
   * Query CNPJ data from BigDataCorp
   */
  async queryCNPJ(cnpj: string) {
    return this.request('/v1/cnpj', { cnpj })
  }

  /**
   * Query phone number data from BigDataCorp
   */
  async queryTelefone(telefone: string) {
    return this.request('/v1/telefone', { telefone })
  }

  /**
   * Query vehicle data from BigDataCorp
   */
  async queryVeiculos(params: { cpf?: string; cnpj?: string }) {
    return this.request('/v1/veiculos', params as Record<string, string>)
  }

  /**
   * Query related persons data from BigDataCorp
   */
  async queryRelacionados(cpf: string) {
    return this.request('/v1/relacionados', { cpf })
  }

  /**
   * Query benefits data from BigDataCorp
   */
  async queryBeneficios(cpf: string) {
    return this.request('/v1/beneficios', { cpf })
  }
}

// Export singleton instance
export const bigDataCorpClient = new BigDataCorpClient()
