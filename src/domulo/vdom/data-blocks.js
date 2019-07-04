
export const BlockSorts = {
  EMPTY: '0',
  
  ELEMENT: 'E',
  CODE: 'X',
  ATTR: 'A',
  COMMENT: 'C',
  TEXT: 'T',
  
  'VTREE': 'V',
  'PATCH' : 'P',
  
  'PATCH_INSERT_NODE': 'PIN',
  'PATCH_UPDATE_NODE': 'PUN',
  'PATCH_DELETE_NODE': 'PDN',
  'PATCH_INSERT_TEXT': 'PIT',
  'PATCH_UPDATE_TEXT': 'PUT',
  'PATCH_DELETE_TEXTR': 'PDT',
  'PATCH_INSERT_ATRR': 'PIA',
  'PATCH_UPDATE_ATTR': 'PUA',
  'PATCH_DDLETE_ATTR': 'PDA'
}

export const clearBlock = (block) => {
  block.puid = '0'
  block.sort = BlockSorts.EMPTY
  block.next = '0'
  block.attrs = '0'
  block.nodes = '0'
  block.name = '#n/a!'
  block.value = '#n/a!'
    
  return block    
}

export const createBlock = (uid) => {
  const block = { uid }
 
  clearBlock (block)
  
  return block
}

export const showBlockDebug = (block) => {
  const lines = []
  
  const uid = block.uid.padStart(6, ' ')
  const puid = block.puid.padStart(6, ' ')
  const attrs = block.attrs.padStart(6, ' ')
  const nodes = block.nodes.padStart(6, ' ')
  const next = block.next.padStart(6, ' ')
  const sort = block.sort.padStart(6, ' ')
  const name = block.name.padStart(20, ' ')
  const value = block.value.padStart(20, ' ')
  
//  return `uid: ${uid} puid: ${puid} attrs: ${attrs} nodes: ${nodes} next: ${next} sort: ${sort} ${name} value: ${value}`
  
  return `${uid}${puid}${attrs}${nodes}${next}${sort}${name}${value}`
  
}

export const showDebugHeaders = () => {
  return '--------------------------------------------------------------------'  + '\n'
       + '     #   UID  PUID ATTRS NODES  NEXT  SORT             NAME            VALUE' + '\n'
       + '--------------------------------------------------------------------'
}
