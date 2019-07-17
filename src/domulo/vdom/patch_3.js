
import { BlockSorts } from '@/src/domulo/vdom/data-blocks'

const insertNode = (element, newly, oldNode) => {
  //console.log (newly)
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


const patchNodes1 = (bmp, deltaBlock, paths, root, level) => {
  const newly = bmp.getBlockByUid (deltaBlock.newly)
  let children = null
  
  if (level > 10) throw new Error('RECURSION')
  
  if (level === 0 && deltaBlock.sort === BlockSorts.PATCH_INSERT_NODE) {
    console.log('patch: ' + deltaBlock.sort)
    PATCH_OPS [ deltaBlock.sort ] (root, newly, null)                 
  } //else {
    
  children = Array.from(root.childNodes)
    
    for (let idx = 0; idx < children.length; idx++) {
      const oldNode = children[idx]
      
      console.log ('oldNode : ', oldNode)

     if (paths.newly[level + 1] === idx) {
       console.log('patch: ' + deltaBlock.sort)
       
       PATCH_OPS [ deltaBlock.sort ] (root, newly, oldNode)
     }

     patchNodes (bmp, deltaBlock, paths, oldNode, level + 1)
    }      
  //}
  
}

const patchAttrs = (root, level) => {
  
}

const patchNodes = (bmp, delta, route, root, level, rank, options) => {
  
  let oldie = null
  let newly = null 
  let children = null 
  
  console.log ('*** patchNodes ***')
  console.log('root:', root)
  console.log('level:', level)
  console.log('route (oldie):' + route.oldie.join("/"))
  console.log('route (newly):' + route.newly.join("/"))
  
  if (level > 10) throw new Error ('RECUSI§ON')
  
  if (delta.oldie) {
    oldie = bmp.getBlockByUid (delta.oldie)
  }
  
  if (delta.newly) {
    if (route.newly.length === level + 1) {
      newly = bmp.getBlockByUid (delta.newly)    
      
      console.log('patch: ' + delta.sort)
      console.log( newly.sort, newly.name, newly.value)
      
      
      PATCH_OPS [ delta.sort ] ( root, newly, null)

      //if(root.hasChildNodes()) {
        children = Array.from (root.childNodes)

        children.map ((child, chidx) => {
          patchDelta (bmp, delta, route, child, level + 1, chidx, options)
        }) 

      //}
    }

  }
    
    

//  console.log (oldie)
//  console.log (newly)
  
}


const patchDelta = (bmp, deltaBlock, route, level, rank, options) => {
  const element  = route [ route.length - 1]
  const parts = deltaBlock.route.split ('!')
  const paths = {
    oldie: parts [0].split ('/').map (s => parseInt (s)),
    newly: parts [1].split ('/').map (s => parseInt (s))
  }
  
  // console.log ("###########")
  // console.log(deltaBlock.route)
  // console.log ("###########")
  
  const newly = bmp.getBlockByUid (deltaBlock.newly)
  console.log ('*** patch delta  ***')
  
  patchNodes (bmp, deltaBlock, paths, element, 0, 0)
}

export const patch = (bmp, deltas, options) => {
  console.log (deltas)
  
  const route = [ deltas.container ]  
  let deltaBlock = bmp.getBlockByUid (deltas.uid)
  let deltaBlockUid = deltaBlock.next
  
  console.log ('=== patching real DOM ===')
  
  while (deltaBlockUid !== '0') {
    deltaBlock = bmp.getBlockByUid (deltaBlockUid)
    patchDelta (bmp, deltaBlock, route, options)
    deltaBlockUid = deltaBlock.next
  }
}



