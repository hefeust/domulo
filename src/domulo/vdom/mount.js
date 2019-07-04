
import { BlockSorts }  from '@/src/domulo/vdom/data-blocks'

export const mount = (bmp, tree, containingELeement) => {
  const vtreeBlock = bmp.getEmptyBlock()

  vtreeBlock.sort = BlockSorts.VTREE 
  vtreeBlock.next = tree.uid
  
  
  return vtreeBlock
}

