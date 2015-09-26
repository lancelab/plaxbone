
//  //\\//  This file does application initialization and sets up all run-time processes.
//
//          Parses frame's children script from HTML-data-conf element.
//          Finalizes frames and their children, ( f.e. images ).
//          Setus up positioner, doPositionChildElements,  which work is based on child phase.
//          Child phase is determined on scroll-bar-position.


( function ( $ ) {

    //: namespaces
    var btb                     = window.btb$           = window.btb$           || {};        
    var app                     = btb.app               = btb.app               || {};
    var conf                    = app.conf              = app.conf              || {};
    var events                  = app.events            = app.events            || {};
    var yjoomla                 = app.yjoomla           = app.yjoomla           || {};



    //: hard-coded constants
    var MOBILE_VIDEO_ZINDEX = 111111111;


    //:  private variables
    var winheight;      //browser window height
    var bodyHeight;     //document body height
    var topFrames;      //frames to animate in parallax
    var $win;           //jQuery window object


    /// gets attr on htmel and runs cb if any ...
    /**
     * @param  {string} type request | cancel | native.
     * @return {object} configuration object | configuratoin-string
     */
    function getAttributes ( htmel, attr, cb, primitive )
    {
        var econf = null;
        //https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Using_data_attributes
        var conf = htmel && htmel.getAttribute && htmel.getAttribute ( attr );
        if( conf ) {
            try {
                    //  btb.ifdeb( 'conf::::' + conf );
                    //  This statement is possibly faulty on Android 2.3.5:  eval( sconf );
                    var econf = primitive ? conf : JSON.parse( conf );
            } catch ( err ) {
                    alert( 'error on attribute ' + attr + '="' + conf + '". err-' + err );
                    return eonf;
            }
        }
        cb && cb( econf, htmel );
        return econf;
    }




    /// Does core initialization work
    app.start = function ()
    {
        btb.ifdeb( 'app initiates in app.start ... ' );

        topFrames   = [];
        $win        = $( window );


        var wDivConf = $( 'div[data-conf-app]' ) || [];
        $.extend( app.conf, getAttributes( wDivConf[0], 'data-conf-app' ) || {} );

        //.checks if site prefers using different configuration prefix
        var wDconfPref = app.conf[ 'dconf-pref' ] || 'data-conf';

        if( btb.browser.mobile ) app.conf[ 'antichoking-delay' ] = app.conf[ 'antichoking-delay' ]  || 10;

        /////////////////////////////////////////////////////////////////
        /// Loops through parallax candidates marked by flag 'data-conf'.
        //  https://learn.jquery.com/using-jquery-core/iterating/
        /////////////////////////////////////////////////////////////////
        $( 'body > div' ).each( function ( key, framediv ) {
            
            if( yjoomla.getAttributes ) {
                //// attaches custom framework for youjoomla.com
                //   stub
                //   yjoomla.getAttributes();
            } else {
                getAttributes( framediv, wDconfPref, parseAttributes );
            }
        });
        //.inits events because all dependent application parts are already in place
        events.init ();
        //.draws
        app.onresize ();
    };


    /// Helper. Parses and spawns pframe and pframe-children 
    //  attributes when called in loop
    /**
      * @param {object} fconf    - pframe configuration
      * @param {object} framediv - DOM-element
      */
    function parseAttributes ( fconf, framediv )
    {
                if( !fconf ) return;

                /// builds information about parent-frame
                //  parent-frame comprises subPFrames, images or other parts of 3d scene ...
                fconf.perspective = fconf.perspective || 1;
                var fsize   = fconf.sizepx;
                var $frame  = $( framediv );
                var frame =
                { 
                    ix              : topFrames.length,
                    $frame          : $frame,
                    perspective     : fconf.perspective,
                    conf            : fconf
                };
                frame.aratio = fconf.aratio; //dumb default value
                frame.aratio = ( fsize && [ fsize[ 1 ] / fsize[ 0 ] ] ) || fconf.aratio;

                btb.ifdeb( 'frame.aratio=' + frame.aratio + ' fconf.aratio= ' + fconf.aratio );
                topFrames.push( frame );


                //:cruerly restricts parent's CSS
                $frame. css( 'position', 'relative' ).   css( 'overflow', 'hidden' ).
                        css( 'border', '0px;' ).         css( 'margin', '0px' ).
                        css( 'padding', '0px;' ).        css( 'width', '100%' );


                ///////////////////////////////////////////////////////////////
                //// Sets parallax scene items (subPFrames).
                //// Parses image parameters from getAttribute ( 'data-conf' )
                ///////////////////////////////////////////////////////////////
                var $children = $( framediv ).children();
                //c ccc( 'ch=', $children );
                $children.each( function ( key, subPF ) {

                    var $subPF = $( subPF ).css( 'border', '0px' ).css( 'margin', '0px' );

                    //. very dangerous thing: img may be not yet loaded
                    //  frame.aratio   = frame.aratio; // TODM || img.naturalHeight / img.naturalWidth;
                    var subPFrames = frame.subPFrames = frame.subPFrames || [];

                    var helWrap = {};
                    getAttributes( subPF, 'data-conf', function ( subPFconf ) {

                        if( !subPFconf ) return;
                        //c ccc( 'item=', subPF, 'subPFconf=', subPFconf );

                        subPFconf.distance = subPFconf.distance || 1;
                        var speed = subPFconf.speed || [ 0, 0, 0 ];
                        //.adds standard parallax increase in respect to parent layer:
                        speed[ 1 ]  += 1 - fconf.perspective / subPFconf.distance;

                        var boxpx   = subPFconf.boxpx;
                        $.extend ( helWrap, { 
                            ix      : subPFrames.length,
                            $subPF  : $subPF,
                            conf    : subPFconf,
                            speed   : speed,
                            phase0  : subPFconf.phase0 || 0,
                            scale   : boxpx && fsize && [ 1 / fsize [ 0 ], 1 / fsize [ 1 ] ],
                            video   : subPF.tagName.toLowerCase() === 'video'
                        });
                        subPFrames.push( helWrap );
                        $subPF.css( 'position', 'absolute' ).css( 'top', '0px' );
                        // too easy to be right: .css( 'width', '100%' );
                        // changed in version 5.
                    });
                    //btb.ifdeb( 'btb.browser.mobile=' + btb.browser.mobile + ' ' + subPF.tagName );

                    /// places mobile video-start-button on top
                    //  TODM this solution for mobiles is half-done
                    //      z-index manipulations may be not necessary,
                    //      z-index 0 and MOBILE_VIDEO_ZINDEX may be incorrect,
                    if( helWrap.video && btb.browser.mobile ) {
                        $subPF.css( 'z-index', MOBILE_VIDEO_ZINDEX );
                        subPF.addEventListener( 'playing', function() { 
                            $subPF.css( 'z-index', 0 );
                            //.this statement has been tested on Android 2.3.5
                            //btb.ifd eb( 'raised z-index-=' + $subPF.css( 'z-index' ) );
                        } );
                        //btb.ifd eb( 'mobile-video: z-index=' + $subPF.css( 'z-index' ) );
                    }
                    
                });
    }





    /// Event handler. Handles browser window resizing earthquake
    app.onresize = function ()
    {
        winheight   = $win.height();
        //btb.ifdeb( 'app.processHtelPhase starts ... ' );
        $.each( topFrames, function ( key, frame ) {

            var $frame      = frame.$frame;
            var width       = $frame.width();
            var helWrap     = frame.subPFrames[ 0 ];
            var $subPF      = helWrap.$subPF;
            var height      = frame.aratio * width;

            //... ' img.clientHeight=' + img.clientHeight;
            //var height = parseInt( $( subPF ).css( 'height' ) );

            //.shifts all dom tree along Y
            $frame.css( 'height', height + 'px' );
            //. FFF: above  is extremely painful flaw: it makes first img height 22 pix more


            /// resizes and prepositions subPFrames
            $( frame.subPFrames ).each( function ( key, helWrap ) {

                helWrap.distance    = helWrap.conf.distance;
                helWrap.width       = width;
                helWrap.height      = height;
                var iwidth          = width;
                var iheight         = height;
                helWrap.sleft       = 0;
                helWrap.stop        = 0;

                //  //\\    scales small sprites
                var scale   = helWrap.scale;
                if( scale ) {
                    var boxpx       = helWrap.conf.boxpx;
                    //TODM move to resize event:
                    helWrap.sleft   = boxpx[0] * scale[0] * width;
                    helWrap.stop    = boxpx[1] * scale[1] * height;
                    var iwidth      = boxpx[2] * scale[0] * width;
                    if( !helWrap.video ) {
                        var iheight   = boxpx[3] * scale[1] * height;
                    }
                    // else {
                    //    c ccc( 'parent width=' + width + 'boxpx[2]=' + boxpx[2]  + ' scale=' + scale[0] +
                    //           ' width=' +  width + 'iwidth=' + iwidth );
                    //}
                }
                //  \\//    scales small sprites

                //.corrects FFF-flaw ... TODM
                helWrap.$subPF.css( 'width', iwidth + 'px' );

                //btb.browser.mobile seems needed for Android 2.3.5 ... without this no controls are displayed and
                //no video is possible at all
                if( !helWrap.video || btb.browser.mobile ) {
                    ////video won't scale anyway ...
                    helWrap.$subPF.css( 'height', iheight + 'px' );
                }
                /*
                if( helWrap.video ) {
                    $subPF[0].width = iwidth;
                }
                */
                //jq[ 0 ].style.height = height + 'px';

            });
            //c ccc( 'after heighting: ' + key + ' subPF css height  = ' + $subPF.css( 'height') + ' parent-height =' + height );
        });
        //. after all frames established their heights ...
        bodyHeight  = Math.max( $( document.body ).height(), winheight );   //TODM give it more thought ...
        
        app.processHtelPhase ();
    };







    //***********************************************************
    //  //\\    Distributes children accorging to scroll ...
    //          A heart of the application ...
    //***********************************************************
    /// gets phase by "window scroll position" and 
    //  shifts parallax layers according their distances
    app.processHtelPhase = function ()
    {
        //btb.ifdeb( 'app.processHtelPhase starts ... ' );
        var wintop = $win.scrollTop(); //window2document(); //?? offset().top;

        //btb.ifdeb( '  wintop=' + wintop + ', offset().top=' + $win.offset().top + ', body.height=' + $( document.body ).height()  );
        btb.ifdeb( '  wintop=' + wintop + ', winheight=' + winheight + ', summ=' + (winheight + wintop) +', body.height=' + bodyHeight  );

        $.each( topFrames, function ( key, frame ) {

            var helWrap     = frame.subPFrames[ 0 ];
            var $frame      = frame.$frame;

            //var box       = boxTest( subPF );
            //var top       = $frame.scrollTop(); //very wrong
            var top         = $frame.offset().top;

            var height      = helWrap.height; // $subPF.height();


            //: phase calculation
            //  top window boundary (winLower) is restricted by value y=0 and body-height - win-height;
            var winLower    = Math.max( 0, top - winheight );
            var winUpper    = Math.min( top + height, bodyHeight - winheight );
            if( winLower > winUpper ) winUpper = winLower + 1; //TODM patch
            var winRange    = winUpper - winLower;
            var phase       = ( wintop - winLower ) / winRange;

            /// arranges subPFrames only in scope of browser main window
            //  c ccc(  '  key=' + key + ', ' + visibilityBottom + ', top=' + top + ', wintop=' + wintop +
            //          ', phase=' + phase + ', winheight=' + winheight + 
            //          ', body.height=' + $( document.body ).height() );
            if( 0 <= phase && phase <= 1 ) {
                /*
                //vital debug
                btb.ifdeb(  frame.ix + ' winLower=' + winLower + ' winUpper=' + 
                            winUpper + ' frame: top=' + top + ', wintop=' + wintop + ', phase=' + phase +
                            ' height=' + height
                );
                */
                $frame.css( 'visibility', 'visible' );
                doPositionChildElements( phase, frame, height );
            } else {

                //if( !btb.browser.mobile ) $frame.css( 'visibility', 'hidden' );

                //.fails on Android 2.3.5
                if( conf[ 'hide-invisible' ] ) $frame.css( 'visibility', 'hidden' );
            }
        });
    };


    /// Heart of heart of the application.
    /// Shifts parallax layers according their distances.
    /**
      * @param {number} phase - pframe phase, any value, negative before sunrise, >1 after sunset
      * @frame {object} frame - DOM-element which is a child of pframe
      */
    function doPositionChildElements( phase, frame )
    {
        $( frame.subPFrames ).each( function ( key, helWrap ) {
            if( helWrap.distance === frame.perspective ) {
                //// sugar: skips repositioning of background elements
                //// it has the same effect if to put subPF without data-conf attribute in the pxframe root ...
                return;
            }
            var width   = helWrap.width;
            var height  = helWrap.height;
            var speed   = helWrap.speed;
            var phase0  = helWrap.phase0;
            var left    = helWrap.sleft + width  * ( phase - 1 + phase0 ) * speed[ 0 ];
            var top     = helWrap.stop  + height * ( phase - 1 + phase0 ) * speed[ 1 ];

            if( btb.hasTranslate3d ) {
                var trans  = 'translate3d(' + left + 'px, ' + top + 'px, 0px )';
                helWrap.$subPF.css( 'transform' , trans );
            } else if( btb.hasTranslate ) {
                var trans  = 'translate(' + left + 'px, ' + top + 'px)';
                helWrap.$subPF.css( 'transform' , trans );
            } else {
                //for IE9: http://caniuse.com/#search=transform
                //for IE10: http://caniuse.com/#search=translate3d
                helWrap.$subPF.css( 'top', top + 'px' ).css( 'left', left + 'px' );
            }
        });
    }
    //  \\//    Distributes children accorging to scroll ...




}) ( jQuery );
