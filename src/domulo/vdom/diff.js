
import { BlockSorts, showBlockDebug  } from '@/src/domulo/vdom/data-blocks'

const blocksDiffSort = (oldTreeBlock, newTreeBlock) => {
  const lhs = oldTreeBlock ? oldTreeBlock.sort : '?' 
  const rhs = newTreeBlock ? newTreeBlock.sort : '?'
 
  return lhs + ':' + rhs
}

const createDiffBlock = (bmp, wrappedPatch, params) => {
  const diffBlock = bmp.getEmptyBlock()

  diffBlock.sort = params.sort
  diffBlock.puid = params.puid 
  diffBlock.name = params.name
  diffBlock.value = params.value
  

  wrappedPatch.patchBlock.next = diffBlock.uid
  wrappedPatch.patchBlock = diffBlock
 
  return diffBlock
}

const diffTags = (bmp, oldTreeBlock, newTreeBlock, wrappedPatch) => {
  const bds = blocksDiffSort(oldTreeBlock, newTreeBlock)
  // let patchBlock = null
  
  switch (bds) {
    
    case (BlockSorts.ELEMENT + ':' + BlockSorts.ELEMENT):
        if (oldTreeBlock.name !== newTreeBlock.name) {
          createDiffBlock(bmp, wrappedPatch, {
            sort: BlockSorts.PATCH_UPDATE_NODE,
            puid: oldTreeBlock.uid,
            name: newTreeBlock.name
          })
        }
      break
      
    case (BlockSorts.ELEMENT + ':' + BlockSorts.TEXT):
        createDiffBlock (bmp, wrappedPatch, {
          sort: BlockSorts.PATCH_DELETE_NODE,
          puid: oldTreeBlock.uid
        })
        
        createDiffBlock (bmp, wrappedPatch, {
          sort: BlockSorts.PATCH_INSERT_TEXT,
          puid: oldTreeBlock.uid,
          value: newTreeBlock.value
        })        
      break
    case (BlockSorts.TEXT + ':' + BlockSorts.ELEMENT):
        createDiffBlock (bmp, wrappedPatch, {
          sort: BlockSorts.PATCH_DLEETE_TEXT,
          puid: oldTreeBlock.uid 
        })
        
        createDiffBlock (bmp, wrappedPatch, {
          sort: BlockSorts.PATCH_INSERT_NODE,
          puid: oldTreeBlock.uid,
          name: newTreeBlock.name  
        })
      break      
  }
}

const getAttrsBlocksList = (bmp, block) => {
  const list = []
  let attrBlock = null
  let attrBlockUID = block.attrs 
  
  while (attrBlockUID !== '0') {
    attrBlock = bmp.getBlockByUid(attrBlockUID)
    list.push (attrBlock)
    attrBlockUID = attrBlock.next
  }
  
  return list
}

const diffAttrs = (bmp, oldTreeBlock, newTreeBlock, wrappedPatch) => {
  
//  console.log('   * diffAttrs * ')
//  console.log('old:\t' + showBlockDebug(oldTreeBlock))
//  console.log('new:\t' + showBlockDebug(newTreeBlock))
  
  const oldAttrsList = getAttrsBlocksList (bmp, oldTreeBlock)
  const newAttrsList = getAttrsBlocksList (bmp, newTreeBlock)
  const collected = new Set()
  
  let found = false
  
  oldAttrsList.map ((oldAttrBlock) => {
    
    newAttrsList.map((newAttrBlock) => {
      
      if(oldAttrBlock.name === newAttrBlock.name) {
        collected.add (oldAttrBlock.name)
        
        if (oldAttrBlock.value !== newAttrBlock.value) {
          createDiffBlock (bmp, wrapeedPatch, {
            sort: BlockSorts.PATCH_UPDATE_ATTR,
            puis: oldAttrBlock.uid,
            name: oldAttrBlock.name,
            value: newAttrBlock.value
          })
        }
      }
    })
  })
  
  oldAttrsList.map((oldAttrBlock) => {
    if (! collected.has(oldAttrBlock.name)) {
      createDiffBlock (bmp, wrapeedPatch, {
        sort: BlockSorts.PATCH_DELETE_ATTR,
        puis: oldAttrBlock.uid,
        name: oldAttrBlock.name
 //       value: newAttrBlock.value
     })      
    }
  })
  
  newAttrsList.map((newAttrBlock) => {
    if (! collected.has(newAttrBlock.name)) {
      createDiffBlock (bmp, wrapeedPatch, {
        sort: BlockSorts.PATCH_INSERT_ATTR,
        //puid: oldAttrBlock.uid,
        name: newAttrBlock.name,
        value: newAttrBlock.value
     })      
    }
  })
}


const getNodesBlocksList = (bmp, block) => {
  const list = []
  let nodeBlock = null
  let nodeBlockUID = block.nodes 
  
  while (nodeBlockUID !== '0') {
    nodeBlock = bmp.getBlockByUid(nodeBlockUID)
    list.push (nodeBlock)
    nodeBlockUID = nodeBlock.next
  }
  
  return list}

/*/*
 * zip two arrays
 * 
 * @param {Array} arr0
 * @param {Array} arr1
 * @returns {Array}
 */
const zip = (arr0, arr1) => {
  if(arr0.length >= arr1.length) {
    return arr0.map ((x0, idx0) => [x0, arr1[idx0]])
  } else {
    return arr1.map ((x1, idx1) => [arr0[idx1]], x1)
  }
}

const diffNodes = (bmp, oldTreeBlock, newTreeBlock, patchWrapper) => {
//  console.log ('   * diffNodes *')
//  console.log ( showBlockDebug (oldTreeBlock))
//  console.log ( showBlockDebug (newTreeBlock))
  
  const oldNodesList = getNodesBlocksList (bmp, oldTreeBlock) 
  const newNodesList = getNodesBlocksList (bmp, newTreeBlock) 
  
  // console.log ('   * diffNodes *')
  
  zip (oldNodesList, newNodesList).map(entry => {
    diffTags (entry[0], entry[1])
  })
}

/**
 * diff two trees inside BMP
 * 
 * 
 * @param {BlocksMemoryPool} bmp
 * @param {Object} oldTree
 * @param {Object} newTree
 * @returns {Object} diff wrapper in BMP
 */
export const diff = (bmp, oldTree, newTree) => {

   const oldTreeBlock = bmp.getBlockByUid (oldTree.uid)
   const newTreeBlock = bmp.getBlockByUid (newTree.uid)
   const patchBlock = bmp.getEmptyBlock()
   const wrappedPatch = { patchBlock }
   
   patchBlock.sort = BlockSorts.PATCH
   
//   console.log ('=== diff ===')
//   console.log('old:\t' + showBlockDebug(oldTreeBlock))
//   console.log('new:\t' + showBlockDebug(newTreeBlock))
   
   diffTags (bmp, oldTreeBlock, newTreeBlock, wrappedPatch)
   diffAttrs(bmp, oldTreeBlock, newTreeBlock, wrappedPatch)
   diffNodes(bmp, oldTreeBlock, newTreeBlock, wrappedPatch)

   return { name: 'patch', uid: patchBlock.uid }
}
