import { Check, X } from 'lucide-react'

interface PasswordStrengthProps {
  password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const checks = [
    { label: 'At least 8 characters', test: password.length >= 8 },
    { label: 'Contains uppercase letter', test: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', test: /[a-z]/.test(password) },
    { label: 'Contains number', test: /\d/.test(password) },
    { label: 'Contains special character', test: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ]

  const passedChecks = checks.filter(check => check.test).length
  const strength = passedChecks === 0 ? 0 : passedChecks <= 2 ? 1 : passedChecks <= 3 ? 2 : passedChecks <= 4 ? 3 : 4

  const getStrengthColor = () => {
    if (strength === 0) return 'bg-gray-200'
    if (strength === 1) return 'bg-red-500'
    if (strength === 2) return 'bg-orange-500'
    if (strength === 3) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStrengthText = () => {
    if (strength === 0) return ''
    if (strength === 1) return 'Weak'
    if (strength === 2) return 'Fair'
    if (strength === 3) return 'Good'
    return 'Strong'
  }

  if (!password) return null

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-colors ${
              level <= strength ? getStrengthColor() : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      {password && (
        <>
          <p className="text-xs font-medium">
            Password strength: <span className={strength >= 3 ? 'text-green-600' : 'text-orange-600'}>{getStrengthText()}</span>
          </p>
          <ul className="space-y-1">
            {checks.map((check, index) => (
              <li key={index} className="flex items-center gap-2 text-xs">
                {check.test ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <X className="h-3 w-3 text-gray-400" />
                )}
                <span className={check.test ? 'text-green-600' : 'text-muted-foreground'}>
                  {check.label}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
