
import { createMWC } from '@/src/domulo/core/mwc'
import { to_string, from_string } from '@/src/domulo/core/keys64'
import { showBlockDebug, showDebugHeaders, BlockSorts } from '@/src/domulo/vdom/data-blocks'
// sole defaukts for MWC generator
const MWC_ALPHA_MULTIPLIER = 982579
const MWC_DIGITS_RANGE = 64  // 64 = A_Za_z0$_-9 keys
const MWC_KEY_LENGTH = 4
const MWC_SEEDS_KEY = '900dCAFE'

// some defaults for Block Memory POOL
//const BMP_POOL_SIZE = 10000
const BMP_POOL_SIZE = 10
const BMP_THRESOLD = 0.05

/**
 * setup the Blocks Meory Pool index
 * 
 * @param {object} options
 * @returns {object}
 */
const setup = (createBlock, clearBlock, options) => {
  const mwc = createMWC ( MWC_ALPHA_MULTIPLIER, MWC_DIGITS_RANGE, MWC_KEY_LENGTH ) 
  
  mwc.init( from_string( MWC_SEEDS_KEY ) )
  
  return {
    generator: mwc,  
    watermark: -1,
    size: options.size || BMP_POOL_SIZE,
    thresold: options.thresold || BMP_THRESOLD,
    createBlock,
    clearBlock
  }
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
    
    newly[k] = bmp.index.createBlock (uid)
    bmp.index.clearBlock(newly[k])
    bmp.lookup [uid] = k + s
  }
    
  // console.log('bmp#reallocate')
  // console.log(bmp.pool.map(b => b.uid).join(' '))
  bmp.index.size *= 2;

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
    //if (bmp.index.throws) {
      throw new Error ('block not found @uid=' + uid)
    //}
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

  let block = null

  bmp.index.watermark++

  if (bmp.index.watermark >= bmp.pool.length * (1 - bmp.index.thresold)) {
    reallocate (bmp)
  }

  block = bmp.pool[ bmp.index.watermark ]
  
  // console.log('@/src/domulo/core/bmp')
  // console.log(bmp.index.watermark, bmp.pool.length)
  // console.log(block)
  
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
 * release a no-more-used block
 *
 * @param {object} bmp
 * @param {string} uid
 */
const releaseBlock = (bmp, uid) => {
  const released_block = getBlockByUid(bmp, uid)
  const wmk = bmp.index.watermark
  const other_uid = bmp.pool[wmk].uid
 
  bmp.index.clearBlock (released_block) 
  swapBlocks (bmp, uid, other_uid)
  bmp.index.watermark--
}

const showDebug = (bmp, verbose) => {
  const entries = []
  
  bmp.pool
          // .filter(b => b.sort !== BlockSorts.EMPTY)
    .map((block, idx) => {
      if(idx % 10 === 0) {
        entries.push(showDebugHeaders())
      }
   
      entries.push(idx.toFixed().padStart(6, ' ') + showBlockDebug(block))
    })
  
  return entries.join('\n')
}

/**
 * module exports BMP factory 
 * 
 * @param {Function} createBlock
 * @param {Function} clearBlock
 * @param {object} options
 * @returns {BMPWrapper}
 */
export const createBMP = (createBlock, clearBlock, options) => {
    /** 
    NOTE: lookup UID --> block index in pool 
    
    limits: 
    -  8.4M  lookup allocations in node
    -  17.1  lookup allocations in Firefox
   */
  const pool = []
  const lookup = {}
  const index = setup (createBlock, clearBlock, options || {})
  
  const bmp = { pool, lookup, index }
  
  return {
    getBlockByUid (uid) { 
      return getBlockByUid (bmp, uid)
    },
    
    getEmptyBlock (uid) { 
      return getEmptyBlock (bmp)
    },
    
    releaseBlock (uid) {
      return releaseBlock (bmp, uid)
    },
    
    showDebug (verbose) {
      return showDebug (bmp, verbose)
    }
  }
}
