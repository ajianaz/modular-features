// Array utility functions

export class ArrayUtils {
  // Check if array is empty
  static isEmpty<T>(arr: T[] | null | undefined): boolean {
    return !arr || arr.length === 0
  }

  // Check if array is not empty
  static isNotEmpty<T>(arr: T[] | null | undefined): boolean {
    return !this.isEmpty(arr)
  }

  // Clone array
  static clone<T>(arr: T[]): T[] {
    return [...arr]
  }

  // Deep clone array
  static deepClone<T>(arr: T[]): T[] {
    return JSON.parse(JSON.stringify(arr))
  }

  // Remove duplicates
  static unique<T>(arr: T[]): T[] {
    return [...new Set(arr)]
  }

  // Remove duplicates by key
  static uniqueBy<T>(arr: T[], key: keyof T): T[] {
    const seen = new Set()
    return arr.filter(item => {
      const value = item[key]
      if (seen.has(value)) {
        return false
      }
      seen.add(value)
      return true
    })
  }

  // Get unique values
  static uniqueValues<T>(arr: T[]): T[] {
    return this.unique(arr)
  }

  // Flatten array
  static flatten<T>(arr: (T | T[])[]): T[] {
    return arr.reduce<T[]>((acc, val) => {
      return acc.concat(Array.isArray(val) ? this.flatten(val) : val)
    }, [])
  }

  // Flatten array to specific depth
  static flattenToDepth<T>(arr: (T | T[])[], depth: number): (T | T[])[] {
    return arr.reduce<(T | T[])[]>((acc, val) => {
      if (Array.isArray(val) && depth > 0) {
        return acc.concat(this.flattenToDepth(val, depth - 1))
      }
      return acc.concat(val)
    }, [])
  }

