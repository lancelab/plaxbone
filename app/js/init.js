
//  //\\//  PlaxBone. Parallax widget configurable from HTML-file.
//          Copyright (c) 2015. Konstantin Kirillov.
//          License on everything except images and videos: MIT.
//          License on images and videos: all rights reserved.
//
//          This file is a main entry point into application.
//
//      version 14. Sept 29 - Oct 3, 2015.
//                  Improved animationFrame throttler: vendor/btb/throttled-animation-frame.js
//                  Added youjoomla HTML-attributes parser and fallback to them:
//                      for speed, directions, phase,
//                      css-background media is available.
//      version 13. Sept 26, 2015.
//                  Posted to github. Minor cleanup.
//      version 10. Sept 25, 2015. 
//                  Android 2.3.5 began showing video even yet as showing video separately from HTML-page
//                  and yet with controls and non-scaled to width.
//
//      version 9.  Sept 24, 2015.
//                  Adopting to client youjoomla-framework.
//                  Non-necessary files removed from vendor/btb/ and from vendor/.
//
//      version 8.  Sept 15-20, 2015.
//                  AnimatinFrame throttler.
//                  translate and translate3d for supporting browsers.
//                  Disabling CSS visibility for hidden parallax-frames.
//                  Granular configuration: delay-mode: none, aframe, timedelay;
//                  Internals code:
//                      names improved
//      version 7.  
//                  name changed to plaxbone
//
//      version 5.  Sept 15, 2015.
//                  Sprites smaller than master image to improve performance.
//                  Scroll phase inaccuracy bug fixed.
//                  More config options added to html:
//                      initial x and y positions.
//      version 4.  Sept 14, 2015.
//                  More config options added to html:
//                      x and y speed
//      version 3. 
//                  Phase0 added.
//                  offset bug fixed.
//      version 2. Sept 10.
//                  Image and parent frame height is set by stashed aspect ratio.   
//                  Missed second child img height resize bug is fixed.
//      version 1. Sept 10.
//                  still clumzy on Android 2.3.5, Samsung Galaxy Player.
//                  see howto.txt


( function ( $ ) {

    //: namespaces
    var btb                     = window.btb$            = window.btb$            || {};        
    var app                     = btb.app                = btb.app                || {};
    var events                  = app.events             = app.events             || {};




    // Main entry point into the application
    // If full page load is required, use this: $( window ).load( function () {
    $( document ).ready( function () {

        //d ebug
        btb$.ifdeb ( 'document ready' );

        btb.doRunFeatureDetectorsOnDocument ();
        app.start ();

    });

}) ( jQuery );
