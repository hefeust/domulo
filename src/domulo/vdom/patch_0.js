  
import { BlockSorts } from '@/src/domulo/vdom/data-blocks' 


const patchAttrs = (bmp, deltaBlock, element, params) => {
  
  
}

const patchNodes = (bmp, deltaBlock, element, params) => {
  console.log ('========= patchBlock')
  console.log(element)
  
  const oldie = deltaBlock.oldie
  const newly = deltaBlock.newly
  const oldNodes = [...element.childNodes]
  let newNode = null 
  
//  for (let i = 0; i < element.childNodes.length; i++) {
//    oldNodes.push (element.childNodes[i])
//  }
  
  oldNodes.map ((oldNode) => {
    
    switch (deltaBlock.sort) {
      case BlockSorts.PATCH_INSERT_NODE:
        newNode = document.createElement (newly.name)
        element.appendChild (newNode)
        break

      case BlockSorts.PATCH_UPDATE_NODE:
        newNode = document .createElement (newly.name)
        element.replaceChild (newNode, oldNode)
        break
        
      case BlockSorts.PATCH_DELETE_NODE:
        element.removeChild (oldNode)
        break
        
      case BlockSorts.PATCH_INSERT_TEXT:
        newNode = document.createTextNode(newly.value)
        element.appendChild (newNode)
        break

      case BlockSorts.PATCH_UPDATE_TEXT:
        newBlock = document.createTextNode (newLy.value)
        element.appendChild (newNode)
        break

      case BlockSorts.PATCH_DELETE_TEXT:
        element.removeChild (oldNode)
        break
    }
  }) 
 
  
  if (deltaBlock.next !== '0') {
    const nextDeltaBlock = bmp.getBlockByUid (deltaBlock.next)
    
    patchDelta (bmp, nextDeltaBlock, element, params)
  }
}

const patchDelta = (bmp, deltaBlock, element, params) => {
  
  patchNodes (bmp, deltaBlock, element, params)
  
}

export const patch = (bmp, deltas, options) => {
  const headBlock = bmp.getBlockByUid (deltas.uid)
  const params = {}
  let element = deltas.container
  
  console.log ('*** patch ***')
  
  params.remember = options.remember
  
  if (headBlock.next !== '0') {
    const deltaBlock = bmp.getBlockByUid (headBlock.next)
    patchDelta (bmp, deltaBlock, element, params)
  }
}
