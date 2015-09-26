
//	//\\//	====================================================================================
//
//	This is:		Light-weight application-self-debugger.
//					When we are on unknown territory with no debugging tools, don't
//					feel helpless ...
//
//	Purpose:		when
//					1.     no c onsole.log (on weird mobile or IE),
//					       no Firebug, no other debugger, or
//					       no time to learn weird firm-ware-debugger, and
//					       the code is already on productin server ....
//
//					2.	timestamps are needed to timeline events ... 
//					3.	messages came before <body> were created must be stashed and
//						displayed later on <body>
//
//	Dependencies:	None.
//	Credit:			Copyright (c) 2013 Konstantin Kirillov. Landkey.net. License: MIT.
//
//	Pollutes:		global namespace with btb$ and possibly with
//					w i n d o w . c c c c in btb$.non-production mode
//
//	Usage:			Calls from inside source code:
//						btb$.ifdeb the same as btb$.deb but fires only when
//							"debug" is set in URL-query like:
//								www.mysite.com?debug
//								www.mysite.com?production&debug=lrs&page
//						btb$.deb fires unconditionally: btb$.deb( arg1, arg2, ..., argN ), btb$.debc..., 
//						btb$.debug(	ob	[, title [, debug_window_ [, debug_window_parent_
//										[, level_restriction  ] ] ] ] );
//						level_restriction - deepness of displaying ob-tree
//					
//  URL-example:	...&deb-cdDC...-aarrggbbzzzzz-15 sets
//							first-group:
//								c - shows config
//								C - saves config to disk
//								D - saves detection to disk
//								d - shows detection
//								e - do extra work
//							second-group:
//								opacity aa
//								color rrggbb
//								z-index zzzzz ( optional, any length )
//							third group:
//								font-size = 15px
//
//		
//	Bugs:			1.	Something strange noted about timestamp milliseconds: not in order.
//						The reason is unknown. See code around "...= new Date();".
//
//	Risk:			btb$.deb has a risk. It uses both c onsole.log and deb, but existence of 
//					c onsole.log can be misdetected and c onsole.log falsely called and crashed.
//	============================================================================================


//	TODM	having btb.debug and btb.debbio is a "must-refactor" sign. Do merge.
//			possible bug noted: second par. in btb.deb fails;
//			debug is a bad name afer all; everyone does use it; make it special: call it degub;




