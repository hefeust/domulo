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
    'PATCH_DELETE_TEXTR': 'PDT',
    'PATCH_INSERT_ATRR': 'PIA',
    'PATCH_UPDATE_ATTR': 'PUA',
    'PATCH_DDLETE_ATTR': 'PDA'
  };

  var clearBlock = function (block) {
    block.puid = '0';
    block.sort = BlockSorts.EMPTY;
    block.next = '0';
    block.attrs = '0';
    block.nodes = '0';
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
    var sort = block.sort.padStart(6, ' ');
    var name = block.name.padStart(20, ' ');
    var value = block.value.padStart(20, ' ');
    
  //  return `uid: ${uid} puid: ${puid} attrs: ${attrs} nodes: ${nodes} next: ${next} sort: ${sort} ${name} value: ${value}`
    
    return ("" + uid + puid + attrs + nodes + next + sort + name + value)
    
  };

  var showDebugHeaders = function () {
    return '--------------------------------------------------------------------'  + '\n'
         + '     #   UID  PUID ATTRS NODES  NEXT  SORT             NAME            VALUE' + '\n'
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
    block.value = '.';
    
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

  var mount = function (bmp, tree, containingELeement) {
    var vtreeBlock = bmp.getEmptyBlock();

    vtreeBlock.sort = BlockSorts.VTREE; 
    vtreeBlock.next = tree.uid;
    
    
    return vtreeBlock
  };

  var ORPHANED = ['img', 'br', 'hr', 'link', 'input', 'meta'];

  var renderAttrs  = function (bmp, block, props) {
    var results = [];
    var nextUID = block.attrs; 
    
    while (nextUID !== '0') {
  //    console.log(nextUID)
      
      var attrBlock = bmp.getBlockByUid(nextUID);
      
  //    console.log(attrBlock)
      
      results.push(attrBlock.name + '=' + '"' + attrBlock.value + '"');
      nextUID = attrBlock.next;
    }
    
    return results.join(' ')
  };


  var renderNodes = function (bmp, block, props) {
    var results = [];
    var nextUID = block.nodes; 
    
    console.log('RenderNode: uid: %s name: %s', block.uid, block.name);
    
    while (nextUID !== '0') {
      var nodeBlock = bmp.getBlockByUid(nextUID);
      
      if(nodeBlock.sort === BlockSorts.TEXT) {
        results.push (nodeBlock.value);
      } else {
        results.push(renderTag(bmp, nodeBlock, props));
      }
      
      nextUID = nodeBlock.next;
    }
    
    return results.join('\n')
  };

  var renderTag = function (bmp, block, props) {
    // const block = bmp.getBlockByUid(tagUID)
    var tagname = block.name;
    var attrs = renderAttrs(bmp, block, props);
    var nodes = renderNodes(bmp, block, props);
    
    var result = '';

    console.log('RenderTag name: %s', block.name);
    
    if(ORPHANED.indexOf(tagname) > -1) {
      result = "<" + tagname + " " + attrs + " />";
    } else {
      result = "<" + tagname + " " + attrs + ">\n " + nodes + "\n </" + tagname + ">";
    }
    
    return result
  };

  var render = function (bmp, tree, props) {
    var root = bmp.getBlockByUid(tree.uid);
    
    return renderTag (bmp, root, props)
  };

  var blocksDiffSort = function (oldTreeBlock, newTreeBlock) {
    var lhs = oldTreeBlock ? oldTreeBlock.sort : '?'; 
    var rhs = newTreeBlock ? newTreeBlock.sort : '?';
   
    return lhs + ':' + rhs
  };

  var createDiffBlock = function (bmp, wrappedPatch, params) {
    var diffBlock = bmp.getEmptyBlock();

    diffBlock.sort = params.sort;
    diffBlock.puid = params.puid; 
    diffBlock.name = params.name;
    diffBlock.value = params.value;
    

    wrappedPatch.patchBlock.next = diffBlock.uid;
    wrappedPatch.patchBlock = diffBlock;
   
    return diffBlock
  };

  var diffTags = function (bmp, oldTreeBlock, newTreeBlock, wrappedPatch) {
    var bds = blocksDiffSort(oldTreeBlock, newTreeBlock);
    // let patchBlock = null
    
    switch (bds) {
      
      case (BlockSorts.ELEMENT + ':' + BlockSorts.ELEMENT):
          if (oldTreeBlock.name !== newTreeBlock.name) {
            createDiffBlock(bmp, wrappedPatch, {
              sort: BlockSorts.PATCH_UPDATE_NODE,
              puid: oldTreeBlock.uid,
              name: newTreeBlock.name
            });
          }
        break
        
      case (BlockSorts.ELEMENT + ':' + BlockSorts.TEXT):
          createDiffBlock (bmp, wrappedPatch, {
            sort: BlockSorts.PATCH_DELETE_NODE,
            puid: oldTreeBlock.uid
          });
          
          createDiffBlock (bmp, wrappedPatch, {
            sort: BlockSorts.PATCH_INSERT_TEXT,
            puid: oldTreeBlock.uid,
            value: newTreeBlock.value
          });        
        break
      case (BlockSorts.TEXT + ':' + BlockSorts.ELEMENT):
          createDiffBlock (bmp, wrappedPatch, {
            sort: BlockSorts.PATCH_DLEETE_TEXT,
            puid: oldTreeBlock.uid 
          });
          
          createDiffBlock (bmp, wrappedPatch, {
            sort: BlockSorts.PATCH_INSERT_NODE,
            puid: oldTreeBlock.uid,
            name: newTreeBlock.name  
          });
        break      
    }
  };

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

  var diffAttrs = function (bmp, oldTreeBlock, newTreeBlock, wrappedPatch) {
    
  //  console.log('   * diffAttrs * ')
  //  console.log('old:\t' + showBlockDebug(oldTreeBlock))
  //  console.log('new:\t' + showBlockDebug(newTreeBlock))
    
    var oldAttrsList = getAttrsBlocksList (bmp, oldTreeBlock);
    var newAttrsList = getAttrsBlocksList (bmp, newTreeBlock);
    var collected = new Set();
    
    oldAttrsList.map (function (oldAttrBlock) {
      
      newAttrsList.map(function (newAttrBlock) {
        
        if(oldAttrBlock.name === newAttrBlock.name) {
          collected.add (oldAttrBlock.name);
          
          if (oldAttrBlock.value !== newAttrBlock.value) {
            createDiffBlock (bmp, wrapeedPatch, {
              sort: BlockSorts.PATCH_UPDATE_ATTR,
              puis: oldAttrBlock.uid,
              name: oldAttrBlock.name,
              value: newAttrBlock.value
            });
          }
        }
      });
    });
    
    oldAttrsList.map(function (oldAttrBlock) {
      if (! collected.has(oldAttrBlock.name)) {
        createDiffBlock (bmp, wrapeedPatch, {
          sort: BlockSorts.PATCH_DELETE_ATTR,
          puis: oldAttrBlock.uid,
          name: oldAttrBlock.name
   //       value: newAttrBlock.value
       });      
      }
    });
    
    newAttrsList.map(function (newAttrBlock) {
      if (! collected.has(newAttrBlock.name)) {
        createDiffBlock (bmp, wrapeedPatch, {
          sort: BlockSorts.PATCH_INSERT_ATTR,
          //puid: oldAttrBlock.uid,
          name: newAttrBlock.name,
          value: newAttrBlock.value
       });      
      }
    });
  };


  var getNodesBlocksList = function (bmp, block) {
    var list = [];
    var nodeBlock = null;
    var nodeBlockUID = block.nodes; 
    
    while (nodeBlockUID !== '0') {
      nodeBlock = bmp.getBlockByUid(nodeBlockUID);
      list.push (nodeBlock);
      nodeBlockUID = nodeBlock.next;
    }
    
    return list};

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
      return arr1.map (function (x1, idx1) { return [arr0[idx1]]; }, x1)
    }
  };

  var diffNodes = function (bmp, oldTreeBlock, newTreeBlock, patchWrapper) {
  //  console.log ('   * diffNodes *')
  //  console.log ( showBlockDebug (oldTreeBlock))
  //  console.log ( showBlockDebug (newTreeBlock))
    
    var oldNodesList = getNodesBlocksList (bmp, oldTreeBlock); 
    var newNodesList = getNodesBlocksList (bmp, newTreeBlock); 
    
    // console.log ('   * diffNodes *')
    
    zip (oldNodesList, newNodesList).map(function (entry) {
      diffTags (entry[0], entry[1]);
    });
  };

  /**
   * diff two trees inside BMP
   * 
   * 
   * @param {BlocksMemoryPool} bmp
   * @param {Object} oldTree
   * @param {Object} newTree
   * @returns {Object} diff wrapper in BMP
   */
  var diff = function (bmp, oldTree, newTree) {

     var oldTreeBlock = bmp.getBlockByUid (oldTree.uid);
     var newTreeBlock = bmp.getBlockByUid (newTree.uid);
     var patchBlock = bmp.getEmptyBlock();
     var wrappedPatch = { patchBlock: patchBlock };
     
     patchBlock.sort = BlockSorts.PATCH;
     
  //   console.log ('=== diff ===')
  //   console.log('old:\t' + showBlockDebug(oldTreeBlock))
  //   console.log('new:\t' + showBlockDebug(newTreeBlock))
     
     diffTags (bmp, oldTreeBlock, newTreeBlock, wrappedPatch);
     diffAttrs(bmp, oldTreeBlock, newTreeBlock, wrappedPatch);
     diffNodes(bmp, oldTreeBlock, newTreeBlock, wrappedPatch);

     return { name: 'patch', uid: patchBlock.uid }
  };

  console.log('@/test/domulo/app/wrap');

  var wrap = function (options) {
    var bmp = createBMP(createBlock, clearBlock, options);
    
    var wrapper = {
      h: function h (tagname, attrs) {
        var children = [], len = arguments.length - 2;
        while ( len-- > 0 ) children[ len ] = arguments[ len + 2 ];

        console.log('*** wrapped.h ***');
        
        return createVNode (bmp, tagname, attrs, children)
      },  
      
      mount: function mount$1 (treeUID, containingELement) {
        console.log('*** wrapped.mount ***');
        
        mount (bmp, treeUID, containingElement);
      
      },
      
      showDebug: function showDebug(verbose) {
        console.log(bmp.showDebug(verbose));
      },
      
      diff: function diff$1 (oldTreeBlock, newTreeBlock) {
        return diff(bmp, oldTreeBlock, newTreeBlock )
      },
      
          
      render: function render$1 (tree, props) {
        return render(bmp, tree, props)
      }
    };
    
    // setup (options)
    
    return wrapper
  };

  exports.wrap = wrap;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
