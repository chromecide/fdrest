if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(['./mixins/api.js'], function(rest_store){
    
    var mixin = {
       rest_store : rest_store
    };
    
    return mixin;
});