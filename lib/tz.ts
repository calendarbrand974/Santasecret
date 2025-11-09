import { formatInTimeZone, fromZonedTime } from 'date-fns-tz'

/**
 * Vérifie si le tirage est ouvert pour un groupe donné
 */
export function isDrawOpen(openAt: Date, timeZone: string): boolean {
  const now = new Date()
  const openAtInTz = fromZonedTime(openAt, timeZone)
  return now >= openAtInTz
}

/**
 * Obtient la date actuelle dans un fuseau horaire donné
 */
export function getCurrentTimeInTz(timeZone: string): Date {
  return new Date()
}

/**
 * Formate une date dans un fuseau horaire donné
 */
export function formatDateInTz(date: Date, timeZone: string, format: string): string {
  return formatInTimeZone(date, timeZone, format)
}

