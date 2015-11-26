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

	if ( obj == undefined ) return false;

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

	    if ( ! isObj(obj) )  return;

	    if ( key != undefined )

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

	return index == undefined ? -1 : index;
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

	var end,
	    i    = 0,

	    walk = function(val) {

		end = fn.call( val, i, val, data );

		return end != undefined;
	    }

	if      ( data == undefined )  return;

	else if ( isArray(data) ) {

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

	    if ( val != undefined ) merge( roll, val );
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


    //  event

    var event = function() {

	var done  = function( event, isTrigger ) {

	    event = event || window.event;

	    var	type             = event.type,

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

		    e.pageX  =	       e.clientX
				+ (    html && html.scrollLeft
				    || body && body.scrollLeft  || 0 )
				- (    html && html.clientLeft
				    || body && body.clientLeft  || 0 );
		    e.pageY  =	       e.clientY
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

		obj =	 ! cancelBubble
			&& isTrigger
			&& isNode(obj)
			&& obj.parentNode;
	    }
	}

	return {

	    bind:    function( obj, type, fn ) {

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
	    },

	    unbind:  function( obj, type, fn ) {

		var stack = expand( obj, "event" );

		if      ( ! stack ) return;

		if      ( type && fn ) {

		    var   index = exists( stack[type], fn );

		    if ( ~index ) {

			stack[type].splice( index, 1 );

			if ( ! stack[type].length ) event.unbind( obj, type );
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

		    each( stack, function(i) { event.unbind( obj, i, fn ) });

		else

		    each( stack, function(i) { event.unbind( obj, i     ) });
	    },

	    trigger: function( obj, type ) {

		if ( isObj(obj) && isWord(type) )

		    done( { target: obj, type: type }, true );
	    }
	};

    }();


    var onready = function() {

	var ready,
	    stack,

	    done  = function() {

		ready = true;

		while (stack.length) stack.shift().call( document, lava );
	    }

	return function  (fn) {

	    if   ( ! isFn(fn) ) return;

	    if   ( stack ) {

		stack.push(fn);

		if (ready) done();
	    }
	    else {

		stack =   [fn];

		event.bind( document, "DOMContentLoaded",    done );
		event.bind( document, "readystatechange", function() {

		    if ( document.readyState == "complete" ) done();
		});
		event.bind( document, "load",                done );
		event.bind( window,   "load",                done );
	    }
	}

    }();


    // DOM

    function domFind ( attr, node ) {

	attr = attr || {},
	node = node || document;

	if ( ! isObj(attr) || ! isNode(node) ) return;

	var index = {},
	    stack;

	each( [ "className", "id", "name", "tagName" ], function( i, key ) {

	    index[key] = grep( attr[key], function( j, val ) {

		return isWord(val);
	    });

	    if ( i && index[key].length > 1 ) index.error = key;

	    index[key] = index[key].join(" ");
	});

	if      ( index.error ) {}

	else if ( index.id        && node.getElementById )

	    stack = [ node.getElementById        ( index.id             ) ];

	else if ( index.name      && node.getElementsByName )

	    stack = ( node.getElementsByName     ( index.name           ) );

	else if ( index.className && node.getElementsByClassName )

	    stack = ( node.getElementsByClassName( index.className      ) );

	else if (                    node.getElementsByTagName )

	    stack = ( node.getElementsByTagName  ( index.tagName || "*" ) );

	return grep( stack, function() { return nodeTest( this, attr )  } );
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

    function nodeContains ( parent, node ) {

	if ( ! isNode(parent) || ! isNode(node) )

	    return      false;

	if ( parent.contains )

	    return      parent.contains(node);

	if ( parent.compareDocumentPosition )

	    return      parent === node
		|| !! ( parent.compareDocumentPosition(node) & 16 );

	while ( node !== parent ) {

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

	nodes   = grep( nodes, function( i, val ) {

	    if ( nodeContains( document, val ) ) return true;

	    out.push(val);
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


    function nodeTest ( node, attr ) {

	if ( ! isNode(node) || ! isObj(attr) ) return false;

	if ( attr.className != undefined ) {

	    attr   = extend( {},  attr );

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


    // querySelector

    function querySelector ( filter, nodes ) {

	var stack = queryParser(filter),
	    roll  = [];

	if ( ! stack ) return;

	each(  stack,  function( i, unit ) {

	    merge( roll, nodesFilter( nodes, unit ) );
	});

	if ( stack.length < 2 ) return roll;

	return nodesSort( unique(roll) );
    }

    function queryFind ( filter, node ) {

	node = node || document;

	var stack = queryParser(filter),
	    roll  = [];

	if ( ! stack ) return;

	each(  stack,  function( i, unit ) {

	    unit[0].context = " ";

	    merge( roll, nodesFilter( [node], unit ) );
	});

	if ( stack.length < 2 )	return roll;

	return nodesSort( unique(roll) );
    }

    function queryFilter ( nodes, filter, invert ) {

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

	var stack = queryParser(filter),
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


    function queryPseudo () {

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

    queryPseudo.prototype = {};


    var queryParser = function() {

	var pseudo = new queryPseudo(),

	    value  = {

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
	    },

	    terms  = [

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

	    if      ( unit.context == ">" ) {

		nodes = map( nodes, function() {

		    return nodeChildren( this       );
		});
	    }
	    else if ( unit.context == "~" ) {

		nodes = map( nodes, function() {

		    return nodeSibling ( this, 1    );
		});
	    }
	    else if ( unit.context == "+" ) {

		nodes = map( nodes, function() {

		    return nodeSibling ( this, 1, 1 );
		});
	    }
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

		nodes = nodesSort( unique(nodes) );

	    each( turn, function( i, test ) {

		if   ( ! nodes.length ) return false;

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


    //  api

    function api (data) {

	this.length = 0;

	if   ( isFn(data) ) onready   (data);
	else                this.merge(data);
    }


    function back () {

	var     self = this;

	extend( self,  {

	    // traversing

	    get:      function() { return merge( [], this ) },

	    size:     function() { return this.length       },

	    fork:     function    (data) {

		if      ( isFn    (data) )

		    data = map( this, data );

		else if ( isString(data) )

		    data = querySelector( data, this.get() );

		var    api = lava (data);

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

		    data = queryFind (data);

		if ( data == undefined ) return this;

		return merge  ( this, data );
	    },

	    each:     function(fn) {

		if ( isFn(fn) ) each( this, fn );

		return this;
	    },

	    find:     function (filter) {

		var nodes = map( this, function() {

		    if ( isNode (this) )

			return queryFind( filter, this );
		});

		if ( this.length > 1 )

		    nodes = nodesSort( unique(nodes) );

		return this.fork(nodes);
	    },

	    filter:   function(filter) {

		return this.fork(

		    queryFilter( this.get(), filter    )
		);
	    },
	    not:      function(filter) {

		return this.fork(

		    queryFilter( this.get(), filter, 1 )
		);
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

		    queryFilter( unique(nodes), filter )
		);
	    },
	    children: function(filter) {

		var nodes = map( this, function() {

		    return nodeChildren(this);
		});

		return this.fork(

		    queryFilter( unique(nodes), filter )
		);
	    },

	    prev:     function(filter) {

		var nodes = map( this, function() {

		    return nodeSibling( this, 0, 1 );
		});

		return this.fork(

		    queryFilter( unique(nodes), filter )
		);
	    },
	    next:    function(filter) {

		var nodes = map( this, function() {

		    return nodeSibling( this, 1, 1 );
		});

		return this.fork(

		    queryFilter( unique(nodes), filter )
		);
	    },
	    prevAll: function(filter) {

		var nodes = map( this, function() {

		    return nodeSibling( this       );
		});

		return this.fork(

		    queryFilter( unique(nodes), filter )
		);
	    },
	    nextAll: function(filter) {

		var nodes = map( this, function() {

		    return nodeSibling( this, 1    );
		});

		return this.fork(

		    queryFilter( unique(nodes), filter )
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
	    },

	    // events

	    bind:    function( type, fn ) {

		return this.each(function( i, el ) {

		    event.bind   ( el, type, fn );
		});
	    },
	    unbind:  function( type, fn ) {

		return this.each(function( i, el ) {

		    event.unbind ( el, type, fn );
		});
	    },
	    trigger: function(type) {

		return this.each(function( i, el ) {

		    event.trigger( el, type     );
		});
	    },

	    one:     function( type, fn ) {

		if ( ! isFn(fn) ) return this;

		var done = function(e) {

		    event.unbind( this, type, done );

		    return fn.call( this, e );
		}

		return this.bind( type, done );
	    }
	});

	// named events

	each([	"click",     "mousedown", "mouseup",   "dblclick",
		"mouseover", "mouseout",  "mousemove",
		"keypress",  "keydown",   "keyup",
		"focus",     "blur",
		"submit",    "change"
	    ],
	    function( i, key ) {

		self[key] = function(fn) {

		    if   ( fn == undefined ) this.trigger( key     );
		    else                     this.bind   ( key, fn );

		    return this;
		}
	    }
	);
    }

    back.prototype =     {};
    api. prototype = new back;


    function lava  (data) { return new api(data) }

    extend(  lava, {

	version: 0.1,

	fn:     back       .prototype,
	filter: queryPseudo.prototype,

	each: function( data, fn ) {

	    if ( isFn(fn) ) return each( data, fn         );
	},
	map:  function( data, fn ) {

	    return isFn(fn)	?  map ( data, fn         )
				:  [];
	},
	grep: function( data, fn, invert ) {

	    return isFn(fn)	?  grep( data, fn, invert )
				:  [];
	},

	type:       type,
	extend:     extend,
	merge:      merge,
	copy:       copy,
	exists:     exists,
	unique:     unique,
	trim:       trim,
	escapeHTML: escapeHTML
    });

    return   lava;


}(window);
