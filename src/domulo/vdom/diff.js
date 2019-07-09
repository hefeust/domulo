
import { BlockSorts} from '@/src/domulo/vdom/data-blocks'

const DIFF_TYPES = {
  TAG_TO_TAG:    BlockSorts.ELEMENT + '=>' + BlockSorts.ELEMENT,
  TAG_TO_TEXT:   BlockSorts.ELEMENT + '=>' + BlockSorts.TEXT,
  TEXT_TO_TAG:   BlockSorts.TEXT + '=>' + BlockSorts.ELEMENT,
  TEXT_TO_TEXT:  BlockSorts.TEXT + '=>' + BlockSorts.TEXT,
  EMPTY_TO_TEXT: BlockSorts.EMPTY + '=>' + BlockSorts.TEXT,
  TEXT_TO_EMPTY: BlockSorts.TEXT + '=>' + BlockSorts.EMPTY,
  TAG_TO_EMPTY: BlockSorts.TAG + '=>' + BlockSorts.EMPTY,
  EMPTY_TO_TAG: BlockSorts.EMPTY + '=>' + BlockSorts.TAG,
  EMPTY_TO_EMPTY: BlockSorts.EMPTY + '=>' + BlockSorts.EMPTY
 }

const blocksDiffSort = (oldTreeBlock, newTreeBlock) => {
  const lhs = oldTreeBlock.sort 
  const rhs = newTreeBlock.sort
 
  return lhs + '=>' + rhs
}


