//Connection

	var request=require("request");
	var crypto=require("crypto");
	//var settings;

	var cache={
		store:[],
		createHash:function(value){
			var hash = crypto.createHash('SHA1')
			if (!hash.write) {
				hash.update(value)
				return hash.digest('hex')
			}
			else {
				hash.setEncoding('hex')
				hash.end(value)
				return hash.read()
			}
		},
		isNew:function(response){


			var req={
				length:response.headers['content-length'],
				chechsum:this.createHash(response.body),
				url:response.request.uri.href
			}
			for(var i=0;i<this.store.length;i++){
				if (this.store[i].length===req.length && this.store[i].chechsum===req.chechsum && this.store[i].url===req.url){
					return false;
				}
			}
			this.store.push(req);
			return true;
		}
	};
	function http(settings){
		var settings=settings || {};
		this.callback;
		this.setting={
			force:settings.forceRefresh || false
		}
	}
	http.prototype={
		get:function(url, callback){
			console.log(url);
			this.callback=callback;
			request(url, (function(ctx, callback, cache){
				return function(error, response, body){
					if(error==null && (ctx.setting.force || cache.isNew(response))){
						ctx.callback(body);
					}
					else{
						ctx.callback();
					}
				}
			})(this, callback, cache));
		}
	}

	exports.http=http;
	exports.init=function(s){
		settings=s;
	}
