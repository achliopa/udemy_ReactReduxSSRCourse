import 'babel-polyfill';
import express from 'express';
import renderer from './helpers/renderer';
import createStore from './helpers/createStore';
import Routes from './client/Routes';
import { matchRoutes } from 'react-router-config';

const app = express();
app.use(express.static('public'));
app.get('*',(req,res)=>{
	// some logic to initialize and load data into teh store
	const store = createStore();
	const promises = matchRoutes(Routes,req.path).map(({route}) => {
		return route.loadData ? route.loadData(store) : null;
	});

	Promise.all(promises).then(()=>{
		res.send(renderer(req,store));
	});
});

app.listen(3000, ()=>{
	console.log('Listening on port 3000');
});