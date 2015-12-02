
var watcher = [];
var i = 0;

var alphabet = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27];

function sayMultipleHi(){
	
	if( watcher.length < 10 ){
		sayHi();
		watcher.push( new Date() );
	} else {

	}

}


sayMultipleHi();

