
import { BlockSorts } from '@/src/domulo/vdom/data-blocks'

const insertNode = (root, infos) => {
  const newNode = document.createElement (infos.newlyBlock.name)
  
  root.appendChild (newNode)
}

const updateNode = (root, infos) => {
  
}

const deleteNode = (root, infos) => {
  
}

const insertText = (root, infos) => {
  const newNode = document.createTextNode (infos.newlyBlock.value)
  
  root.appendChild (newNode)
}

const updateText = (root, infos) => {
  
}

const deleteText = (root, infos) => {
  
}


const discoverNodes = (root, infos) => {
  const { oldieRoute, newlyRoute, oldieDelta, newlyDelta } = infos
  const progress = Object.assign ({}, infos)
  let level = 0
  let currentNode = root
  let oldieNode = null
  let newlyNode = null
  let children = null

  while (level < newlyDelta.length) {
    console.log ('while', level, currentNode)
    
    children = currentNode.childNodes
    
    if (newlyDelta[level] < children.length ) {
      currentNode = children [newlyDelta[ level ]]
      
    } else {
      console.log ('ALERT')
      break
    }
    
    level++
  }
  
  console.log('--> discoverNodes', root)
  console.log ('newlyDelta: ' + newlyDelta.join(' ')) 
  // console.log ('newlyRoute: ' + newlyRoute.join(' '))
  console.log ('currentNde', currentNode)
  
  return { root: currentNode, oldieNode, newlyNode}
}

const patchDOM = (root, infos, options) => {
  console.log ('### patch real DOM ###')
  
  const discovery = discoverNodes (root, infos)
 
  console.log('patchDOM after discovery', discovery)
 
  root = discovery.root
  infos.newlyNode = discovery.newlyNode
  infos.oldieNode = discovery.oldieNode
  
  switch (infos.ops) {
    case BlockSorts.PATCH_INSERT_NODE: 
      insertNode (root, infos)
    break

    case BlockSorts.PATCH_INSERT_TEXT: 
      insertText (root, infos)
    break    
  }
  
}

/**
 * the patching algorithm
 * 
 * given a list of deltas, patches the real DOM
 * 
 * @param {Object} bmp
 * @param {Object} deltas
 * @param {Object} options
 * @returns {undefined}
 */
export const patch = (bmp, deltas, options) => {
  const root = deltas.container
  
  const deltaPreludeBlock = bmp.getBlockByUid (deltas.uid)
  let deltaBlockUid = deltaPreludeBlock.next  
  let rank = 0
  
  console.log ('===== patching real DOM... =====')
  
  while (deltaBlockUid !== '0') {
    const deltaBlock = bmp.getBlockByUid (deltaBlockUid)
    const parts = deltaBlock.route.split ('!')
    const oldieDelta = parts[0].split ('/').map(s => parseInt(s))
    const newlyDelta = parts[1].split ('/').map(s => parseInt(s))

    const infos = {
      ops: deltaBlock.sort,
      oldieDelta,
      oldieRoute: [0],
      oldieBlock: deltaBlock.oldie && bmp.getBlockByUid (deltaBlock.oldie),
      newlyDelta,
      newlyRoute: [0],
      newlyBlock: deltaBlock.newly &&   bmp.getBlockByUid (deltaBlock.newly),
      level: 0,
      chidx: 0,
    }
  
    console.log('patch #' + rank)
    // console.log (infos)
  
    patchDOM (root, infos, options)
  
    deltaBlockUid = deltaBlock.next
    rank++
  }
}