//	//\\//	BTB. Beaver Tool Belt. Lite-weight JS library.
//          License MIT. Copyright (c) 2015 Konstantin Kirillov.



( function () {

	var btb				= window.btb$				= window.btb$				|| {};		


	btb.userAgent = navigator.userAgent;

   	var ww = new Date();
	btb.timeStamp = ww.getUTCDate() + '-' + ww.getHours() + '-' + ww.getMinutes() + '-' + ww.getSeconds() + '-' + ww.getMilliseconds();


	///=====================================================================================
	//	Browser detection.
	//	We heard a lot about functional detection.
	//	But if buggy browser's image "jerks" when scrolling ... how we will detect this?
	//	... and how much time we spend to find "quantative measure" ...
	//	Apparently, jQuery phases out this feature, which is still irreplaceable ...
	//	... so we adding it here ...
	//	TODm possibly outdated.
	//	Sets core.browser.IE to truthful/falsness, and so on ...
	//	Usage: 	For IE, Mozilla, AppleWebKit, WebKit, Chrome, Gecko:
	//			like this:	if(tp.core.browser.IE),
	//						then tp.core.browser.IE[1] contains a version.

	//	iPxxxxxxxx
	//	http://stackoverflow.com/questions/9548012/user-agent-string-for-iphone-4s
	//	http://stackoverflow.com/questions/12305566/what-is-the-ios-6-user-agent-string

	//======================================================================================
	btb.browser = ( function () {

		    var isOpera =	Object.prototype.toString.call( window.opera ) === '[object Opera]';
			var ua = btb.userAgent;
			var ret =
			{
				//IE			!!window.attachEvent && !isOpera, //prototype style detection
				//				Trident gives crude but effective detection of IE8-11+
				//				http://msdn.microsoft.com/library/ms537503.aspx
				//				http://stackoverflow.com/questions/17907445/how-to-detect-ie11
				IE				: ( !isOpera && ua.match(  /msie\s*([0-9.]*)/i  ) )		||		ua.match( /Trident\s*\/([0-9.]*)/i ),

				Mozilla			: ua.match(/mozilla.*rv:([0-9.]*)/i),
				FireFox			: ua.match(/FireFox\/([0-9.]*)/i),
				AppleWebKit		: ua.match(/AppleWebKit\/([0-9.]*)/i),
				WebKit			: ua.match(/WebKit\/([0-9.]*)/i),
				Chrome			: ua.match(/chrome\/([0-9.]*)/i),
				Gecko			: (ua.indexOf('KHTML') === -1) && ua.match(/Gecko\/([0-9.]*)/i),
				Safari			: ua.match(/Safari\/([0-9.]*)/i),
				MobileSafari	: ua.match(/Apple.*Mobile/),
				Opera			: isOpera
   			};

			///	Converts IE version to an integer and drops fraction
			if( ret.IE )
			{
				var ww = parseInt( ret.IE[1] );
				if( isNaN( ww ) ) ww = 0;
				ret.IE[1] = ww;
			}

			///	Detects mobile.	TODM do better.
			if( 
				!( 
					ret.IE				||
					ret.Mozilla			||
					ret.FireFox			||
					ret.AppleWebKit		||
					ret.WebKit			||
					ret.Chrome			||
					ret.Gecko			||
					ret.Safari			||
					ret.Opera
				)	|| 	ret.MobileSafari
			)
			{
				ret.mobile = true;
			}

			//fastdeb( ret );
			return ret;

	}) ();
	//	\\//	Detections ///////////////////////////



		///	Throttle:	fires only once at the "end" of event like "window.onresize";
		//	Input:		delay - how much time throttle will wait;
		//	Usage:		throttledCallback( callback [, delay] );
		var throttleIdGenerator = 0;	// for debug
		btb.throttledCallback = function ( callback_at_the_end, delay )
		{
				var throttleId	= throttleIdGenerator;
				throttleIdGenerator++;
				var toFlag		= null;
				var event		= null;
				delay = delay || 10;

				var wrapper = function ()
				{
					toFlag = null;
					//	btb.d eb( ' throttle ' + throttleId +' began COMPLETING. toFlag=' + toFlag );
					callback_at_the_end( event );
					//	btb.d eb( ' throttle ' + throttleId +' COMPLETED. toFlag=' + toFlag );
				};

				//	TODM Add functionality:
				//	var callee = function ...
				//	callee.addMoreCallbacks = function ( callback ) {
				//		var former = callback_at_the_end;
				//		callback_at_the_end = function() {
				//				former();
				//				callback();
				//		};
				//	};

				return ( function ( event_ ) {

					//:	good de bug:
					//	btb.d eb( ' throttle ' + throttleId +' callbacked. toFlag=' + toFlag );
					event = event_;

					if( toFlag !== null )
					{
						//	... see doc/info/run_graph.js
						window.clearTimeout( toFlag );
						//	btb.d eb( ' throttle ' + throttleId +' delayed. toFlag=' + toFlag );
					}
					toFlag = setTimeout( wrapper, delay );
				});
		};


        /// Ajax sender
        //  recognizes: comm and server-script errors
		//	used:       to capture images
        //  interface:  in case of success, requires PHP responder to send a line beginning with 'success';
        //              any other string considered as a server error;
		//	origin:     /var/www/html/w/now/3rd/btb/main.js
		btb.ajax2server = function( ajset_, success_callback, error_callback )
        //url, text, success_callback, error_callback, timeout )
		{
            var url = ajset_.url;

            //http://api.jquery.com/jquery.ajax/
			var ajset =
			{
				url			: url,
				type		: ajset_.post || 'post',
                data        : ajset_.data,
				timeout		: ajset_.timeout || 5000
				//cache		: false, // no need for type "post"
				// "success : ... " moved to "done" ... as in jQ "Promise interface"
                // http://api.jquery.com/category/deferred-object/
			};
            if( ajset_.dataType )                              ajset.dataType       = ajset_.dataType;
            if( typeof ajset_.processData !== 'undefined' )    ajset.processData    = ajset_.processData;
            if( typeof ajset_.contentType !== 'undefined' )    ajset.contentType    = ajset_.contentType;


			$.ajax( ajset ).

            //http://api.jquery.com/jquery.ajax/
            fail( function( jqXHR, textStatus, errorThrown ) {
                var message = 
					"ajax-related-error = " + arguments[ 1 ] + "; \n" +
					"failed saving to " + url + " \n" +
					"HTTP-error = " + arguments[ 2 ]
				btb.ifdeb( message );
                if( error_callback ) error_callback( message );
			}).

            //http://api.jquery.com/jquery.ajax/
            //done( function( data, textStatus, jqXHR ) {
            done( function( data, textStatus ) {

                //useless: if(	textStatus === 'success' )
				if( data.indexOf( 'success' ) === 0 )
				{
					btb.ifdeb( "server successfully processed at " + url );
                    if( success_callback ) success_callback( data );
				}else{
       				if( data.indexOf( 'error' ) === 0 ) {
                        var message = 'server-script error:' + data.substr(5);
                    } else {
                        var message = 'unformatted-error: ' + data;
                    }
                    if( error_callback ) error_callback( message );
					btb.ifdeb( "error of saving to " + url + "\n" + message );
				}
			});

			btb.ifdeb( 'data is ajaxed to ' + url );
		};


}) ();



