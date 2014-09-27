

(function(g_ctx, undefined){
        "use strict";

var List=function(comparer){
        this.first=null;
        this.last=null;
        this.comparer=comparer;
}
List.prototype.add=function(obj){


                //Add wrapping ListItem
                var item=new ListItem();
                item.data=obj;
                var ret=null;
                var comp;
                if(this.first===null){
                        comp=(this.comparer!==undefined)?
                                        this.comparer.call(item.data, undefined):
                                        1;
                        if(comp!==1 || comp!==-1){
                                this.first=item;
                        }
                        ret=this.first;
                }
                else{
                        var walk=true;
                        var current=this.first;
                        while(walk && current!==null){
                                comp=(this.comparer!==undefined)?
                                        this.comparer.call(item.data, current.data):
                                        item.compare(current.data);
                                if(comp===0){ // Item exists, return current
                                        walk=false;
                                        ret=current;
                                }
                                else if(comp===1){
                                        if(current.next!==null){ //Continue
                                                current=current.next;
                                        }
                                        else{ //Att the end, add item last
                                                walk=false;
                                                current.next=item;
                                                item.prev=current;
                                                this.last=item;
                                                ret=item;
                                        }
                                }
                                else{
                                        if(current.prev===null){ //New item before first
                                                current.prev=item;
                                                item.next=current;
                                                this.first=item;
                                        }
                                        else{ //New item before current
                                                item.prev=current.prev;
                                                item.prev.next=item;

                                                current.prev=item
                                                item.next=current;

                                        }
                                        ret=item;
                                        walk=false;
                                }
                        }

                }
                return ret.data;
        }
List.prototype.getItems=function(){
        var current=this.first;
        var items=[];
        while(current!==null){
                items.push(current.data);
                current=current.next;
        }
        return items;
}
List.prototype.shallowCopy=function(comparer){
        var cp=new List(comparer);
        var current=this.first;
        while(current!==null){
                var listItem=new ListItem();
                listItem.data=current.data;
                cp.add(listItem);
                current=current.next;
        }
        return cp;
}

List.prototype.grep=function(fn){
        var ret=[];
        var current=this.first;
        while(current!==null){
                if(fn(current.data)){
                        ret.push(current.data);
                }
                current=current.next;
        }
        return ret;
}
List.prototype.forEach=function(cb, ctx){
        var current=this.first;
        var index=-1;
        while(current!==null){
                index++;
                cb.call(ctx || current.data, current.data, index, this);
                current=current.next;
        }
}
List.prototype.remove=function(fn){
        var current=this.first;
        while(current!==null){
                if(fn(current.data)){
                        this._remove(current);
                }
                current=current.next;
        }
}
List.prototype._remove=function(item){
        if(item.prev!==null){
                if(item.next!==null){
                        item.next.prev=item.prev;
                        item.prev.next=item.next;
                }
                else{
                        item.prev.next=null;
                        this.last=item.prev;
                        this.last.next=null;
                }
        }
        else{
                this.first=null;
                if(item.next!==null){
                        this.first=item.next;
                        this.first.prev=null;
                }
        }
}
List.prototype.indexOf=function(fn){
        var current=this.first;
        var i=-1;
        var pos=-1;
        while(current!==null){
                i++;
                if(fn(current.data)){
                        pos=i;
                        current=null;
                }
                else{
                        current=current.next;
                }
        }
        return pos;
}
List.prototype.removeAt=function(index){
        var current=this.first;
        var i=0;
        while(current!==null){
                if(i==index){
                        this._remove(current);
                        current=null;
                }
                else{
                        current=current.next;
                }
                i++;
        }
}
var ListItem=function(){
        this.next=null;
        this.prev=null;
        this.data=null;
}
ListItem.prototype={
        compare:function(obj){
                return (this.data.compare)?this.data.compare(obj):1;
        }
};
g_ctx.List=List;
})(exports);
