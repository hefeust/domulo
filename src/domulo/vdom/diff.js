
import { BlockSorts} from '@/src/domulo/vdom/data-blocks'

/**
 * the patch types 
 * @type ENUM
 */
const DIFF_TYPES = {
  TAG_TO_TAG:    BlockSorts.ELEMENT + '=>' + BlockSorts.ELEMENT,
  TAG_TO_TEXT:   BlockSorts.ELEMENT + '=>' + BlockSorts.TEXT,
  TEXT_TO_TAG:   BlockSorts.TEXT + '=>' + BlockSorts.ELEMENT,
  TEXT_TO_TEXT:  BlockSorts.TEXT + '=>' + BlockSorts.TEXT,
  EMPTY_TO_TEXT: BlockSorts.EMPTY + '=>' + BlockSorts.TEXT,
  TEXT_TO_EMPTY: BlockSorts.TEXT + '=>' + BlockSorts.EMPTY,
  TAG_TO_EMPTY: BlockSorts.ELEMENT + '=>' + BlockSorts.EMPTY,
  EMPTY_TO_TAG: BlockSorts.EMPTY + '=>' + BlockSorts.ELEMENT,
  EMPTY_TO_EMPTY: BlockSorts.EMPTY + '=>' + BlockSorts.EMPTY
 }

/**
 * get patch types from 2 trees
 
 * @param {object} oldTreeBlock
 * @param {object} newTreeBlock
 * @returns {String}
 */
const blocksDiffSort = (oldTreeBlock, newTreeBlock) => {
  const lhs = oldTreeBlock.sort 
  const rhs = newTreeBlock.sort
 
  return lhs + '=>' + rhs
}

/**
 * create a new patch block
 * append it to patches listr
 * 
 * @param {object} bmp
 * @param {object} patch
 * @param {object} params
 * @returns {undefined}
 */
const createPatchBlock = (bmp, patch, params) => {
  const newPatchBlock = bmp.getEmptyBlock()
  
  // console.log('######### createPatchBlock')
  // console.log (params)
  
  newPatchBlock.sort = params.sort || '#/a!'
  newPatchBlock.rel = params.rel || '#/a!'

  // patching route
  newPatchBlock.route = params.route && params.route.oldie.join('/') + '!' + params.route.newly.join('/')

  newPatchBlock.oldie = params.oldie
  newPatchBlock.newly = params.newly

  patch.patchBlock.next = newPatchBlock.uid
  patch.patchBlock = newPatchBlock
}

/**
 * get attrs blocks list
 * 
 * @TODO move to separate file
 * 
 * @param {type} bmp
 * @param {type} block
 * @returns {Array|getAttrsBlocksList.list}
 */
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

/**
 * get nodes blocks list
 * 
 * @TODO move to separate file
 * 
 * @param {type} bmp
 * @param {type} block
 * @returns {Array|getAttrsBlocksList.list}
 */
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


/**
 * diff two tags blocks
 * 
 * big switching algorithm to determine with patch to apply
 * 
 * @param {type} bmp
 * @param {type} oldTagBlock
 * @param {type} newTagBlock
 * @param {type} patch
 * @returns {undefined}
 */
const diffTagsBlocks = (bmp, oldTagBlock, newTagBlock, route, patch) => {
  const bds = blocksDiffSort (oldTagBlock, newTagBlock)
  let sort = BlockSorts.EMPTY

  console.log('    diff tag blocks: ' + bds)
  console.log ( oldTagBlock.name + ' ' + newTagBlock.name)
  
  switch (bds) {
    
    case DIFF_TYPES.TAG_TO_TAG:
      if (oldTagBlock.name === newTagBlock.name) return 
      
//      sort = BlockSorts.PATCH_UPDATE_NODE,
      createPatchBlock (bmp, patch, {
        sort: BlockSorts.PATCH_UPDATE_NODE,
        oldie: oldTagBlock.uid,
        newly: newTagBlock.uid,
        route
      })
    break
    
    case DIFF_TYPES.TAG_TO_TEXT:   
      createPatchBlock (bmp, patch, {
        sort: BlockSorts.PATCH_DELETE_NODE,
        oldie: oldTagBlock.uid,
        newly: null,
        route
      })
      
      createPatchBlock (bmp, patch, {
        sort: BlockSorts.PATCH_INSERT_TEXT,
        oldie: null,
        newly: newTagBlock.uid,
        route
      })
    break 
    
    case DIFF_TYPES.TEXT_TO_TAG:   
      createPatchBlock (bmp, patch, {
        sort: BlockSorts.PATCH_DELETE_TEXT,
          oldie: oldTagBlock.uid,
          newly: null,
          route
      })
      
      createPatchBlock (bmp, patch, {
        sort: BlockSorts.PATCH_INSERT_NODE,
        oldie: null,
        newly: newTagBlock.uid,
        route
      })
    
    break
    
    case DIFF_TYPES.TEXT_TO_TEXT:  
      if (oldTagBlock.value === newTagBlock.value) return 
      
      createPatchBlock (bmp, patch, {
        sort:BlockSorts.PATCH_UPDATE_TEXT,
        oldie: oldTagBlock.uid,
        newly: newTagBlock.uid,
        route
      })
    break 
    
    case DIFF_TYPES.EMPTY_TO_TEXT: 
      createPatchBlock (bmp, patch, {
        sort: BlockSorts.PATCH_INSERT_TEXT,
        oldie: null,
        newly: newTagBlock.uid,
        route
      })
    break 
    
    case DIFF_TYPES.TEXT_TO_EMPTY: 
      createPatchBlock (bmp, patch, {
        sort: BlockSorts.PATCH_DELETE_TEXT,
        oldie: oldTagBlock.uid,
        newly: null,
        route
      })
    break 
    
    case DIFF_TYPES.TAG_TO_EMPTY: 
      createPatchBlock (bmp, patch, {
        sort: BlockSorts.PATCH_DELETE_NODE,
        oldie: oldTagBlock.uid,
        newly: null,
        route
      })    
    break 
    
    case DIFF_TYPES.EMPTY_TO_TAG: 
      console.log('==========================')
      
      createPatchBlock (bmp, patch, {
        sort: BlockSorts.PATCH_INSERT_NODE,
        oldie: null,
        newly: newTagBlock.uid,
        route
      })    
    break 
    
    case DIFF_TYPES.EMPTY_TO_EMPTY: 
      // do nothing ...
      return    
    break 
  }
}

