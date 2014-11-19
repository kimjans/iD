iD.ui.StyleTree = function(context) {
	
	var tree = {};
	$('#styleTree').empty();
	var $styleTree;  
	function makeTree( data ){
		var $styleTree = $('#styleTree'); 
		$styleTree.tree({
			data: data,
			onDblClick : function(node){
				if( node.attributes && node.attributes.editable){
					
					var color = node.text == 'default' ? "000000" : node.text;
					var nodetarget = $(node.target); 
					nodetarget.colpick({
						flat:true,
						layout:'hex',
						color:color,
						onSubmit : function(hsb,hex,rgb,el,bySetColor){
							
							$styleTree.tree('update', {
								target: node.target,
								text: hex
							});
							nodetarget.colpickHide();
							setColor(node.attributes, hex);
							
						}
					});
					
				}
			}
		})
		
	}
	var setColor = function(attributes, hex){
		
		var entity = context.entity( attributes.id );
		entity.setColor( attributes.key, "#" +hex);
		
	} 
	
	return {
		hide : function(){
			
			$(".styleTree").hide();
					
		},
		show : function(selectedIDs){
			
			console.log( selectedIDs ,context.entity( selectedIDs[0] ) )
			if(!selectedIDs) return;
			
			$(".styleTree").show();
			var data = [];
			for(var i = 0 ;i < selectedIDs.length ; ++i ){
				var entity = context.entity( selectedIDs[i] );
				if(entity.color){
					var color = entity.color;
					
					var children = [];
					for(var key in color){
						children.push({
							text : key,
							state : 'closed',
							children :[{
								"text" : color[key] ? color[key] : "default",
								"attributes":{
						            "editable" : true,
						            "id" : selectedIDs[i],
									"key" : key
						        }
							}]
						});
					}
					data.push({
						text : entity.id,
						state : 'closed',
						children : children
					});
				}
			}
			
			makeTree( data );
			
		}
		
	};
};
