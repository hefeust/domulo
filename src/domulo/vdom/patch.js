
import { BlockSorts } from '@/src/domulo/vdom/data-blocks'

const insertNode = (element, newly, oldNode) => {
  console.log('insertNode', element, oldNode)
  const newNode = document.createElement (newly.name)
  element.appendChild (newNode)
}

const updateNode = (element, newly, oldNode) => {
  console.log('insertNode', element, oldNode)
  const newNode = document.createElement (newly.name)
  element.replaceChild (newNode, oldNode)
}

const deleteNode = () => {}

const insertText = (element, newlyBlock, oldNode) => {
  console.log('insertText', element, oldNode)
  const newNode = document.createTextNode (newlyBlock.value)
  element.appendChild (newNode)  
}

const updateText = () => {}
const deleteText = () => {}

const insertAttr = () => {}
const updateAttr = () => {}
const deleteAttr = () => {}

const PATCH_OPS = {}

PATCH_OPS [ BlockSorts.PATCH_INSERT_NODE ] = insertNode
PATCH_OPS [ BlockSorts.PATCH_INSERT_TEXT ] = insertText
PATCH_OPS [ BlockSorts.PATCH_INSERT_ATTR ] = insertAttr

PATCH_OPS [ BlockSorts.PATCH_UPDATE_NODE ] = updateNode
PATCH_OPS [ BlockSorts.PATCH_UPDATE_TEXT ] = updateText
PATCH_OPS [ BlockSorts.PATCH_UPDATE_ATTR ] = updateAttr

PATCH_OPS [ BlockSorts.PATCH_DELETE_NODE ] = deleteNode
PATCH_OPS [ BlockSorts.PATCH_DELETE_TEXT ] = deleteText
PATCH_OPS [ BlockSorts.PATCH_DLEETE_ATTR ] = deleteAttr



const patchTag = (bmp, root, delta, visiting, options) => {
  let used = false
  console.log ('*** patch DOM root TAG ***')
  
  const visited = [visiting.oldie.join('/'), visiting.newly.join('/')].join('!')
  const oldNode = null
  const newlyBlock = bmp.getBlockByUid (delta.newly)
  
  if (delta.route = visited) {
    used = true
    PATCH_OPS [ delta.sort] (root, newlyBlock, oldNode)
  }
  
  return used
}


const patchAttrs = (bmp,root, delta, visiting, options) => {
  console.log ('*** patch DOM attributes ***')
  return false
}


const patchNodes = (bmp, root, delta, visiting, options) => {
  console.log ('*** patch DOM nodes ***')
  
  const children = root.childNodes
  
  let used = false
  
  if (visiting.level > 20) throw new Error ('#RECURSION!')
  
  for (let idx = 0; idx < children.length; idx++) {
    const discovery = {}
    const child = children [idx]
    
    discovery.oldie = visiting.oldie.slice(0)
    discovery.newly = visiting.newly.slice(0)
    
    if(delta.oldie) {
      discovery.oldie.push (idx)  
    } else {
      discovery.oldie [discovery.oldie.length - 1]++
    }

    if(delta.newly) {
      discovery.newly.push (idx)  
    } else {
      discovery.newly [discovery.newly.length - 1]++
    }    
    
    discovery.level = visiting.level + 1
    discovery.rank = idx
    
    console.log ('=========================')
    
    used = patchDOM (bmp, child, delta, discovery, options)
    
    if (used) break
  }
  
  return used
}

const patchDOM = (bmp, root, delta, visiting, options) => {
  let used = false
  
  console.log ('=== patch DOM recursively ===')
  console.log ('root', root)
  
  used = patchTag (bmp, root, delta, visiting, options)  
  used = used && patchAttrs (bmp, root, delta, visiting, options)  
  used = used && patchNodes (bmp, root, delta, visiting, options)  
  
  return used
}

export const patch = (bmp, deltas, options) => {
  
  const root = deltas.container
  let delta = bmp.getBlockByUid (deltas.uid)
  let deltaBlockUid = delta.next
  let rank = 0
  
  while (deltaBlockUid !== '0') {
    const deltaBlock = bmp.getBlockByUid (deltaBlockUid)
    const visitingInfos = { 
      level: 0,
      rank: 0,
      oldie: [0], 
      newly: [0] 
    }
    
    patchDOM (bmp, root, deltaBlock, visitingInfos, options)
    deltaBlockUid = deltaBlock.next
    rank++

    console.log('PATCH #' + rank)
    console.log(deltaBlock)
    console.log(visitingInfos)
    console.log(rank)

  }
}

