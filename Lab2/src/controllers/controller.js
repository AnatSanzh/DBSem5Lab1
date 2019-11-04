const prompt = require('../utils/prompt');

module.exports = function(router, view, model){
	const viewActions = {
		'create': async (params) => model.create(params),
		'update': async (params) => model.update(params.id, params.properties),
		'delete': async (params) => model.delete(params.id),
		
		'navigate': async (params) => router.navigate(params.path, params.params),
		'exit': async (params) => process.exit(),

		'noop': async (params) => 0
	};

	this.display = async function(params){
		let action;

		try{
			action = await view(params);
		}catch(err){
			router.navigate("/error", { 
				errorText: err/*.toString()*/
			});

			return;
		}

		try{
			await (viewActions[action.id] || viewActions.noop)(action.params);
		}catch(err){
			router.navigate("/error", {
				errorText: err/*.toString()*/
			});
		}
	}
};