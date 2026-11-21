import type { SelectHTMLAttributes } from 'react'
import { useBrands } from '../api/hooks'
import { Select } from './Form'

interface BrandSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  placeholder: string
}

export function BrandSelect({ placeholder, ...rest }: BrandSelectProps) {
  const { data: brands, isLoading } = useBrands()
  return (
    <Select {...rest} disabled={rest.disabled || isLoading}>
      <option value="">{isLoading ? 'Loading brands' : placeholder}</option>
      {brands?.map((brand) => (
        <option key={brand.code} value={brand.code}>
          {brand.name}
        </option>
      ))}
    </Select>
  )
}

export function useBrandName(code: string | undefined) {
  const { data: brands } = useBrands()
  return brands?.find((brand) => brand.code === code)?.name ?? code ?? ''
}
