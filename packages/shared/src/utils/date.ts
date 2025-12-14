// Date utility functions

export class DateUtils {
  // Add time to date
  static add(date: Date, duration: {
    years?: number
    months?: number
    weeks?: number
    days?: number
    hours?: number
    minutes?: number
    seconds?: number
    milliseconds?: number
  }): Date {
    const result = new Date(date)

    if (duration.years) {
      result.setFullYear(result.getFullYear() + duration.years)
    }

    if (duration.months) {
      result.setMonth(result.getMonth() + duration.months)
    }

    if (duration.weeks) {
      result.setDate(result.getDate() + (duration.weeks * 7))
    }

    if (duration.days) {
      result.setDate(result.getDate() + duration.days)
    }

    if (duration.hours) {
      result.setHours(result.getHours() + duration.hours)
    }

    if (duration.minutes) {
      result.setMinutes(result.getMinutes() + duration.minutes)
    }

    if (duration.seconds) {
      result.setSeconds(result.getSeconds() + duration.seconds)
    }

    if (duration.milliseconds) {
      result.setMilliseconds(result.getMilliseconds() + duration.milliseconds)
    }

    return result
  }

  // Subtract time from date
  static subtract(date: Date, duration: {
    years?: number
    months?: number
    weeks?: number
    days?: number
    hours?: number
    minutes?: number
    seconds?: number
    milliseconds?: number
  }): Date {
    const negated = Object.keys(duration).reduce((acc, key) => {
      acc[key as keyof typeof duration] = -(duration[key as keyof typeof duration] || 0)
      return acc
    }, {} as typeof duration)

    return this.add(date, negated)
  }

  // Calculate difference between dates
  static difference(date1: Date, date2: Date): {
    years: number
    months: number
    weeks: number
    days: number
    hours: number
    minutes: number
    seconds: number
    milliseconds: number
    total: {
      years: number
      months: number
      weeks: number
      days: number
      hours: number
      minutes: number
      seconds: number
      milliseconds: number
    }
  } {
    const diff = date1.getTime() - date2.getTime()
    const absDiff = Math.abs(diff)

    // Calculate total values
    const total = {
      milliseconds: absDiff,
      seconds: absDiff / 1000,
      minutes: absDiff / (1000 * 60),
      hours: absDiff / (1000 * 60 * 60),
      days: absDiff / (1000 * 60 * 60 * 24),
      weeks: absDiff / (1000 * 60 * 60 * 24 * 7),
      months: absDiff / (1000 * 60 * 60 * 24 * 30.44), // Average month length
      years: absDiff / (1000 * 60 * 60 * 24 * 365.25) // Include leap years
    }

    // Calculate individual components
    const sign = diff < 0 ? -1 : 1

    const years = Math.floor(total.years)
    const months = Math.floor((total.years - years) * 12)
    const days = Math.floor((total.days - (years * 365.25 + months * 30.44)))
    const hours = Math.floor((total.hours - Math.floor(total.hours)) * 24)
    const minutes = Math.floor((total.minutes - Math.floor(total.minutes)) * 60)
    const seconds = Math.floor((total.seconds - Math.floor(total.seconds)) * 60)
    const milliseconds = Math.floor((total.milliseconds - Math.floor(total.milliseconds)) * 1000)

    return {
      years: years * sign,
      months: months * sign,
      weeks: Math.floor(total.weeks) * sign,
      days: days * sign,
      hours: hours * sign,
      minutes: minutes * sign,
      seconds: seconds * sign,
      milliseconds: milliseconds * sign,
      total
    }
  }

  // Get start of period
  static startOf(date: Date, period: 'year' | 'quarter' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second'): Date {
    const result = new Date(date)

    switch (period) {
      case 'year':
        result.setMonth(0, 1)
        result.setHours(0, 0, 0, 0)
        break

      case 'quarter':
        const quarter = Math.floor(result.getMonth() / 3)
        result.setMonth(quarter * 3, 1)
        result.setHours(0, 0, 0, 0)
        break

      case 'month':
        result.setDate(1)
        result.setHours(0, 0, 0, 0)
        break

      case 'week':
        const dayOfWeek = result.getDay()
        result.setDate(result.getDate() - dayOfWeek)
        result.setHours(0, 0, 0, 0)
        break

      case 'day':
        result.setHours(0, 0, 0, 0)
        break

      case 'hour':
        result.setMinutes(0, 0, 0)
        break

      case 'minute':
        result.setSeconds(0, 0)
        break

      case 'second':
        result.setMilliseconds(0)
        break
    }

    return result
  }

