(function(ctx){

  //Load dependencies
  var List= require("./list").List;
	var poller=require("./poller");

  var processCount=0;

	var Process=function(){
		this.actions=new List(function(action){
			if(action!==undefined){
				if(this.id>action.id){
					return 1;
				}
				else{
					return -1;
				}
			}

		});
		this.id=processCount;
		processCount++;
		this.currentAction=null;
		this.setting={};
		this.data={};
		this.counter=0;
		this.waitOnSub=false;
		this.isSub=false;
		this.storeData=true;
		this.isRunning=false;
		this.parentProcess=undefined;
		this.keystoneModel;

		//object refs added by API
		this.pubsub;

		this.subProcesses=[];
		this.done=function(arg){

			if(!this.waitOnSub)
			{
				if(!this.isSub){
					//Save data;
					debugger;
					this.save();
				}
				else{
					console.log("sub done "+this.id);
				}

				this.counter;
				this.data={};
				this.clear();
			}
			else{
				console.log("waiting on sub");
			}
		}
		this.clear=function(){
			this.actions.remove(function(action){
				return action.isClone;
			})
			this.data={};
			this.isRunning=false;
			console.log("clear "+this.isSub);

		}
	}

	Process.prototype={
		save:function(){
			//traverse all task data objects
			for(var p in this.data){
				//each task has its own set of temp models, traverse them
				for(var model in this.data[p]){

					//For each object in the temp model
					for(var i=0;i<this.data[p][model].length;i++){

						//Create a keystone model item
						var item=new this.keystoneModel.model();
						var doSave=false;

						//Traverse the temp model item to find matching properties
						for(var prop in this.data[p][model][i]){

							//If matching property is found, add it to the keystone model item
							if(this.keystoneModel.fields[prop]){

								/* TODO: handle this diffrently depending on file type in keystone
								*  At this point each value is just added to the prop in the keystome item
								*  this will have to be handled diffrently for files etc...
								*/
								item[prop]=this.data[p][model][i][prop];
								doSave=true;
							}
						}
						
						//If any item has been created and populated, save the item
						if(doSave){
							item.save();
						}
					}
				}
			}
		},
		getRootProcess:function(){
			if(this.parentProcess!=undefined){
				return this.parentProcess.getRootProcess();
			}
			return this;
		},
		add:function(action){
			action.inProcess=this;
			//this.actions.push(action);
			this.actions.add(action);
		},
		subProcess:function(subprocess){
			console.log("adding sub "+subprocess.id);;
			this.subProcesses.push(subprocess);
			subprocess.parentProcess=this;
			this.waitOnSub=true;

			var done=subprocess.done;
			subprocess.done=(function(parentProcess, subprocess, done){
				return function(){
					done.call(subprocess, "sub");
					parentProcess.subProcessDone.call(parentProcess, subprocess);
				}
			})(this, subprocess, done);
		},
		subProcessDone:function(subprocess){
			if(!subprocess.waitOnSub && this.subProcesses.length>0){
				var index=-1;
				for(var i=0;i<this.subProcesses.length;i++){
					if(this.subProcesses[i].id===subprocess.id){
						index=i;
						break;
					}
				}
				if(index>-1){
					console.log("Remove sub: "+subprocess.id.toString());
					this.subProcesses.splice(index,1);
				}
			}
			if(this.subProcesses.length===0){
				console.log("running done method on parent");
				this.waitOnSub=false;
				this.done();
			}
		},
		sequence:function(setting){
			for(var p in setting){
				this.setting[p]=setting[p];
			}
			//Run sequence loop
			if(this.setting.frequency!==undefined){
				poller.createPoller({
	                method:this.run,
	                context:this,
	                asyncCallbackIndex:0,
	                args:[this.clear],
	                tt:this.clear,
	                delay:this.setting.frequency
				}).start();
			}
			//Start by time
			else if(this.setting.time!==undefined){
				this.pubsub.subscribe("timer", function(args){
						if(!this.isRunning && args.getHours()==this.setting.time.hour && args.getMinutes()==this.setting.time.minute){
							this.run();
						}
					}, this);
			}
			return this;

		},
		run:function(){
			this.isRunning=true;
			this.counter++;
			if(!this.isSub){
				console.log("start main "+this.counter);
			}
			else{
				console.log("start sub "+this.id);
			}
			if(this.actions.first){
				this.currentAction=this.actions.first;
				this.currentAction.data.init();
			}
			else{
				this.done();
			}
			//console.log("run process");
			return this;
		},
		next:function(){
			if(this.currentAction.next){
				this.currentAction=this.currentAction.next;
				this.currentAction.data.init();
			}
			else{
				this.done();
			}
		},
		addData:function(data, taskName){
			if(this.data[taskName]){
				console.log(taskName);
				this.mergeData(this.data[taskName], data);
			}
			else{
				this.data[taskName]=data;
			}

		},
		mergeData:function(dest, src){
			for(var p in src){
				if(dest[p]){
					if(typeof dest[p]=="string"){
						if(dest[p]!==src[p]){

							dest[p]=[dest[p], src[p]];
						}
					}
					else if(Array.isArray(dest[p])){
						if(src[p]){
							for(var i=0;i<src[p].length;i++){
								dest[p].push(src[p][i]);
							}
						}
					}
				}
			}

		}


	}
  ctx.Process=Process;
})(exports)
