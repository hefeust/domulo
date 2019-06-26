(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}(function () { 'use strict';

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
    TEXT: 'T'
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
    bmp.index.size *= 2;

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
    // console.log( '*** getBlockByUid ***' )
    // console.log( bmp )  
    
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
            // .filter(b => b.sort !== BlockSorts.EMPTY)
      .map(function (block, idx) {
        if(idx % 10 === 0) {
          entries.push(showDebugHeaders());
        }
     
        entries.push(idx.toFixed().padStart(6, ' ') + showBlockDebug(block));
      });
    
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
      
      mount: function mount (treeUID, containingELement) {
        console.log('*** wrapped.mount ***');
      
      },
      
      showDebug: function showDebug(verbose) {
        console.log(bmp.showDebug(verbose));
      },
      
      render: function render$1 (tree, props) {
        return render(bmp, tree, props)
      }
    };
    
    // setup (options)
    
    return wrapper
  };

  var domulo = wrap({ key: 'peaceful '});

  var TodoItem = function (props) {
    return domulo.h('li', { className: 'todo-item' },
      domulo.h('p', {}, 
        domulo.h('span', {}, props.title),
        domulo.h('span', {}, props.done)
      )
    )
  };

  var TodoList = function (props) {
    return domulo.h('section', { className: 'todo-list'},
      domulo.h('h1', {}, 'Todo List items'),
      domulo.h('ul', {}, 
        props.todos.map(function (todo) { return TodoItem(todo); })
      )
    )
  };

  var props = {
    todos:  [
      { title: 'todo-1', priority: 1, done: false },
      { title: 'todo-2', priority: 5, done: false },
      { title: 'todo-3', priority: 4, done: true },
      { title: 'todo-4', priority: 2, done: false },
      { title: 'todo-5', priority: 3, done: true }
    ]
  };

  var tree = TodoList (props);

  console.log(domulo.showDebug(tree));
  console.log(domulo.render (tree ));

}));
