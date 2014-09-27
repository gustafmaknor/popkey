(function(global_context, undefined){
    "use strict";

    var poller={
        /**
        *Creates a new poller.
        *def = {object}
        *
            {
                method:obj.say,         //initiator method, the method to poll
                context:obj,            //context to run initiator method
                asyncCallbackIndex:1,   //restart poll firs when the callback
                                        in the args array has executed.
                args:["hej", callback],
                delay:2000              //set poll delay
            }
        **/
        createPoller:function(def){
        var poller ={
        context:(def.context || {}),
            delay:def.delay || 1000,
            run:true,
            start:function(delay){
                if(this.run){
                    if(delay!==undefined){
                        this.delay=delay;
                        setTimeout(this.poll(this),0);
                    }
                    else{
                        setTimeout(this.poll(this),this.delay);
                    }
                }
                return this;
            },
            stop:function(){
                this.run=false;
                return this;
            },
            resume:function(){
                this.run=true;
            },
            poll:function(poller){
                    return function(){
                        return (function(context){
                            def.method.apply(context, def.args);
                        })(poller.context);
                    }
                }
            };
            (function(poller){
                var m=((typeof def.asyncCallbackIndex)===(typeof 1))?
                 (function(){
                    var fn=def.args[def.asyncCallbackIndex];
                    return function(){
                        console.log("restart on callback");
                        fn.apply(poller.context, arguments);
                        poller.start();
                    }
                })()
                :(function(){
                    var fn=def.method;
                    return function(){
                        console.log("restart on initiator");
                        fn.apply(poller.context, def.args);
                        poller.start();
                    }
                })();
                if(def.args!==undefined && typeof def.args[def.asyncCallbackIndex]==='function'){
                    //def.args[def.asyncCallbackIndex]=m;
                    //ToDo: some marshalling problem here.
                    //In browser def.args[async...] is referencing to done(). node however sem to pass by value
                    poller.context.clear=m;
                }
                else{
                    def.method=m;
                }
            })(poller)
        return poller;
        }
    }
        global_context.createPoller=poller.createPoller;
})(exports)
