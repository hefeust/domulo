

import { diff } from '@/src/domulo/vdom/diff'
import { patch} from '@/src/domulo/vdom/patch'

export const mount = (bmp, tree, container) => {
  const treeBlock = bmp.getBlockByUid (tree.uid)
  const deltas = diff (bmp, null, tree)

  treeBlock.name = '#container!'
  treeBlock.value = container
    
  patch (bmp, tree, deltas, { rembmer:  false })
}