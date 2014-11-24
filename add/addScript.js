var a = window.iD;

var treeManger = {
		
	/**
	 * 지도에 그래픽요소들이 새로 그려짐.
	 */
	updateMap : function(entities){
		
		var $surface = $("#surface");
		var matchList = {};
		for(var i = 0 ; i < entities.length ; ++i){
			var tags = entities[i].tags;
			if($surface.find('.' + entities[i].id).length == 0){ continue;} //화면에 보여지고 있지않으면 제외함.
			
			var entityStyle = this.tagStyleList.filter(function(style){ //entity의 tag와 일치하는 style만 filter
				var styleTag = style.tag;
				var exList = styleTag.filter(function(currentStyleTag){
					
					if( !currentStyleTag[1] ){
						return !!tags[ currentStyleTag[0] ];
					}else{
						return (tags[ currentStyleTag[0] ] == currentStyleTag[1]);
					}
					
				});
				return exList.length == styleTag.length;
			});
			
			_.each( entityStyle, function(style){ //entity의 tag를 key 새로운 데이터를 만듬.
				
				_.each( style.tag , function(tag){
					
					var tagName = tag[0] + (tag[1]?"-"+tag[1]:"");
					
					if(	!matchList[tagName] ){ matchList[tagName] = { entity : [], layer : {}} };
					var currentList = matchList[tagName];
					currentList.entity.push( entities[i].id );
					currentList.entity = _.uniq(currentList.entity);
					
					if(!currentList.layer[style.layerName]){ currentList.layer[style.layerName] = {} }
					
					_.each(style.style, function(s){
						currentList.layer[style.layerName][ s[0]] = s[1];
					});
					
				});
				
			});
			
		}
		this.makeTree( matchList );
		
	},
	makeTree : function(matchList){
		
		$('#styleTreeDefault').empty();
		var treeData = [];
		for(var i in matchList){
			treeData.push({
				text : [i,"(",matchList[i].entity.length,")"].join(""),
				state : 'closed',
				children : [{
						text : "entity",
						state : 'closed',
						children :  _.map(matchList[i].entity, function(d){ return  {text : d } })
					},{
						text : "layer",
						state : 'closed',
						children : _.map(matchList[i].layer, function(styleArray,layerName,c){
							return  {
								text : layerName,
								state : 'closed',
								children : _.map(styleArray, function(d,styleName,f){ return {
										text : styleName,
										state : 'closed',
										children : [{
											text : d,
											attributes:{
									            "styleType" : (styleName == "stroke" || styleName == "fill")?"color":"none",
									            "layerName" : layerName,
									            "styleName" : styleName,
									            "tag" : i
									        }
										}]
									}   
								} )
							}
						})
					}       
				]
			});
		}
		$('#styleTreeDefault').tree({
			data: treeData,
			onDblClick : function(node){
				if( node.attributes && node.attributes.styleType == "color"){
					
					var color = /\#/.test(node.text) ? node.text.replace(/\#/,"") : "000000";
					var nodetarget = $(node.target); 
					nodetarget.colpick({
						flat:true,
						layout:'hex',
						color:color,
						onSubmit : function(hsb,hex,rgb,el,bySetColor){
							
							$('#styleTreeDefault').tree('update', {
								target: node.target,
								text: "#" + hex
							});
							nodetarget.colpickHide();
							
							nodeUtil.changeStyle( node.attributes.tag, node.attributes.layerName, node.attributes.styleName, "#" + hex )
							
						}
					});
					
				}
			}
		});
	},
	requestStyleList : function(){
		
		this.tagStyleList = []; //tag리스트로 정의되어 있는 style정보.
		$.ajax({
		    type:"GET",
		    url: "/add/json/styleList.json",
		    dataType : "json",
		    success:function(json){
		    	
		    	this.tagStyleList = json;
		    	
		    }.bind(this),
		    error:function(e){
		    }
		});
		
	}
}
treeManger.requestStyleList();


var nodeUtil = {
		
	changeStyle : function(tag, layerName, styleName, value){
		
		var query = "path." + layerName + ".tag-" + tag;
		_.each(treeManger.tagStyleList, function(style){
			if( style.query == query){
				_.each(style.style, function(styleArray){
					if(styleArray[0] == styleName){
						styleArray[1] = value;
					}
				});
					
			} 
		});
		this.appplyStyle();
		
	},
	/**
	 * 부모노드에
	 * 해당 ID를 가진 부모가 존재하는지 판단한다.
	 */
	hasParentById : function(element, id){
		
		var parentEls = $(element).parents().filter(function(){ return arguments[1].id == id; }).get()[0];
		return !!parentEls;
	},
	appplyStyle : function(){
		
		var styleArray = _.map(this.tagStyleList, function(style){
			
			return [ style['query'],"{",  _.map(style.style, function(d){  return [d[0],":",d[1],";"].join("") }), "}"].join("");
			
		});
		this.setStyle( styleArray.join("") );
		
	},
	setStyle : function(c){
		$('#customStyle').remove();
		var b=document.createElement("style");
		b.type="text/css";
		if(b.styleSheet){b.styleSheet.cssText=c}else{
			b.appendChild(document.createTextNode(c))
		}
		b.id = "customStyle";
		document.getElementsByTagName("head")[0].appendChild(b)
	}	
}

/**
 * Node, Relation, Way 클래스를 확장해서 기능을 추가한다.
 */
var extendObject = {
		
	setColor : function(type, value, context){
		
		this.color[type] = value;
		var nodeName = this.geometry(context.graph());
		if( this instanceof iD.Node ){
			
			//vertices
			if( nodeName == "vertex"){
				//vertext
				switch(type){
	            	case "stroke" :
	            		$("#surface ." + this.id + " .stroke").css("fill", value);
	            		break;
	            	case "shadow" :
	            		$("#surface ." + this.id + " .shadow").css("fill", value);
	            		break;
	        	}
				return;
			}
			
			//points
			switch(type){
            	case "stroke" :
            		//element.style.fill = value;
            		$("#surface ." + this.id + " .stroke").css("fill", value);
            		break;
            	case "shadow" :
            		//element.style.stroke = value;
            		$("#surface ." + this.id + " .shadow").css("stroke	", value);
            		break;
        	}
				
			return;
		}
		
		
		//area, relation, line	
		switch(type){
        	case "fill" :
        		$("#surface .fill." + this.id).css({
        			fill : value,
        			stroke : value
        		});
        		break;
        	case "stroke" :
        		$("#surface .stroke." + this.id).css({
        			stroke : value
        		});
        		break;
        	case "shadow" :
        		$("#surface .shadow." + this.id).css({
        			stroke : value
        		});
        		break;
        	case "casing" :
        		$("#surface .casing." + this.id).css({
        			stroke : value
        		});
        		break;
    	}
			
	},
	getColor : function(type){
		if(!type) return false;
		this.createColorValue(type);
		return this.color[type];
	},
	createColorValue : function(type){
		//context.graph()
		//entity.geometry(graph) !== 'area'
		if(!this.color){
			this.color = {};
		}
		if(!this.color[type]) { this.color[type] = null; }
	}
}

_.extend(iD.Node.prototype, extendObject)
_.extend(iD.Relation.prototype,extendObject );
_.extend(iD.Way.prototype,extendObject);