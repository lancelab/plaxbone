//  //\\//  AnimatinoFrame polyfill and throttler.
//          Purpose is to
//              polyfill requestAnimationFrame,
//              handle "call-flooding or choking conditions", and
//              to supply `event` parameter to the leaf callback.


( function () {

	var btb				= window.btb$				= window.btb$				|| {};		

    var AF_FALLBACK_DELAY   = 1000 / 60;   //mimics expected FPS.
    var DEFAULT_DELAY       = 1;
    var DEFAULT_MODE        = 'animFrame';



    ///Part I of II: does polyfil missed requestAnimationFrame and cancel...
    ( function () {


        /// requestAnimationFrame fallback
        var fallbackRequest = function ( callback ) {
            fallbackID = setTimeout( fallBack, AF_FALLBACK_DELAY );
            return fallbackID;
        };

        /// cancelAnimationFrame fallback
        var fallbackCancel = function ( callback ) {
            if( fallbackID !== null ) {
				window.clearTimeout( fallbackID );
            }
        };



        //=============================================================================================================
        // this may have more thought: https://github.com/julienetie/request-frame/blob/master/src/request-frame.src.js
        // seems not the most elaborate polyfil, but enough good:
        // credits: downloaded from: https://gist.github.com/paulirish/1579671
        //          http://paulirish.com/2011/requestanimationframe-for-smart-animating/
        //          http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
        //          requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
        //=============================================================================================================
        var pref    = [ 'ms', 'moz', 'webkit', 'o' ];
        var af      = 'AnimationFrame';
        var Raf     = 'Request' + af;
        var raf     = 'request' + af;
        var Caf     = 'Cancel' + af;
        var caf     = 'cancel' + af;
        var win     = window;
        for( var ix = 0; ix < pref.length && !win[ raf ]; ix++ ) {
            var pr       = pref[ ix ];
            win[ raf ]   = win[ pr + Raf ];
            win[ caf ]   = win[ pr + Caf ] || win[ pr + 'Cancel' + Raf ];
        }

        if( !win[ raf ] ) {
            //// still no requestAnimationFrame exists ... create a fallback
            win[ raf ] = fallbackRequest;
            win[ caf ] = fallbackCancel;
        }

    }) ();



    /// Part II of II:
    //  Throttler.
    //  Purpose is to handle "call-flooding or choking conditions" and to supply `event` parameter to the callback.
    //  Takes care about cancelling scheduled animationFrame when new animationFrame is requested.
    //  When param delayMode is 
    //     "none"                   returns finalCb; no functionality is added;
    //     "animFrame"              autocancels already scheduled animationFrame and schedules new animationFrame;
    //     "timedelay"              or !window.AnimationFrame: makes an ordinary setTimeout;
    //     "timedelayAndAnimFrame"  double throttles via setTimeout and animationFrame
    /**
      * @param finalCb   application callback, signature: function( event ), event is an optional parameter.
      */
	btb.throttledAnimFrame = function ( finalCb, delay, delayMode )
	{
    	//  btb.d eb( 'setting up btb.throttledAnimFrame ... delayMode=' + delayMode +' delay=' + delay );
        //. requestAnimationFrame mode is a hard-coded default
        delayMode   = delayMode || 'animFrame';
        var afrID   = null;
		var toutID  = null;
  		var event	= null;
		delay       = delay || DEFAULT_DELAY;


        if( delayMode === 'none' ) {

            var outerCb = finalCb;

        } else if ( delayMode === 'animFrame' && window.requestAnimationFrame ) {

    		var outerCb = function ( event_ )
    		{
                if ( afrID ) {
                    cancelAnimationFrame( afrID );
                    afrID = null;
                }
       			var afrID = requestAnimationFrame( function () {
           			//btb.d eb( 'executing pure requestAnimationFrame ... afrID=' + afrID );
                    afrID = null;
                    finalCb( event_ );
                } );
    		};

        } else {           

            //// Delayed callback  /////////
    		var delayedCb = function ()
    		{
    			//btb.d eb( 'executing delayedCb ... delayMode = ' + delayMode + ' toutID=' + toutID );
    			toutID = null;
                if( delayMode === 'timedelay' || !window.AnimationFrame ) {
        			finalCb( event );
                } else if ( delayMode === 'timedelayAndAnimFrame' ) {
        			var afrID = requestAnimationFrame( function () {
               			//btb.d eb( 'executing delayed requestAnimationFrame ... afrID=' + afrID );
                        afrID = null;
                        finalCb( event );
                    } );
                }
    		};

            /// Delays callbacks
            var outerCb = function ( event_ )
            {
    			//:	good de bugs:
    			//  btb.d eb( ' callbacked. toutID=' + toutID + 'event_=', event_ );
    			//  btb.d eb( 'external callback fired on event.type=' + event_.type + ' toutID=' + toutID );
    
    			event = event_;

                /// Clears scheduled callbacks
    			if( toutID !== null )
    			{
    				window.clearTimeout( toutID );
    			} else if ( afrID ) {
    				//btb.d eb( 'cancelling aftID= ' + afrID );
                    //// moreover if toutID is already cleared, but AF is already and yet scheduled, do amend AF:
                    cancelAnimationFrame( afrID );
                    afrID = null;
                }

           		toutID = setTimeout( delayedCb, delay );
        		//btb.d eb( 'did set timeout ... ' + ' toutID=' + toutID );
    		};
        }

        return outerCb;

	};

}) ();

