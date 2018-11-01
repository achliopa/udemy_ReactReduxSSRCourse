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