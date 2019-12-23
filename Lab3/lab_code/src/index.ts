import connectionPromise from './models/database';
import * as router from './controllers/router';
import StudentModel from './models/student-model';
/*
const getRandom=(list:string[]) => list[Math.floor(Math.random()*list.length)];
const getRandomSentance=(list:string[], count:number) =>{
	let result:string = getRandom(list);

	while(count-->0){
		result+=" "+getRandom(list);
	}

	return result;
};

const groups=[
	"7003f025-fb0a-4bd3-8b9b-f28ee25e375f",
	"ad064a8e-7c42-4559-a4a5-a9aa340740b0",
	"963b8ebe-7bd4-4dbe-9f02-108095f04359"];
const names=[
	"Oleksiy","Oleksiyovuch","Olegoviy","Oleg",
	"Oksana","Petro","Petrovuch","Andriy"];
*/
(async function(){
	await connectionPromise;
/*
	for(let i=0;i<1000*1000;i++){
		await StudentModel.create({ Name: "generated "+getRandomSentance(names, 3), Group_ID: getRandom(groups) });
	}
*/	
	router.begin();
})();