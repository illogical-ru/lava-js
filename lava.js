/*!
 * https://github.com/illogical-ru/lava-js
 *
 * Copyright 2015 illogical
 * Released under the MIT license
 */

var lava = function( window, undefined ) {

    "use strict";

    var document  =  window.document;


    //  types

    function type (obj) {

	if      ( obj === undefined ) return "Undefined";
	else if ( obj === null      ) return "Null";

	return  Object	.prototype
			.toString.call(obj)
			.replace( /^\[object\s(\w+)\]$/, "$1" );
    }


    function isNull    (obj) {

	return          obj  == undefined;
    }

    function isBoolean (obj) {

	return     type(obj) == "Boolean";
    }

    function isVal     (obj) {

	var name = type(obj);

	return	   name      == "Number"
		|| name      == "String";
    }

    function isString  (obj) {

	return     type(obj) == "String";
    }

    function isWord    (obj) {

	return	     isString (obj)
		&& ! /\s/.test(obj);
    }

    function isArray   (obj) {

	var name = type(obj);

	return	   (   !!   obj
		    && obj        !==  window
		    && obj.length === +obj.length )
		&& (   name        ==  "Array"
		    || name        ==  "Arguments"
		    || !!   obj.item
		    ||    ( obj instanceof  api )
		    || has( obj,       "callee" ) );
    }

    function isObj     (obj) {

	return	   !!           obj
		&& !  isBoolean(obj)
		&& !  isVal    (obj);
    }

    function isFn      (obj) {

	return     type(obj) == "Function";
    }

    function isRegExp  (obj) {

	return     type(obj) == "RegExp";
    }

    function isNode    (obj) {

	return	   obj
		&& obj.getElementsByTagName
		&& obj.nodeType
		|| false;
    }


    //  util

    function has ( obj, key ) {

	if ( isNull(obj) ) return false;

	return  Object	.prototype
			.hasOwnProperty.call( obj, key );
    }

    function extend (obj) {

	if ( isObj(obj) )

	    for ( var i = 0; ++i < arguments.length; ) {

		var  el = arguments[i];

		for ( var j in el ) obj[j] = el[j];
	    }

	return obj;
    }

    function merge (obj) {

	if ( isObj(obj) )

	    for ( var i = 0; ++i < arguments.length; ) {

		var  el = arguments[i];

		if  ( ! isArray(el) ) el = [el];

		for ( var j = 0; j < el.length; j++ ) {

		    obj.length = +obj.length || 0;

		    obj[obj.length++] = el[j];
		}
	    }

	return obj;
    }

    function copy ( obj, src, keys ) {

	if ( isObj(obj) && isObj(src) )

	    each( keys, function( i, key ) {

		if ( key in src ) obj[key] = src[key];
	    });

	return obj;
    }

    var expand = function() {

	var id = 'lava_' + +( new Date );

	return function( obj, key ) {

	    if ( ! isObj (obj) )  return;

	    if ( ! isNull(key) )

		return	   obj[id]
			&& obj[id]()[key];

	    obj[id] = obj[id] || function() {

		var data = {};

		return function expand() {

		    obj  = null;

		    return data;
		}

	    }();

	    return obj[id]();
	}

    }();

    function exists ( data, val ) {

	var    index = each( data, function( i, el ) {

	    if ( el === val ) return i;
	});

	return isNull(index) ? -1 : index;
    }

    function unique (data) {

	var    uniq = [];

	each(  data, function( i, val ) {

	    if ( !~ exists( uniq, val ) ) uniq.push(val);
	});

	return uniq;
    }


    //  loop

    function each ( data, fn ) {

	if ( isNull(data) ) return;

	var end,
	    i    = 0,

	    walk = function(val) {

		end = fn.call( val, i, val, data );

		return ! isNull(end);
	    }

	if      ( isArray(data) ) {

	    for ( ; i < data.length; i++ )

		if (                   walk(data[i]) )

		    break;
	}
	else if ( isObj  (data) ) {

	    for ( i in data )

		if ( has( data, i ) && walk(data[i]) )

		    break;
	}
	else                           walk(data   );

	return end;
    }

    function map ( data, fn ) {

	var    roll = [];

	each(  data, function( i, val ) {

	    val = fn.call( this, i, val, data );

	    if ( ! isNull(val) ) merge( roll, val );
	});

	return roll;
    }

    function grep ( data, fn, invert ) {

	var    roll = [];

	each(  data, function( i, val ) {

	    if ( ! invert ^ ! fn.call( this, i, val, data ) )

		roll.push(val);
	});

	return roll;
    }


    //  text

    function trim       (data) {

	if ( !  isVal(data) )	 return "";

	return String(data)	.replace( /^\s+/gm, ""   )
				.replace( /\s+$/gm, ""   );
    }

    function escapeHTML (data) {

	if ( !  isVal(data) )	 return "";

	return String(data)	.replace( /&/g, "&amp;"  )
				.replace( /'/g, "&#39;"  )
				.replace( /"/g, "&quot;" )
				.replace( /</g, "&lt;"   )
				.replace( />/g, "&gt;"   );
    }

    function escapeRE   (data) {

	if ( !  isVal(data) )	 return "";

	return String(data)	.replace(

	    /([-$()*+.?\[\\\]^{|}])/g, "\\$1"
	);
    }


    //  nodes

    function nodeChildren ( node ) {

	if ( ! isNode(node) ) return;

	return grep(	   node.children
			|| node.childNodes, function() {

	    return isNode(this) == 1;
	});
    }

    function nodeSibling ( node, dir, first ) {

	if ( ! isNode(node) ) return;

	var     sib  = [];

	while ( node = dir	? node.nextSibling
				: node.previousSibling )

	    if ( isNode (node) == 1 ) {

		sib.push(node);

		if (first) break;
	    }

	return first	?             sib.shift  ()
			: dir ? sib : sib.reverse();
    }

    function nodeContains ( over, node ) {

	if ( ! isNode(over) || ! isNode(node) )

	    return      false;

	if ( over.contains )

	    return      over.contains(node);

	if ( over.compareDocumentPosition )

	    return      over === node
		|| !! ( over.compareDocumentPosition(node) & 16 );

	while ( node !== over ) {

	    node = node.parentNode;

	    if ( ! node ) return false;
	}

	return true;
    }


    function nodeClassList   ( node ) {

	if ( isNode(node) != 1 ) return;

	return unique( trim(node.className).match(/\S+/g) );
    }

    function nodeHasClass    ( node, name ) {

	return !!~ exists( nodeClassList(node), name );
    }

    function nodeAddClass    ( node, name ) {

	var  list = nodeClassList(node);

	if ( list && isWord(name) ) {

	    if ( !~ exists( list, name ) ) list.push(name);

	    node.className = list.join(" ");
	}
    }

    function nodeDelClass    ( node, name ) {

	var  list = nodeClassList(node);

	if ( list && list.length && isWord(name) ) {

	    list = grep( list, function() { return this != name } );

	    node.className = list.join(" ");
	}
    }

    function nodeToggleClass ( node, name ) {

	if   ( nodeHasClass( node, name ) ) nodeDelClass( node, name );
	else                                nodeAddClass( node, name );
    }


    function nodesSort (nodes) {

	var out = [];

	nodes   = grep( nodes, function( i, node ) {

	    if ( nodeContains( document, node ) ) return true;

	    out.push(node);
	});

	nodes.sort(function( a, b ) {

	    if ( a.compareDocumentPosition )

		return ( a.compareDocumentPosition(b) & 2 ) - 1;

	    if ( a.sourceIndex && b.sourceIndex )

		return ( a.sourceIndex - b.sourceIndex    );

	    var	trackA = [],
		trackB = [];

	    while (a) {

		trackA.push(a);

		a = a.parentNode;
	    }
	    while (b) {

		trackB.push(b);

		b = b.parentNode;
	    }

	    while ( trackA.length && trackB.length ) {

		a = trackA.pop(),
		b = trackB.pop();

		if ( a === b )     continue;

		while (a) {

		    a = a.nextSibling;

		    if ( a === b ) return -1;
		}

		return 1;
	    }

	    return trackA.length ? 1 : -1;
	});

	return merge( nodes, out );
    }


    //  api

    function api (data) {

	this.length = 0;

	if      ( ! isFn(data) ) this.merge   (data);
	else if (   $.event    ) $.event.ready(data);
	else                     data.call( document, $ );
    }



    function apiFilter ( nodes, filter, invert ) {

	if (   filter == undefined || filter == "" )

	    return nodes;

	if (   isFn    (filter) )

	    return grep  ( nodes, filter, invert );

	if ( ! isString(filter) && ! isArray(filter) )

	    filter =   [filter];

	if (   isArray (filter) )

	    return grep  ( nodes, function( i, val ) {

		return ~ exists( filter, val );

	    }, invert );




    }


    function back () {

	extend( this, {

	    // traversing

	    get:      function(index) {

		return merge( [],

		    index == undefined	? this
					: this.eq(index)
		);
	    },

	    size:     function() { return this.length },

	    fork:     function   (data) {

		if ( isFn(data) ) data = map( this, data );

		var    api = $(data);

		expand(api).parent = this;

		return api;
	    },
	    end:      function() {

		return expand( this, "parent" ) || this;
	    },

	    sort:     function(fn) {

		return this.fork(

		    isFn(fn)	? this.get().sort(fn)
				: nodesSort(this)
		);
	    },

	    unique:   function() {

		return this.fork( unique(this) );
	    },

	    merge:    function    (data) {

		if      ( isFn    (data) )

		    data = map( this, data );

		else if ( isString(data) )

		    data = document.getElementById(data);

		if      ( data != undefined )

		    merge     ( this, data );

		return this;
	    },

	    each:     function(fn) {

		if ( isFn(fn) ) each( this, fn );

		return this;
	    },

	    filter:   function(filter) {

		return this.fork( apiFilter( this, filter    ) );
	    },
	    not:      function(filter) {

		return this.fork( apiFilter( this, filter, 1 ) );
	    },

	    eq:       function(index) {

		index = +index + ( index < 0 ? this.length : 0 );

		return this.fork(this[index]);
	    },

	    first:    function() { return this.eq( 0) },
	    last:     function() { return this.eq(-1) },

	    lt:       function(index) {

		return this.fork(function(i) {

		    if ( i < index ) return this;
		});
	    },
	    gt:       function(index) {

		return this.fork(function(i) {

		    if ( i > index ) return this;
		});
	    },

	    parent:   function(filter) {

		var nodes = map( this, function() {

		    if ( isNode (this) )

			return this.parentNode;
		});

		return this.fork(

		    apiFilter( unique(nodes), filter )
		);
	    },
	    children: function(filter) {

		var nodes = map( this, function() {

		    return nodeChildren(this);
		});

		return this.fork(

		    apiFilter( unique(nodes), filter )
		);
	    },

	    prev:     function(filter) {

		var nodes = map( this, function() {

		    return nodeSibling( this, 0, 1 );
		});

		return this.fork(

		    apiFilter( unique(nodes), filter )
		);
	    },
	    next:    function(filter) {

		var nodes = map( this, function() {

		    return nodeSibling( this, 1, 1 );
		});

		return this.fork(

		    apiFilter( unique(nodes), filter )
		);
	    },
	    prevAll: function(filter) {

		var nodes = map( this, function() {

		    return nodeSibling( this       );
		});

		return this.fork(

		    apiFilter( unique(nodes), filter )
		);
	    },
	    nextAll: function(filter) {

		var nodes = map( this, function() {

		    return nodeSibling( this, 1    );
		});

		return this.fork(

		    apiFilter( unique(nodes), filter )
		);
	    },

	    // attr

	    hasClass:    function(name) {

		return !! each( this, function() {

		    if ( nodeHasClass( this, name ) )

			return true;
		});
	    },
	    addClass:    function(name) {

		return this.each(function() {

		    nodeAddClass   ( this, name );
		});
	    },
	    delClass:    function(name) {

		return this.each(function() {

		    nodeDelClass   ( this, name );
		});
	    },
	    toggleClass: function(name) {

		return this.each(function() {

		    nodeToggleClass( this, name );
		});
	    },

	    html:        function(data) {

		if   ( data == undefined ) {

		    if ( isNode(this[0]) == 1 )

			return  this[0].innerHTML;
		}
		else {

		    data = trim(data);

		    return this.each(function() {

			if ( isNode(this) == 1 )

			    this.innerHTML = data;
		    });
		}
	    }
	});
    }

    back.prototype =     {};
    api. prototype = new back;


    function $  (data) { return new api(data) }

    extend(  $, {

	version:    0.1,

	window:     window,
	document:   document,

	fn:         back.prototype,

	type:       type,
	isBoolean:  isBoolean,
	isVal:      isVal,
	isString:   isString,
	isWord:     isWord,
	isArray:    isArray,
	isObj:      isObj,
	isFn:       isFn,
	isRegExp:   isRegExp,
	isNode:     isNode,

	has:        has,
	extend:     extend,
	merge:      merge,
	copy:       copy,
	expand:     expand,
	exists:     exists,
	unique:     unique,

	each: function( data, fn ) {

	    if   ( isFn(fn) )	   return each( data, fn  );
	},
	map:  function( data, fn ) {

	    return isFn(fn)	?  map ( data, fn         )
				:  [];
	},
	grep: function( data, fn, invert ) {

	    return isFn(fn)	?  grep( data, fn, invert )
				:  [];
	},

	trim:       trim,
	escapeHTML: escapeHTML,
	escapeRE:   escapeRE,

	sort:       nodesSort
    });

    return $;

}(window);



/* tag: lava.event.js */

(function($) {

    "use strict";

    var document = window.document,

	isWord   = $.isWord,
	isObj    = $.isObj,
	isFn     = $.isFn,
	isNode   = $.isNode,

	extend   = $.extend,
	copy     = $.copy,
	expand   = $.expand,
	exists   = $.exists,

	each     = $.each;


    function done ( event, isTrigger ) {

	event = event || window.event;

	var type             = event.type,

	    returnValue      = true,
	    cancelBubble     = false,
	    abort            = false,

	    preventDefault   = function() {

		returnValue  = false;

		if   (event.preventDefault)  event.preventDefault ();
		else  event.returnValue  =   returnValue;
	    },
	    stopPropagation  = function() {

		cancelBubble = true;

		if   (event.stopPropagation) event.stopPropagation();
		else  event.cancelBubble =   cancelBubble;
	    },

	    e = {

		type:      type,
		target:    event.target,

		timeStamp: event.timeStamp || +( new Date ),

		preventDefault:                preventDefault,
		stopPropagation:               stopPropagation,
		stopImmediatePropagation:      function() {

		    abort = true, stopPropagation();
		},
		isDefaultPrevented:            function() {

		    return returnValue;
		},
		isPropagationStopped:          function() {

		    return cancelBubble;
		},
		isImmediatePropagationStopped: function() {

		    return abort;
		}
	    };

	if   (isTrigger)

	    e.isTrigger     = true;

	else {

	    e.originalEvent = event;

	    copy( e, event, [

		"relatedTarget",
		"button",  "which",   "keyCode", "charCode",
		"altKey",  "ctrlKey", "metaKey", "shiftKey",
		"clientX", "clientY", "pageX",   "pageY",
		"screenX", "screenY", "offsetX", "offsetY"
	    ]);

	    if ( ! e.target )

		e.target        = event.srcElement  ||  document;

	    if ( ! e.relatedTarget && event.fromElement )

		e.relatedTarget = e.target === event.fromElement
					    ?  event.toElement
					    :  event.fromElement;
	    if ( ! e.which && e.button ) {

		if      ( e.button & 1 ) e.which = 1;
		else if ( e.button & 4 ) e.which = 2;
		else if ( e.button & 2 ) e.which = 3;
	    }

	    if ( e.pageX == undefined && e.clientX != undefined ) {

		var doc  = e  .target.ownerDocument || document,
		    html = doc.documentElement,
		    body = doc.body;

		e.pageX  =         e.clientX
			    + (    html && html.scrollLeft
			        || body && body.scrollLeft  || 0 )
			    - (    html && html.clientLeft
			        || body && body.clientLeft  || 0 );

		e.pageY  =         e.clientY
			    + (    html && html.scrollTop
			        || body && body.scrollTop   || 0 )
			    - (    html && html.clientTop
			        || body && body.clientTop   || 0 );
	    }

	    if ( e.pageX != undefined ) {

		e.offsetX = e.pageX - ( e.target.offsetLeft || 0 );
		e.offsetY = e.pageY - ( e.target.offsetTop  || 0 );
	    }
	}

	var    obj = event.currentTarget;

	if ( ! obj ) {

	    stopPropagation();

	    obj          = e.target,
	    isTrigger    = true,
	    cancelBubble = false;
	}

	while (obj) {

	    var stack = expand( obj, "event" );

	    if (stack) each( stack[type], function() {

		e.currentTarget =            obj;
		e.result        = this.call( obj, e );

		if ( e.result === false ) {

		    preventDefault ();
		    stopPropagation();
		}

		if (abort) return abort;
	    });

	    obj =  ! cancelBubble
		&&   isTrigger
		&&   isNode(obj)
		&&   obj.parentNode;
	}
    }


    function bind ( obj, type, fn ) {

	if   ( ! isWord(type) || ! isFn(fn) ) return false;

	var stack = expand(obj);

	if   ( ! stack )                      return false;

	stack = stack.event = stack.event || {};

	if   ( stack[type] ) {

	    if ( !~ exists( stack[type], fn ) )

		stack[type].push(fn);
	}
	else {

	    stack[type] = [fn];

	    if      ( obj !== window && ! isNode(obj) ) {}

	    else if ( obj.addEventListener )

		obj.addEventListener( type, done, false );

	    else if ( obj.attachEvent )

		obj.attachEvent     ( "on" + type, done );
	}

	return true;
    }

    function unbind ( obj, type, fn ) {

	var stack = expand( obj, "event" );

	if      ( ! stack ) return;

	if      ( type && fn ) {

	    var   index = exists( stack[type], fn );

	    if ( ~index ) {

		stack[type].splice( index, 1 );

		if ( ! stack[type].length ) unbind( obj, type );
	    }
	}
	else if ( type ) {

	    if (stack[type]) {

		delete stack[type];

		if      ( obj !== window && ! isNode(obj) )   {}

		else if ( obj.removeEventListener )

		    obj.removeEventListener( type, done, false );

		else if ( obj.detachEvent )

		    obj.detachEvent        ( "on" + type, done );
	    }
	}
	else if ( fn )

	    each( stack, function(i) { unbind( obj, i, fn ) });

	else

	    each( stack, function(i) { unbind( obj, i     ) });
    }

    function trigger ( obj, type ) {

	if ( isObj(obj) && isWord(type) )

	    done( { target: obj, type: type }, true );
    }


    var ready = function() {

	var flag,
	    stack,

	    done  = function() {

		flag = true;

		while (stack.length) stack.shift().call( document, $ );
	    }

	return function  (fn) {

	    if   ( ! isFn(fn) ) return;

	    if   (   stack ) {

		stack.push(fn);

		if (flag) done();
	    }
	    else {

		stack = [fn];

		bind( document, "DOMContentLoaded", done );
		bind( document, "readystatechange", function() {

		    if ( document.readyState == "complete" ) done();
		});
		bind( document, "load",             done );
		bind( window,   "load",             done );
	    }
	}

    }();


    extend( $.fn, {

	bind:    function( type, fn ) {

	    return this.each(function( i, el ) {

		bind   ( el, type, fn );
	    });
	},
	unbind:  function( type, fn ) {

	    return this.each(function( i, el ) {

		unbind ( el, type, fn );
	    });
	},
	trigger: function(type) {

	    return this.each(function( i, el ) {

		trigger( el, type     );
	    });
	},

	one:     function( type, fn ) {

	    if ( ! isFn(fn) ) return this;

	    var done = function(e) {

		unbind( this, type, done );

		return fn.call( this, e );
	    }

	    return this.bind( type, done );
	}
    });

    each([	"click",     "mousedown", "mouseup",   "dblclick",
		"mouseover", "mouseout",  "mousemove",
		"keypress",  "keydown",   "keyup",
		"focus",     "blur",
		"submit",    "change",
		"load" ],

	function( i, key ) {

	    $.fn[key] = function(fn) {

		if   ( isNull(fn) ) this.trigger( key     );
		else                this.bind   ( key, fn );

		return this;
	    }
	}
    );

    $.event = {

	bind:    bind,
	unbind:  unbind,
	trigger: trigger,

	ready:   ready
    };

})(lava);



/* tag: lava.querySelector.js */

(function( $, window, undefined ) {

    "use strict";

    var document  = window.document,

	isBoolean = $.isBoolean,
	isVal     = $.isVal,
	isWord    = $.isWord,
	isArray   = $.isArray,
	isObj     = $.isObj,
	isFn      = $.isFn,
	isRegExp  = $.isRegExp,
	isNode    = $.isNode,

	extend    = $.extend,
	merge     = $.merge,
	unique    = $.unique,

	each      = $.each,
	map       = $.map,
	grep      = $.grep,

	trim      = $.trim,
	escapeRE  = $.escapeRE;


    function find ( attr, node ) {

	var index = {},
	    stack;

	each( [ "className", "id", "name", "tagName" ], function( i, key ) {

	    index[key] = grep( attr[key], function( j, val ) {

		return isWord(val);
	    });

	    if ( i && index[key].length > 1 ) index.error = key;

	    index[key] = index[key].join(" ");
	});

	if      ( index.error ) return;

	else if ( index.id        && node.getElementById )

	    stack = [ node.getElementById        ( index.id             ) ];

	else if ( index.name      && node.getElementsByName )

	    stack = ( node.getElementsByName     ( index.name           ) );

	else if ( index.className && node.getElementsByClassName )

	    stack = ( node.getElementsByClassName( index.className      ) );

	else if (                    node.getElementsByTagName )

	    stack = ( node.getElementsByTagName  ( index.tagName || "*" ) );

	return grep( stack, function() {

	    return nodeTest( this, attr );
	});
    }


    function nodeTest ( node, attr ) {

	if ( attr.className != undefined ) {

	    attr.className = map( attr.className, function( i, val ) {

		if   ( isWord(val) )

		     return new RegExp(

			"(?:^|\\s)" + escapeRE(val) + "(?:\\s|$)"
		     );

		else return val;
	    });
	}

	return   ! each( attr, function( key, data ) {

	    if ( ! isArray(data) ) data = [data];

	    return each( data, function( j,   val  ) {

		if      ( isVal    (val) )

		    return   val !=          node[key]   || undefined;

		else if ( isRegExp (val) )

		    return ! val.test(       node[key] ) || undefined;

		else if ( isBoolean(val) )

		    return   val !=       !! node[key]   || undefined;

		else if ( isFn     (val) )

		    return ! val.call( node, node[key] ) || undefined;

		else

		    return   val !==         node[key]   || undefined;
	    });
	});
    }






    function querySelector ( filter, nodes ) {

	var stack = parser(filter),
	    roll  = [];

	if ( ! stack ) return;

	each(  stack,  function( i, unit ) {

	    merge( roll, nodesFilter( nodes, unit ) );
	});

	if ( stack.length < 2 ) return roll;

	return $.sort( unique(roll) );
    }


    function queryFilter ( nodes, filter, invert ) {

	var stack = parser(filter),
	    roll  = [];

	if ( ! stack ) return;

	each(  stack,  function( i, unit ) {

	    unit    =  unit.shift(),
	    roll[i] =  nodesFilter( nodes, [unit] );
	});

	return grep( nodes, function( i, node ) {

	    return each( stack, function( j, unit ) {

		if ( !~ exists( roll[j], node ) ) return;

		return nodesFilter( [node], unit ).length;
	    });

	}, invert );
    }



    var value  = {

		re:	  "\\s*(?:"
		    +  '"((?:[^\\\\]|\\\\.)*?)"'
		    + "|'((?:[^\\\\]|\\\\.)*?)'"
		    + "|(.*?)"
		    + ")\\s*",

		un:   function( v1, v2, v3 ) {

		    if (v1) return v1.replace( /\\(?=[\\"])/g, "" );
		    if (v2) return v2.replace( /\\(?=[\\'])/g, "" );
		            return v3 || "";
		}
	    };


    var terms  = [

	{ // context

	    re: "\\s*([,>+~]|\\s)\\s*",

	    fn: function(context) {

		if ( context == "," ) {

		    if ( ! this.tail )

			return 1;

		    if (   ! this.last().context
			&& ! this.turn().length )

			return 1;

		    this.unit();
		}
		else

		    this.context(context);
	    }
	},
	{ // tagName

	    re: "(\\*|[hH][1-6]|[a-zA-Z]+)",

	    fn: function(name) {

		if ( this.turn().length ) return 1;

		var tagName = this.attr("tagName");

		if ( name != "*" )

		    tagName.push( name.toUpperCase() );
	    }
	},
	{ // id & className

	    re: "(#|\\.)([\\w-]+)",

	    fn: function ( type, name ) {

		this	.attr( type == "#" ? "id" : "className" )
			.push( name );
	    }
	},
	{ // attr

	    re:	  "\\["
		+ "\\s*(\\w+)\\s*"
		+ "(?:([!^$*~|]?=)" + value.re + ")?"
		+ "\\]",

	    fn: function( name, comp,  v1, v2, v3 ) {

		var attr = this .attr(name),
		    val  = value.un  ( v1, v2, v3 );

		if      ( ! comp ) {

		    attr.push(true); return;
		}

		if      ( comp == "="  ) {

		    attr.push( val); return;
		}
		else if ( comp == "!=" ) {

		    attr.push(function(prop) {

			return  val != prop;
		    });
			return;
		}

		val     = escapeRE(val);

		if      ( comp == "^=" )

		    val = "^"         + val;

		else if ( comp == "$=" )

		    val =               val + "$";

		else if ( comp == "~=" )

		    val = "(?:^|\\s)" + val + "(?:\\s|$)";

		else if ( comp == "|=" )

		    val = "^"         + val + "(?:-|$)";

		attr.push( new RegExp(val) );
	    }
	},
	{ // pseudo

	    re:	  ":([\\w-]+)"
		+ "(?:\\(" + value.re + "\\))?",

	    fn: function( name, v1, v2, v3 ) {

		if ( ! isFn(pseudo[name]) ) return 1;

		this.turn().push(function( i, val, data ) {

		    return pseudo[name].call(

			this, i, value.un( v1, v2, v3 ), data
		    );
		});
	    }
	}
    ];



    function filter () {

	extend( this, {

	    first:    function(i) {

		return i == 0;
	    },
	    last:     function( i, val, data ) {

		return i == data.length - 1;
	    },

	    odd:      function(i) {

		return   ( i & 1 );
	    },
	    even:     function(i) {

		return ! ( i & 1 );
	    },

	    eq:       function( i, val, data ) {

		return i == +val + ( val < 0 ? data.length : 0 );
	    },
	    lt:       function( i, val ) {

		return i <   val;
	    },
	    gt:       function( i, val ) {

		return i >   val;
	    },

	    has:      function( i, val ) {

		if ( ! isNode(this) || ! val ) return;

		val = queryFind( val, this );

		return val &&   val.length;
	    },
	    not:      function( i, val ) {

		if ( ! val ) return true;

		val = queryFilter( [this], val );

		return val && ! val.length;
	    },

	    parent:   function() {

		return isNode(this) &&   this.childNodes.length;
	    },
	    empty:    function() {

		return isNode(this) && ! this.childNodes.length;
	    },

	    selected: function() {

		if ( ! isNode(this)           )	return;
		if ( this.tagName == "OPTION" )	return this.selected;
		if ( this.tagName == "INPUT"  )	return this.checked;
	    }
	});
    }

    filter.prototype = {};





    var parser = function() {

	var pseudo = new filter();



	return function (selector) {

	    selector  = trim(selector);

	    if ( ! selector ) return;

	    var	stack = extend( [], {

		unit:    function() {

		    this.push   ([]);
		    this.context(  );
		},
		context: function(context) {

		    this[ this.length - 1 ].push({

			context: context,
			turn:    []
		    });
		},
		last:    function() {

		    var last = this[ this.length - 1 ];

		    return     last[ last.length - 1 ];
		},
		turn:    function() {

		    return this.last().turn;
		},
		attr:    function(name) {

		    var turn = this.turn();

		    var last = turn[ turn.length - 1 ];

		    if ( ! last || isFn(last) ) {

			last = {};

			turn.push(last);
		    }

		    last[name] = last[name] || [];

		    return last[name];
		}
	    });

	    stack.unit();

	    while ( each( terms, function( i, term ) {

		var match  = selector.match ( "^" + term.re );

		if ( ! match )				return;

		stack.tail = selector.substr(match.shift().length);

		if ( term.fn.apply( stack, match ) )	return 0;

		selector   = stack.tail;
							return selector;
	    })){}

	    if ( ! selector ) return stack;

	    throw Error(

		"Syntax error, unrecognized expression: " + selector
	    );
	}

    }();


    function nodesFilter ( nodes,  filter ) {

	each( filter, function( i, unit ) {

	    var turn = unit.turn;

	    if      ( unit.context == ">" )

		nodes = map( nodes, function() {

		    return nodeChildren( this       );
		});

	    else if ( unit.context == "~" )

		nodes = map( nodes, function() {

		    return nodeSibling ( this, 1    );
		});

	    else if ( unit.context == "+" )

		nodes = map( nodes, function() {

		    return nodeSibling ( this, 1, 1 );
		});

	    else if ( unit.context == " " ) {

		if ( turn.length && ! isFn(turn[0]) ) {

		    turn = merge( [], turn );

		    var attr = turn.shift();
		}

		nodes = map( nodes, function( i,  el ) {

		    if (el) return domFind( attr, el );
		});
	    }

	    if      ( unit.context )

		nodes = $.sort( unique(nodes) );

	    each( turn, function( i, test ) {

		if   ( ! nodes.length )  return false;

		if   (   isFn(test)   )

		    nodes = grep( nodes, test );

		else

		    nodes = grep( nodes, function() {

			return nodeTest( this, test );
		    });
	    });
	});

	return nodes;
    }


    var api = function( filter, node ) {

	node = node || document;

	var stack = parser(filter),
	    roll  = [];

	if ( ! stack ) return;

	each(  stack,  function( i, unit ) {

	    unit[0].context = " ";

	    merge( roll, nodesFilter( [node], unit ) );
	});

	if ( stack.length < 2 )	return roll;

	return $.sort( unique(roll) );
    }

    api.filter = filter.prototype;



    extend( $.fn, {

	find: function(filter) {

	    var nodes = map( this, function() {

		if ( isNode (this) )

		    return api( filter, this );
	    });

	    if ( this.length > 1 )

		nodes = $.sort( unique(nodes) );

	    return this.fork(nodes);
	}
    });

    $.querySelector = api;

})( lava, window );
