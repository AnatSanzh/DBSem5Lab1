import connectionPromise from './models/database';
import * as router from './controllers/router';

(async function(){
	await connectionPromise;
	router.begin();
})();