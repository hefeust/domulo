
import { BlockSorts } from '@/src/domulo/vdom/data-blocks'

const insertNode = (root, infos) => {
  const newNode = document.createElement (infos.newlyBlock.name)
  
  root.appendChild (newNode)
}

const updateNode = (root, infos) => {
  
}

const deleteNode = (root, infos) => {
  console.log ('delete node')
  console.log (root)
  console.log (infos.oldieNode  )

  //const chidx = infos.oldieDelta [ infos.oldieDelta.length - 1 ]
  //const oldNode = root.childNodes [ chidx ]
  const oldieNode = infos.oldieNode
  
  root.removeChild (oldieNode)  
}

const insertText = (root, infos) => {
  const newNode = document.createTextNode (infos.newlyBlock.value)
  
  root.appendChild (newNode)
}

const updateText = (root, infos) => {
  
}

const deleteText = (root, infos) => {
  console.log ('delete node')
  console.log (root)
  console.log (infos)

  //const chidx = infos.oldieDelta [ infos.oldieDelta.length - 1 ]
  //const oldNode = root.childNodes [ chidx ]
  const oldieNode = infos.oldieNode
  
  root.removeChild (oldieNode)  
}

const setAttr = (root, infos) => {
  const name = infos.newlyBlock.name
  const value = infos.newlyBlock.value

  if (name === 'className') {
    root.setAttribute ('class', value)
  } else {
    root.setAttribute (name, value)
  }
}

const deleteAttr  = (root, infos) => {
  
}

const discoverNodes = (root, infos) => {
  const { oldieDelta, newlyDelta } = infos  
  
  const iterate = (route, nav, shift) => {
    console.log ('iterate route:'  + route.join('/'))
    let children = null
    let level = shift
    
    if (shift === 1) {
      nav.oldieNode = nav.root
      nav.root = nav.root.parentNode
      
      return 
    }
    
    while (level + shift < route.length) {
      children = nav.root.childNodes
      
      if (route [level] < children.length) {
        nav.root = children [ route [level] ]
        nav.oldieNode = nav.root.childNodes [ route [level + 1 ] ]
      }
      
      level++
    }
  }
  
  let shift = 0
  let nav = { root, oldieNode: null }
  
  if (oldieDelta.length > 1) {
    iterate (oldieDelta, nav, shift)
    shift = 1
  } else {
    shift = 0
  }
  
  iterate (newlyDelta, nav, shift)

  console.log ('discoverNopdes results with (root, oldieNode)', nav.root, nav.oldieNode)

  return nav
}

const patchDOM = (root, infos, options) => {
  console.log ('### patch real DOM ###')
  
  const discovery = discoverNodes (root, infos)
 
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

    case BlockSorts.PATCH_INSERT_ATTR: 
      setAttr (root, infos)
    break  

    case BlockSorts.PATCH_UPDATE_NODE: 
      updateNode (root, infos)
    break

    case BlockSorts.PATCH_UPDATE_TEXT: 
      updateText (root, infos)
    break

    case BlockSorts.PATCH_UPDATE_ATTR: 
      setAttr (root, infos)
    break  
  
    case BlockSorts.PATCH_DELETE_NODE: 
      deleteNode (root, infos)
    break

    case BlockSorts.PATCH_DELETE_TEXT: 
      deleteText (root, infos)
    break

    case BlockSorts.PATCH_DELETE_ATTR: 
      deleteAttr (root, infos)
    break  
  }
  
}

const collectDeltaInfos = (bmp, deltaRootBlock) => {
  let deltas = []
  let deltaBlockUid =  deltaRootBlock.next 
  let rank = 0
  

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
      rank
    }

    
    deltas.push (infos)
    rank++
    deltaBlockUid = deltaBlock.next
  }  


  console.log('collectDeltasInfos', deltaRootBlock)
  
  
  
  let ds = ds = deltas.map(d => 
    `${d.rank} ${d.ops} oldie: ${d.oldieDelta.join(',')}  newly: ${d.newlyDelta.join(',')}`
  )
  
  console.log (ds.join('\n'))
    
  
  

  return deltas   
}

