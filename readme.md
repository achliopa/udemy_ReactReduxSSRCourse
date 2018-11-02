# Udemy Course - Server Side Rendering with React and Redux

* [Course](https://www.udemy.com/server-side-rendering-with-react-and-redux/)
* [Repository](https://github.com/StephenGrider/ReactSSRCasts)

## Section 1 - Getting Started

### Lecture 3 - Why Server Side Rendering

* A traditional React Application is only rendered in the browser
* to see what happens in a traditional react app rendering we use dev tools network console
* in a traditional react app when a user requests a page and till the content is visible on page:
	* a root request to the server (localhost:3000 eg). Response? small amount of html (index.html). response has a link to bundle.js
	* a second request for bundle.js (app  js code packaged e.g by webpack) Response? a big bulk of JS code
	* content is visible
* so the simplest flow ot Traditional React app is: Browser Request Page=>[Wait]=>Browser Requests JS file=>[wait]=> bontent visible on browser. Usually we have one more step of wait till the app fetches json data from backen before rendering
* This resutls in page load wait time. long wait reduces conversion rate. big sites can lose money

### Lecture 4 - SSR Overview

* we sse SSR in action laoding a boilerplate react project that uses SSR
* in the SSR app between the page request and content appearning on screen:
	* a request to webserver (e.g localhost:3000) Response? html file (relatively big file)
	* the rendering happens in one step (one wait time) for a simple app
* How SSR works?
	* browser: user navigates to our-app.com => browser  issues an http Get request 
	* server: receives request => loads react app IN-memory => fetches any required data from backend =>renders the react app => takes the generated html and sends it to the user
	* browser: user sees the content => html file tells browser it needs the bundle.js file => browser requests bundle.js file from server
	* server: sends bundle.js
	* browser: react app makes follow up requests for data 
	* server: receives request =>  gets data => sends back json data
	* browser: app renders on to the screen
* SSR reason of existence is to get html content on screen as fast as possible. full rendering with data and all still needs time

## Section 2 - Let's get Coding!

### Lecture 5 - App Overview

* our app is focused on ssr.
	* landingpage has: simple content + a header with link tags
	* /users: header + list of users . accessible regardles of auth status
	* /admin:  header + list of admins . accessible only to auth'd users
	* /randomroute: header + message. visible for unrecognisable routes

### Lecture 6 - Server Architecture Approach

* our app makes use of: API Server(already built) => rendering server(we do this) => browser
* why 2 servers for a SSR app?
	* 1st: is the backend API (business logic and data layer) DB Access,Validation.Authentication,Authorization,Logging
	* 2nd: is the renderer server (view layer) Takes data produces html
* by decoupling our server it makes it easy to replace renderer with an angular app or a mobile app, 
* renderer makes heavy use of react and redux
* also we can scale the app easily. more users more api requests. the load on renderer is not that big. we can scale where we need to
* if our app bottleneck is the react renderer (complex react content) we can scale on renderers to serve a sible api backend
* rendering react in backend is slow. performance of rendering server is a concern

### Lecture 8 - BoilerPlate Setup

* Create one simple component -> add server side rendering behaviour -> add react reouter -> tweak ssr setup -> add redux -> tweak ssr setup
* our express server will serve the '/' route returning the <Home /> component rendered as HTML
* we create a /server folder and add a package.json from course lecture content
* we install modules with npm install

### Lecture 9 - Express Setup

* we add a src folder and inside add index.js
* we add setup express boilerplate code
```
const express = require('express');
const app = express();

app.get('/',(req,res)=>{

});

app.listen(3000, ()=>{
	console.log('Listening on port 3000');
});
```
* in server/src we add /client folder and inside /components subfolder and add Home.js react component
* we create a functional compoennt and export it
* server folder uses ES6 while client folder uses ES2015
* to turn the React component into plain html to return to user we will use the ReactCOM library
* in atraditional app we use ReactDOM to mount our app to the index.html using render(). render() creates instances of components and mounts them to a DOM node
* renderToDtring() on the other hand renders a bunch of components one time and procuces a string out of all the resulting HTML. we will use this in SSR to do the rendering in our SSR server express route handler
* we import react libs in oldschool js style in our index.js file
```
const React = require('react');
const renderToString = require('react-dom/server').renderToString;
const Home = require('./client/components/Home').default;
```

* our route handler becomes
```
app.get('/',(req,res)=>{
	const content = renderToString(<Home />);
	res.send(content);
});
```
* we put JSX into ES5 code... node has no idea what to do with JSX
* we need to make node server able to use JSX

### Lecture 11 - JSX on the Server

*  on client side codebase all .js files are imported in a top level index.js file imported into webpack. webpack uses babel to transpile the es2015 code into a es5 bundle.js file that is run by the browser (using same engine like node)
* node.js can un traspiled bundle.js
* we ll use the same toolchain. index.js will be added to webpack that will use babel to rpoduce a traspiled bundle.js that node can use
* in server root folder we add 'webpack.server.js' file
* this config file is for server and its the follwoing (mor eon webpack2 notes)
```
const path = require('path');

module.exports = {
	// Inform webpack that we are building a bundle
	// for nodeJS, rather than for the browser
	target: 'node',
	// tell webpack the root file of our
	// server application
	entry: './src/index.js',

	// tell webpack where to put the output file
	// that is generated
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'build')
	},

	//tell webpack to run babel on every file it runs through
	module: {
		rules: [
			{
				test: /\.js?$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				options: {
					presets: [
						'react',
						'stage-0',
						['env',{ targets: { browsers: ['last 2 versions']}}]
					]
				}
			}
		]
	}
};
```

### Lecture 12 - Server Side Webpack

* in  our package.json file we add a script to run webpack `dev:build:server":"webpack --config webpack.server.js"`. our code got traspiled and a nwe folder got created for the output /build
* we run the traspiled file `node build/bundle.js` and our server runs in localhost:3000 and we can visit it in browser
* our SSR app is up and running fast. our browser dev tools confirm that . only one request to localhost gets logged

### Lecture 13 - Review

* we gave solution to 2 problems that arose from SSR
	* JSX on the server: run webpack on our server. execute resulting code
	* turn components into HTML: use react-dom/server libs 'renderToString' method
* with SSR client based code and server side code (renderer) get mixed unlike traditional React apps

## Section 3 - Server Configuration

### Lecture 14 - Rebuilding and Restarting

* with our current project setup we have issues. if we change our react component ad refresh app we dont see the change... we dont use webpack devserver...
* our build process is static
* we want any time we change our codebase to rerun webpack and restart server
* to rerun webpack we modify the dev script adding '--watch' to keep webpack running and watch for changes
* to restart the server we use nodemon. we want nodemon to restart when bundle.js changes and run node build/bundl.js. the nodemon script is `"dev:server": "nodemon --watch build --exec \"node build/bundle.js\"",`
* we run both scripts in 2 terminals

### Lecture 15 - Server Side Rendering, Isomorphic Javascript, Universal javascript

* Server Side Rendering: Generate HTML on the server
* Universal javascript: the same code runs on the server and the  browser
* Isomorphic Javascript: the same code runs on the server and the browser
* the last 2 buzzwords mean that we will use the same codestyle in browser and server. we dont do it
* we want to write the same JS dialect in our project. as now our server code is transpiled with babel and webpackwe can use ES2015 on both sides
* we start with replacing require statements with imports

### Lecture 16 - Client Side JS

* we expose a problem with our app setup. we add a button in jsx of Home React componet and an event handler to console log a message.
* we test in browser but it does not console log anything
* in a traditional react app React JS + our code => renders components to dom => sets up event handlers
* in our current SSR express server sends back plain html (no handlers) 
* in a full SSR app . we saw that render code gets send upo to browser in consecutive requests

### Lecture 17 - Client Bundles

* to solve the problem we will create 2 separate JS bundles using webpack
	* 1st bundle: ServerCode+ReactApp (this code runs in backend)
	* 2nd bundle: reactApp (ship this bundle down to the browser)
* why dont use 1 bundle for server and client?? because some code might contain sensitive info and should not be sent to the browser
* we setup a second webpack pipeline for our client bundle. we add a new webpack config file `webpack.client.js`. we cp the server webpack cofig. 
* we dont need node target . also we setup a different entry point. ./src/client/client.js
* our output is added to /public dir
* we add some code in /client.js to test our webpack build
* we add a build script in package.json `"dev:build:client": "webpack --config webpack.client.js --watch"`
* we test it to sse if console.log runs

### Lecture 18 - The Public Directory

* we need to direct the browser to request and run the /public/bundle.js
* we tell express to treat the public dir as a freely available resource `app.use(express.static('public'));`
* to tell browser to use the client bundle we do a hackish addition to the express route handler.
* we serve an explicit html string where we add the react rendered component and the link to bundle.js
```
app.get('/',(req,res)=>{
	const content = renderToString(<Home />);

	const html = `
		<html>
			<head></head>
			<body>
				<div>${content}</div>
				<script src="bundle.js"></script>
			</body>
		</html>
	`;

	res.send(html);
});
```
* our response now gets bundle

### Lecture 19 - Why client.js

* our server base file index.js imports frontend Home.js compoinent and intends to run on server (for rendering)
* our client base file client.js imports Home.js with the intention to run on the browser (for dynamic content)
* we  SHOULD NEVER NEVER import server side code in client.js
* we will have some code to start a part of react app in browser and another part for server
* we will have distinct redux and react configuration for server and for client
* the lifecycle of our app when loaded in browser
	* app rendered on the server into some div in the 'template'
	* rendered app sent to the user's browser
	* browser renders HTML file on the screen then loads client bundle
	* client bundle boots up
	* we manually render the entire React app a second time into the 'same ' div'
	* react renders our app on teh client side, and compares the new HTML to  what already exists in teh document
	* react 'takes over' the existing rendered app, binds event handlers etc

### Lecture 20 - Client Bootup

* rendering the react app a second time in client (browser) breathes life into the scaffold rendered the first time (dummy)
* client.js will be the bootup location of our app int eh browser
* in this file we dont do any server side rrendering. 
* its like a classical react app base js file
* we need to render the app in the same html tag like in server rendering. we add an id to the wrapper div
```
// start up point for the client side application
import React from 'react';
import ReactDOM from 'react-dom';
import Home from './components/Home';

ReactDOM.render(<Home />, document.querySelector('#root'));
```
* we have our 2 build scripts and one server run
* we reffresh the page and get a warning from browser 'Calling ReactDOM.render() to hydrate server-rendered markup will stop working in React v17'
* our button works
* the process of putting life into the app is called hydrate. we use the correct method

## Section 4 - Refactoring for Cleaner Code

### Lecture 21 - Merging Webpack Config

* we can now start adding components in Home and build a full fledged react application
* we will refactor our code to prepare for future additions
* we have a lot of duplicate config logic between webpack.client and webpack.server.js
* babel setup is identical
* isoometric apps purpose is to use same JS code on server and client
* we will use one babel rule and import it in both configs using webpack-merge lib
* we will have a base config with common rules that we will merge to the 2 config files
* we add webpack.base.js we add a module export cping the entire babel module rule
* we import the base file in both and the webpack-merge lib and use merge to export a merged config
```
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.js');
const config = {
	// tell webpack the root file of our
	// server application
	entry: './src/client/client.js',

	// tell webpack where to put the output file
	// that is generated
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'public')
	}	
};
module.exports = merge(baseConfig, config)
```

### Lecture 22 - Single Script Startup

* we restart our 2 build scripts
* to dev our app we use 3 scripts... we will use another module 'npm-run-all' to run all with 1 script `"dev":"npm-run-all --parallel dev:*",`
* we run all scripts starting with dev:* in parallel. make sure to replace : with - so that lib do not complain
* all three scripts spit output on screen

### Lecture 23 - Ignoring Files with Webpack

* to reduce script startup time we add ignore on files to not trigger build
* webpack puts the entire npm libraries source into the bundle. we want that on the client to use our app.
* in server we dont want all libs. we dont care about size in server but its a matter of loading time
* we use 'webpack-node-externals' npm package to do it
* in server webpack config we require it `const webpackNodeExternals = require('webpack-node-externals');`
* we add it in config `module.exports = merge(baseConfig, config);`
* the result is that the node module lib sources are not added to the server bundle.js. speeed up time. bundle is skinned down

### Lecture 24 - Renderer Helper

* all our server side render logic and html is in index.js. as we ad dup it will grow a lot
* we put our render logic in a separate file renderer.js in a new folder /helpers
* this file will just return html as a string with renderTostring. we export it and thus separate react logic from express server

## Section 5 - Adding Navigation

### Lecture 25 - Implementing React Router Support

* our next step in the app is to add navigation with react router
* our app will have 2 routing layers. express router and react router
* express router will not enforce routing rules / will pass through all to react (will serve/* ) aka singlepage app
* we can offer apis or else from express. but for html content delivery all will pass through to react

### Lecture 26 - BrowserRouter vs StaticRouter