  // Get end of period
  static endOf(date: Date, period: 'year' | 'quarter' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second'): Date {
    const result = new Date(date)

    switch (period) {
      case 'year':
        result.setMonth(11, 31)
        result.setHours(23, 59, 59, 999)
        break

      case 'quarter':
        const quarter = Math.floor(result.getMonth() / 3)
        result.setMonth(quarter * 3 + 2, 1)
        result.setMonth(result.getMonth() + 1) // First day of next quarter
        result.setDate(0) // Last day of current quarter
        result.setHours(23, 59, 59, 999)
        break

      case 'month':
        result.setMonth(result.getMonth() + 1, 1)
        result.setDate(0) // Last day of current month
        result.setHours(23, 59, 59, 999)
        break

      case 'week':
        const dayOfWeek = result.getDay()
        result.setDate(result.getDate() - dayOfWeek + 6)
        result.setHours(23, 59, 59, 999)
        break

      case 'day':
        result.setHours(23, 59, 59, 999)
        break

      case 'hour':
        result.setMinutes(59, 59, 999)
        break

      case 'minute':
        result.setSeconds(59, 999)
        break

      case 'second':
        result.setMilliseconds(999)
        break
    }

    return result
  }

  // Check if date is same as another
  static isSame(date1: Date, date2: Date, granularity: 'year' | 'quarter' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second' = 'day'): boolean {
    const start1 = this.startOf(date1, granularity)
    const start2 = this.startOf(date2, granularity)
    return start1.getTime() === start2.getTime()
  }

  // Check if date is after another
  static isAfter(date1: Date, date2: Date, granularity: 'year' | 'quarter' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond'): boolean {
    if (granularity === 'millisecond') {
      return date1.getTime() > date2.getTime()
    }

    const start1 = this.startOf(date1, granularity)
    const start2 = this.startOf(date2, granularity)
    return start1.getTime() > start2.getTime()
  }

  // Check if date is before another
  static isBefore(date1: Date, date2: Date, granularity: 'year' | 'quarter' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond'): boolean {
    if (granularity === 'millisecond') {
      return date1.getTime() < date2.getTime()
    }

    const start1 = this.startOf(date1, granularity)
    const start2 = this.startOf(date2, granularity)
    return start1.getTime() < start2.getTime()
  }

  // Check if date is between two dates
  static isBetween(date: Date, startDate: Date, endDate: Date, inclusive: boolean = true): boolean {
    if (inclusive) {
      return this.isAfter(date, startDate, 'minute') && this.isBefore(date, endDate, 'minute') ||
             this.isSame(date, startDate) || this.isSame(date, endDate)
    } else {
      return this.isAfter(date, startDate, 'minute') && this.isBefore(date, endDate, 'minute')
    }
  }

  // Check if date is weekend
  static isWeekend(date: Date): boolean {
    const dayOfWeek = date.getDay()
    return dayOfWeek === 0 || dayOfWeek === 6 // Sunday or Saturday
  }

  // Check if date is weekday
  static isWeekday(date: Date): boolean {
    return !this.isWeekend(date)
  }

  // Check if date is today
  static isToday(date: Date): boolean {
    return this.isSame(date, new Date(), 'day')
  }

  // Check if date is yesterday
  static isYesterday(date: Date): boolean {
    const yesterday = this.subtract(new Date(), { days: 1 })
    return this.isSame(date, yesterday, 'day')
  }

  // Check if date is tomorrow
  static isTomorrow(date: Date): boolean {
    const tomorrow = this.add(new Date(), { days: 1 })
    return this.isSame(date, tomorrow, 'day')
  }

  // Check if date is this year
  static isThisYear(date: Date): boolean {
    return this.isSame(date, new Date(), 'year')
  }

  // Check if date is this month
  static isThisMonth(date: Date): boolean {
    return this.isSame(date, new Date(), 'month')
  }

  // Get day of year
  static getDayOfYear(date: Date): number {
    const startOfYear = this.startOf(date, 'year')
    const diff = date.getTime() - startOfYear.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1
  }

  // Get week of year
  static getWeekOfYear(date: Date): number {
    const startOfYear = this.startOf(date, 'year')
    const dayOfYear = this.getDayOfYear(date)
    return Math.ceil(dayOfYear / 7)
  }

  // Get quarter of year
  static getQuarter(date: Date): number {
    return Math.floor(date.getMonth() / 3) + 1
  }

