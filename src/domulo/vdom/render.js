

import { BlockSorts } from '@/src/domulo/vdom/data-blocks'

const ORPHANED_TAGS = 'br,hr,img,input'.split(',')

const getAttrsBlocksList = (bmp, block) => {
  const list = []
  let attrBlock = null
  let attrBlockUID = block.attrs 
  
  while (attrBlockUID !== '0') {
    attrBlock = bmp.getBlockByUid(attrBlockUID)
    list.push (attrBlock)
    attrBlockUID = attrBlock.next
  }
  
  return list
}


const getNodesBlocksList = (bmp, block) => {
  const list = []
  let nodeBlock = null
  let nodeBlockUID = block.nodes 
  
///  console.log ("-----")
//  console.log (bmp)
//  console.log ("-----")

  console.log ('* getNodesBlocksList * ')
    
  while (nodeBlockUID !== '0') {
    nodeBlock = bmp.getBlockByUid(nodeBlockUID)
    console.log('node: name=%s sort=%s', nodeBlock.name, nodeBlock.sort)
    list.push (nodeBlock)
    nodeBlockUID = nodeBlock.next
  }
  
  return list

}


const renderOpeningTag = (bmp, tagBlock, attrsBlocks, options) => {
//  console.log('*** renderOpeningTag ***')
//  console.log(options)
  
  let text = `${tagBlock.name}`
  let attrsText = attrsBlocks.reduce((acc, ab) => acc + ' ' + ab.name + '=' + '"' + ab.value + '"', '')
  
  
  text += attrsText === '' ? '' : ' ' + attrsText
  
  if(ORPHANED_TAGS.indexOf(tagBlock.name) > -1) {
    text = '<' + text  + '/>'
  } else {
    text = '<' + text + '>'
  }
  
  options.head.push(text)
  
  return text
}

const renderNodes = (bmp, tagBlock, nodesBlock, options) => {
  let text = ''
  //let nodesText = nodesBlocks.reduce((acc, nb) => acc + ' ' + ab.name + '=' + '"' + ab.value + '"', '')
  nodesBlock.reduce((acc, nb, nbidx) => {
    // console.log('nbidx :' + nbidx )
    renderTagBlock(bmp, nb, options)
  }, '')
  
  // options.head.push(text)
  
  return text  
}


const renderClosingTag = (bmp, tagBlock, attrsBlocks, options) => {
  let text = ''
  
  if(ORPHANED_TAGS.indexOf(tagBlock.name) > -1) {
    text =  '\n'
  } else {
    text =  `</${tagBlock.name}>`
  }
  
  // BUGFIX closing tags order
  //options.tail.push  (text)
  options.head.push  (text)
  
  return text
}

const renderTextBlock = (bmp, textBlock, options) => {
  let text = textBlock.value 
  
  options.head.push (text)
  
  return text
}

const renderTagBlock = (bmp, tagBlock, options) => {
  const attrsBlocksList = getAttrsBlocksList(bmp, tagBlock)
  const nodesBlocksList = getNodesBlocksList(bmp, tagBlock)

  // console.log('*** renderTagBlock ***')
  // console.log(options)
  
  console.log ( 'renderTagBlock name=%s attrs=%d nodes=%s', tagBlock.name, attrsBlocksList.length, nodesBlocksList.length)

  console.log(tagBlock.sort)

  if (tagBlock.sort === BlockSorts.ELEMENT) {
    // opening tag
    renderOpeningTag (bmp, tagBlock, attrsBlocksList, options)
  
    // render nodes if any
    renderNodes (bmp, tagBlock, nodesBlocksList, options)
  
    // clsoing tag
    renderClosingTag (bmp, tagBlock, attrsBlocksList, options)

  }

  if (tagBlock.sort === BlockSorts.TEXT) {
    renderTextBlock (bmp, tagBlock, options)
  }
}

export const render = (bmp, tree, options) => {
  const tagBlock = bmp.getBlockByUid(tree.uid)
  
  options.head = []
  options.tail = []
  
  renderTagBlock (bmp, tagBlock, options)
    
  console.log(options)
    
  return options.head.join('\n') + '\n' + options.tail.join('\n')
}

