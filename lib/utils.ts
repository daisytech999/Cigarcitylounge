import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(date))
}

export function generateMemberId(): string {
  const prefix = 'CCL'
  const year = new Date().getFullYear().toString().slice(-2)
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0')
  return `${prefix}${year}-${random}`
}

export function calculateAge(dateOfBirth: string): number {
  const today = new Date()
  const dob = new Date(dateOfBirth)
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--
  return age
}
