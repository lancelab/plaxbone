//  //\\//  This file dispatches events.



( function ( $ ) {

    //: namespaces
	var btb						= window.btb$			= window.btb$			|| {};		
	var app						= btb.app				= btb.app				|| {};
    var	conf    				= app.conf				= app.conf				|| {};
	var events					= app.events			= app.events			|| {};



    /// Initializes events
	events.init = function ()
	{

        var $win = $( window );


        //  //\\    scroll smoothing        //////////////////////////////////////////////
        //  seems working well on desktop
		var effectiveScroll = app.processHtelPhase;

        //: estimates Graphics Processor Power:
	    var width			= screen.width;
	    var height			= screen.height;
        var volume          = width * height;
        /// 800 * 500 do match Android 2.3.5, Samsung Galaxy Player YP G1.
        //  if( volume < 800 * 500 ) {  

        //  most recent experiment tells that YP works well without throttling ...
        //  perhaps the best way is to tune up the size of graphic files ...
        //  if( volume < 300 * 100 ) {

        //  for mode conf.anitchoking === 'timedelay',
        //      value 1 seems bad for YP G1
        //      value 10 feels better for YP G1
        //  conf.antichokingDelay = conf.antichokingDelay || 1;

        var effectiveScroll = btb.throttledAnimFrame( app.processHtelPhase, conf[ 'antichoking-delay' ], conf.antichoking );
        //  \\//    scroll smoothing        //////////////////////////////////////////////



		$win.bind( 'scroll', effectiveScroll );

        var resize_thr  = btb.throttledCallback( app.onresize, 50 );
		$win.resize(    resize_thr );
	};


}) ( jQuery );	



