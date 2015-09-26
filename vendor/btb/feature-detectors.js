//  //\\//  Detects transform3d and other CSS features
//          credit: http://stackoverflow.com/questions/5661671/detecting-transform-translate3d-support
//          Must run after document is ready ...
//          License MIT. Copyright (c) 2015 Konstantin Kirillov.

( function () {

	var btb				= window.btb$				= window.btb$				|| {};		

    btb.doRunFeatureDetectorsOnDocument = function ()
    {
        btb.hasTranslate3d = hasTransformFeature( "translate3d(1px,1px,1px)" );
        btb.hasTranslate   = hasTransformFeature( "translate(1px,1px)" );
        btb.ifdeb( 'btb.hasTranslate3d=' + btb.hasTranslate3d + ', btb.hasTranslate=' + btb.hasTranslate );
    };

    function hasTransformFeature ( feature )
    {
        if( !window.getComputedStyle ) return false;

        var has3d;
        var el = document.createElement( 'p' );
        var transforms =
        {
                'webkitTransform'   :'-webkit-transform',
                'OTransform'        :'-o-transform',
                'msTransform'       :'-ms-transform',
                'MozTransform'      :'-moz-transform',
                'transform'         :'transform'
        };
    
        // Add it to the body to get the computed style.
        document.body.insertBefore( el, null );

        for (var t in transforms) {

            if ( typeof el.style[t] !== 'undefined' ) {

                el.style[t] = feature;
                has3d = window.getComputedStyle( el ).getPropertyValue( transforms[t] );
            }
        }

        document.body.removeChild( el );

        return ( typeof has3d !== 'undefined' && has3d.length > 0 && has3d !== "none" );
    }


}) ();



