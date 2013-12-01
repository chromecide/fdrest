if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(){
    var mixin = {
        name: 'fdrest/api',
        inputs: [
            {
                name: 'http.request',
                accepts:['FluxData/http/request']
            }
        ],
        outputs: [],
        //called when first mixing in the functionality
        init: function(cfg, callback){
            var self = this;
            var errs = false;
            
            if(cfg.port){
                self.requireMixin('FluxData/http/server', cfg, function(){
                    self.on('http.request', function(data){
                        self.fdrest.processRequest.call(self, data);
                    });

                    for(var key in cfg){
                        self.set(key, cfg[key]);
                    }

                    var store = self.get('store');

                    if(!(store instanceof self.constructor)){
                        
                        store = new self.constructor(store);
                        store.once('channel.ready', function(){
                            store.fetch(function(){
                                if(callback){
                                    callback(errs, self);
                                }
                            });
                        });
                        self.set('store', store);
                    }else{
                        store.fetch(function(){
                            if(callback){
                                callback(errs, self);
                            }
                        });
                    }
                });
            }else{

            }
        },
        //called when something is published to this channel
        publish: function(topic, data){
            switch(topic){
                case 'http.request':
                    self.fdrest.processRequest.call(self, data);
                    break;
            }
        },
        fdrest: {
            processRequest: function(data){
                var self = this;
                var request = data.get('request');
                var response = data.get('response');

                //parse the request uri
                
                var requestPath = request.url;
                if(requestPath.indexOf('/')===0){
                    requestPath = requestPath.substr(1);
                }

                requestPath = requestPath.split('/');
                var store = self.get('store');
                if(!store.get('models.'+requestPath[0])){
                    response.statusCode = 404;
                    response.end('404');
                }else{
                    var col = store.get('collections.'+requestPath[0]);
                    
                    col.onAny(function(){
                        console.log(this.event);
                    });

                    switch(request.method){
                        case 'GET':
                            if(requestPath.length===1 || (requestPath.length===2 && requestPath[1]==='')){
                                col.fetch(function(err, records){
                                    console.log(arguments);
                                    if(records.length>0){
                                        var outputArray = [];
                                        for(var i=0;i<records.length;i++){
                                            outputArray.push(records[i].getValue());
                                        }

                                        response.statusCode = 200;
                                        response.end(JSON.stringify(outputArray), 'UTF-8');
                                    }else{
                                        response.statusCode = 200;
                                        response.end('[]', 'UTF-8');
                                    }
                                });
                            }
                            break;
                        case 'POST':
                            console.log('POST', request.url);
                            break;
                        case 'PUT':
                            console.log('PUT', request.url);
                            break;
                        case 'DELETE':
                            console.log('DELETE', request.url);
                            break;
                    }
                }
            }
        }
    };
    
    return mixin;
});