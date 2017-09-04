"use strict";

var num = 0;

function promiseSqrt(value){
    return new Promise(function (fulfill, reject){
        console.log('START execution with value =', value);
        num = num + value;
        fulfill({ value: value, result: num });
        /*setTimeout(function() {
            //fulfill({ value: value, result: value * value });
            
        }, 0 | Math.random() * 100);*/
    });
}
 
var p = [];
for (var n = 0; n < 10; n++) {
    p.push(promiseSqrt(n , n * 2));
}

Promise.all(p).then(function(results) {
    //console.log(results.num)
    results.forEach(function(obj) {
        console.log('END execution with value =', obj.value, 'and result =', obj.result);
    });
    console.log('COMPLENTED');
}); 