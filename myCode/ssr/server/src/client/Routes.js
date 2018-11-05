import React from 'react';
import App from './App';
import HomePage from './pages/HomePage';
import UsersListPage from './pages/UsersListPage';
import NotFoundpage from './pages/NotFoundpage';

export default [
	{
		...App,
		routes: [
			{
				...HomePage,
				path: '/',
				exact: true
			},
			{
				...UsersListPage,
				path: '/users',
			},
			{
				...AdminsListPage,
				path: '/admins',
			},
			{
				...NotFoundPage
			}
		]
	}
];