

import { diff } from '@/src/domulo/vdom/diff'
import { patch} from '@/src/domulo/vdom/patch'

export const mount = (bmp, vtree, container) => {
  //const treeBlock = bmp.getBlockByUid (vtree.uid)
  const deltas = diff (bmp, null, vtree)

  deltas.container = container
    
  patch (bmp, deltas, { remebmer:  false })
}