/**
 * attributes blocks diffing
 * 
 * @param {type} bmp
 * @param {type} oldTagBlock
 * @param {type} newTagBlock
 * @param {type} patch
 * @returns {undefined}
 */
const diffAttrsBlocks = (bmp, oldTagBlock, newTagBlock, route, patch) => {
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
            oldie: oldAttrBlock.uid,
            newly: newAttrBlock.uid,
            route
          })
        }
      }
    })
  })
  
  oldAttrsList.map((oldAttrBlock) => {
    if (! collected.has(oldAttrBlock.name)) {
      createPatchBlock (bmp, patch, {
        sort: BlockSorts.PATCH_DELETE_ATTR,
        oldie: oldAttrBlock.uid,
        newly: null,
        route
     })      
    }
  })
  
  newAttrsList.map((newAttrBlock) => {
    if (! collected.has(newAttrBlock.name)) {
      createPatchBlock (bmp, patch, {
        sort: BlockSorts.PATCH_INSERT_ATTR,
        oldie: null,
        newly: newAttrBlock.uid,
        route
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


const diffNodesBlocks = (bmp, oldTagBlock, newTagBlock, route, patch) => {
  const oldNodesList = getNodesBlocksList (bmp, oldTagBlock) 
  const newNodesList = getNodesBlocksList (bmp, newTagBlock) 
  const olen = oldNodesList.length
  const nlen = newNodesList.length
  
  console.log('BEFORE ZIP : %s %s', olen, nlen )
  
  zip (oldNodesList, newNodesList).map((entry, idx) => {
    console.log('zip ' + idx + ' ############################')
    
//    console.log (route.oldie)
//    console.log (route.newly)
    
    //if (idx === 4) throw new Error('ERROR')
    
    if (nlen > olen) {
      route.newly.push(idx)
    } else {
      route.oldie.push(idx)
    }
    
    
    diffTrees (bmp, entry[0], entry[1], route, patch)

    //if (idx === 4) throw new Error('ERROR')

    if (nlen > olen) {
      route.newly.pop ()
    } else {
      route.oldie.pop ()
    }
  })
}

const diffTrees = (bmp, oldTree, newTree, route, patch) => {
  let oldTreeBlock
  let newTreeBlock

  if (oldTree && newTree) {
    // both new old and new tree exist
    console.log ('### diff existing trees ###')
    
    oldTreeBlock = bmp.getBlockByUid (oldTree.uid)
    newTreeBlock = bmp.getBlockByUid (newTree.uid)
    
    newTree.container = oldTree.container
    
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


  // diffTagsBlocks (bmp, oldTreeBlock, newTreeBlock, patch)
  // diffAttrsBlocks (bmp, oldTreeBlock, newTreeBlock, patch)
  //diffNodesBlocks (bmp, oldTreeBlock, newTreeBlock, patch)

  diffTagsBlocks (bmp, oldTreeBlock, newTreeBlock, route, patch)
  diffAttrsBlocks (bmp, oldTreeBlock, newTreeBlock, route, patch)
  diffNodesBlocks (bmp, oldTreeBlock, newTreeBlock, route, patch)
}

export const diff = (bmp, oldTree, newTree) => {
  const patchBlock = bmp.getEmptyBlock()
  const route = { oldie: [0], newly: [0] }
  const patch = {
    patchBlock,
  }
  
  patchBlock.sort = BlockSorts.PATCH
//  patchBlock.rel = [oldTree && oldTree.uid, newTree && newTree.uid]
  
  //diffTrees (bmp, oldTree, newTree, route, patch)
  diffTrees (bmp, oldTree, newTree, route, patch)

  return { 
    name: 'PATCH',
    uid: patchBlock.uid,
    oldie: newTree.uid,
    newly: newTree.uid
  }
}
