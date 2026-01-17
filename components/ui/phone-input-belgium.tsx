'use client';

import { useState, useRef } from 'react';
import { Input } from './input';
import { Label } from './label';

interface PhoneInputBelgiumProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

export function PhoneInputBelgium({
  value,
  onChange,
  disabled = false,
  required = false,
  error
}: PhoneInputBelgiumProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const formatPhoneNumber = (input: string): string => {
    const digitsOnly = input.replace(/\D/g, '');

    if (!digitsOnly) return '';

    if (!digitsOnly.startsWith('32')) {
      return input;
    }

    const withoutPrefix = digitsOnly.substring(2);

    if (withoutPrefix.length === 0) return '+32';
    if (withoutPrefix.length <= 3) return `+32 ${withoutPrefix}`;
    if (withoutPrefix.length <= 5) return `+32 ${withoutPrefix.slice(0, 3)} ${withoutPrefix.slice(3)}`;
    if (withoutPrefix.length <= 7) return `+32 ${withoutPrefix.slice(0, 3)} ${withoutPrefix.slice(3, 5)} ${withoutPrefix.slice(5)}`;

    return `+32 ${withoutPrefix.slice(0, 3)} ${withoutPrefix.slice(3, 5)} ${withoutPrefix.slice(5, 7)} ${withoutPrefix.slice(7, 9)}`;
  };

  const validatePhone = (phoneValue: string): string | null => {
    if (!phoneValue) return null;

    const digitsOnly = phoneValue.replace(/\D/g, '');

    if (!phoneValue.startsWith('+32')) {
      return 'Numéro invalide. Exemple : +32 471 12 34 56';
    }

    if (!digitsOnly.startsWith('32')) {
      return 'Numéro invalide. Exemple : +32 471 12 34 56';
    }

    const withoutPrefix = digitsOnly.substring(2);

    if (!withoutPrefix.startsWith('4')) {
      return 'Numéro invalide. Exemple : +32 471 12 34 56';
    }

    if (withoutPrefix.length !== 9) {
      return 'Numéro invalide. Exemple : +32 471 12 34 56';
    }

    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    if (!inputValue) {
      onChange('');
      setValidationError(null);
      return;
    }

    if (!inputValue.startsWith('+')) {
      inputValue = '+' + inputValue.replace(/^\+*/, '');
    }

    const digitsOnly = inputValue.replace(/\D/g, '');

    if (digitsOnly.length > 11) {
      return;
    }

    const formatted = formatPhoneNumber(inputValue);
    onChange(formatted);

    const error = validatePhone(formatted);
    setValidationError(error);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    let pastedText = e.clipboardData.getData('text');

    let digitsOnly = pastedText.replace(/\D/g, '');

    if (digitsOnly.startsWith('0') && digitsOnly.length === 10) {
      digitsOnly = '32' + digitsOnly.substring(1);
    } else if (!digitsOnly.startsWith('32') && digitsOnly.length === 9) {
      digitsOnly = '32' + digitsOnly;
    }

    if (digitsOnly.length > 11) {
      digitsOnly = digitsOnly.substring(0, 11);
    }

    const formatted = formatPhoneNumber('+' + digitsOnly);
    onChange(formatted);

    const error = validatePhone(formatted);
    setValidationError(error);
  };

  const showError = error || validationError;

  return (
    <div className="space-y-1.5">
      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
        Ton téléphone {required && <span className="text-red-500">*</span>}
      </Label>

      <Input
        ref={inputRef}
        id="phone"
        name="phone"
        type="tel"
        inputMode="tel"
        required={required}
        value={value}
        onChange={handleInputChange}
        onPaste={handlePaste}
        placeholder="+32 471 12 34 56"
        disabled={disabled}
        className={showError ? 'border-red-500 focus-visible:ring-red-500' : ''}
        autoComplete="tel"
      />

      <p className="text-xs text-gray-500">
        Format : +32 471 12 34 56
      </p>

      {showError && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <span>⚠</span>
          <span>{showError}</span>
        </p>
      )}
    </div>
  );
}
