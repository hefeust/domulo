
import { BlockSorts } from '@/src/domulo/vdom/data-blocks'

const insertNode = (element, newly, oldNode) => {
  const newNode = document.createElement (newly.name)
  
  element.appendChild (newNode)
}

const deleteNode = () => {}

const insertText = () => {}

const deleteText = () => {}

const PATCH_OPS = {
  
}

const patchDelta = (bmp, deltaBlock, route, options) => {
  const element = route [ route.length - 1]
  const children = [...element.childNodes]
  
  for (let idx = 0; idx < children.length; idx++) {
    PATCH_OPS [ deltaBlock.sort ] ()
  }
  
}

export const patch = (bmp, deltas, options) => {
  const route = [ delta.container ]  
  
  patchDelta ()
}



