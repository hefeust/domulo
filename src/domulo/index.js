

import { createBMP } from '@/src/domulo/core/bmp'
import { createBlock, clearBlock } from '@/src/domulo/vdom/data-blocks'
import { createVNode } from '@/src/domulo/vdom/create-vnode'
import { empty } from '@/src/domulo/vdom/empty'
import { mount } from '@/src/domulo/vdom/mount'
import { render } from '@/src/domulo/vdom/render'
import { diff } from '@/src/domulo/vdom/diff'
import { patch } from '@/src/domulo/vdom/patch'


console.log('@/test/domulo/app/wrap')

export const wrap = (options) => {
  const bmp = createBMP(createBlock, clearBlock, options)
  
  const wrapper = {
    h (tagname, attrs, ...children) {
      console.log('*** wrapped.h ***')
      
      return createVNode (bmp, tagname, attrs, children)
    },
    
    empty () {
      return empty ( bmp )
    },
    
    mount (tree, rootElement) {
      console.log('*** wrapped.mount ***')
      
      mount (bmp, tree, rootElement)
    },
   
    diff (oldTree, newTree) {
      return diff(bmp, oldTree, newTree )
    },
    
    patch (deltas, options) {
      console.log('*** wrapped.mount ***')
      
      patch (bmp, deltas, options)
    },
        
    render (tree, options) {
      return render(bmp, tree, options || {}  )
    },
    
    showDebug(verbose) {
      console.log(bmp.showDebug(verbose))
    }
  }
  
  // setup (options)
  
  return wrapper
}