

import { BlockSorts } from '@/src/domulo/vdom/data-blocks'

const createTag = (bmp, tagname) => {
  const block = bmp.getEmptyBlock()
  
  block.sort = BlockSorts.ELEMENT
  block.name = tagname
  block.value = ''
  
  console.log('createTag: %s', tagname)
  
  return block
}


const addAttr = (bmp, tagUID, value, key, idx) => {
  
  const owner = bmp.getBlockByUid(tagUID  
  const owner = bmp.getBlockByUid(tagUID)
)
  const block = bmp.getEmptyBlock()
  
  block.puid = tagUID
  block.sort = BlockSorts.ATTR 
  block.name = key
  block.value = value
  
  if (key.substr(0, 2) === 'on') {
    block.sort = BlockSorts.CODE
  }
}

const handleAttrs = (bmp, tagUID, attrs) => {
  console.log('handleAttrs')  

  Object.keys(attrs).map((key, idx) => {
    addAttr(bmp, tagUID, attrs[key], key, idx)    
  })
}

const addNode = (bmp, parentUID, prevUID, n, idx) => {

  
  block.puid = tagUID
  block.sort = BlockSorts.ATTR 
  block.name = key
  block.value = value
   
}

const handleNodes = (bmp, tagUID, nodes) => {
  const parent = bmp.getBlockByUid (tagUID)
  let textRank = 0
  let prevUID = '0'
  
  nodes.map((n, idx) => {
    const block = bmp.getEmptyBlock()
    const ots = ({}).toString.call(n)
  
    switch (ots) {
      case '[object Object]':
        
        block.puid = tagUID
        block.sort = BlockSorts.ELEMENT
        // block.name = 
        // block.value = 
        
        if (prevUID === '0') {
          parent.nodes = block.uid 
          
        } else {
          
        }
        
        prevUID = block.uid
        
        break
      
      case '[object string]':
          textRank++
        break
      
    }
    
  }) /// nodes.map

  console.log('handleNodes')  
}


export const createVNode = (bmp, tagname, attrs, nodes) => {
  const TAG_BLOCK = createTag (bmp, tagname)  
  
  handleAttrs  (bmp, TAG_BLOCK.uid, attrs)
  handleNodes  (bmp, TAG_BLOCK.uid, nodes)
  
  console.log('createVNode: %s', tagname)
  
  return { uid: TAG_BLOCK.uid }
}
