var Process=require('./lib/process').Process;
var Action=require('./lib/action').Action;

	function getValue(){
		var args=Array.prototype.slice.call(arguments);
		var fieldSettings;
		if(args.length===2){
			fiedSettings=args.splice(1,1);
		}
		else{
			if(typeof fieldSettings=="boolean"){
				fieldSettings={
					persist:fieldSettings
				}
			}
		}
		return function(){
			return {
				fn:'value',
				args:args.concat(Array.prototype.slice.call(arguments)),
				settings:fieldSettings
			}
		}
	}
    function getList(){
		var args=Array.prototype.slice.call(arguments);
		return function(){
			return {
				fn:'list',
				args:args.concat(Array.prototype.slice.call(arguments))
			}
		}
	}
	var popkey={
	    task:function(keystoneModel, tasks){
	      var process=new Process();
	      process.keystoneModel=keystoneModel;
	      var actionId=0;
	      var prev=null;
	      for(var p in tasks){
	        if(typeof tasks[p] ==='object'){
	          process.add(new Action(tasks[p], process.id+'_'+p, actionId));
	          prev=p;
	          actionId++;
	        }
	        else if(typeof tasks[p]==='function' && prev!==null){
	          var fn=tasks[p].call(process, prev);
	          process[fn.fn].apply(process, fn.args);
	        }

	      }
	      return process;
	    },
	    getValue:getValue,
	    getList:getList
	}
	exports.popkey=popkey;
	/*popkey.task({
	villa:{
		url: 'http://w4.sfd.se/obj/obj.dll/list?firmanr=32068',
		model: {
			estates:getList(function($){
					return $('.tblObjlist .Rand:nth-child(odd) a');
				},{
				link:getValue(function($, list, index){
					var val=list.eq(index).attr("href");
					val=val.substring(val.indexOf("'")+1, val.lastIndexOf("'"));
					return val;
				})
			})
		}
	}
}).run();*/