( function ( window ) {


	//.	Inserts debug into global btb$ namespace
	var btb						= window.btb$	= window.btb$	|| {};
	var debby					= btb.debby		= btb.debby		|| {};

	//.	Fires "deb" by passing input to it only if debby.on is set
	//	"fastdeb" should be used only if it creates one-time or quick-performed calls;
	btb.fastdeb					= function () { if( debby.on ) btb.deb.apply( this, arguments ) };
	//.	the way of attach fastdeb to modules dependent or non-dependent on debug.js
	//	var fastdeb				= btb.fastdeb	= btb.fastdeb	|| ( function () {} );
	//	former version of fastdeb
	btb.ifdeb					= function () { if( debby.on ) btb.deb.apply( this, arguments ) };



	//: Default setup
    var CALLS_LIMIT				= 1000;
	var TRUNCATE_STRING_TO		= 2000000; //200000;
    var SIZE_LIMIT				= 50000;
    var LEVEL_LIMIT				= 10;
	var DEFAULT_DEBUG_WINDOW_ID	= 'debug-btb';	//CSS-id

	var fontSize				= 10;
	var opacity					= '0.6';
	var color					= '000055';

	//	var zIndex				= 'z-index : 111111';	//	bad idea: may block all controls;
	var zIndex					= '';

	//	//\\	Helper functions and variables   //////////////////

	var debug_window			= null;	// Debug-c onsole: DOM-element where debug text will be shown to user
	var collected_in_session	= '';
	var calls_count;

	///	Purpose:	generate blank string comprised with char(32) characters.
	//	Input:		length
	var INDENT = '                                                                                                           	                                                                              ';
	var space = function( length )
	{
		return INDENT.substr( 0, length );
	};

	
	///	Purpose:	apparently to add nice indent for tree nodes in deep levels
	var indentize = function( ss, length )
	{
		if( ss.length > TRUNCATE_STRING_TO )
		{
			ss = ss.substr( 0, TRUNCATE_STRING_TO ) + ' ... ';
		}
		return ss.replace( "\n", "\n" + space( length ) );
	};



	var c_onsole_log	=	!IE && window.console &&			// *** browser safe c onsole string
							typeof console !== 'undefined' &&	// *** browser safe c onsole string
							console.log;						// *** browser safe c onsole.log string
	var c_onsole_clear	=	c_onsole_log && console.clear;		// *** browser safe c onsole.clear string



	//:	credit:	https://ajax.googleapis.com/ajax/libs/prototype/1.7.0.0/prototype.js
	//			(c) 2005-2010 Sam Stephenson http://www.prototypejs.org/
    var isOpera = Object.prototype.toString.call( window.opera ) == '[object Opera]';
    var IE = !!window.attachEvent && !isOpera;



	///	Gets parameter from URL query string.
	//	Returns:	if separator supplied
	//					true, false if no groups
	//					array of groups otherwise
	//				othewise, behaves as btb-legacy-getQueryPar
	var getQueryPar = debby.getQueryPar = function( key, separator )
	{
			var ww			= window.location.search;
			var sep			= separator || '=';
			var sepr		= sep === '-' ? '\\' + sep : sep;

			// fails: var re = new RegExp('(?:&|\\?)'+key+'(?:' + sep + '([^&' + sep + ']*))*(?:&|$)');
			var re			= new RegExp(	'(?:&|\\?)' + key + 
											'(?:' + sep + '([^&' + sepr + ']*)){0,1}' + //	core group
											'(?:' + sep + '([^&' + sepr + ']*)){0,1}' + //	basic style
											'(?:' + sep + '([^&' + sepr + ']*)){0,1}' + //	font group
											// add more groups here
											'(?:&|$)');
			// c onsole.log( 'regex=', re );
			ww				= ww.match( re );
			// c onsole.log( 'result=', ww );

			if( !ww )		return false;
			if( ww.length === 1 )	return true;
			for( var ii = 1; ii < ww.length; ii++ )
			{
				ww[ ii ] = ww[ ii ] && decodeURIComponent( ww[ ii ] );
			}

			if( separator ) return ww;
			//.	preserves backward compatibility
			return ww[ 1 ];	
	};


	//. Inits debug flag at object definition time.
	var ww			= getQueryPar( 'deb', '-' );
	debby.on		= !!ww;
	debby.core		= ( ww && ww[1] ) || '';
	debby.style		= ( ww && ww[2] ) || '';
	debby.fontsize	= ( ww && ww[3] ) || '';
	if( /e/.test( debby.core ) ) btb.debby.extra = true;
	//	\\//	Helper functions and variables   //////////////////








	//========================================================================
	//Purpose:	creates debug_window if not yet exists
	//Input:	debug_window_ - dom object.
	//					If not supplied, ....getElementById(DEFAULT_DEBUG_WINDOW_ID) is tried.
	//					If fails, then window is generated.			
	//			debug_window_parent_ used to attach debug_window to it.
	//					If not supplied, attached to document.body
	//========================================================================
	var setup_debug_window = function( debug_window_, debug_window_parent_)
	{

		if( debug_window ) return;
        debug_window = debug_window_ || document.getElementById( DEFAULT_DEBUG_WINDOW_ID );
		if( debug_window ) return;
        if( debug_window_parent_ || document.body)
		{
            debug_window = document.createElement('div');
			debug_window.setAttribute( 'id', 'debug-btb' );

			// /\ Establishing debug color and opacity
			//.	group of debug query
			var gquery	= debby.style;
			if( gquery && gquery.length > 7 )
			{
				gquery		= gquery.toUpperCase();
				color		= gquery.substr( 2, 6 ) || color;
				var wopacity	= gquery.substr( 0, 2 );
				var wopacity	= parseInt( '0x' + wopacity, 16 );
				if( !isNaN( wopacity ) && wopacity >=0 && wopacity <= 255 )
				{
					wopacity /= 255;
					wopacity = Math.max( wopacity, 0.0001 );
					opacity = wopacity;
				}

				var wzindex = gquery.substr( 8 );
				wzindex = wzindex && parseInt( wzindex );
				if( !isNaN( wzindex ) ) zIndex = wzindex;
			}

			if( debby.fontsize )
			{
				var ww = parseInt( debby.fontsize );
				if( !isNaN( ww ) && ww > 5 ) fontSize = ww;
			}

			// \/ Establishing debug color and opacity
									
			var wStyle =	'position:absolute; '	+
							'top:0px; '				+
							'left:0px; '			+
							'color:#'				+ color		+ '; ' +
							'opacity:'				+ opacity	+ '; ' +
							'font-size:'			+ fontSize	+ 'px; ' +
							'z-index:'				+ zIndex	+ '; ';

			//	c onsole.log( 'style of deb=' + wStyle );
			debug_window.setAttribute( 'style', wStyle );
			debug_window.style.lineHeight = '1em';
            var ww = debug_window_parent_ ? debug_window_parent_ : document.body;
            ww.appendChild( debug_window );
		}
	};


	///=========================================================================
    //	Purpose:	this is a workhorse of debugger. Recursively parses objects.
	//	Does:		ads timestamp
	//	How works:	collects all data parsed from object tree and adds them
	//				to "collected_in_session" string.
	//				Displays "collected_in_session" as innerHTML of c onsole	
	//	Input:		ob - required
	//				other parameters are optional
	//===========================================================================

	//.	Collects strings constructed in recursive "debug" calls
	var rr;

    var debug = btb.debug = function( ob, title, debug_window_, debug_window_parent_, level )
	{
		level=level	|| 0;
		title=title || '';

		if( !level )
		{
			var ww = new Date();
			title=
				''  + ( ww.getHours() + 1 ) +
				':' + ( ww.getMinutes() + 1 ) +
				':' + ( ww.getSeconds() + 1 ) +
				'.' + ( ww.getMilliseconds() + 1 ) +
				' ' + title + ' ';
			calls_count = 0;
			rr = title;
		}

        if
		(
			rr.length		> SIZE_LIMIT	||
			level			> LEVEL_LIMIT	||
			++calls_count	> CALLS_LIMIT
		)	return rr;


		var tt	= ( typeof ob ); 
        var n	= "\n";
        var ii	= space( title.length );
	    if( tt === 'string' ) {
            var ss = indentize( ob, ii.length );
            rr += ss + n;
        }else if( tt === 'function') {

			//TODm parse conditionally:
			//TODm replace with beatutifier to replace indent:
            var ss = indentize( ob.toString(), ii.length );
            rr += ss + n;
        }else if( tt === 'number' ) {
            rr += ob + n;
        }else if( tt === 'boolean' ) {
            rr += ob + n;
        }else if( ob === null ) {
            rr += 'null' + n;
        }else if( tt === 'undefined' ) {
            rr += 'undefined' + n;
        }else if( tt === 'object' && ob.length  ) {

            for( var jj = 0, wwlen = ob.length; jj < wwlen; jj++ ) {
				var ww = '[' + jj + ']= ';
				rr += (jj ? ii : '' ) + ww;
				debug( ob[ jj ], space( ii.length + ww.length ), null, null, level + 1 );
            }
			if( !ob.length ) rr += n;

		}else if( tt === 'object' ) {

			var pcount = 0;
			for( var pp in ob )
			{
				//	Why IE breaks here?:
                //	if(ob.hasOwnProperty(p))

                if( ob.hasOwnProperty && ob.hasOwnProperty( pp ) )
				{
					var ww = ' ' + pp + '  : ';
					rr += ( pcount ? ii : '' ) + ww;
					debug( ob[ pp ], space( ii.length + ww.length ), null, null, level + 1 );
					pcount++;
				}
            }
			//TODm add loop via __proto__
			if( !pcount.length ) rr += n;
		}

		if( level === 0 ) {

			collected_in_session += rr;
			//Should catch history before page loaded.:
			setup_debug_window( debug_window_, debug_window_parent_ );
			if( debug_window ) debug_window.innerHTML = "<pre>" + collected_in_session + "</pre>"; 
			if( c_onsole_log )
			{
				console.log( rr );	// *** browser safe c onsole.log string
			}

			//====================
			//TODm
			//fails,? why?: (c onsole && c onsole.log) || 
			//if(window.c onsole && window.c onsole.log )c onsole.log(r);  // *** safe c onsole.log
			//====================

		}
        return rr;
    };

	///	Cleans/sets up debug window and throws textToOutput there
	btb.reuseDebugWindow = function ( textToOutput )
	{
		setup_debug_window();
		if( debug_window ) debug_window.innerHTML = "<pre>" + textToOutput + "</pre>"; 
	};







	//	//\\	E x t e r n a l   c a l l s		//////////////////////////////


	// //\\	Purpose:	if window.c onsole exist, debug only to it.
	//					Despite apparent usefulness of this function, it seems not very practical.
	var sequentialConsole =	function ()
	{
		for( var ii = 0; ii <arguments.length; ii++)
		{
			console.log( arguments[ ii ] );	// *** browser safe c onsole.clear string
		}
	};

	var debc = btb.debc =
		( c_onsole_log && sequentialConsole ) ||
		( function () { for( var ii = 0; ii <arguments.length; ii++) debug( arguments[ ii ] ); });
	// \\//	Purpose:	if window.c onsole exist, debug only to it.



	// Purpose:			debug to both custom debugger and if exist, to c onsole:
	// Input:			empty arguments list clears up collected_in_session and debug windows
	// Input sample:	btb$.deb( myObject, 'This is myObject', ... )
	//					the same for debc
	var deb = btb.deb = function ()
	{ 
		if( arguments.length === 0 ) {

			if( debug_window )		debug_window.innerHTML = "<pre> </pre>"; 
			if( c_onsole_clear )	console.clear();	// *** browser safe c onsole.clear string
			collected_in_session = '';
		}
		for( var ii = 0; ii < arguments.length; ii++ ) debug( arguments[ ii ] ); 
	};
	//	\\//	E x t e r n a l   c a l l s		//////////////////////////////




	
	///	Adds global shortcut "c c c c" of "c o n s o l e . l o g" in non-production-flag mode.
	//	Reason: name c onsole.log is too long to type. "c ccc" is faster.
	//	Production_mode usually passed from "PHP or ROR server" if any.
	if( !btb.production_mode && c_onsole_log )
	{	
		/// reduces annoying name c onsole.log to shorter
		window.cccc = function ()		// *** browser safe cc cc string
		{
			for( var ii=0; ii < arguments.length; ii++)
			{
				//.	fails in Chrome, Ubuntu
				//	// c_onsole_log( arguments[ ii ] );

				console.log( arguments[ ii ] );  // *** browser safe c onsole.clear string
			}
		}
	}

	return btb;

}) ( window );
