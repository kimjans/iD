iD.modes.StyleChanger = function(context, selectedIDs) {
	
    var mode = {
        id: 'StyleChanger',
        button: 'browse'
    };
    
    var behaviors = [
                 iD.behavior.Hover(context),
                 iD.behavior.Select(context),
                 iD.behavior.Lasso(context)
    ]
    
    var tree = iD.ui.StyleTree(context);    
    
    var showTree = function(){
    	
    	tree.show( selectedIDs );
    }

    mode.selectedIDs = function() {
        return selectedIDs;
    };

    mode.reselect = function() {
    	tree.show();
    };

    mode.newFeature = function(_) {
        return mode;
    };

    mode.suppressMenu = function(_) {
        return mode;
    };
    //mode에 진입
    mode.enter = function() {
    	showTree();
    	
    	behaviors.forEach(function(behavior) {
            context.install(behavior);
        });
    	
    	function selectElements() {
            var selection = context.surface()
                    .selectAll(iD.util.entityOrMemberSelector(selectedIDs, context.graph()));

            if (selection.empty()) {
                // Exit mode if selected DOM elements have disappeared..
                context.enter(iD.modes.Browse(context));
            } else {
                selection
                    .classed('selected', true);
            }
        }

        context.map().on('drawn.select', selectElements);
        selectElements();
    	
    	
    };

  //mode에서 나감.
    mode.exit = function() {
    	
    	behaviors.forEach(function(behavior) {
            context.uninstall(behavior);
        });
    	
    	context.surface()
        .selectAll('.selected')
        .classed('selected', false);
    	context.map().on('drawn.select', null);
    	
    	tree.hide();
       
    };

    return mode;
};
