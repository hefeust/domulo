

import { diff } from '@/src/domulo/vdom/diff'
import { patch} from '@/src/domulo/vdom/patch'
import { empty } from '@/src/domulo/vdom/empty'

export const mount = (bmp, vtree, container) => {
  //const treeBlock = bmp.getBlockByUid (vtree.uid)
  const deltas = diff (bmp, empty (bmp), vtree)

  deltas.container = container
  vtree.container = container
  
  patch (bmp, deltas, { remebmer:  false })
}