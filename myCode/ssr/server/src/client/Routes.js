import { Route } from 'react-router-dom';
import React from 'react';
import Home from './components/Home';
import UsersList from './components/UsersList';

export default () => {
	return (
		<div>
			<Route exact path='/' component={Home} />
			<Route path='/users' component={UsersList} />
		</div>
	);
};
