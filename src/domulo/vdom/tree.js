
import { createBlocksMemoryPool } from '@src/dexm/core/blocks-memory-pool'


const handleTag = (bmp, root, tagname) => { 
  console.log ('=== handleTag ===')

  root.btype = BlockTypes.TAG
  root.name = tagname
  root.value = tagname
}

const handleAttributes = (bmp, root, attrs) => {
  console.log ('=== handleAttributes ===')

}

const handleChildren = ( bmp, root, children) => {
  console.log ('=== handleChildren ===')

}

const createVNode = (bmp, tagname, attrs, children) =>  {
  
  const ROOT_BLOCK = bmp.getEmpty()
  
  handleTag (bmp, ROOT_BLOCK, tagname)
  handleAttributes (bmp, ROOT_BLOCK, tagname)
  handleChildren (bmp, ROOT_BLOCK, tagname)
  
  return {
    merge ( otherVNode )
  }
}

export const createVDOM = () => {

  const bmp = createBlocksMemoryPool()  

  const h = (tagname, attrs, ...children) => {
    return createVNode (bmp, tagname, attrs, children)
  }
  
  return h
}
