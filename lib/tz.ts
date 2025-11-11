import { formatInTimeZone, fromZonedTime } from 'date-fns-tz'

/**
 * Vérifie si le tirage est ouvert pour un groupe donné
 * 
 * openAt est stocké en UTC dans la DB mais représente une heure locale dans le timeZone
 * On compare directement en UTC car openAt est déjà converti en UTC lors de la sauvegarde
 */
export function isDrawOpen(openAt: Date, timeZone: string): boolean {
  const now = new Date() // UTC
  // openAt est déjà en UTC dans la DB, on compare directement
  return now >= openAt
}

/**
 * Obtient la date actuelle dans un fuseau horaire donné (en UTC)
 */
export function getCurrentTimeInTz(timeZone: string): Date {
  return new Date()
}

/**
 * Convertit une date/heure locale (string ISO sans timezone) en UTC
 * en supposant que cette heure est dans le timeZone spécifié
 * 
 * @param dateTimeString - String au format "YYYY-MM-DDTHH:mm" ou "YYYY-MM-DDTHH:mm:ss" (sans timezone)
 * @param timeZone - Fuseau horaire IANA (ex: "Indian/Reunion")
 * @returns Date en UTC
 */
export function localDateTimeStringToUTC(dateTimeString: string, timeZone: string): Date {
  // Parser la string pour extraire les composants
  const [datePart, timePart] = dateTimeString.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const timeComponents = (timePart || '00:00').split(':')
  const [hour, minute] = timeComponents.map(Number)
  const second = timeComponents[2] ? Number(timeComponents[2]) : 0
  
  // Créer une date locale avec ces composants
  // Cette date est créée dans le fuseau horaire local du serveur
  const localDate = new Date(year, month - 1, day, hour, minute, second)
  
  // Calculer l'offset du fuseau horaire local du serveur
  const serverOffset = localDate.getTimezoneOffset() * 60000 // en millisecondes
  
  // Créer une date UTC "naive" (sans timezone) en ajustant pour l'offset du serveur
  const naiveUTC = new Date(localDate.getTime() + serverOffset)
  
  // Maintenant, calculer l'offset du timeZone cible à cette date
  // Pour cela, on formate la date UTC dans le timeZone et on compare
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  
  const partsInTz = formatter.formatToParts(naiveUTC)
  const tzHour = parseInt(partsInTz.find(p => p.type === 'hour')?.value || '0')
  const tzMinute = parseInt(partsInTz.find(p => p.type === 'minute')?.value || '0')
  
  // Calculer la différence entre l'heure souhaitée et l'heure dans le timeZone
  const diffMinutes = (hour - tzHour) * 60 + (minute - tzMinute)
  
  // Ajuster la date UTC pour obtenir l'heure correcte dans le timeZone
  const adjustedUTC = new Date(naiveUTC.getTime() - diffMinutes * 60 * 1000)
  
  return adjustedUTC
}

/**
 * Formate une date dans un fuseau horaire donné
 */
export function formatDateInTz(date: Date, timeZone: string, format: string): string {
  return formatInTimeZone(date, timeZone, format)
}

