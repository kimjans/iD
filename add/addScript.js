var extendObject = {
		
	setColor : function(type, value){
		
		this.color[type] = value;
		
		if( this instanceof iD.Node ){
			if(this.elements && this.elements[type]){
				
				var element = this.elements[type];
				switch(type){
	            	case "stroke" :
	            		element.style.fill = value;
	            		break;
	            	case "shadow" :
	            		element.style.stroke = value;
	            		break;
	        	}
				
			}
			return;
		}
		
		if(this.elements && this.elements[type]){
			
			var element = this.elements[type];
			switch(type){
            	case "fill" :
            		element.style.fill = value;
            		element.style.stroke = value;
            		break;
            	case "stroke" :
            		element.style.stroke = value;
            		break;
            	case "shadow" :
            		element.style.stroke = value;
            		break;
            	
        	}
			
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