const createPatchBlock = (bmp, patch, params) => {
  const newPatchBlock = bmp.getEmptyBlock()
  
  newPatchBlock.sort = params.sort 
  newPatchBlock.rel = params.rel
  newPatchBlock.name = params.name
  newPatchBlock.value = params.value


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


const getNodesBlocksList = (bmp, block) => {
  const list = []
  let nodeBlock = null
  let nodeBlockUID = block.nodes 
  
///  console.log ("-----")
//  console.log (bmp)
//  console.log ("-----")

  // console.log ('* getNodesBlocksList * ')
    
  while (nodeBlockUID !== '0') {
    nodeBlock = bmp.getBlockByUid(nodeBlockUID)
    // console.log('node: name=%s sort=%s', nodeBlock.name, nodeBlock.sort)
    list.push (nodeBlock)
    nodeBlockUID = nodeBlock.next
  }
  
  return list

}



const diffTagsBlocks = (bmp, oldTagBlock, newTagBlock, patch) => {
  const bds = blocksDiffSort (oldTagBlock, newTagBlock)

  // console.log('    diff tag blocks: ' + bds)
  
  switch (bds) {
    
    case DIFF_TYPES.TAG_TO_TAG:
      if (oldTagBlock.name === newTagBlock.name) return 
      
      createPatchBlock (bmp, patch, {
        sort: BlockSorts.PATCH_UPDATE_NODE,
        rel:  oldTagBlock.uid,
        name: newTagBlock.name
      })
    break
    
    case DIFF_TYPES.TAG_TO_TEXT:   
      createPatchBlock (bmp, patch, {
        sort: BlockSorts.PATCH_DELETE_NODE,
        rel:  oldTagBlock.uid
      })
      
      createPatchBlock (bmp, patch, {
        sort: BlockSorts.PATCH_INSERT_TEXT,
        rel:  oldTagBlock.uid,
        value: newTreeBlock.value
      })
    break 
    
    case DIFF_TYPES.TEXT_TO_TAG:   
      createPatchBlock (bmp, patch, {
        sort: BlockSorts.PATCH_DELETE_TEXT,
        rel:  oldTagBlock.uid
      })
      
      createPatchBlock (bmp, patch, {
        sort: BlockSorts.PATCH_INSERT_NODE,
        rel:  oldTagBlock.uid,
        name: newTagBlock.name,
        value: newTreeBlock.name
      })
    
    break
    
    case DIFF_TYPES.TEXT_TO_TEXT:  
      if (oldTagBlock.value === newTagBlock.value) return 
      
      createPatchBlock (bmp, patch, {
        sort:BlockSorts.PATCH_UPDATE_TEXT,
        rel: oldTagBlock.uid,
        value: newTagBlock.value
      })
    break 
    
    case DIFF_TYPES.EMPTY_TO_TEXT: 
      createPatchBlock (bmp, patch, {
        sort: BlockSorts.PATCH_INSERT_TEXT,
        rel: oldTagBlock.uid,
        value: newTagBlock.value
      })
    break 
    
    case DIFF_TYPES.TEXT_TO_EMPTY: 
      createPatchBlock (bmp, patch, {
        sort: BlockSorts.PATCH_DELETE_TEXT,
        rel: oldTagBlock.uid
      })
    break 
    
    case DIFF_TYPES.TAG_TO_EMPTY: 
      createPatchBlock (bmp, patch, {
        sort: BlockSorts.PATCH_DELETE_NODE,
        rel: oldTagBlock.uid
      })    
    break 
    
    case DIFF_TYPES.EMPTY_TO_TAG: 
      createPatchBlock (bmp, patch, {
        sort: BlockSorts.PATCH_INSERT_NODE,
        rel: oldTagBlock.uid,
        name: newTagBlock.name
      })    
    break 
    
    case DIFF_TYPES.EMPTY_TO_EMPTY: 
      return    
    break 
  }
}

const diffAttrsBlocks = (bmp, oldTagBlock, newTagBlock, patch) => {
  const oldAttrsList = getAttrsBlocksList (bmp, oldTagBlock)
  const newAttrsList = getAttrsBlocksList (bmp, newTagBlock)
  const collected = new Set()
  
  let found = false
  
  oldAttrsList.map ((oldAttrBlock) => {
    
    newAttrsList.map((newAttrBlock) => {
      
      if(oldAttrBlock.name === newAttrBlock.name) {
        collected.add (oldAttrBlock.name)
        
        if (oldAttrBlock.value !== newAttrBlock.value) {
          createPatchBlock (bmp, patch, {
            sort: BlockSorts.PATCH_UPDATE_ATTR,
            rel: oldAttrBlock.uid,
            name: oldAttrBlock.name,
            value: newAttrBlock.value
          })
        }
      }
    })
  })
  
  oldAttrsList.map((oldAttrBlock) => {
    if (! collected.has(oldAttrBlock.name)) {
      createPatchBlock (bmp, patch, {
        sort: BlockSorts.PATCH_DELETE_ATTR,
        rel: oldAttrBlock.uid,
        name: oldAttrBlock.name
 //       value: newAttrBlock.value
     })      
    }
  })
  
  newAttrsList.map((newAttrBlock) => {
    if (! collected.has(newAttrBlock.name)) {
      createPatchBlock (bmp, patch, {
        sort: BlockSorts.PATCH_INSERT_ATTR,
        //puid: oldAttrBlock.uid,
        name: newAttrBlock.name,
        value: newAttrBlock.value
     })      
    }
  })  
}


/*/*
 * zip two arrays
 * 
 * @param {Array} arr0
 * @param {Array} arr1
 * @returns {Array}
 */
const zip = (arr0, arr1) => {
  
  // console.log(arr0)
  // console.log(arr1)
  
  if(arr0.length >= arr1.length) {
    return arr0.map ((x0, idx0) => [x0, arr1[idx0]])
  } else {
    return arr1.map ((x1, idx1) => [arr0[idx1], x1])
  }
}


const diffNodesBlocks = (bmp, oldTagBlock, newTagBlock, patch) => {
  const oldNodesList = getNodesBlocksList (bmp, oldTagBlock) 
  const newNodesList = getNodesBlocksList (bmp, newTagBlock) 
  
  // console.log ('   * diffNodes *')
  // console.log(oldNodesList.length)
  // console.log(newNodesList.length)
  
  zip (oldNodesList, newNodesList).map(entry => {
    
    diffTrees (bmp, entry[0], entry[1], patch)
    //diffTagsBlocks (entry[0], entry[1])
  })

}

const diffTrees = (bmp, oldTree, newTree, patch) => {
  let oldTreeBlock
  let newTreeBlock

  if (oldTree && newTree) {
    // both new old and new tree exist
    console.log ('### diff existing trees ###')
    
    oldTreeBlock = bmp.getBlockByUid (oldTree.uid)
    newTreeBlock = bmp.getBlockByUid (newTree.uid)
    
  } else if (oldTree) {
    // tree removal
    console.log ('### tree removal ###')

    oldTreeBlock = bmp.getBlockByUid (oldTree.uid)
    newTreeBlock = bmp.getEmptyBlock ()
    
    
  } else if (newTree) {
    // tree creation
    console.log ('###  tree creation ###')
  
    oldTreeBlock = bmp.getEmptyBlock ()
    newTreeBlock = bmp.getBlockByUid (newTree.uid)
  
  
  } else {
    // otherwise,j do nothing
    console.log ('### diff empty trees ###')

    oldTreeBlock = bmp.getEmptyBlock ()
    newTreeBlock = bmp.getEmptyBlock ()
 
  }

  //console.log(oldTreeBlock, newTreeBlock)

  diffTagsBlocks (bmp, oldTreeBlock, newTreeBlock, patch)
  diffAttrsBlocks (bmp, oldTreeBlock, newTreeBlock, patch)
  diffNodesBlocks (bmp, oldTreeBlock, newTreeBlock, patch)
}

export const diff = (bmp, oldTree, newTree) => {
  const patchBlock = bmp.getEmptyBlock()
  const patch = {
    patchBlock,
    
  }
  
  patchBlock.sort = BlockSorts.PATCH
  
  diffTrees (bmp, oldTree, newTree, patch)
}