const INS_OPS = [
    BlockSorts.PATCH_INSERT_NODE,
    BlockSorts.PATCH_INSERT_TEXT,
    BlockSorts.PATCH_INSERT_ATTR,
]


const DEL_OPS = [
    BlockSorts.PATCH_DELETE_NODE,
    BlockSorts.PATCH_DELETE_TEXT,
    BlockSorts.PATCH_DELETE_ATTR,
]

const sortDeltaBlocksList = (dbl) => {
  
  dbl.sort ((a, b) => {
    const a_is_delete = DEL_OPS.indexOf(a.ops) > -1
    const b_is_delete = DEL_OPS.indexOf(b.ops) > -1
    
    if (a_is_delete && b_is_delete) {
      // both deletions: revert sorting order
      if (a.rank < b.rank) {
        return 1
      } else if(a.rank > b.rank) {
        return -1
      } else {
        return 0
      }
    } else if (a_is_delete) {
      // only a deletes ? a is smaller
      return -1
    } else if (b_is_delete) {
      // only b deletes ? b is lsmaller
      return 1      
    } else {
      // NO DLETIONS AT ALL ? preserve order
      if (a.rank < b.rank) {
        return -1
      } else if(a.rank > b.rank) {
        return 1
      } else {
        return 0
      }
    }
  })
}

const rebaseDeltasBlocksList = (dbl, rank) => {
  
  for (let s = 0; s < dbl.length; s++) {
    const src = dbl [s]
    const ops_is_delete = DEL_OPS.indexOf(dbl[s]) > -1
    const ops_is_insert = INS_OPS.indexOf(dbl[s]) > -1

    if (ops_is_delete) {
      for (let t = s + 1; t < dbl.length; t++) {
        const tgt = dbl [t]
        let oldiePos = tgt.oldieDelta.length - 2
        let i = 0
        
        while (src.oldieDelta[i] ===  tgt[t].oldieDelta[i]) {
          if (i === oldiePos) tgt.oldieDelta[i]--
          if (i > src.oldieDelta.length) break
          i++ 
        }
      }
    }    

    if (ops_is_insert) {
      for (let t = s + 1; t < dbl.length; t++) {
        const tgt = dbl [t]
        let newlyPos = tgt.newlyDelta.length -  2
                
        let i = 0
        
        while (src.newlyDelta[i] ===  tgt[t].newlyDelta[i]) {
          if (i === newlyPos) tgt.newlyDelta[i]++
          if (i > src.newlyDelta.length) break
          i++ 
        }
      }    
    }

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
  const deltasInfosList = collectDeltaInfos (bmp, bmp.getBlockByUid (deltas.uid))
  let rank = 0
  
  console.log ('===== patching real DOM... =====')
  console.log ('root element patched is:' , root)
  
  sortDeltaBlocksList (deltasInfosList)

  deltasInfosList.map(di => {
    const oldie = di.oldieBlock && di.oldieBlock.name
    const newly = di.newlyBlock && di.newlyBlock.name
    const route = di.oldieDelta.join('/') + '!' + di.newlyDelta.join('/')
    
    console.log(`${di.rank} ${di.ops} oldie: ${oldie} newly: ${newly} ${route}`)
  })
  
   rebaseDeltasBlocksList (deltasInfosList , 0)
    console.log('after rebasing:', deltasInfosList)

  deltasInfosList.map(di => {
    const oldie = di.oldieBlock && di.oldieBlock.name
    const newly = di.newlyBlock && di.newlyBlock.name
    const route = di.oldieDelta.join('/') + '!' + di.newlyDelta.join('/')
    
    console.log(`${di.rank} ${di.ops} oldie: ${oldie} newly: ${newly} ${route}`)
  })

  deltasInfosList.map ((infos, rank) => {
    console.log('patch #' + rank)
    console.log ('infos (sort, route)', infos.ops, infos.oldieRoute, infos.newlyRoute)
  
    patchDOM (root, infos, options)
    
    
  })
}