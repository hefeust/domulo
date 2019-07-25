
/**
 * collect a list of blocks, given its head block
 * 
 * used for collecting:
 * - attrs
 * - subnodes
 * - deltas for patches
 * 
 * @param {Object} bmp
 * @param {Object} headBlock
 * @returns {Array<Object>}
 */
export const collectList = (bmp, firstBlockUid) => {
  const list = []
  let blockUid = firstBlockUid
  
  while (blockUid !== '0') {
    const block = bmp.getBlockByUid (blockUid)
    
    list.push (block)
    blockUid = block.next
  }
  
  return list
}
