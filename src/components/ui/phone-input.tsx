'use client'

import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { useState } from 'react'

interface PhoneInputFieldProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  required?: boolean
  id?: string
}

export function PhoneInputField({
  value,
  onChange,
  placeholder = 'Phone number',
  required = false,
  id = 'phone'
}: PhoneInputFieldProps) {
  const [phoneValue, setPhoneValue] = useState<string>(value || '')

  const handleChange = (value: string | undefined) => {
    const newValue = value || ''
    setPhoneValue(newValue)
    if (onChange) {
      onChange(newValue)
    }
  }

  return (
    <div className="phone-input-wrapper">
      <PhoneInput
        international
        defaultCountry="BR"
        value={phoneValue}
        onChange={handleChange}
        placeholder={placeholder}
        id={id}
        required={required}
        className="phone-input-custom"
      />
      <style jsx global>{`
        .phone-input-custom {
          width: 100%;
        }

        .phone-input-custom .PhoneInputInput {
          height: 48px;
          width: 100%;
          padding: 0 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 15px;
          outline: none;
          transition: all 0.2s;
        }

        .phone-input-custom .PhoneInputInput:focus {
          border-color: #0069FF;
          ring: 1px;
          ring-color: #0069FF;
        }

        .phone-input-custom .PhoneInputCountry {
          margin-right: 8px;
          padding: 0 8px;
        }

        .phone-input-custom .PhoneInputCountryIcon {
          width: 24px;
          height: 18px;
          border-radius: 2px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .phone-input-custom .PhoneInputCountrySelect {
          border: none;
          background: transparent;
          cursor: pointer;
          outline: none;
        }

        .phone-input-custom .PhoneInputCountrySelectArrow {
          opacity: 0.5;
          margin-left: 4px;
        }
      `}</style>
    </div>
  )
}