  // Chunk array into smaller arrays
  static chunk<T>(arr: T[], size: number): T[][] {
    if (size <= 0) {
      throw new Error('Chunk size must be greater than 0')
    }
    
    const chunks: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size))
    }
    return chunks
  }

  // Chunk array with predicate
  static chunkBy<T>(arr: T[], predicate: (item: T, index: number) => boolean): T[][] {
    const chunks: T[][] = []
    let currentChunk: T[] = []
    
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i]
      if (predicate(item, i)) {
        if (currentChunk.length > 0) {
          chunks.push(currentChunk)
          currentChunk = []
        }
      }
      currentChunk.push(item)
    }
    
    if (currentChunk.length > 0) {
      chunks.push(currentChunk)
    }
    
    return chunks
  }

  // Group array items by key
  static groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
    return arr.reduce((groups, item) => {
      const groupKey = String(item[key])
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(item)
      return groups
    }, {} as Record<string, T[]>)
  }

  // Group array by predicate
  static groupByPredicate<T>(arr: T[], predicate: (item: T) => string): Record<string, T[]> {
    return arr.reduce((groups, item) => {
      const groupKey = predicate(item)
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(item)
      return groups
    }, {} as Record<string, T[]>)
  }

  // Sum array items
  static sum(arr: number[]): number {
    return arr.reduce((sum, num) => sum + num, 0)
  }

  // Sum array items by key
  static sumBy<T>(arr: T[], key: keyof T): number {
    return arr.reduce((sum, item) => sum + (Number(item[key]) || 0), 0)
  }

  // Average of array items
  static average(arr: number[]): number {
    if (arr.length === 0) return 0
    return this.sum(arr) / arr.length
  }

  // Average of array items by key
  static averageBy<T>(arr: T[], key: keyof T): number {
    if (arr.length === 0) return 0
    return this.sumBy(arr, key) / arr.length
  }

  // Find max item
  static max(arr: number[]): number {
    return Math.max(...arr)
  }

  // Find max item by key
  static maxBy<T>(arr: T[], key: keyof T): T | null {
    if (arr.length === 0) return null
    return arr.reduce((max, item) => 
      (Number(item[key]) || 0) > (Number(max[key]) || 0) ? item : max
    )
  }

  // Find min item
  static min(arr: number[]): number {
    return Math.min(...arr)
  }

  // Find min item by key
  static minBy<T>(arr: T[], key: keyof T): T | null {
    if (arr.length === 0) return null
    return arr.reduce((min, item) => 
      (Number(item[key]) || 0) < (Number(min[key]) || Infinity) ? item : min
    )
  }

  // Sort array
  static sort<T>(arr: T[]): T[] {
    return this.clone(arr).sort()
  }

  // Sort array by key
  static sortBy<T>(arr: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
    return this.clone(arr).sort((a, b) => {
      const aVal = a[key]
      const bVal = b[key]
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1
      if (aVal > bVal) return direction === 'asc' ? 1 : -1
      return 0
    })
  }

  // Sort array by multiple keys
  static sortByMultiple<T>(arr: T[], keys: Array<{ key: keyof T; direction?: 'asc' | 'desc' }>): T[] {
    return this.clone(arr).sort((a, b) => {
      for (const { key, direction = 'asc' } of keys) {
        const aVal = a[key]
        const bVal = b[key]
        
        if (aVal < bVal) return direction === 'asc' ? -1 : 1
        if (aVal > bVal) return direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }

  // Sort array by custom comparator
  static sortByComparator<T>(arr: T[], comparator: (a: T, b: T) => number): T[] {
    return this.clone(arr).sort(comparator)
  }

  // Shuffle array
  static shuffle<T>(arr: T[]): T[] {
    const shuffled = this.clone(arr)
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Pick random items from array
  static sample<T>(arr: T[], count: number): T[] {
    const shuffled = this.shuffle(arr)
    return shuffled.slice(0, Math.min(count, arr.length))
  }

  // Pick random item from array
  static sampleOne<T>(arr: T[]): T | null {
    if (arr.length === 0) return null
    return arr[Math.floor(Math.random() * arr.length)]
  }

  // Get nth item from array (negative indexes count from end)
  static nth<T>(arr: T[], index: number): T | undefined {
    if (index < 0) {
      return arr[arr.length + index]
    }
    return arr[index]
  }

  // Get first item
  static first<T>(arr: T[]): T | undefined {
    return arr[0]
  }

  // Get last item
  static last<T>(arr: T[]): T | undefined {
    return arr[arr.length - 1]
  }

  // Get head of array (first n items)
  static head<T>(arr: T[], n: number = 1): T[] {
    return arr.slice(0, n)
  }

  // Get tail of array (last n items)
  static tail<T>(arr: T[], n?: number): T[] {
    if (n === undefined) return arr.slice(1)
    return arr.slice(-n)
  }

  // Get initial items (all except last)
  static initial<T>(arr: T[], n?: number): T[] {
    if (n === undefined) return arr.slice(0, -1)
    return arr.slice(0, Math.max(0, arr.length - n))
  }

  // Drop first n items
  static drop<T>(arr: T[], n: number = 1): T[] {
    return arr.slice(n)
  }

  // Drop last n items
  static dropRight<T>(arr: T[], n: number = 1): T[] {
    return arr.slice(0, -n)
  }

  // Filter array
  static filter<T>(arr: T[], predicate: (item: T, index: number) => boolean): T[] {
    return arr.filter(predicate)
  }

  // Filter array by key
  static filterBy<T>(arr: T[], key: keyof T, value: any): T[] {
    return arr.filter(item => item[key] === value)
  }

  // Filter array by multiple keys
  static filterByMultiple<T>(arr: T[], filters: Partial<T>): T[] {
    return arr.filter(item => {
      return Object.entries(filters).every(([key, val]) => item[key as keyof T] === val)
    })
  }

  // Reject items that match predicate
  static reject<T>(arr: T[], predicate: (item: T, index: number) => boolean): T[] {
    return arr.filter((item, index) => !predicate(item, index))
  }

  // Find item
  static find<T>(arr: T[], predicate: (item: T, index: number) => boolean): T | undefined {
    return arr.find(predicate)
  }

  // Find item by key
  static findBy<T>(arr: T[], key: keyof T, value: any): T | undefined {
    return arr.find(item => item[key] === value)
  }

  // Find last item
  static findLast<T>(arr: T[], predicate: (item: T, index: number) => boolean): T | undefined {
    return arr.findLast(predicate)
  }

  // Find all items
  static findAll<T>(arr: T[], predicate: (item: T, index: number) => boolean): T[] {
    return arr.filter(predicate)
  }

  // Check if array includes item
  static includes<T>(arr: T[], item: T): boolean {
    return arr.includes(item)
  }

  // Check if any items match predicate
  static some<T>(arr: T[], predicate: (item: T, index: number) => boolean): boolean {
    return arr.some(predicate)
  }

  // Check if all items match predicate
  static every<T>(arr: T[], predicate: (item: T, index: number) => boolean): boolean {
    return arr.every(predicate)
  }

  // Check if none of the items match predicate
  static none<T>(arr: T[], predicate: (item: T, index: number) => boolean): boolean {
    return !arr.some(predicate)
  }

  // Map array items
  static map<T, U>(arr: T[], mapper: (item: T, index: number) => U): U[] {
    return arr.map(mapper)
  }

  // Map array by key
  static mapBy<T, K extends keyof T>(arr: T[], key: K): T[K][] {
    return arr.map(item => item[key])
  }

  // Flat map array items
  static flatMap<T, U>(arr: T[], mapper: (item: T, index: number) => U | U[]): U[] {
    return arr.flatMap(mapper)
  }

  // Reduce array items
  static reduce<T, U>(arr: T[], reducer: (acc: U, item: T, index: number) => U, initialValue: U): U {
    return arr.reduce(reducer, initialValue)
  }

  // Join array items with separator
  static join<T>(arr: T[], separator: string = ','): string {
    return arr.join(separator)
  }

  // Join array items by key
  static joinBy<T>(arr: T[], key: keyof T, separator: string = ','): string {
    return arr.map(item => String(item[key])).join(separator)
  }

  // Intersection of arrays
  static intersection<T>(...arrays: T[][]): T[] {
    if (arrays.length === 0) return []
    
    return arrays.reduce((acc, current) => 
      acc.filter(item => current.includes(item))
    )
  }

  // Union of arrays
  static union<T>(...arrays: T[][]): T[] {
    return this.unique(arrays.flat())
  }

  // Difference of arrays (items in first array but not in others)
  static difference<T>(first: T[], ...others: T[][]): T[] {
    const otherItems = new Set(others.flat())
    return first.filter(item => !otherItems.has(item))
  }

  // Symmetric difference of arrays
  static symmetricDifference<T>(...arrays: T[][]): T[] {
    const unionSet = new Set(this.union(...arrays))
    const intersectionSet = new Set(this.intersection(...arrays))
    
    return Array.from(unionSet).filter(item => !intersectionSet.has(item))
  }

  // Partition array into two arrays based on predicate
  static partition<T>(arr: T[], predicate: (item: T, index: number) => boolean): [T[], T[]] {
    const truthy: T[] = []
    const falsy: T[] = []
    
    arr.forEach((item, index) => {
      if (predicate(item, index)) {
        truthy.push(item)
      } else {
        falsy.push(item)
      }
    })
    
    return [truthy, falsy]
  }

  // Create pairs from array
  static pairwise<T>(arr: T[]): Array<[T, T]> {
    const pairs: Array<[T, T]> = []
    for (let i = 0; i < arr.length - 1; i++) {
      pairs.push([arr[i], arr[i + 1]])
    }
    return pairs
  }

  // Create sliding windows
  static slidingWindow<T>(arr: T[], size: number): T[][] {
    if (size <= 0) return []
    if (size > arr.length) return [arr]
    
    const windows: T[][] = []
    for (let i = 0; i <= arr.length - size; i++) {
      windows.push(arr.slice(i, i + size))
    }
    return windows
  }

  // Rotate array
  static rotate<T>(arr: T[], positions: number): T[] {
    const length = arr.length
    if (length === 0) return arr
    
    const normalizedPositions = positions % length
    if (normalizedPositions === 0) return this.clone(arr)
    
    if (normalizedPositions > 0) {
      return [
        ...arr.slice(-normalizedPositions),
        ...arr.slice(0, length - normalizedPositions)
      ]
    } else {
      const positiveShifts = length + normalizedPositions
      return [
        ...arr.slice(positiveShifts),
        ...arr.slice(0, positiveShifts)
      ]
    }
  }

  // Move item from one index to another
  static move<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
    const result = this.clone(arr)
    const [removed] = result.splice(fromIndex, 1)
    result.splice(toIndex, 0, removed)
    return result
  }

  // Swap two items
  static swap<T>(arr: T[], index1: number, index2: number): T[] {
    const result = this.clone(arr)
    ;[result[index1], result[index2]] = [result[index2], result[index1]]
    return result
  }

  // Remove item at index
  static removeAt<T>(arr: T[], index: number): T[] {
    const result = this.clone(arr)
    result.splice(index, 1)
    return result
  }

  // Remove first occurrence of item
  static remove<T>(arr: T[], item: T): T[] {
    const index = arr.indexOf(item)
    if (index === -1) return this.clone(arr)
    return this.removeAt(arr, index)
  }

  // Remove all occurrences of item
  static removeAll<T>(arr: T[], item: T): T[] {
    return arr.filter(i => i !== item)
  }

  // Remove items by predicate
  static removeWhere<T>(arr: T[], predicate: (item: T, index: number) => boolean): T[] {
    return arr.filter((item, index) => !predicate(item, index))
  }

  // Insert item at index
  static insertAt<T>(arr: T[], index: number, item: T): T[] {
    const result = this.clone(arr)
    result.splice(index, 0, item)
    return result
  }

  // Insert multiple items at index
  static insertManyAt<T>(arr: T[], index: number, items: T[]): T[] {
    const result = this.clone(arr)
    result.splice(index, 0, ...items)
    return result
  }

  // Replace item at index
  static replaceAt<T>(arr: T[], index: number, item: T): T[] {
    const result = this.clone(arr)
    result[index] = item
    return result
  }

  // Replace first occurrence of item
  static replace<T>(arr: T[], oldItem: T, newItem: T): T[] {
    const index = arr.indexOf(oldItem)
    if (index === -1) return this.clone(arr)
    return this.replaceAt(arr, index, newItem)
  }

  // Replace all occurrences of item
  static replaceAll<T>(arr: T[], oldItem: T, newItem: T): T[] {
    return arr.map(item => item === oldItem ? newItem : item)
  }

  // Fill array with value
  static fill<T>(arr: T[], value: T, start?: number, end?: number): T[] {
    const result = this.clone(arr)
    return result.fill(value, start, end)
  }

  // Create range array
  static range(start: number, end?: number, step: number = 1): number[] {
    if (end === undefined) {
      end = start
      start = 0
    }
    
    const result: number[] = []
    if (step > 0) {
      for (let i = start; i < end; i += step) {
        result.push(i)
      }
    } else if (step < 0) {
      for (let i = start; i > end; i += step) {
        result.push(i)
      }
    }
    
    return result
  }

  // Create array with n copies of value
  static repeat<T>(value: T, count: number): T[] {
    return Array(count).fill(value)
  }

  // Zip arrays together
  static zip<T>(...arrays: T[][]): T[][] {
    const maxLength = Math.max(...arrays.map(arr => arr.length))
    const result: T[][] = []
    
    for (let i = 0; i < maxLength; i++) {
      result.push(arrays.map(arr => arr[i]))
    }
    
    return result
  }

  // Unzip array of tuples
  static unzip<T>(arr: T[][]): T[][] {
    const maxLength = Math.max(...arr.map(item => item.length))
    const result: T[][] = Array(maxLength).fill([])
    
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr[i].length; j++) {
        result[j].push(arr[i][j])
      }
    }
    
    return result
  }

  // Check if two arrays are equal
  static equals<T>(arr1: T[], arr2: T[]): boolean {
    if (arr1.length !== arr2.length) return false
    return arr1.every((item, index) => item === arr2[index])
  }

  // Check if two arrays are equal ignoring order
  static equalsIgnoreOrder<T>(arr1: T[], arr2: T[]): boolean {
    if (arr1.length !== arr2.length) return false
    return this.equals(arr1.sort(), arr2.sort())
  }

  // Create array from predicate
  static createArray<T>(length: number, factory: (index: number) => T): T[] {
    return Array.from({ length }, (_, index) => factory(index))
  }

  // Paginate array
  static paginate<T>(arr: T[], page: number, pageSize: number): {
    items: T[]
    totalPages: number
    totalItems: number
    currentPage: number
    hasNext: boolean
    hasPrev: boolean
  } {
    const totalItems = arr.length
    const totalPages = Math.ceil(totalItems / pageSize)
    const currentPage = Math.max(1, Math.min(page, totalPages))
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const items = arr.slice(startIndex, endIndex)
    
    return {
      items,
      totalPages,
      totalItems,
      currentPage,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1
    }
  }

  // Compact array (remove null and undefined)
  static compact<T>(arr: (T | null | undefined)[]): T[] {
    return arr.filter((item): item is T => item != null)
  }

  // Get item counts
  static countBy<T>(arr: T[], key: keyof T): Record<string, number> {
    return arr.reduce((counts, item) => {
      const keyValue = String(item[key])
      counts[keyValue] = (counts[keyValue] || 0) + 1
      return counts
    }, {} as Record<string, number>)
  }

  // Get frequency of each item
  static frequency<T>(arr: T[]): Record<string, number> {
    return arr.reduce((freq, item) => {
      const key = String(item)
      freq[key] = (freq[key] || 0) + 1
      return freq
    }, {} as Record<string, number>)
  }

  // Get most frequent items
  static mostFrequent<T>(arr: T[], count: number = 1): T[] {
    const freq = this.frequency(arr)
    const sorted = Object.entries(freq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, count)
      .map(([key]) => key) as T[]
    return sorted
  }

  // Get least frequent items
  static leastFrequent<T>(arr: T[], count: number = 1): T[] {
    const freq = this.frequency(arr)
    const sorted = Object.entries(freq)
      .sort(([, a], [, b]) => a - b)
      .slice(0, count)
      .map(([key]) => key) as T[]
    return sorted
  }
}

export default ArrayUtils
