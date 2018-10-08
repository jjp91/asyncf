'use strict'

function asyncf( cb ) {
	var cpt = 0 , step = 1 , error = 0 , errorgo = 999 , gvar = { newstep: 0 } ; 
	var recursive = 0 , paral = 0 , paralstoponerror = 0 , cptparal = 0 ;
	var timeout = 0 , tparal , newstep ; 
	
	function callback ( err, result1 , result2 ) {
		if ( recursive ) { 
			process.nextTick( callback.bind(this) , err, result1 , result2 ) ; 
			return 
		}
		
		if ( err == 'timeout' && ( this == cpt || ( Array.isArray(this) && this[0] == cpt ) ) ) {
		} else if ( typeof this == 'number' && this == cpt && !paral ) {
		} else if ( Array.isArray(this) && paral && this[0] == cpt && err && paralstoponerror ) { 
			tparal[ this[1] ] = arguments ;
		} else if ( Array.isArray(this) && paral && this[0] == cpt ) { 
			for ( var a = tparal[ this[1] ] = arguments , i = 1 ; i <= paral ; i++ ) 
				if ( !tparal[i] ) return ;
			result1 = tparal ;
			result2 = err = paral = paralstoponerror = cptparal = tparal = 0 ;
		} else return ;
		
		if (timeout) {
			err != 'timeout' && clearTimeout(timeout) ;
			timeout = 0 ;
		}
		
		// if errorgo < 0 then result1 must not be empty
		( errorgo < 0 ) && !err && !result1 && ( err='empty' ) && ( errorgo=-errorgo ) ;
		// if err change step
		if ( (error=errorgo?err:0) ) {
			errorgo && ( result2 = step ) && ( step = errorgo ) && ( result1 = error ) ; // error handling
		}
		
		gvar.newstep = 0 ;
		recursive = 1 ;
		[ newstep = 0 , errorgo = 999 ] = cb( step , result1 , result2 , gvar , callback.bind(++cpt) ) || [] ;
		step = newstep || ( ( gvar.newstep || step ) + 1 ) ;
		recursive = 0 ;
	}
	
	gvar.parallelcallback = function ( stoponerr ) { 
		paralstoponerror = stoponerr || 0 ; 
		( ++paral ) && paral == 1 && ( tparal = [] ) ;
		return callback.bind([cpt,paral]) ; 
	} ;
	
	gvar.settimeout = function ( delay ) { timeout = setTimeout( callback.bind(cpt) , delay , 'timeout' ) } ;
	
	callback.bind(0)() ;
}

function whateverasyncfunction( param1 , param2 , cb , err ) { setTimeout( cb , 1000 , err , param1 , param2 ) }

asyncf( function monasyncprocess ( step , result1 , result2 , gvar , callback ) {
	do { 
		switch ( step ) {
			case 1 : 
				// init 
				console.log( "step 1" ) ;
				gvar.whatever = "anything" ;
				// ...
				
			case 2 :
				// performs directly after case 1
				gvar.newstep = 2 ;
				console.log( "step 2" ) ;
				whateverasyncfunction( 4 , 5 , callback ) ;
				return [ 10 , 29 ] ; // [ next step to execute , with which error handling step ]
				
			case 10 :
				// get results
				console.log( "step 10" ) ;
				console.log( "result1=" + result1 + ",result2=" + result2) ;
				// possibility to go directly
				step = 20 ;
				break ;
				
			case 20 :
				// goto access
				console.log( "step 20" ) ;
				// simulate a callback with error = 10 
				whateverasyncfunction( 0 , 0 , callback , 10 ) ;
				return [ 0 , 29 ] ; // [ automaticaly + 1 , 29 ]
				
				
			case 29 :
				// local error handling step
				console.log( "step 29 " ) ;
				console.log( "local error handling, error=" + result1 ) ;
				// even if callback is sent without parameters, it still works
				callback() ;
				return ; // [ automaticaly + 1 , take default 999 error step ]
				
			case 30 :
				// init loop 
				console.log( "step 30 init loop " ) ;
				gvar.i = 0 ;
				
			case 31 :
				// loop 
				gvar.newstep = 31 ;
				console.log( "step 31  loop " ) ;
				if ( gvar.i > 5 ) { step = 40 ; break }
				
				whateverasyncfunction( gvar.i , 0 , callback ) ;
				return ;
				
			case 32 :
				// end loop
				console.log( "loop 32, i= " + gvar.i) ;
				gvar.i++ ;
				step = 31 ;
				break ;
				
			case 40 :
				// timeout
				console.log( "step 40") ;
				whateverasyncfunction( 0 , 0 , callback ) ;
				gvar.settimeout( 500 ) ;
				return [ 0 , 49 ] ;
				
			case 49 :
				// local error timeout handling 
				console.log( "step 49 " ) ;
				console.log( "local error handling, error=" + result1 ) ;
				// even if callback is sent without parameters, it still works
				callback() ;
				return [ 50 ] ;
				
			case 50 :
				// parallele calling
				console.log( "loop 50") ;
				whateverasyncfunction( 100 , 0 , gvar.parallelcallback() ) ;
				whateverasyncfunction( 101 , 0 , gvar.parallelcallback() ) ;
				whateverasyncfunction( 102 , 0 , gvar.parallelcallback() ) ;
				return ;
				
			case 51 :
				// parallel calling results
				console.log( "loop 51") ;
				console.log( result1 ) ;
				step = 1000 ;
				break ;
				
			case 999 :
				// general error handling step
				console.log( "step 999 " ) ;
				console.log( "error handling =" + result1 ) ;
				//~ whateverasyncfunction( 0 , 0 , callback ) ;
				//~ return [ 1000 ] ;
				
			case 1000 :
				// end process
				console.log( "finished " ) ;
				// done() ;
				return ;
				

			default :
				console.log( "erreur step= " + step ) ;
				return ;
			
		}
	} while ( true ) ;
} ) ;

