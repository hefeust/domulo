
import { BlockSorts } from '@/src/domulo/vdom/data-blocks'

const createRoot = (bmp, tagname) => {
  const block = bmp.getEmptyBlock()
  
  block.sort = BlockSorts.ELEMENT
  block.name = tagname
  block.value = '#n/a!'
  
  return block
}

const handleAttrs = (bmp, root, attrs) => {
  let lastCreated = null
  
  Object.keys (attrs).map ((key, idx) => {
    const block = bmp.getEmptyBlock ()
    const value = attrs [key]
    
    // console.log(block)
    
    block.puid = root.uid
    block.sort = BlockSorts.ATTR
    block.name = key
    block.value = value 
    
    
    if (idx === 0) {
      root.attrs = block.uid 
    } else {
      lastCreated.next = block.uid
    }
    
    lastCreated = block
  })
}

const handleNodes = (bmp, root, nodes) => {
  
  let block = null
  let lastVisited = null
  
  nodes.map((whatever, idx) => {
    const ots = ({}).toString.call(whatever)
    
    switch(ots) {
      // subnode is a text-able node
      case '[object String]':
      case '[object Boolean]':
      case '[object Number]':
      case '[object Date]':
        block = bmp.getEmptyBlock ()
        
        block.puid = root.uid
        block.sort = BlockSorts.TEXT 
        block.name = '#text!'
        block.value = whatever.toString()

        if (idx === 0) {
          root.nodes = block.uid
        } else {
          lastVisited.next = block.uid
        }
        
        lastVisited = block
      break
      
      // subnode is a subtree ?
      case '[object Object]':
        block = bmp.getBlockByUid(whatever.uid)
        block.puid = root.uid      

        if (idx === 0) {
          root.nodes = block.uid
        } else {
          lastVisited.next = block.uid
        }
        
        lastVisited = block
        
      break
 
      // subnode is an array of subtrees ?
      case '[object Array]':
        whatever.map ((entry, widx) => bmp.getBlockByUid(entry.uid))
           .map((block, bidx) => { 
              block.puid = root.uid

              if (idx === 0 && bidx === 0) {
                root.nodes = block.uid
              } else {
                lastVisited.next = block.uid
              }

              lastVisited = block
          
          
           })
      break
    }

  })
  
}

const handleNodes0 = (bmp, root, nodes) => {
  // console.log('\t' + 'handleNodes')
  // console.log('\t' + root.uid + ' ' + root.name)
  // console.log('\t' + nodes.join(', '))
  
  let block, lastCreated = null
  
  nodes.map ((n, idx) => {
    const ots = ({}).toString.call(n)
    // let block = bmp.getEmptyBlock ()
    
    // console.log('\tNode:', n, idx)
    
    switch (ots) {
      case '[object Object]':
        // bmp.releaseBlock (block.uid)
        block = bmp.getBlockByUid(n.uid)
        block.puid = root.uid
        
        // console.log('=== ots is Object ===')
        // console.log('puid: %s', root.uid)
        // console.log(n)
        
        lastCreated = block

v
        
      break
      
      case '[object String]':
      case '[object Boolean]':
      case '[object Number]':
        block = bmp.getEmptyBlock ()
        block.puid = root.uid
        block.sort = BlockSorts.TEXT 
        block.name = '#text!'
        block.value = n.toString()
        
        lastCreated = block
 
        if (idx === 0) {
          root.nodes = lastCreated.uid
        } else {
          lastCreated.next = block.uid
        }
        
        break
      
      case '[object Array]': 
        console.log('########### ARRAY ###########')
        console.log(n.map(b => b.uid).join(', '))
        n.map ((entry, idx) => bmp.getBlockByUid(entry.uid))
           .map((block, bidx) => { 
              block.puid = root.uid
              lastCreated = block
           })
      break
      
      default:
        console.log(ots)
         throw new Error('unsupported block sort')
        break
    }

    if (idx === 0) {
      root.nodes = lastCreated.uid
    } else {
      lastCreated.next = block.uid
    }
    
    
    // console.log(`##### BLOCK uid: ${block.uid} puid: ${block.puid} sort: ${block.sort} name: ${block.name}`)
  })

}

export const createVNode = (bmp, tagname, attrs, nodes) => {
  const root = createRoot (bmp, tagname)

  handleAttrs (bmp, root, attrs)
  handleNodes (bmp, root, nodes)
  
  return { uid: root.uid }
}