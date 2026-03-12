import { Badge } from '@/components/ui/badge'

interface Parameter {
  name: string
  type: string
  required: boolean
  description: string
}

interface ApiEndpointDocsProps {
  method: string
  endpoint: string
  description: string
  parameters: Parameter[]
  exampleRequest: string
  exampleResponse: string
}

export function ApiEndpointDocs({
  method,
  endpoint,
  description,
  parameters,
  exampleRequest,
  exampleResponse,
}: ApiEndpointDocsProps) {
  return (
    <div className="space-y-6 mt-4">
      <div className="space-y-3">
        <div className="flex items-center gap-3 mb-3">
          <Badge
            variant={method === 'GET' ? 'default' : 'secondary'}
            className="text-xs font-semibold px-3 py-1"
          >
            {method}
          </Badge>
          <code className="text-sm font-mono bg-[#0069FF]/10 text-[#0069FF] px-3 py-1.5 rounded-md border border-[#0069FF]/20">
            {endpoint}
          </code>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-white text-base">Parameters</h4>
        <div className="space-y-3 bg-white/5 border border-white/10 rounded-lg p-4">
          {parameters.map((param, idx) => (
            <div key={idx} className="flex items-start gap-3 text-sm pb-3 border-b border-white/10 last:border-0 last:pb-0">
              <code className="bg-black/30 text-[#0069FF] px-2.5 py-1 rounded font-mono text-xs shrink-0">
                {param.name}
              </code>
              <span className="text-gray-400 shrink-0">({param.type})</span>
              {param.required && (
                <Badge variant="destructive" className="text-xs shrink-0">
                  Required
                </Badge>
              )}
              <span className="text-gray-300 flex-1">{param.description}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-white text-base">Example Request</h4>
        <pre className="bg-black/30 border border-white/10 p-4 rounded-lg overflow-x-auto">
          <code className="text-sm text-gray-300 font-mono">{exampleRequest}</code>
        </pre>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-white text-base">Example Response</h4>
        <pre className="bg-black/30 border border-white/10 p-4 rounded-lg overflow-x-auto">
          <code className="text-sm text-gray-300 font-mono whitespace-pre">{exampleResponse}</code>
        </pre>
      </div>
    </div>
  )
}
