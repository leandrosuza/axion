import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Code2, Book, Zap, Shield } from 'lucide-react'
import { ApiEndpointDocs } from '@/components/docs/api-endpoint-docs'

export default function DocsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-white">Documentação da API</h1>
        <p className="text-gray-400">
          Guia completo para integrar a API BigDataCorp em sua aplicação
        </p>
      </div>

      {/* Início Rápido Guide */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Início Rápido</CardTitle>
            <Zap className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-400">
              Comece em minutos com nossa autenticação simples
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">6 Endpoints</CardTitle>
            <Code2 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-400">
              Acesse fontes de dados brasileiros abrangentes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">API RESTful</CardTitle>
            <Book className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-400">
              Métodos HTTP padrão com respostas JSON
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Seguro</CardTitle>
            <Shield className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-400">
              Autenticação por chave API com limite de taxa
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Autenticação Section */}
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Autenticação</CardTitle>
          <CardDescription className="text-gray-400">Todas as requisições da API requerem autenticação usando uma chave API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 text-white">Inclua sua chave API no cabeçalho de Autorização:</h3>
            <pre className="bg-black/30 border border-white/10 p-4 rounded-lg overflow-x-auto">
              <code className="text-sm text-gray-300">
{`Authorization: Bearer YOUR_API_KEY`}
              </code>
            </pre>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-white">Exemplo de requisição:</h3>
            <pre className="bg-black/30 border border-white/10 p-4 rounded-lg overflow-x-auto">
              <code className="text-sm text-gray-300">
{`curl -X GET "https://api.bigdatacorp.com/v1/cpf?cpf=12345678901" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
              </code>
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints da API */}
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Endpoints da API</CardTitle>
          <CardDescription className="text-gray-400">Endpoints disponíveis e seu uso</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="cpf" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="cpf">CPF</TabsTrigger>
              <TabsTrigger value="cnpj">CNPJ</TabsTrigger>
              <TabsTrigger value="telefone">Telefone</TabsTrigger>
              <TabsTrigger value="veiculos">Veículos</TabsTrigger>
              <TabsTrigger value="relacionados">Relacionados</TabsTrigger>
              <TabsTrigger value="beneficios">Benefícios</TabsTrigger>
            </TabsList>

            <TabsContent value="cpf" className="space-y-4">
              <ApiEndpointDocs
                method="GET"
                endpoint="/api/v1/cpf"
                description="Retorna informações completas de uma pessoa física pelo CPF"
                parameters={[
                  { name: 'cpf', type: 'string', required: true, description: 'CPF com 11 dígitos (apenas números)' }
                ]}
                exampleRequest={`curl -X GET "https://api.bigdatacorp.com/v1/cpf?cpf=12345678901" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                exampleResponse={`{
  "status": "ok",
  "data": {
    "dadosBásicoos": {
      "cpf": "12345678901",
      "nome": "JOÃO SILVA",
      "dataNasc": "1990-01-01",
      "sexo": "M",
      "estCivil": "SOLTEIRO(A)"
    },
    "telefones": [...],
    "enderecos": [...],
    "veiculos": [...]
  },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}`}
              />
            </TabsContent>

            <TabsContent value="cnpj" className="space-y-4">
              <ApiEndpointDocs
                method="GET"
                endpoint="/api/v1/cnpj"
                description="Consulta dados de uma empresa através do CNPJ"
                parameters={[
                  { name: 'cnpj', type: 'string', required: true, description: 'CNPJ com 14 dígitos (apenas números)' }
                ]}
                exampleRequest={`curl -X GET "https://api.bigdatacorp.com/v1/cnpj?cnpj=12345678000190" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                exampleResponse={`{
  "status": "ok",
  "data": {
    "cnpj": "12345678000190",
    "razaoSocial": "EMPRESA EXEMPLO LTDA",
    "nomeFantasia": "EXEMPLO",
    "situacaoCadastral": "ATIVA",
    "socios": [...]
  }
}`}
              />
            </TabsContent>

            <TabsContent value="telefone" className="space-y-4">
              <ApiEndpointDocs
                method="GET"
                endpoint="/api/v1/telefone"
                description="Retorna informações sobre um número de telefone"
                parameters={[
                  { name: 'telefone', type: 'string', required: true, description: 'Número com DDD (10-11 dígitos)' }
                ]}
                exampleRequest={`curl -X GET "https://api.bigdatacorp.com/v1/telefone?telefone=11987654321" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                exampleResponse={`{
  "status": "ok",
  "data": {
    "telefone": "11987654321",
    "tipo": "MÓVEL",
    "operadora": "VIVO",
    "whatsapp": true,
    "titular": {...}
  }
}`}
              />
            </TabsContent>

            <TabsContent value="veiculos" className="space-y-4">
              <ApiEndpointDocs
                method="GET"
                endpoint="/api/v1/veiculos"
                description="Consulta veículos associados a um CPF ou CNPJ"
                parameters={[
                  { name: 'cpf', type: 'string', required: false, description: 'CPF do proprietário (11 dígitos)' },
                  { name: 'cnpj', type: 'string', required: false, description: 'CNPJ do proprietário (14 dígitos)' }
                ]}
                exampleRequest={`curl -X GET "https://api.bigdatacorp.com/v1/veiculos?cpf=12345678901" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                exampleResponse={`{
  "status": "ok",
  "data": {
    "proprietario": {...},
    "veiculos": [
      {
        "placa": "ABC1D23",
        "marca": "VOLKSWAGEN",
        "modelo": "GOL",
        "ano": "2020"
      }
    ]
  }
}`}
              />
            </TabsContent>

            <TabsContent value="relacionados" className="space-y-4">
              <ApiEndpointDocs
                method="GET"
                endpoint="/api/v1/relacionados"
                description="Busca CPFs relacionados baseando-se em vínculos"
                parameters={[
                  { name: 'cpf', type: 'string', required: true, description: 'CPF para buscar relacionados (11 dígitos)' }
                ]}
                exampleRequest={`curl -X GET "https://api.bigdatacorp.com/v1/relacionados?cpf=12345678901" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                exampleResponse={`{
  "status": "ok",
  "data": {
    "cpfConsultado": "12345678901",
    "relacionados": [
      {
        "cpf": "98765432109",
        "nome": "MARIA SILVA",
        "tipoRelacao": "MÃE",
        "confianca": 100
      }
    ]
  }
}`}
              />
            </TabsContent>

            <TabsContent value="beneficios" className="space-y-4">
              <ApiEndpointDocs
                method="GET"
                endpoint="/api/v1/beneficios"
                description="Consulta benefícios sociais vinculados a um CPF"
                parameters={[
                  { name: 'cpf', type: 'string', required: true, description: 'CPF do beneficiário (11 dígitos)' }
                ]}
                exampleRequest={`curl -X GET "https://api.bigdatacorp.com/v1/beneficios?cpf=12345678901" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                exampleResponse={`{
  "status": "ok",
  "data": {
    "cpf": "12345678901",
    "beneficios": {
      "bolsaFamilia": {
        "status": "ATIVO",
        "valorMensal": "600.00"
      }
    }
  }
}`}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Respostas de Erro */}
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Respostas de Erro</CardTitle>
          <CardDescription className="text-gray-400">Entendendo códigos de erro da API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <Badge variant="destructive">400</Badge>
              <div>
                <p className="font-semibold text-white">Requisição Inválida</p>
                <p className="text-sm text-gray-400">Parâmetros inválidos ou campos obrigatórios ausentes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="destructive">401</Badge>
              <div>
                <p className="font-semibold text-white">Não Autorizado</p>
                <p className="text-sm text-gray-400">Chave API inválida ou ausente</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="destructive">429</Badge>
              <div>
                <p className="font-semibold text-white">Muitas Requisições</p>
                <p className="text-sm text-gray-400">Limite de taxa excedido para seu plano</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="destructive">500</Badge>
              <div>
                <p className="font-semibold text-white">Erro Interno do Servidor</p>
                <p className="text-sm text-gray-400">Algo deu errado do nosso lado</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Limites de Taxa */}
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Limites de Taxa</CardTitle>
          <CardDescription className="text-gray-400">Limites de uso da API por plano</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 font-semibold text-sm text-white">
              <div>Plano</div>
              <div>Por Minuto</div>
              <div>Por Dia</div>
              <div>Por Mês</div>
            </div>
            {[
              { plan: 'Grátis', minute: '10', day: '100', month: '1,000' },
              { plan: 'Básico', minute: '60', day: '1,000', month: '30,000' },
              { plan: 'Pro', minute: '300', day: '10,000', month: '300,000' },
              { plan: 'Enterprise', minute: 'Ilimitado', day: 'Ilimitado', month: 'Ilimitado' },
            ].map((limit, idx) => (
              <div key={idx} className="grid grid-cols-4 gap-4 text-sm border-t border-white/10 pt-4">
                <div className="font-medium text-white">{limit.plan}</div>
                <div className="text-gray-400">{limit.minute}</div>
                <div className="text-gray-400">{limit.day}</div>
                <div className="text-gray-400">{limit.month}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
