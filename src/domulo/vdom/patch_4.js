
import { BlockSorts } from '@/src/domulo/vdom/data-blocks'

const insertNode = (element, newly, oldNode) => {
  console.log('insertNode', element, oldNode)
  const newNode = document.createElement (newly.name)
  element.appendChild (newNode)
}

const deleteNode = () => {}

const insertText = (element, newly, oldNode) => {
  console.log('insertText', element, oldNode)
  const newNode = document.createTextNode (newly.value)
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

const patchAttrs = (bmp, delta, route, root, level, rank, options) => {
  
}

const patchNodes = (bmp, delta, paths, root, level, rank, options) => {
  console.log ('*** patching node recursively *** ', delta.sort, root)
  console.log('*** level, rank', level, rank)
  const visited = [paths.oldie.join('/'), paths.newly.join('/')].join('!')

  let oldie = null
  let newly = null
  let children = null
  let modified = false

  console.log(delta.route, visited)
  
  if (level === 20) throw new Error ('RECURSION!')

  if (delta.newly) {
    newly = bmp.getBlockByUid (delta.newly)

    if (delta.route === visited) {
      PATCH_OPS [delta.sort] (root, newly, null)
      modified = true
    } 
  }

}

export const patch = (bmp, deltas, options) => {
  
  const root = deltas.container
  const paths = { oldie: [0], newly: [0] }
  let delta = bmp.getBlockByUid (deltas.uid)
  let deltaBlockUid = delta.next
  let rank = 0
  
  while (deltaBlockUid !== '0') {
    const delta = bmp.getBlockByUid (deltaBlockUid)
    
    console.log('PATCH #' + rank)
    patchNodes (bmp, delta, paths, root, 0, 0, options)
    console.log(rank)
    
    deltaBlockUid = delta.next
    rank++
  }
}

