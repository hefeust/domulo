
import { BlockSorts } from '@/src/domulo/vdom/data-blocks' 


const insertNode = (element, child, newly, options) => {
  const newNode = document.createElement(newly.name)
  
  element.appendChild (newNode) 
}

const updateNode = (bmp, deltaBlock, route, oldNode, options) => {
  
}

const deleteNode = (element, child, newly, options) => {
  element.removeChild (child)   
}

const insertText = (bmp, deltaBlock, route, oldNode, options) => {
  
}

const updateText = (bmp, deltaBlock, route, oldNode, options) => {
  
}

const deleteText = (bmp, deltaBlock, route, oldNode, options) => {
  
}

const insertAttr = (bmp, deltaBlock, route, oldNode, options) => {
  
}

const updateAttr = (bmp, deltaBlock, route, oldNode, options) => {
  
}

const deleteAttr = (bmp, deltaBlock, route, oldNode, options) => {
  
}

const PATCH_OPS = {}

PATCH_OPS [ BlockSorts.PATCH_INSERT_NODE ] = insertNode
PATCH_OPS [ BlockSorts.PATCH_UPDATE_NODE ] = updateNode
PATCH_OPS [ BlockSorts.PATCH_DELETE_NODE ] = deleteNode

PATCH_OPS [ BlockSorts.PATCH_INSERT_TEXT ] = insertText
PATCH_OPS [ BlockSorts.PATCH_UPDATE_TEXT ] = updateText
PATCH_OPS [ BlockSorts.PATCH_DELETE_TEXT ] = deleteText

const patchDelta = (bmp, deltaBlock, route, options) => {
  const element = route[route.length - 1]
  const children = [...element.childNodes]
  const oldie = bmp.getBlockByUid (deltaBlock.oldie)
  const newly = bmp.getBlockByUid (deltaBlock.newly)
  let done = false 
  
  for (let c = 0; c < children.length; c++) {
    testRoute = route + '/' + c
    if (testRoute === deltaBlock.route) {
      PATCH_OPS [deltaBlock.sort] (element, children [c], newly, options)
      done = true
      break
    }
  }
  
  patchNodes (bmp, deltaBlock, route, options)
  patchAttrs (bmp, deltaBlock, route, options)  
}

export const patch = (bmp, deltas, params) => {
  const element = deltas.container
  const route = [element]
  let deltaBlock = bmp.getBlockByUid (deltas.uid)
  let deltaBlcokUid = deltaBlock.next
  
  console.log ('*** patching ***')
  
  patchDelta (bmp, deltaBlock, element, params)
  
//  while (deltaBlockUid !== '0') {
  if (deltaBlockUid !== '0') {
    deltaBlock = bmp.getBlockByUid (deltaBlockUid)
    patchDelta (bmp, deltaBlock, route, options)
    //deltaBlockUid = deltaBlock.next
  }
}
