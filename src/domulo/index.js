

import { createBMP } from '@/src/domulo/core/bmp'
import { createBlock, clearBlock } from '@/src/domulo/vdom/data-blocks'
import { createVNode } from '@/src/domulo/vdom/create-vnode'
import { mount } from '@/src/domulo/vdom/mount'
import { render } from '@/src/domulo/vdom/render'
import { diff } from '@/src/domulo/vdom/diff'


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
      
      mount (bmp, treeUID, containingElement)
    
    },
    
    showDebug(verbose) {
      console.log(bmp.showDebug(verbose))
    },
    
    diff (oldTreeBlock, newTreeBlock) {
      return diff(bmp, oldTreeBlock, newTreeBlock )
    },
    
        
    render (tree, options) {
      return render(bmp, tree, options || {}  )
    }
  }
  
  // setup (options)
  
  return wrapper
}