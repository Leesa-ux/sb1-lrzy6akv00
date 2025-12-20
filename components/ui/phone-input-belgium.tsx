'use client';

import { useState, useRef, useEffect } from 'react';
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

  const extractDigits = (fullValue: string): string => {
    if (fullValue.startsWith('+32')) {
      return fullValue.substring(3);
    }
    return fullValue.replace(/\D/g, '');
  };

  const [localValue, setLocalValue] = useState(() => extractDigits(value));
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setLocalValue(extractDigits(value));
  }, [value]);

  const formatDisplay = (digits: string): string => {
    if (!digits) return '';

    const cleaned = digits.replace(/\D/g, '');

    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 5) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    } else if (cleaned.length <= 7) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5)}`;
    } else {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)}`;
    }
  };

  const validatePhone = (digits: string): string | null => {
    if (!digits) return null;

    if (digits.startsWith('0')) {
      return 'Ne pas inclure le 0 initial';
    }

    if (digits.length < 8) {
      return 'Le numéro doit contenir au moins 8 chiffres';
    }

    if (digits.length > 9) {
      return 'Le numéro ne peut pas dépasser 9 chiffres';
    }

    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    let digits = inputValue.replace(/\D/g, '');

    if (digits.startsWith('0')) {
      digits = digits.substring(1);
    }

    if (digits.length > 9) {
      digits = digits.substring(0, 9);
    }

    setLocalValue(digits);

    const fullNumber = digits ? `+32${digits}` : '';
    onChange(fullNumber);

    const error = validatePhone(digits);
    setValidationError(error);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight',
      'Tab', 'Home', 'End'
    ];

    if (allowedKeys.includes(e.key)) {
      return;
    }

    if (e.key === '0' && localValue === '') {
      e.preventDefault();
      return;
    }

    if (e.key === ' ') {
      e.preventDefault();
      return;
    }

    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');

    let digits = pastedText.replace(/\D/g, '');

    if (digits.startsWith('32')) {
      digits = digits.substring(2);
    }

    if (digits.startsWith('0')) {
      digits = digits.substring(1);
    }

    if (digits.length > 9) {
      digits = digits.substring(0, 9);
    }

    setLocalValue(digits);
    onChange(digits ? `+32${digits}` : '');

    const error = validatePhone(digits);
    setValidationError(error);
  };

  const displayValue = formatDisplay(localValue);
  const showError = error || validationError;

  return (
    <div className="space-y-1.5">
      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
        Ton numéro {required && <span className="text-red-500">*</span>}
      </Label>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
          <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
            +32
          </span>
        </div>

        <Input
          ref={inputRef}
          id="phone"
          name="phone"
          type="tel"
          required={required}
          value={displayValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="466 14 18 24"
          disabled={disabled}
          className={`pl-16 ${showError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          autoComplete="tel"
        />
      </div>

      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-gray-500">
          Indicatif Belgique +32 inclus automatiquement
        </p>

        {localValue && (
          <p className="text-xs font-mono text-gray-400 whitespace-nowrap">
            {`+32${localValue}`}
          </p>
        )}
      </div>

      {showError && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <span>⚠</span>
          <span>{showError}</span>
        </p>
      )}
    </div>
  );
}
