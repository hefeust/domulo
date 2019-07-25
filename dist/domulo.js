(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global['DOMULO-lib'] = {}));
}(this, function (exports) { 'use strict';

  /**
   * create a new Multiply-With-Carry pseudo random number  generator
   * 
   * @param {number} a - the multiplier chaeacteristic of the MWC PRNG
   * @param {type} b - digits number opf positions
   * @param {type} r - number of digits (generator lag)
   * @returns {Object} generator instance
   */
  var createMWC = function (a, b, r) {

    var values = new Array (2 * r);
    var lag = 0;
    var idx = (lag + r) % (2 * r);

    var init = function (seeds) {
      // if(!seeds.length) { throw new Error('seeds must be a lenfth of  2 * r = ' + 2 * r) }
      
      seeds.forEach (function (s, idx) {
        values[idx] = s; 
      });
    };
    
    /**
     * one generator step
     * 
     * adapted friom wikipeida:
     * 
     * https://en.wikipedia.org/wiki/Multiply-with-carry_pseudorandom_number_generator
     * 
     * @returns {Array}
     */
    var step = function () {
        
      // values and carries stored in the same array
      var result = new Array(r);
      var xn =            (a * values[idx] + values[lag]) % b;
      var cn = Math.floor((a * values[idx] + values[lag]) / b);

      idx = (idx + 1) % (2 * r);
      lag = (lag + 1) % (2 * r);
      
      values[idx] = xn;
      values[lag] = cn;
            
      for(var i = 0; i < r; i++) {
        result[i] = values[(lag + i + 1) % (2 * r)];
      }
         
      return result    
    };
    
    /**
     * to avoid need of keeping lag in values array,
     * we invoke 2 * r  times the step() function 
     * so lag is always 0 through two consecutive next() calls
     * 
     * @returns {Array} 
     */
    var next = function () {
      var result = [];
      
      for (var k = 0; k < 2 * r; k++) {
         result = step();
      }
      
      return result
    };

    /**
     * to save the state for future use
     * 
     * create and new MWC and init it with the getState() output
     * 
     * @returns {Array}
     */  
    var getState = function () {
      return values
    };
    
    return { init: init, next: next, getState: getState }
  };

  var uppercased = Array(26).fill().map(function (_, idx) { return String.fromCharCode(idx + 'A'.charCodeAt(0)); }
  );

  var lowercased = Array(26).fill().map(function (_, idx) { return String.fromCharCode(idx + 'a'.charCodeAt(0)); }
  );

  var digits = Array(10).fill().map(function (_, idx) { return idx; });

  var alt = ['$', '_'];

  var digits64 = []
    .concat(uppercased)
    .concat(lowercased)
    .concat(alt)
    .concat(digits);
    
  var from_string = function (str) {
    return str.split('').map(function (c) { return digits64.indexOf(c); })
  };

  var to_string = function (arr) {
    return arr.map(function (n) { return digits64[n]; }).join('')
  };

  var BlockSorts = {
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
    'PATCH_DELETE_TEXT': 'PDT',
    'PATCH_INSERT_ATTR': 'PIA',
    'PATCH_UPDATE_ATTR': 'PUA',
    'PATCH_DELETE_ATTR': 'PDA'
  };

  var clearBlock = function (block) {
    block.sort = BlockSorts.EMPTY;
    block.puid = '0';
    block.next = '0';
    block.rel = '0';
    block.oldie = '0';
    block.newly = '0';
    block.attrs = '0';
    block.nodes = '0';
    block.route = '';
    block.name = '#n/a!';
    block.value = '#n/a!';
      
    return block    
  };

  var createBlock = function (uid) {
    var block = { uid: uid };
   
    clearBlock (block);
    
    return block
  };

  var showBlockDebug = function (block) {
    
    var uid = block.uid.padStart(6, ' ');
    var puid = block.puid.padStart(6, ' ');
    var attrs = block.attrs.padStart(6, ' ');
    var nodes = block.nodes.padStart(6, ' ');
    var next = block.next.padStart(6, ' ');
    var rel = block.rel.padStart(6, ' ');
    var sort = block.sort.padStart(6, ' ');
    var oldie = block.oldie.padStart(6, ' ');
    var newly = block.newly.padStart(6, ' ');
    var name = block.name.padStart(20, ' ');
    var value = block.value.padStart(20, ' ');
    
  //  return `uid: ${uid} puid: ${puid} attrs: ${attrs} nodes: ${nodes} next: ${next} sort: ${sort} ${name} value: ${value}`
    
    return ("" + uid + puid + attrs + nodes + next + rel + oldie + newly + sort + name + value)
    
  };

  var showDebugHeaders = function () {
    return '--------------------------------------------------------------------'  + '\n'
         + '     #   UID  PUID ATTRS NODES  NEXT   REL  SORT             NAME            VALUE' + '\n'
         + '--------------------------------------------------------------------'
  };

  // sole defaukts for MWC generator
  var MWC_ALPHA_MULTIPLIER = 982579;
  var MWC_DIGITS_RANGE = 64;  // 64 = A_Za_z0$_-9 keys
  var MWC_KEY_LENGTH = 4;
  var MWC_SEEDS_KEY = '900dCAFE';

  // some defaults for Block Memory POOL
  //const BMP_POOL_SIZE = 10000
  var BMP_POOL_SIZE = 10;
  var BMP_THRESOLD = 0.05;

  /**
   * setup the Blocks Meory Pool index
   * 
   * @param {object} options
   * @returns {object}
   */
  var setup = function (createBlock$$1, clearBlock$$1, options) {
    var mwc = createMWC ( MWC_ALPHA_MULTIPLIER, MWC_DIGITS_RANGE, MWC_KEY_LENGTH ); 
    
    mwc.init( from_string( MWC_SEEDS_KEY ) );
    
    return {
      generator: mwc,  
      watermark: -1,
      size: options.size || BMP_POOL_SIZE,
      thresold: options.thresold || BMP_THRESOLD,
      createBlock: createBlock$$1,
      clearBlock: clearBlock$$1
    }
  };

  /**
   * reallocate blocks pool to make room inside it
   *
   * @param {object} bmp
   */
  var reallocate  = function (bmp) {
    var ref;

    var s = bmp.pool.length;
    var newly = new Array(s);
    
    for(var k = 0; k < bmp.index.size; k++) {
      var generated = (void 0), uid = (void 0);
      
      do {
        generated = bmp.index.generator.next ();
        uid = to_string( generated );
      } while (bmp.lookup.hasOwnProperty(uid)) 
      
      newly[k] = bmp.index.createBlock (uid);
      bmp.index.clearBlock(newly[k]);
      bmp.lookup [uid] = k + s;
    }
      
    // console.log('bmp#reallocate')
    // console.log(bmp.pool.map(b => b.uid).join(' '))
    bmp.index.size += s;

    (ref = bmp.pool).push.apply(ref, newly);
  };

  /**
   * get a block by UID
   *
   * @param {object } bmp - the Blocks Memory Pool
   * @param {uid} string
   *
   */
  var getBlockByUid = function (bmp, uid) {
  //  console.log( '*** getBlockByUid ***' )
  //-  console.log( uid )  
    
    var block = null;
    
    // console.log(bmp)
    
    if(bmp.lookup.hasOwnProperty(uid)) {
      block = bmp.pool[ bmp.lookup[ uid ] ]; 
    } else {
      //if (bmp.index.throws) {
        throw new Error ('block not found @uid=' + uid)
      //}
    }
    
    return block
  };

  /** 
   * find an rmpty block, reallocating blocks if necessary
   *
   * it implies creasing of the watermark level value
   * and could occasionnally produce are reallocation cycle 
   *
   * @param {object } bmp - the Blocks Memory Pool
   * @param {object } bmp - the Blocks Memory Pool
   *
   */
  var getEmptyBlock = function (bmp) {
    // console.log( '*** getEmptyBlock ***' )
    // console.log( bmp )

    var block = null;

    bmp.index.watermark++;

    if (bmp.index.watermark >= bmp.pool.length * (1 - bmp.index.thresold)) {
      reallocate (bmp);
    }

    block = bmp.pool[ bmp.index.watermark ];
    
    // console.log('@/src/domulo/core/bmp')
    // console.log(bmp.index.watermark, bmp.pool.length)
    // console.log(block)
    
    return block
  };

  /** 
   * swap blocks in pool
   *
   * @param {object} bmp
   * @param {string} uid1
   * @param {string} uid2
   */
  var swapBlocks = function (bmp, uid1, uid2) {
    
    // @TODO integrate swap vlock to pool ???
    
    var idx1 = bmp.lookup [uid1];
    var idx2 = bmp.lookup [uid2];
    var temp = bmp.pool[idx1];
    var result = false;
    
    // swap block
    bmp.pool[uid1] = bmp.pool [ uid2 ];
    bmp.pool[uid2] = temp;
    
    // trnaslate lookup bloxks accoredingly
    bmp.lookup [ uid1 ] = idx2;
    bmp.lookup [ uid2 ] = idx1;
    
    result = true;
    
    return result 
  };



  /**
   * release a no-more-used block
   *
   * @param {object} bmp
   * @param {string} uid
   */
  var releaseBlock = function (bmp, uid) {
    var released_block = getBlockByUid(bmp, uid);
    var wmk = bmp.index.watermark;
    var other_uid = bmp.pool[wmk].uid;
   
    bmp.index.clearBlock (released_block); 
    swapBlocks (bmp, uid, other_uid);
    bmp.index.watermark--;
  };

  var showDebug = function (bmp, verbose) {
    var entries = [];
    
    bmp.pool
      .map(function (block, idx) {
        var entry = '';
        
        // console.log(idx + ' ' + block.uid) 
        
        //if (!block) return
        
        if(idx % 10 === 0) {
          entries.push(showDebugHeaders());
        }
     
        entry = idx.toFixed ().padStart (6, ' ') + '\t' 
                + showBlockDebug (block);
        
        entries.push(entry);
      });
    
      entries.push('*****');
    // console.log(Object.keys(bmp.lookup))

    return entries.join('\n')
  };

  /**
   * module exports BMP factory 
   * 
   * @param {Function} createBlock
   * @param {Function} clearBlock
   * @param {object} options
   * @returns {BMPWrapper}
   */
  var createBMP = function (createBlock$$1, clearBlock$$1, options) {
      /** 
      NOTE: lookup UID --> block index in pool 
      
      limits: 
      -  8.4M  lookup allocations in node
      -  17.1  lookup allocations in Firefox
     */
    var pool = [];
    var lookup = {};
    var index = setup (createBlock$$1, clearBlock$$1, options || {});
    
    var bmp = { pool: pool, lookup: lookup, index: index };
    
    return {
      getBlockByUid: function getBlockByUid$1 (uid) { 
        return getBlockByUid (bmp, uid)
      },
      
      getEmptyBlock: function getEmptyBlock$1 (uid) { 
        return getEmptyBlock (bmp)
      },
      
      releaseBlock: function releaseBlock$1 (uid) {
        return releaseBlock (bmp, uid)
      },
      
      showDebug: function showDebug$1 (verbose) {
        return showDebug (bmp, verbose)
      }
    }
  };

  var createRoot = function (bmp, tagname) {
    var block = bmp.getEmptyBlock();
    
    block.sort = BlockSorts.ELEMENT;
    block.name = tagname;
    block.value = '#n/a!';
    
    return block
  };

  var handleAttrs = function (bmp, root, attrs) {
    var lastCreated = null;
    
    Object.keys (attrs).map (function (key, idx) {
      var block = bmp.getEmptyBlock ();
      var value = attrs [key];
      
      // console.log(block)
      
      block.puid = root.uid;
      block.sort = BlockSorts.ATTR;
      block.name = key;
      block.value = value; 
      
      
      if (idx === 0) {
        root.attrs = block.uid; 
      } else {
        lastCreated.next = block.uid;
      }
      
      lastCreated = block;
    });
  };

  var handleNodes = function (bmp, root, nodes) {
    
    var block = null;
    var lastVisited = null;
    
    nodes.map(function (whatever, idx) {
      var ots = ({}).toString.call(whatever);
      
      switch(ots) {
        // subnode is a text-able node
        case '[object String]':
        case '[object Boolean]':
        case '[object Number]':
        case '[object Date]':
          block = bmp.getEmptyBlock ();
          
          block.puid = root.uid;
          block.sort = BlockSorts.TEXT; 
          block.name = '#text!';
          block.value = whatever.toString();

          if (idx === 0) {
            root.nodes = block.uid;
          } else {
            lastVisited.next = block.uid;
          }
          
          lastVisited = block;
        break
        
        // subnode is a subtree ?
        case '[object Object]':
          block = bmp.getBlockByUid(whatever.uid);
          block.puid = root.uid;      

          if (idx === 0) {
            root.nodes = block.uid;
          } else {
            lastVisited.next = block.uid;
          }
          
          lastVisited = block;
          
        break
   
        // subnode is an array of subtrees ?
        case '[object Array]':
          whatever.map (function (entry, widx) { return bmp.getBlockByUid(entry.uid); })
             .map(function (block, bidx) { 
                block.puid = root.uid;

                if (idx === 0 && bidx === 0) {
                  root.nodes = block.uid;
                } else {
                  lastVisited.next = block.uid;
                }

                lastVisited = block;
            
            
             });
        break
      }

    });
    
  };

  var createVNode = function (bmp, tagname, attrs, nodes) {
    var root = createRoot (bmp, tagname);

    handleAttrs (bmp, root, attrs);
    handleNodes (bmp, root, nodes);
    
    return { uid: root.uid }
  };

  var empty = function (bmp) {
    // const emptyBlock = bmp.getEmptyBlock()
    
    // emptyBlock.sort = 'VTREE('
    
    return {
      uid: '0'
    }
  };

  /**
   * collect a list of blocks, given its head block
   * 
   * used for collecting:
   * - attrs
   * - subnodes
   * - deltas for patches
   * 
   * @param {Object} bmp
   * @param {Object} headBlock
   * @returns {Array<Object>}
   */
  var collectList = function (bmp, firstBlockUid) {
    var list = [];
    var blockUid = firstBlockUid;
    
    while (blockUid !== '0') {
      var block = bmp.getBlockByUid (blockUid);
      
      list.push (block);
      blockUid = block.next;
    }
    
    return list
  };

  /**
   * the patch types 
   * @type ENUM
   */
  var DIFF_TYPES = {
    TAG_TO_TAG:    BlockSorts.ELEMENT + '=>' + BlockSorts.ELEMENT,
    TAG_TO_TEXT:   BlockSorts.ELEMENT + '=>' + BlockSorts.TEXT,
    TEXT_TO_TAG:   BlockSorts.TEXT + '=>' + BlockSorts.ELEMENT,
    TEXT_TO_TEXT:  BlockSorts.TEXT + '=>' + BlockSorts.TEXT,
    EMPTY_TO_TEXT: BlockSorts.EMPTY + '=>' + BlockSorts.TEXT,
    TEXT_TO_EMPTY: BlockSorts.TEXT + '=>' + BlockSorts.EMPTY,
    TAG_TO_EMPTY: BlockSorts.ELEMENT + '=>' + BlockSorts.EMPTY,
    EMPTY_TO_TAG: BlockSorts.EMPTY + '=>' + BlockSorts.ELEMENT,
    EMPTY_TO_EMPTY: BlockSorts.EMPTY + '=>' + BlockSorts.EMPTY
   };

  /**
   * get patch types from 2 trees
   
   * @param {object} oldTreeBlock
   * @param {object} newTreeBlock
   * @returns {String}
   */
  var blocksDiffSort = function (oldTreeBlock, newTreeBlock) {
    var lhs = oldTreeBlock.sort; 
    var rhs = newTreeBlock.sort;
   
    return lhs + '=>' + rhs
  };

  /**
   * create a new patch block
   * append it to patches listr
   * 
   * @param {object} bmp
   * @param {object} patch
   * @param {object} params
   * @returns {undefined}
   */
  var createPatchBlock = function (bmp, patch, params) {
    var newPatchBlock = bmp.getEmptyBlock();
    
    // console.log('######### createPatchBlock')
    // console.log (params)
    
    newPatchBlock.sort = params.sort || '#void!';
    // newPatchBlock.rel = params.rel || '#/a!'

    // patching route
    // newPatchBlock.route = params.route && params.route.oldie.join('/') + '!' + params.route.newly.join('/')

    newPatchBlock.route = params.route && [params.route.oldie.join('/'), params.route.newly.join('/')].join('!');

    newPatchBlock.oldie = params.oldie;
    newPatchBlock.newly = params.newly;

    if (newPatchBlock.sort === '#void!') {
      console.log (params);
      // console.log('oldie', oldie)
      //console.log('newly', newly)
      throw new Error ()
    }

    patch.patchBlock.next = newPatchBlock.uid;
    patch.patchBlock = newPatchBlock;
  };

  /**
   * diff two tags blocks
   * 
   * big switching algorithm to determine with patch to apply
   * 
   * @param {type} bmp
   * @param {type} oldTagBlock
   * @param {type} newTagBlock
   * @param {type} patch
   * @returns {undefined}
   */
  var diffTagsBlocks = function (bmp, oldTagBlock, newTagBlock, route, patch) {
    var bds = blocksDiffSort (oldTagBlock, newTagBlock);
    // let sort = BlockSorts.EMPTY

    // console.log('    diff tag blocks: ' + bds)
    // console.log ( oldTagBlock.name + ' ' + newTagBlock.name)
    try {
    switch (bds) {
      
      case DIFF_TYPES.TAG_TO_TAG:
        if (oldTagBlock.name === newTagBlock.name) { return } 
        
  //      sort = BlockSorts.PATCH_UPDATE_NODE,
        createPatchBlock (bmp, patch, {
          sort: BlockSorts.PATCH_UPDATE_NODE,
          oldie: oldTagBlock.uid,
          newly: newTagBlock.uid,
          route: route
        });
      break
      
      case DIFF_TYPES.TAG_TO_TEXT:   
        createPatchBlock (bmp, patch, {
          sort: BlockSorts.PATCH_DELETE_NODE,
          oldie: oldTagBlock.uid,
          newly: null,
          route: route
        });
        
        createPatchBlock (bmp, patch, {
          sort: BlockSorts.PATCH_INSERT_TEXT,
          oldie: null,
          newly: newTagBlock.uid,
          route: route
        });
      break 
      
      case DIFF_TYPES.TEXT_TO_TAG:   
        createPatchBlock (bmp, patch, {
          sort: BlockSorts.PATCH_DELETE_TEXT,
          oldie: oldTagBlock.uid,
          newly: null,
          route: route
        });
        
        createPatchBlock (bmp, patch, {
          sort: BlockSorts.PATCH_INSERT_NODE,
          oldie: null,
          newly: newTagBlock.uid,
          route: route
        });
      
      break
      
      case DIFF_TYPES.TEXT_TO_TEXT:  
        if (oldTagBlock.value === newTagBlock.value) { return } 
        
        createPatchBlock (bmp, patch, {
          sort:  BlockSorts.PATCH_UPDATE_TEXT,
          oldie: oldTagBlock.uid,
          newly: newTagBlock.uid,
          route: route
        });
      break 
      
      case DIFF_TYPES.EMPTY_TO_TEXT: 
        createPatchBlock (bmp, patch, {
          sort: BlockSorts.PATCH_INSERT_TEXT,
          oldie: null,
          newly: newTagBlock.uid,
          route: route
        });
      break 
      
      case DIFF_TYPES.TEXT_TO_EMPTY: 
        createPatchBlock (bmp, patch, {
          sort: BlockSorts.PATCH_DELETE_TEXT,
          oldie: oldTagBlock.uid,
          newly: null,
          route: route
        });
      break 
      
      case DIFF_TYPES.TAG_TO_EMPTY: 
        createPatchBlock (bmp, patch, {
          sort: BlockSorts.PATCH_DELETE_NODE,
          oldie: oldTagBlock.uid,
          newly: null,
          route: route
        });    
      break 
      
      case DIFF_TYPES.EMPTY_TO_TAG: 
        createPatchBlock (bmp, patch, {
          sort: BlockSorts.PATCH_INSERT_NODE,
          oldie: null,
          newly: newTagBlock.uid,
          route: route
        });    
      break 
      
      case DIFF_TYPES.EMPTY_TO_EMPTY: 
        // do nothing ...
      break 
    }
    
    } catch (error)  {
      console.log (bds);
      console.log ('oldTagBlock', oldTagBlock);
      console.log ('newTagBlock', newTagBlock);
      throw error
    }
  };

  /**
   * attributes blocks diffing
   * 
   * @param {type} bmp
   * @param {type} oldTagBlock
   * @param {type} newTagBlock
   * @param {type} patch
   * @returns {undefined}
   */
  var diffAttrsBlocks = function (bmp, oldieTagBlock, newlyTagBlock, route, patch) {
    var oldieAttrsList = collectList (bmp, oldieTagBlock.attrs);
    var newlyAttrsList = collectList (bmp, newlyTagBlock.attrs);
    var collected = new Set();
    
    oldieAttrsList.map (function (oldie, oidx) {
      newlyAttrsList.map (function (newly, nidx) {
        if (oldie.name === newly.name) {
          collected.add (oldie.name);
          
          createPatchBlock (bmp, patch, {
            sort: BlockSorts.PATCH_UPDATE_ATTR,
            oldie: oldie.uid,
            newly: newly.uid,
            route: route
          });
        }
      });    
    });

    oldieAttrsList.map(function (oldie, oidx) {
      if (false === collected.has(oldie.name)) {
        createPatchBlock (bmp, patch, {
          sort: BlockSorts.PATCH_DELETE_ATTR,
          oldie: oldie.uid,
          newly: newly.uid,
          route: route
        });      
      }
    });
    
  };


  /*/*
   * zip two arrays
   * 
   * @param {Array} arr0
   * @param {Array} arr1
   * @returns {Array}
   */
  var zip = function (arr0, arr1) {
    if(arr0.length >= arr1.length) {
      return arr0.map (function (x0, idx0) { return [x0, arr1[idx0]]; })
    } else {
      return arr1.map (function (x1, idx1) { return [arr0[idx1], x1]; })
    }
  };


  var diffNodesBlocks = function (bmp, oldieTagBlock, newlyTagBlock, route, patch) {
    var oldieNodesList = collectList (bmp, oldieTagBlock.nodes);
    var newlyNodesList = collectList (bmp, newlyTagBlock.nodes);
    var olen = oldieNodesList.length;
    var nlen = newlyNodesList.length;
    
    zip (oldieNodesList, newlyNodesList).map(function (zipped, idx) {
       var oldie = route.oldie.slice (0);
       var newly = route.newly.slice (0);
       var nodeRoute = { oldie: oldie, newly: newly };
      
       if (olen > nlen) {
         if (idx < nlen) {
           newly.push (idx);
         } else {
           oldie.push (idx - nlen);
         }
       } else {
         if (idx < olen) {
           oldie.push (idx);
         } else {
           newly.push (idx - olen);
         }       
       }
      
      diffTrees (bmp, zipped[0], zipped[1], nodeRoute, patch);
    });
  };

  var diffTrees = function (bmp, oldTree, newTree, route, patch) {
    var oldTreeBlock;
    var newTreeBlock;

    console.log ('===== diffTrees =====');
    console.log (oldTree);
    console.log (newTree);

    if (oldTree && oldTree.uid !== '0') {
      oldTreeBlock = bmp.getBlockByUid (oldTree.uid);    
    } else {
      oldTreeBlock = bmp.getEmptyBlock ();
    }

    if (newTree && newTree.uid !== '0') {
      newTreeBlock = bmp.getBlockByUid (newTree.uid);    
    } else {
      newTreeBlock = bmp.getEmptyBlock ();
    }

    diffTagsBlocks (bmp, oldTreeBlock, newTreeBlock, route, patch);
    diffAttrsBlocks (bmp, oldTreeBlock, newTreeBlock, route, patch);
    diffNodesBlocks (bmp, oldTreeBlock, newTreeBlock, route, patch);
  };

  var diff = function (bmp, oldTree, newTree) {
    var patchBlock = bmp.getEmptyBlock();
    var route = { oldie: [0], newly: [0] };
    var patch = {
      patchBlock: patchBlock,
    };
    
    patchBlock.sort = BlockSorts.PATCH;
    newTree.container = oldTree.container;
    
    //diffTrees (bmp, oldTree, newTree, route, patch)
    diffTrees (bmp, oldTree, newTree, route, patch);

    return { 
      name: 'PATCH',
      uid: patchBlock.uid,
      oldie: oldTree && oldTree.uid,
      newly: newTree && newTree.uid,
      container: oldTree.container
    }
  };

  var insertNode = function (root, infos) {
    var newNode = document.createElement (infos.newlyBlock.name);
    
    root.appendChild (newNode);
  };

  var updateNode = function (root, infos) {
    var oldieNode = infos.oldieNode;
    var newlyNode = document.createElement (infos.newlyBlock.name);
    
    root.replaceChild (newlyNode, oldieNode);
  };

  var deleteNode = function (root, infos) {
    console.log ('delete node');
    console.log (root);
    console.log (infos.oldieNode  );

    //const chidx = infos.oldieDelta [ infos.oldieDelta.length - 1 ]
    //const oldNode = root.childNodes [ chidx ]
    var oldieNode = infos.oldieNode;
    
    root.removeChild (oldieNode);  
  };

  var insertText = function (root, infos) {
    var newNode = document.createTextNode (infos.newlyBlock.value);
    
    root.appendChild (newNode);
  };

  var updateText = function (root, infos) {
    var oldieNode = infos.oldieNode;
    var newlyNode = document.createTextNode (infos.newlyBlock.value);
    
    root.replaceChild (newlyNode, oldieNode);  
  };

  var deleteText = function (root, infos) {
    console.log ('delete node');
    console.log (root);
    console.log (infos);

    //const chidx = infos.oldieDelta [ infos.oldieDelta.length - 1 ]
    //const oldNode = root.childNodes [ chidx ]
    var oldieNode = infos.oldieNode;
    
    root.removeChild (oldieNode);  
  };

  var setAttr = function (root, infos) {
    var name = infos.newlyBlock.name;
    var value = infos.newlyBlock.value;

    if (name === 'className') {
      root.setAttribute ('class', value);
    } else {
      root.setAttribute (name, value);
    }
  };

  var discoverNodes = function (root, infos) {
    var oldieDelta = infos.oldieDelta;
    var newlyDelta = infos.newlyDelta;  
    
    var iterate = function (route, nav, shift) {
      console.log ('iterate route:'  + route.join('/'));
      var children = null;
      var level = shift;
      
      if (shift === 1) {
        nav.oldieNode = nav.root;
        nav.root = nav.root.parentNode;
        
        return 
      }
      
      while (level + shift < route.length) {
        children = nav.root.childNodes;
        
        if (route [level] < children.length) {
          nav.root = children [ route [level] ];
          nav.oldieNode = nav.root.childNodes [ route [level + 1 ] ];
        }
        
        level++;
      }
    };
    
    var shift = 0;
    var nav = { root: root, oldieNode: null };
    
    if (oldieDelta.length > 1) {
      iterate (oldieDelta, nav, shift);
      shift = 1;
    } else {
      shift = 0;
    }
    
    iterate (newlyDelta, nav, shift);

    console.log ('discoverNopdes results with (root, oldieNode)', nav.root, nav.oldieNode);

    return nav
  };

  var patchDOM = function (root, infos, options) {
    console.log ('### patch real DOM ###');
    
    var discovery = discoverNodes (root, infos);
   
    root = discovery.root;
    infos.newlyNode = discovery.newlyNode;
    infos.oldieNode = discovery.oldieNode;
    
    switch (infos.ops) {
      case BlockSorts.PATCH_INSERT_NODE: 
        insertNode (root, infos);
      break

      case BlockSorts.PATCH_INSERT_TEXT: 
        insertText (root, infos);
      break

      case BlockSorts.PATCH_INSERT_ATTR: 
        setAttr (root, infos);
      break  

      case BlockSorts.PATCH_UPDATE_NODE: 
        updateNode (root, infos);
      break

      case BlockSorts.PATCH_UPDATE_TEXT: 
        updateText (root, infos);
      break

      case BlockSorts.PATCH_UPDATE_ATTR: 
        setAttr (root, infos);
      break  
    
      case BlockSorts.PATCH_DELETE_NODE: 
        deleteNode (root, infos);
      break

      case BlockSorts.PATCH_DELETE_TEXT: 
        deleteText (root, infos);
      break

      case BlockSorts.PATCH_DELETE_ATTR: 
      break  
    }
    
  };

  var collectDeltaInfos = function (bmp, deltaRootBlock) {
    var deltas = [];
    var deltaBlockUid =  deltaRootBlock.next; 
    var rank = 0;
    

    while (deltaBlockUid !== '0') {
      var deltaBlock = bmp.getBlockByUid (deltaBlockUid);

      var parts = deltaBlock.route.split ('!');
      var oldieDelta = parts[0].split ('/').map(function (s) { return parseInt(s); });
      var newlyDelta = parts[1].split ('/').map(function (s) { return parseInt(s); });
      
      var infos = {
        ops: deltaBlock.sort,
        oldieDelta: oldieDelta,
  //      oldieRoute: [0],
        oldieBlock: deltaBlock.oldie && bmp.getBlockByUid (deltaBlock.oldie),
        newlyDelta: newlyDelta,
  //      newlyRoute: [0],
        newlyBlock: deltaBlock.newly &&   bmp.getBlockByUid (deltaBlock.newly),
  //      level: 0,
  //      chidx: 0,
        rank: rank
      };

      
      deltas.push (infos);
      rank++;
      deltaBlockUid = deltaBlock.next;
    }  

    return deltas   
  };

  var INS_OPS = [
      BlockSorts.PATCH_INSERT_NODE,
      BlockSorts.PATCH_INSERT_TEXT ];


  var DEL_OPS = [
      BlockSorts.PATCH_DELETE_NODE,
      BlockSorts.PATCH_DELETE_TEXT
      // BlockSorts.PATCH_DELETE_ATTR
  ];

  var sortDeltaBlocksList = function (dbl) {
    
    dbl.sort (function (a, b) {
      var a_is_insert = INS_OPS.indexOf(a.ops) > -1;
      var b_is_insert = INS_OPS.indexOf(b.ops) > -1;    
      var a_is_delete = DEL_OPS.indexOf(a.ops) > -1;
      var b_is_delete = DEL_OPS.indexOf(b.ops) > -1;
      
      if (a_is_delete && b_is_delete) {
        // both deletions: revert sorting order
        if (a.rank < b.rank) {
          return 1
        } else if(a.rank > b.rank) {
          return -1
        } else {
          return 0
        }
        
      } 
  /*    
      else if (a_is_insert) {
        // only a deletes ? a is smaller
        return -1
      } else if (b_is_insert) {
        // only b deletes ? b is lsmaller
        return 1      
    
      } else if (a_is_delete) {
        // only a deletes ? a is smaller
        return -1
      }
      else if (b_is_delete) {
        // only b deletes ? b is lsmaller
        return 1      
      }
      */
        else {
        // NO DLETIONS AT ALL ? preserve order
        if (a.rank < b.rank) {
          return -1
        } else if(a.rank > b.rank) {
          return 1
        } else {
          return 0
        }
      }
    });
  };

  var rebaseDeltasList = function (dbl) {
    
    console.log ('### rebase deltas list ###');
    
    var alter = function (src ,tgt, arrayName, amount) {
      var position = tgt[arrayName].length - 1;
      var i = 0;
      
      if(src[arrayName].length !== tgt[arrayName].length) { return }
          
      while (src[arrayName][i] ===  tgt[arrayName][i]) {
        if (i === position && tgt[arrayName][i] > 0) 
          { tgt[arrayName][i] += amount; }
        
        if (i > src[arrayName].length) { break }
        
        i++; 
      }
    };
    
    for (var s = 0; s < dbl.length; s++) {
      var src = dbl [s];
      var ops_is_delete = DEL_OPS.indexOf(src.ops) > -1;
      var ops_is_insert = INS_OPS.indexOf(src.ops) > -1;
      var route = src.oldieDelta.join('/') + '!' + src.newlyDelta.join('/');


   //   console.log (src.ops, route)
      
      for (var t = s + 1; t < dbl.length; t++) {
        var tgt = dbl [t];
        
        if (ops_is_delete) {
          alter (src, tgt, 'oldieDelta', -1);
        }
        
        if (ops_is_insert) {
          alter (src, tgt, 'newlyDelta', 1);
        }
      }
    }
  };

  var showDeltaBlocksList = function (dbl) {
    var results = [];
    
    dbl.map(function (di) {
      var oldie = di.oldieBlock && di.oldieBlock.name;
      var newly = di.newlyBlock && di.newlyBlock.name;
      var route = di.oldieDelta.join('/') + '!' + di.newlyDelta.join('/');
      
      results.push(((di.rank) + " " + (di.ops) + " oldie: " + oldie + " newly: " + newly + " " + route));
    });
    
    return results.join ('\n')
  };


  /**
   * the patching algorithm
   * 
   * given a list of deltas, patches the real DOM
   * 
   * @param {Object} bmp
   * @param {Object} deltas
   * @param {Object} options
   * @returns {undefined}
   */
  var patch = function (bmp, deltas, options) {
    var root = deltas.container;
    var deltasInfosList = collectDeltaInfos (bmp, bmp.getBlockByUid (deltas.uid));
    
    console.log ('===== patching real DOM... =====');
    console.log ('root element patched is:' , root);

    console.log ('BEFORE SORTING AND REBASING');
    console.log (showDeltaBlocksList (deltasInfosList) );

    sortDeltaBlocksList (deltasInfosList);

    console.log ('AFTER sorting, BEFORE rebasing');
    console.log (showDeltaBlocksList (deltasInfosList) );
    
    rebaseDeltasList (deltasInfosList);

    console.log ('AFTER SORTING AND REBASING');
    console.log (showDeltaBlocksList (deltasInfosList) );
    
    deltasInfosList.map (function (infos, rank) {
      patchDOM (root, infos, options);
    });
  };

  var mount = function (bmp, vtree, container) {
    //const treeBlock = bmp.getBlockByUid (vtree.uid)
    var deltas = diff (bmp, empty (bmp), vtree);

    deltas.container = container;
    vtree.container = container;
    
    patch (bmp, deltas, { remebmer:  false });
  };

  // list of orphaned (standalone) HTML tags
  var ORPHANED_TAGS = 'br,hr,img,input'.split(',');

  /**
   * get the attrs blocks list
   * for a given tag block in Blocck Memory Pool
   * 
   * @param {Object} bmp
   * @param {Ovject} block
   * @returns {Array|getAttrsBlocksList.list}
   */
  var getAttrsBlocksList = function (bmp, block) {
    var list = [];
    var attrBlock = null;
    var attrBlockUID = block.attrs; 
    
    while (attrBlockUID !== '0') {
      attrBlock = bmp.getBlockByUid(attrBlockUID);
      list.push (attrBlock);
      attrBlockUID = attrBlock.next;
    }
    
    return list
  };


  var getNodesBlocksList = function (bmp, block) {
    var list = [];
    var nodeBlock = null;
    var nodeBlockUID = block.nodes; 

    //console.log ('* getNodesBlocksList * ')
      
    while (nodeBlockUID !== '0') {
      nodeBlock = bmp.getBlockByUid(nodeBlockUID);
      list.push (nodeBlock);
      nodeBlockUID = nodeBlock.next;
    }
    
    return list

  };


  var renderOpeningTag = function (bmp, tagBlock, attrsBlocks, options) {
    var text = "" + (tagBlock.name);
    var attrsText = attrsBlocks.reduce(function (acc, ab) { return acc + ' ' + ab.name + '=' + '"' + ab.value + '"'; }, '');
    
    
    text += attrsText === '' ? '' : ' ' + attrsText;
    
    if(ORPHANED_TAGS.indexOf(tagBlock.name) > -1) {
      text = '<' + text  + '/>';
    } else {
      text = '<' + text + '>';
    }
    
    options.head.push(text);
    
    return text
  };

  var renderNodes = function (bmp, tagBlock, nodesBlock, options) {
    var text = '';
    //let nodesText = nodesBlocks.reduce((acc, nb) => acc + ' ' + ab.name + '=' + '"' + ab.value + '"', '')
    nodesBlock.reduce(function (acc, nb, nbidx) {
      // console.log('nbidx :' + nbidx )
      renderTagBlock(bmp, nb, options);
    }, '');
    
    // options.head.push(text)
    
    return text  
  };


  var renderClosingTag = function (bmp, tagBlock, attrsBlocks, options) {
    var text = '';
    
    if(ORPHANED_TAGS.indexOf(tagBlock.name) > -1) {
      text =  '\n';
    } else {
      text =  "</" + (tagBlock.name) + ">";
    }
    
    // BUGFIX closing tags order
    //options.tail.push  (text)
    options.head.push  (text);
    
    return text
  };

  var renderTextBlock = function (bmp, textBlock, options) {
    var text = textBlock.value; 
    
    options.head.push (text);
    
    return text
  };

  var renderTagBlock = function (bmp, tagBlock, options) {
    var attrsBlocksList = getAttrsBlocksList(bmp, tagBlock);
    var nodesBlocksList = getNodesBlocksList(bmp, tagBlock);
    
  //  console.log ( 'renderTagBlock name=%s attrs=%d nodes=%s', tagBlock.name, attrsBlocksList.length, nodesBlocksList.length)

  //  console.log(tagBlock.sort)

    if (tagBlock.sort === BlockSorts.ELEMENT) {
      // opening tag
      renderOpeningTag (bmp, tagBlock, attrsBlocksList, options);
    
      // render nodes if any
      renderNodes (bmp, tagBlock, nodesBlocksList, options);
    
      // clsoing tag
      renderClosingTag (bmp, tagBlock, attrsBlocksList, options);

    }

    if (tagBlock.sort === BlockSorts.TEXT) {
      renderTextBlock (bmp, tagBlock, options);
    }
  };

  /**
   * give a string representation of a VTree
   * useful for debugging purpose
   * 
   * @param {Object} bmp
   * @param {Object} tree
   * @param {Ovject} options
   * @returns {String}
   */
  var render = function (bmp, tree, options) {
    var tagBlock = bmp.getBlockByUid(tree.uid);
    
    options.head = [];
    options.tail = [];
    renderTagBlock (bmp, tagBlock, options);
       
    return options.head.join('\n') + '\n' + options.tail.join('\n')
  };

  console.log('@/src/domulo/index');

  /**
   * domulo main wrapper
   * 
   * options are:
   * - seed: a 8-digits string (example: 'GoodCafe'
   * 
   * @param {object} options
   * @returns {wrap.wrapper}
   */
  var wrap = function (options) {
    var bmp = createBMP(createBlock, clearBlock, options);
    
    var wrapper = {
      h: function h (tagname, attrs) {
        var children = [], len = arguments.length - 2;
        while ( len-- > 0 ) children[ len ] = arguments[ len + 2 ];

        console.log('*** wrapped.h ***');
        
        return createVNode (bmp, tagname, attrs, children)
      },
      
      empty: function empty$1 () {
        return empty ( bmp )
      },
      
      mount: function mount$1 (tree, rootElement) {
        console.log('*** wrapped.mount ***');
        
        mount (bmp, tree, rootElement);
      },
     
      diff: function diff$1 (oldTree, newTree) {
        return diff(bmp, oldTree, newTree )
      },
      
      patch: function patch$1 (deltas, options) {
        console.log('*** wrapped.mount ***');
        
        patch (bmp, deltas, options);
      },
          
      render: function render$1 (tree, options) {
        return render(bmp, tree, options || {}  )
      },
      
      showDebug: function showDebug(verbose) {
        console.log(bmp.showDebug(verbose));
      }
    };
    
    return wrapper
  };

  exports.wrap = wrap;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
