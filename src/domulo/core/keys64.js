
const uppercased = Array(26).fill().map((_, idx) => 
  String.fromCharCode(idx + 'A'.charCodeAt(0))
)

const lowercased = Array(26).fill().map((_, idx) => 
  String.fromCharCode(idx + 'a'.charCodeAt(0))
)

const digits = Array(10).fill().map((_, idx) => idx)

const alt = ['$', '_']

const digits64 = []
  .concat(uppercased)
  .concat(lowercased)
  .concat(alt)
  .concat(digits)
  
export const from_string = (str) => {
  return str.split('').map(c => digits64.indexOf(c))
}

export const to_string = (arr) => {
  return arr.map(n => digits64[n]).join('')
}


