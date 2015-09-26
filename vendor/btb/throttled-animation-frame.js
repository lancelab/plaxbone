//	//\\//	    Throttles ( double delayes callback ) via timeout and further by default via animationFrame.
//              First it delays a callback, and if AF mode is chosen, puts it into AF.
//              Furthemore, if next event is fired before AF began, then
//              AF is cleared, callback not executed, and callback is delayed again.

( function () {

	var btb				= window.btb$				= window.btb$				|| {};		

    var DEFAULT_DELAY = 1000 / 60;   //mimics expected FPS.
    var DEFAULT_DELAY = 1;


    ///firstly do polyfil missed requestAnimationFrame and cancel...
    ( function () {
        //=============================================================================================================
        // this may have more thought: https://github.com/julienetie/request-frame/blob/master/src/request-frame.src.js
        // seems not the most elaborate polyfil, but enough satisfactory:
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
    }) ();





    /// Throttles ( double delayes callback ) via timeout and further by default via animationFrame.
	btb.throttledAnimFrame = function ( callback_at_the_end, delay, delay_mode )
	{
    	//btb.d eb( 'setting up btb.throttledAnimFrame ... delay_mode=' + delay_mode +' delay=' + delay );
        //. requestAnimationFrame mode is a hard-coded default
        delay_mode = delay_mode || 'animFrame';
        if( delay_mode === 'none' ) return callback_at_the_end;

		var toutID		= null;
        var afrID       = null;
		var event		= null;
		delay           = delay || DEFAULT_DELAY;

		var delayed_cb = function ()
		{
			//btb.d eb( 'executing delayed_cb ... delay_mode = ' + delay_mode + ' toutID=' + toutID );
			toutID = null;
            if( delay_mode === 'timedelay' ) {
    			callback_at_the_end( event );
            } else if ( delay_mode === 'animFrame' ) {
    			var afrID = requestAnimationFrame( function () {
           			//btb.d eb( 'executing requestAnimationFrame ... afrID=' + afrID );
                    afrID = null;
                    callback_at_the_end( event );
                } );
            }
		};



        var throttledEventHandler = function ( event_ ) {

			//.	good but too wordy de bug:
			//  btb.d eb( ' callbacked. toutID=' + toutID + 'event_=', event_ );

			//.	good de bug:
			//  btb.d eb( 'external callback fired on event.type=' + event_.type + ' toutID=' + toutID );

			event = event_;

			if( toutID !== null )
			{
				window.clearTimeout( toutID );
			} else if ( afrID ) {
				//btb.d eb( 'cancelling aftID= ' + afrID );
                //// moreover if toutID is already cleared, but AF is already and yet scheduled, do amend AF:
                cancelAnimationFrame( afrID );
                afrID = null;
            }
       		toutID = setTimeout( delayed_cb, delay );
    		//btb.d eb( 'did set timeout ... ' + ' toutID=' + toutID );
		};

        return throttledEventHandler;

	};

}) ();



