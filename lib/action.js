var connection=require('./connection');
var parser=require('./parser');
var processing=require('./processing');


var Action=function(task, taskName, id){
		this.id=id;
		this.name=taskName;
		this.data={};
		this.orgTask=task;
		this.isClone=false;


    this.url=task.url;
    this.connection=new connection.http();
		this.selector='dom';
    this.parser=new parser.dom();
    this.engine=processing.DOMMapper;
		this.model=task.model;

		//Make sure a subprocess uses the data already on the main process.
		if(task.data){
			this.data=task.data;
		}

    //Set up the then function to be run before finalizing the current action
		if(task.then){
			var fin=this.finalize;
			this.finalize=(function(fin, ctx){
				return function(){
					task.then.call(ctx, ctx.data);
					fin.call(ctx, arguments);
				}
			})(fin, this);
		}

	}
	Action.prototype={

    /*
    Gets the input data for the action
    */
		init:function(){
      //Fetch the data from the url
				this.connection.get(this.url, (function(ctx){
						return function(data){
              //Process the result
							ctx.process.call(ctx, data);
						}
					})(this));
		},
    /*
    Processes the input data and maps it to the KeyStone model
    */
		process:function(data){

        //If there is any data to process, do so. Otherwise finalize the action
				if(this.engine!==undefined && data!==undefined){

          //Parse the data as a cheeroi doc
					this.parser.parse(data, (function(ctx){
						return function(parsedData){
              //Use the cheeroi selectors to mapp the data to the KeyStone model
							ctx.data=ctx.engine.map(ctx.model, parsedData, ctx.data, ctx.selector);
							ctx.finalize();
						}
					})(this));
				}
				else{
					this.finalize();
				}
		},

    /*
      Finalize the action and execute the next action inte the process.
      I the action is in a sub process, adds the data to the root process
    */
		finalize:function(){
			if(!this.inProcess.isSub){
				this.inProcess.getRootProcess().addData(this.data, this.name);
			}
			this.data={};
			this.inProcess.next();
		},

    /*
      Create a sub process to fetch data depending on values from the parent
      process.

      Use case example: The main process fetches a blog archive. The sub browses
      each post to fetch additional data not present on the archive page.

      A sub can access it´s parents data and the parent wont finish untill all
      subs are finished.
    */
		sub:function(tasks){
			var subprocess=task(tasks);
			subprocess.isSub=true;
			this.inProcess.subProcess(subprocess);
			return subprocess;
		},

    /*
      Clone the action instance in order to run at another url.
      Ideally used for paginated pages
    */
		clone:function(url){
			this.orgTask.input.url=url;
			var newAction=new Action(this.orgTask, this.name, this.id+1);
			newAction.isClone=true;
			this.inProcess.add(newAction);
		}

	}
  exports.Action=Action;
