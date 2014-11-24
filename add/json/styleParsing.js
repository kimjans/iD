var tagList = [];
$.ajax({
    type:"GET",
    url: "map.css",
    success:function(text){
    	var list =  text.match(/path(.*)(tag\-\w*[\-\w]*)/g);
    	list = _.uniq(list);
    	for(var i = 0 ; i < list.length ; ++i){
    		
    		text.match( list[i] + "[^\{]*(\{[^\}]*\})" );
    		var style = RegExp.$1.replace(/[\{|\}|\s]/g, "");
    		var aStyle = style.split(";").filter(function(d){ return !!d });
    		aStyle = _.map(aStyle, function(d){ return d.split(":")  });
    		
    		var tagString = list[i].match(/tag\-\w*[\-\w]*/g);
    		tagString = _.map(tagString, function(d){ return  [d.split("-")[1], d.split("-")[2]];  });
    		
    		tagList.push({
    			query : list[i],
    			layerName : list[i].split('.')[1],
    			style : aStyle,
    			tag : tagString
    		});
    	}
    	console.log( JSON.stringify(tagList) );
    	
    }.bind(this),
    error:function(e){
    }
});