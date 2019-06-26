
import { BlockSorts } from '@/src/domulo/vdom/data-blocks'

const ORPHANED = ['img', 'br', 'hr', 'link', 'input', 'meta']

const renderAttrs  = (bmp, block, props) => {
  let results = []
  let nextUID = block.attrs 
  
  while (nextUID !== '0') {
//    console.log(nextUID)
    
    const attrBlock = bmp.getBlockByUid(nextUID)
    
//    console.log(attrBlock)
    
    results.push(attrBlock.name + '=' + '"' + attrBlock.value + '"')
    nextUID = attrBlock.next
  }
  
  return results.join(' ')
}


const renderNodes = (bmp, block, props) => {
  let results = []
  let nextUID = block.nodes 
  
  console.log('RenderNode: uid: %s name: %s', block.uid, block.name)
  
  while (nextUID !== '0') {
    const nodeBlock = bmp.getBlockByUid(nextUID)
    
    if(nodeBlock.sort === BlockSorts.TEXT) {
      results.push (nodeBlock.value)
    } else {
      results.push(renderTag(bmp, nodeBlock, props))
    }
    
    nextUID = nodeBlock.next
  }
  
  return results.join('\n')
}

const renderTag = (bmp, block, props) => {
  // const block = bmp.getBlockByUid(tagUID)
  const tagname = block.name
  const attrs = renderAttrs(bmp, block, props)
  const nodes = renderNodes(bmp, block, props)
  
  let result = ''

  console.log('RenderTag name: %s', block.name)
  
  if(ORPHANED.indexOf(tagname) > -1) {
    result = `<${tagname} ${attrs} />`
  } else {
    result = `<${tagname} ${attrs}>\n ${nodes}\n </${tagname}>`
  }
  
  return result
}

export const render = (bmp, tree, props) => {
  const root = bmp.getBlockByUid(tree.uid)
  
  return renderTag (bmp, root, props)
}
