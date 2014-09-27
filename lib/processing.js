var selectors={
	dom:{
		count:function($, path){
			console.log("sizzle: " +path);
		},
		getList:function($, fn){
			var d;
			if(typeof fn=='function'){
				d=fn($);
			}
			else{
				d=$(fn);
			}
			return {
				data:d,
				count:d.length
			}
		},
		getValue:function($, fn, elem, prefix, index){
			if(typeof fn=='function'){
				return fn($, elem, index-1);
			}
			else{
				return $(fn).text().trim();
			}
			//console.log($("*", elem).attr("href"));
		},
		getFile:function($, fn, elem, prefix, index){
			var val;
			if(typeof fn=='function'){
				val = fn($, elem, index-1);
			}
			else{
				val = $(fn).text().trim();
			}
			return {
				//type:val.split('.').pop(),
				original:val,
				interfayse_type:'file'
			}
			//console.log($("*", elem).attr("href"));
		}
	}
}
var DOMMapper={
	//mode=the model, dom = the parsed Data, select= the selector.
	//structure = the data already avalible in the process
	defaultSelector:selectors.dom,
	map:function(model, dom, structure, select){
		var selector=selectors[select] || this.defaultSelector;
		structure=this.generateStructure(model, dom, selector, structure);
		return structure;
	},
	generateStructure:function(model, dom, selector, structure, prefix, index, elem){
		for(var p in model){
			if(typeof model[p] === 'function'){
				var fn=model[p].call(this, structure, p, dom, selector, prefix, index, elem);
				this[fn.fn].apply(this, fn.args);
			}
		}
		return structure;
	},
	file:function(path, structure, member, dom, selector, prefix, index, elem){
		structure[member]=selector.getFile(dom, path, elem, prefix, index);
	},
	value:function(path, structure, member, dom, selector, prefix, index, elem){
		structure[member]=selector.getValue(dom, path, elem, prefix, index);
	},
	list:function(path, model, structure, member, dom, selector){
		structure[member]=[];
		var list=selector.getList(dom, path);
		console.log("processorEngine list() "+list.count);
		for(var i=1;i<=list.count;i++){
			structure[member].push(this.generateStructure(model, dom, selector, {}, path, i, list.data));
		}
	}

}
exports.DOMMapper=DOMMapper;
