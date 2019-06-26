

import { createBMP } from '@/src/domulo/core/bmp'
import { createBlock, clearBlock } from '@/src/domulo/vdom/data-blocks'
import { createVNode } from '@/src/domulo/vdom/create-vnode'
import { render } from '@/src/domulo/vdom/render'

console.log('@/test/domulo/app/wrap')

export const wrap = (options) => {
  const bmp = createBMP(createBlock, clearBlock, options)
  
  const wrapper = {
    h (tagname, attrs, ...children) {
      console.log('*** wrapped.h ***')
      
      return createVNode (bmp, tagname, attrs, children)
    },  
    
    mount (treeUID, containingELement) {
      console.log('*** wrapped.mount ***')
    
    },
    
    showDebug(verbose) {
      console.log(bmp.showDebug(verbose))
    },
    
    render (tree, props) {
      return render(bmp, tree, props)
    }
  }
  
  // setup (options)
  
  return wrapper
}