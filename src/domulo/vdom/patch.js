
import { BlockSorts, showBlockDebug } from '@/src/domulo/vdom/data-blocks'

const getDeltaBlocksList = (bmp, block) => {
  const list = []
  let deltaBlock = null
  let deltaBlockUID = block.next 
  
  while (deltaBlockUID !== '0') {
//    console.log ('*** getDeltaBlocksList: %s', deltaBlockUID)
    
    deltaBlock = bmp.getBlockByUid(deltaBlockUID)
    list.push (deltaBlock)
    deltaBlockUID = deltaBlock.next
  }
  
  return list
}

const patchTree = (bmp, treeBlcok, deltaBlocksList, options) => {
  const texts = []

  deltaBlocksList.map (db => {
//    console.log(db)
//    texts.push (`sort: ${db.sort} name: ${db.name} value: ${db.value}`)
    texts.push ( showBlockDebug (db) )
  })

  console.log ( texts.join ('\n'))
}

export const patch = (bmp, tree, deltas, options) =>  {
  const treeBlock = bmp.getBlockByUid (tree.uid)
  const deltaBlock = bmp.getBlockByUid (deltas.uid)
  const deltaBlocksList = getDeltaBlocksList (bmp, deltaBlock)

  if (treeBlock.name === '#container!') {
    patchTree (bmp, treeBlock, deltaBlocksList, options || {})
  } else {
    console.log('@src/domulo/vdom/patchT#patchTree: no such container !')
  }
}
