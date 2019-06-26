

import { createBMP } from '@/src/domulo/core/bmp'
import { createBlock, clearBlock } from '@/src/domulo/vdom/data-blcok'

export const wrap = (options) => {
  
  const wrapper = {
    h (tagname, attrs, ...children) {
      console.log('*** wrapped.h ***')
      
      
    },  
    
    mount (treeUID, containingELement) {
      console.log('*** wrapped.mount ***')
    
    }
  }
  
  // setup (options)
  
  return wrapper
}