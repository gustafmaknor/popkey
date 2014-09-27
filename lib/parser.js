	var cheerio=require("cheerio");
	function dom(){
	}
	dom.prototype={
		parse:function(data, callback){
			var doc=cheerio.load(data);
			callback(doc);
		}
	}
	exports.dom=dom;
