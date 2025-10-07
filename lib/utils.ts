import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  // Combines time and random to avoid collisions during rapid updates
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