  // Get days in month
  static getDaysInMonth(date: Date): number {
    const year = date.getFullYear()
    const month = date.getMonth() + 1

    // Handle February with leap year
    if (month === 2) {
      return this.isLeapYear(year) ? 29 : 28
    }

    // April, June, September, November have 30 days
    if ([4, 6, 9, 11].includes(month)) {
      return 30
    }

    return 31
  }

  // Check if year is leap year
  static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
  }

  // Format date
  static format(date: Date, format: string): string {
    const options: Record<string, string | number> = {
      YYYY: date.getFullYear(),
      YY: date.getFullYear().toString().slice(-2),
      MM: (date.getMonth() + 1).toString().padStart(2, '0'),
      M: date.getMonth() + 1,
      DD: date.getDate().toString().padStart(2, '0'),
      D: date.getDate(),
      HH: date.getHours().toString().padStart(2, '0'),
      H: date.getHours(),
      mm: date.getMinutes().toString().padStart(2, '0'),
      m: date.getMinutes(),
      ss: date.getSeconds().toString().padStart(2, '0'),
      s: date.getSeconds(),
      SSS: date.getMilliseconds().toString().padStart(3, '0'),
      SS: date.getMilliseconds().toString().padStart(3, '0').slice(0, 2),
      S: date.getMilliseconds(),
    }

    let result = format
    for (const [key, value] of Object.entries(options)) {
      result = result.replace(new RegExp(key, 'g'), value.toString())
    }

    return result
  }

  // Parse date from string
  static parse(dateString: string, format?: string): Date {
    if (!format) {
      // Try parsing with native Date constructor
      const parsed = new Date(dateString)
      if (!isNaN(parsed.getTime())) {
        return parsed
      }

      // Try parsing common formats
      const isoFormat = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/
      if (isoFormat.test(dateString)) {
        return new Date(dateString)
      }

      // Try US format (MM/DD/YYYY)
      const usFormat = /^(\d{2})\/(\d{2})\/(\d{4})$/
      const usMatch = dateString.match(usFormat)
      if (usMatch) {
        return new Date(parseInt(usMatch[3]), parseInt(usMatch[1]) - 1, parseInt(usMatch[2]))
      }

      // Try European format (DD/MM/YYYY)
      const euFormat = /^(\d{2})\/(\d{2})\/(\d{4})$/
      const euMatch = dateString.match(euFormat)
      if (euMatch) {
        return new Date(parseInt(euMatch[3]), parseInt(euMatch[2]) - 1, parseInt(euMatch[1]))
      }

      throw new Error(`Unable to parse date: ${dateString}`)
    }

    // Custom format parsing (simplified)
    const result = new Date()
    const formatParts = format.split(/[^A-Za-z0-9]+/)
    const valueParts = dateString.split(/[^A-Za-z0-9]+/)

    for (let i = 0; i < formatParts.length && i < valueParts.length; i++) {
      const part = formatParts[i]
      const value = valueParts[i]

      switch (part) {
        case 'YYYY':
          result.setFullYear(parseInt(value))
          break
        case 'MM':
        case 'M':
          result.setMonth(parseInt(value) - 1)
          break
        case 'DD':
        case 'D':
          result.setDate(parseInt(value))
          break
        case 'HH':
        case 'H':
          result.setHours(parseInt(value))
          break
        case 'mm':
        case 'm':
          result.setMinutes(parseInt(value))
          break
        case 'ss':
        case 's':
          result.setSeconds(parseInt(value))
          break
        case 'SSS':
        case 'SS':
        case 'S':
          result.setMilliseconds(parseInt(value))
          break
      }
    }

    return result
  }

  // Get relative time
  static getRelativeTime(date: Date, baseDate: Date = new Date()): string {
    const diff = this.difference(date, baseDate)
    const absDiff = Math.abs(diff.total.seconds)

    if (absDiff < 60) {
      const seconds = Math.round(absDiff)
      return diff.total.seconds < 0 ? `${seconds} seconds ago` : `in ${seconds} seconds`
    }

    if (absDiff < 3600) {
      const minutes = Math.round(diff.total.minutes)
      return diff.total.minutes < 0 ? `${minutes} minutes ago` : `in ${minutes} minutes`
    }

    if (absDiff < 86400) {
      const hours = Math.round(diff.total.hours)
      return diff.total.hours < 0 ? `${hours} hours ago` : `in ${hours} hours`
    }

    if (absDiff < 604800) {
      const days = Math.round(diff.total.days)
      return diff.total.days < 0 ? `${days} days ago` : `in ${days} days`
    }

    if (absDiff < 2629746) {
      const weeks = Math.round(diff.total.weeks)
      return diff.total.weeks < 0 ? `${weeks} weeks ago` : `in ${weeks} weeks`
    }

    if (absDiff < 31556952) {
      const months = Math.round(diff.total.months)
      return diff.total.months < 0 ? `${months} months ago` : `in ${months} months`
    }

    const years = Math.round(diff.total.years)
    return diff.total.years < 0 ? `${years} years ago` : `in ${years} years`
  }

  // Get time ago
  static timeAgo(date: Date): string {
    const relative = this.getRelativeTime(date)
    return relative.replace('in ', '').replace(' seconds ago', 's').replace(' minutes ago', 'm').replace(' hours ago', 'h').replace(' days ago', 'd').replace(' weeks ago', 'w').replace(' months ago', 'mo').replace(' years ago', 'y')
  }

  // Get ISO string without timezone
  static toISODate(date: Date): string {
    return this.format(date, 'YYYY-MM-DD')
  }

  // Get ISO datetime string without timezone
  static toISODateTime(date: Date): string {
    return this.format(date, 'YYYY-MM-DD HH:mm:ss')
  }

  // Get time-only string
  static toTime(date: Date, includeSeconds: boolean = true): string {
    const format = includeSeconds ? 'HH:mm:ss' : 'HH:mm'
    return this.format(date, format)
  }

  // Get date-only string
  static toDate(date: Date): string {
    return this.format(date, 'YYYY-MM-DD')
  }

  // Get timezone offset
  static getTimezoneOffset(date: Date = new Date()): string {
    const offset = date.getTimezoneOffset()
    const sign = offset <= 0 ? '+' : '-'
    const hours = Math.floor(Math.abs(offset) / 60)
    const minutes = Math.abs(offset) % 60
    return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  // Convert to timezone
  static toTimezone(date: Date, timezone: string): Date {
    // This is a simplified implementation
    // In a real application, you would use a library like moment-timezone or date-fns-tz
    return new Date(date.toLocaleString('en-US', { timeZone: timezone }))
  }

  // Get timezone
  static getTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  }

  // Get age from birthdate
  static getAge(birthDate: Date, currentDate: Date = new Date()): number {
    const diff = this.difference(currentDate, birthDate)
    return Math.floor(diff.total.years)
  }

  // Add business days
  static addBusinessDays(date: Date, days: number): Date {
    let result = new Date(date)
    let remainingDays = Math.abs(days)
    const step = days >= 0 ? 1 : -1

    while (remainingDays > 0) {
      result.setDate(result.getDate() + step)

      if (this.isWeekday(result)) {
        remainingDays--
      }
    }

    return result
  }

  // Get business days between dates
  static getBusinessDays(startDate: Date, endDate: Date): number {
    let businessDays = 0
    let current = new Date(startDate)

    while (current <= endDate) {
      if (this.isWeekday(current)) {
        businessDays++
      }
      current.setDate(current.getDate() + 1)
    }

    return businessDays
  }

  // Get holidays for year (simplified)
  static getHolidays(year: number, country: string = 'US'): Date[] {
    const holidays: Date[] = []

    switch (country) {
      case 'US':
        // New Year's Day
        holidays.push(new Date(year, 0, 1))

        // Martin Luther King Jr. Day (3rd Monday of January)
        const mlkDay = new Date(year, 0, 1)
        while (mlkDay.getDay() !== 1) mlkDay.setDate(mlkDay.getDate() + 1)
        mlkDay.setDate(mlkDay.getDate() + 14)
        holidays.push(mlkDay)

        // Presidents' Day (3rd Monday of February)
        const presidentsDay = new Date(year, 1, 1)
        while (presidentsDay.getDay() !== 1) presidentsDay.setDate(presidentsDay.getDate() + 1)
        presidentsDay.setDate(presidentsDay.getDate() + 14)
        holidays.push(presidentsDay)

        // Memorial Day (last Monday of May)
        const memorialDay = new Date(year, 4, 31)
        while (memorialDay.getDay() !== 1) memorialDay.setDate(memorialDay.getDate() - 1)
        holidays.push(memorialDay)

        // Independence Day
        holidays.push(new Date(year, 6, 4))

        // Labor Day (1st Monday of September)
        const laborDay = new Date(year, 8, 1)
        while (laborDay.getDay() !== 1) laborDay.setDate(laborDay.getDate() + 1)
        holidays.push(laborDay)

        // Columbus Day (2nd Monday of October)
        const columbusDay = new Date(year, 9, 1)
        while (columbusDay.getDay() !== 1) columbusDay.setDate(columbusDay.getDate() + 1)
        columbusDay.setDate(columbusDay.getDate() + 7)
        holidays.push(columbusDay)

        // Veterans Day
        holidays.push(new Date(year, 10, 11))

        // Thanksgiving Day (4th Thursday of November)
        const thanksgivingDay = new Date(year, 10, 1)
        while (thanksgivingDay.getDay() !== 4) thanksgivingDay.setDate(thanksgivingDay.getDate() + 1)
        thanksgivingDay.setDate(thanksgivingDay.getDate() + 21)
        holidays.push(thanksgivingDay)

        // Christmas Day
        holidays.push(new Date(year, 11, 25))
        break

      // Add other countries' holidays as needed
    }

    return holidays
  }

  // Check if date is holiday
  static isHoliday(date: Date, country: string = 'US'): boolean {
    const holidays = this.getHolidays(date.getFullYear(), country)
    return holidays.some(holiday => this.isSame(date, holiday, 'day'))
  }

  // Get workday between two dates
  static getWorkday(startDate: Date, days: number, country: string = 'US'): Date {
    let result = new Date(startDate)
    let remainingDays = Math.abs(days)
    const step = days >= 0 ? 1 : -1

    while (remainingDays > 0) {
      result.setDate(result.getDate() + step)

      if (this.isWeekday(result) && !this.isHoliday(result, country)) {
        remainingDays--
      }
    }

    return result
  }

  // Get number of workdays between dates
  static getWorkdays(startDate: Date, endDate: Date, country: string = 'US'): number {
    let workdays = 0
    let current = new Date(startDate)

    while (current <= endDate) {
      if (this.isWeekday(current) && !this.isHoliday(current, country)) {
        workdays++
      }
      current.setDate(current.getDate() + 1)
    }

    return workdays
  }

  // Get date range for period
  static getDateRange(period: 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear'): { start: Date; end: Date } {
    const now = new Date()
    let start: Date
    let end: Date

    switch (period) {
      case 'today':
        start = this.startOf(now, 'day')
        end = this.endOf(now, 'day')
        break

      case 'yesterday':
        const yesterday = this.subtract(now, { days: 1 })
        start = this.startOf(yesterday, 'day')
        end = this.endOf(yesterday, 'day')
        break

      case 'thisWeek':
        start = this.startOf(now, 'week')
        end = this.endOf(now, 'week')
        break

      case 'lastWeek':
        const lastWeekStart = this.subtract(this.startOf(now, 'week'), { weeks: 1 })
        start = lastWeekStart
        end = this.endOf(lastWeekStart, 'week')
        break

      case 'thisMonth':
        start = this.startOf(now, 'month')
        end = this.endOf(now, 'month')
        break

      case 'lastMonth':
        const lastMonthStart = this.subtract(this.startOf(now, 'month'), { months: 1 })
        start = lastMonthStart
        end = this.endOf(lastMonthStart, 'month')
        break

      case 'thisYear':
        start = this.startOf(now, 'year')
        end = this.endOf(now, 'year')
        break

      case 'lastYear':
        const lastYearStart = this.subtract(this.startOf(now, 'year'), { years: 1 })
        start = lastYearStart
        end = this.endOf(lastYearStart, 'year')
        break

      default:
        throw new Error(`Invalid period: ${period}`)
    }

    return { start, end }
  }

  // Get calendar days for month
  static getCalendarDays(date: Date): Array<{
    date: Date
    isCurrentMonth: boolean
    isToday: boolean
    isWeekend: boolean
    isHoliday: boolean
  }> {
    const start = this.startOf(date, 'month')
    const end = this.endOf(date, 'month')
    const startOfWeek = this.startOf(start, 'week')
    const endOfWeek = this.endOf(end, 'week')

    const days = []
    let current = new Date(startOfWeek)

    while (current <= endOfWeek) {
      days.push({
        date: new Date(current),
        isCurrentMonth: this.isSame(current, start, 'month'),
        isToday: this.isToday(current),
        isWeekend: this.isWeekend(current),
        isHoliday: this.isHoliday(current)
      })
      current.setDate(current.getDate() + 1)
    }

    return days
  }

  // Clone date
  static clone(date: Date): Date {
    return new Date(date.getTime())
  }

  // Check if date is valid
  static isValid(date: Date): boolean {
    return !isNaN(date.getTime())
  }

  // Min date
  static min(...dates: Date[]): Date {
    return new Date(Math.min(...dates.map(d => d.getTime())))
  }

  // Max date
  static max(...dates: Date[]): Date {
    return new Date(Math.max(...dates.map(d => d.getTime())))
  }
}

export default DateUtils
