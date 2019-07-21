
import { is_prime, generate_primes } from '@src/dexm/core/primes'

const MAX_SAMPLES = 1000
const b = 52
const r = 3

const results = []
const safe_primes = []

for(let a = 0; a < MAX_SAMPLES; a++) {
  // const p = (a * Math.pow(b, r)) / 2 - 1
  const p = a * b - 1

  console.log('checking p for a=%s', a)

  if(is_prime(p)) {
    results.push(`${a}: ${p}`)
    safe_primes.push(a)
  }
}

console.log(results.join(', '))

console.log('')
console.log('cut and paste this:')
console.log( '[' + safe_primes.join(', ') + ']')
