//const prompt = require('../utils/prompt');
import * as prompt from "../utils/prompt";

module.exports = function(router, view, model){
	const viewActions = {
		'create': async (params) => model.default.create(params),
		'update': async (params) => model.default.update(params.id, params.properties),
		'delete': async (params) => model.default.delete(params.id),
		
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