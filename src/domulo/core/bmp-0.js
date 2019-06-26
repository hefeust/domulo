
import { createMWC } from '@/src/domulo/core/mwc'
import { to_string } from '@/src/domulo/core/keys64'

const ALPHA = 982579
const KEY_DIGIT_SIZE = 64  // 64 = A_Za_z0$_-9 keys
const KEY_LENGTH = 4
const SEEDS = [32, 32, 32, 32, 0, 0, 0, 0]
const DEFAULT_POOL_SIZE = 1000

/**
 * creates anew blocks memory  pool
 *
 *
 * @param {Function} factory
 *@param {}
 * @param {object} options
 * @returns {object } - the Blocks Memory Pool
 *
 * options are key/values pairs :
 *    - size: in number of memory blocks
 *    - thresold: 0..1 reallocation thresold
 *    - throws: boolean 
 */
const createBMP = (factory, options) => {

  const _options = options || {}

  const generator = createMWC ( ALPHA, KEY_DIGIT_SIZE, KEY_LENGTH ) 

  const index = {
    size: _options.size || DEFAULT_POOL_SIZE,
    thresold: _options.thresold || 0.05,
    throws: _options.throws || false,
    watermark: 0, 
    factory,
    generator
  }

  /** blocks pool in memory */  
  const pool = []
  
  /** 
    lookup UID --> block index in pool 
    
    limits: 
    -  8.4M  lookup allocations in node
    -  17.1  lookup allocations in Firefox
   */
  const lookup = {}
  
  generator.init(SEEDS)

  return { pool, lookup, index }
}

/**
 * reallocate blocks pool to make room inside it
 *
 * @param {object} bmp
 */
const reallocate  = (bmp) => {
  const s = bmp.pool.length
  const newly = new Array(s)
  
  for(let k = 0; k < bmp.index.size; k++) {
    let generated, uid
    
    do {
      generated = bmp.index.generator.next ()
      uid = to_string( generated )
    } while (bmp.lookup.hasOwnProperty(uid)) 
    
    //newly[k] = createDataBlock (uid, BlockTypes.EMPTY)
    newly[k] = index.factory (uid, BlockSort.EMPTY)
    bmp.lookup [uid] = k + s
  }
    
  bmp.pool.push(...newly)
}

/**
 * get a block by UID
 *
 * @param {object } bmp - the Blocks Memory Pool
 * @param {uid} string
 *
 */
const getBlockByUid = (bmp, uid) => {
  // console.log( '*** getBlockByUid ***' )
  // console.log( bmp )  
  
  let block = null
  
  // console.log(bmp)
  
  if(bmp.lookup.hasOwnProperty(uid)) {
    block = bmp.pool[ bmp.lookup[ uid ] ] 
  } else {
    if (bmp.index.throws) {
      throw new Error ('block not found @uid=' + uid)
    }
  }
  
  return block
}

/** 
 * find an rmpty block, reallocating blocks if necessary
 *
 * it implies creasing of the watermark level value
 * and could occasionnally produce are reallocation cycle 
 *
 * @param {object } bmp - the Blocks Memory Pool
 * @param {object } bmp - the Blocks Memory Pool
 *
 */
const getEmptyBlock = (bmp) => {
  // console.log( '*** getEmptyBlock ***' )
  // console.log( bmp )

  let block

  bmp.index.watermark++

  if (bmp.index.watermark >= bmp.pool.length * (1 - bmp.index.thresold)) {
    reallocate (bmp)
  }

  block = bmp.pool[ bmp.index.watermark ]
  
  return block
}

/** 
 * swap blocks in pool
 *
 * @param {object} bmp
 * @param {string} uid1
 * @param {string} uid2
 */
const swapBlocks = (bmp, uid1, uid2) => {
  
  // @TODO integrate swap vlock to pool ???
  
  const idx1 = bmp.lookup [uid1]
  const idx2 = bmp.lookup [uid2]
  const temp = bmp.pool[idx1]
  let result = false
  
  // swap block
  bmp.pool[uid1] = bmp.pool [ uid2 ]
  bmp.pool[uid2] = temp
  
  // trnaslate lookup bloxks accoredingly
  bmp.lookup [ uid1 ] = idx2
  bmp.lookup [ uid2 ] = idx1
  
  result = true
  
  return result 
}

/**
 * clears a block
 *
 * @param {object} bmp
 * @param {string} uid
 */
const clearBlock = (bmp, uid) => {
  const block = getBlockByUid (bmp, uid)
  
  block.btype = BlockTypes.EMPTY
  block.src = null
  block.rel = []
  block.data = {}
}

/**
 * release a no-more-used block
 *
 * @param {object} bmp
 * @param {string} uid
 */
const releaseBlock = (bmp, uid) => {
  const other = bmp.index.watermark
  
  clearBlock (bmp, uid) 
  swapBlocks (bmp, uid, other)
  
  bmp.index.watermark--
}

/**
 * Blocks Memory Pool factory
 *
 * @param {Function} factory - pool blocks factory function
 * @param {object} options
 *
 */
export const createBlocksMemoryPool = (factory, options) => {

  const bmp = createBMP (factory, options)

  reallocate(bmp)

  // console.log( '*** bmp ***' )
  // console.log( bmp )

  return {
    getByUID (uid) { return getBlockByUId(bmp, uid) },
    getEmpty () { return getEmptyBlock(bmp) },
    release (uid) { return releaseBlock(bmp, uid) },
    uids () { return Object.keys(bmp.lookup).join(', ') }
  }
}

const BMPSetup = (blockDef, options) => {
  
  const generator = createMWC ( ALPHA, KEY_DIGIT_SIZE, KEY_LENGTH ) 
  
  const index = {
    factory: blockDefs.factory,
    sorts:  blockDef.BlcokSorts,
    
    generator
    size: options.size || DEFAULT_POOL_SIZE,
    thresold: options.thresold || 0.05,
    throws: options.throws || false,
    watermark: 0, 

  }

  /** blocks pool in memory */  
  const pool = []
  
  /** 
    lookup UID --> block index in pool 
    
    limits: 
    -  8.4M  lookup allocations in node
    -  17.1  lookup allocations in Firefox
   */
  const lookup = {}
  
  generator.init(SEEDS)

  return { pool, lookup, index }
}

export const BMPFactory = (blocksDef, options) => {
    
  const bmp = BMPSetup(options || {})
  
  return {
    getBlockByUid (uid) { 
      return getBlockByUid (bmp, uid)
    },
    
    getEmptyBlock (uid) { 
      return getEmptyBlock (bmp)
    },
    
    releaseBlock (uid) {
      return realseBlock (bmp, uid)
    }
  }
}
