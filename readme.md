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

* react router behaviour will be different in inital render and subsequent hydration
* in traditional react app react reouter works like:
	* browser reequests /users
	* express handler of `app.get('*')` responds
	* express sends down index.html
	* express sends down bundle.js
	* react boots up, react router boots up
	* BrowserROuter looks at URL in address bar and renders the compoennt it has for the route
* BrowserROute is designed to look at browsers address bar. 
* when we render the app in the server we dont have the address bar available. so BrowserROute does not work in server. it throuws an error
* the solution is to use 2 diff routers in our app
	* StaticRouter when doing SSR (server side)
	* BrowserRouter when app is running in the browser (client side)
* StaticRouter is designed for use in server when doing SSR
* we will make a new file ROutes.js. it will contain all different route mappings in our app. without the routers
* we will import the file in the renderer.js file on the server (it will use the staticrouter) AND in the client.js file on the client (it will use BrowserROuter)
* more in react router docs

### Lecture 27 - Route Configuration

* in /compoennts we add Routes.js as a functional compoennt to add our Route tags and export them to client and server routers
```
export default () => {
	return (
		<div>
			<Route exact path='/' component={Home} />
		</div>
	);
};
```
* we import Routes in client.js and BrowserROuter to wrap it

```
ReactDOM.hydrate(
	<BrowserRouter>
		<Routes />
	</BrowserRouter>
	, document.querySelector('#root'));
```

### Lecture 28 - HTML Mismatch

* we run our app and test it. we get an HTML mismatch error for the added div we added in ROutes.
in SSR code it does not exist
* React expects render output between SSR and hydrated app to match

### Lecture 29 - More on Route Configuration

* we set Routes comp in server renderer.js using StatiCRouter to fix the problem
* our rendertostring is
```
	const content = renderToString(
		<StaticRouter context={{}}>
			<Routes />
		</StaticRouter>
	);
```
* static router needs to be told what path we are looking for. it cannot access the search bar
* so we need to pass in the request object from the express router handler in renderer and use it in StatiRouter
```
export default (req) => {
	const content = renderToString(
		<StaticRouter location={req.path} context={{}}>
			<Routes />
		</StaticRouter>
	);
```
* eventually we will replace '/' in express handler with `'*'` to catch all routes

### Lecture 30 - Routing Tiers

* we should add a second dummy route to test `<Route path='/hi' component={()=> 'Hi'} />` we get an error not found . we replace '/' with '* ' in express route handler in index.js and is fixed

## Section 6 - Integrating Support for Redux

### Lecture 31 - The Users API

* we will render a fake list of users on screen
* we will consume a  ready made [api](https://react-ssr-api.herokuapp.com/) for the course
* authentication in the app is handled whroiugh google oauth
* api offers the follwoing routes
	* / : api doc
	* /users : user list
	* /admins : list of admins (must log in)
	* /auth/google : auth process
	* /current_user : info on currently logged in user
	I /logout : logout from api

### Lecture 32 - Four Big Challenges

* we need to fetch data from api
* we will use the follwoing reducers: users, admins, auth
* we will use the action creators : fetchUsers, fetchAdmins, fetchCurrentUser
* the cahllenges on impleemtning redux in SSR
	* redux needs different configuration on browser and server. why? in order to fix the other 3 problems SOLUTION: use fifferent stores using other lib components
	* aspects of authentication needs to be handled on server. nomally this is done only on the browser why? cookie based authentication (cookies are browser thing) SOLUTION: find a way to access cookies on server
	* needs some way to detect when all initial data load action creators are completed on the server why? to rerender new data render on string and sent it to browser ASAP. SOLUTION: detect when action creators finish
	* need state rehydration on the browser 

### Lecture 33 - Browser Store Creation

* well setup 2 stores with redux . one in client and one in server
* we start with client in client.js
* imports are like any redux app
```
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
```
* setup of store  is also like any redux app

### Lecture 34 - Server Store Creation

* we ll add in /helpers a second file to help add redux store in server names createStore.js
* in the file we create a store and export it. no Provider
```
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

export default () +> {
	create store = createStore(reducers, {}, applyMiddleware(thunk));
	return store;
};
```
* we will add the store to index.js. we do so to get the ability to track stae changes before we call renderToString
* in index.js we will add some logic to initialize and load data into teh store
* we pass the store in renderer
* in renderer.js we use the Provider and the store in renderToString

### Lecture 35 - FetchUsers Action Creator

* we implement users reducer and fetchUsers action creator in normal redux way
* we add a folder for actions. our action creator is
```
export const FETCH_USERS = 'fetch_users';
export const fetchUsers = () => async dispatch => {
	const res = await axios.get('https://react-ssr-api.herokuapp.com/users')

	dispatch({
		type: FETCH_USERS,
		payload: res
	});
};
```

### Lecture 36 - The Users reducer

* like normal a combineReducers and a reucer for our action

### Lecture 37 - Reducers Imports

* we import reducers in both createStore locations in client and server

### Lecture 38 - UsersList Component

* we will add a new realistic component to use the state from redux
* we use connect to map statetoprops and the action creator to use it in a lifecycle method
* we cannot just call the action creator as normal it will throw an error
* we add a render helper method with map() method to render a list of names

### Lecture 39 - Babel Polyfill

* we add an entry for the new component in Routes. js file
* we uncomment the action creator call in lifecycle method and when we test the app we get an error compaining about regeneratorRuntime
* the error we caget is because we use async await syntac in action crator code
* in index.js we import 'babel-polyfill' to make async await work in SSR
* we also import it in client side 'client.js'
* our test is successful. list renders
* users are rendered in client. no SSR list rendering yet

## Section 7 - Server Side Data Loading

### Lecture 40 - Detecting Data Load COmpletion

* we will now learn ow to detect when all initial data load action creators have completed on the server

* this is an SSR propblem. in client when we run the app it works fine
* in browser the react redux data flow is the usual. we call USerList. lifecycle method component did month calls action creator data are fethed state is changed component rerenders
* the timeline of the client side  data flow is:
	* entire app rendered
	* UserList 'componentDidMount
	* call 'fetchUsers'
	* make API request
	* ...wait for response
	* get list of users
	* list of users caught by reducer
	* UserList component rerenders, shows users
* in SSR we feed redux store in to rnderToString. then the rendered html is sent back to browser
* there is no time fetching data from the backend
* in SSR only step 1 of the flow is completed (app rendering) before the HTML response is sent back to the browser
* in SSR lifecycle methods are not invoked

### Lecture 41 - Solution #1 for Data Loading

* we will not use this solution. but its the first one that usual comes to mind
* we will attempt to render the app two times.
	* render the app onece on the server: Render #1
	* each rendered component calls its 'componentWillMount'
	* call action creators from 'component will mount'
	* ...wait for response
	* somehow detect all requests are complete
	* render the app again with the collected data: Render #2
	* send rresult to browser
* Pros: not a lot special code required
* Cons: we have to render the app twice, only loads one round of requests
* in this approach we would call renderToString 2 times  sequentially
* if our app does 2 rounds of data fetch the second round is not rendered

### Lecture 42 - #2 for Data Loading

* this is the ultimate solution we will implement
* next framework uses this idea
* the flow is:
	* figure out what components would have rendered (based on URL)
	* call a 'loadData' method attached to each of these components
	* ...wait for response...
	* somehow detect all requests are complete
	* render the app with the colected data
	* send result to browser
* the key to the solution is to attach a function to each component that describes the data the component needs to load in order to get rendered. then when a request  comes to our server we ll look into the url it is trying to access and figure out wqhich components need to render
* then we will call the load data method for these components
* PROS: only render the app once, makes data requirenets of each component clear
* CONS: requires a ton of extra code. especially in react0-router
* in our current setup react router with statiRouter has to render the entire app to decide which component to render
* the solution is not elegant. we will leave react router asde and hack our way towards the solution

### Lecture 43 - The React Router Config Library

* we will implement the solution
* we will focus on the first 2 steps
	* figure out based on url which components need to render
	* see in these components which dat aneed to get loaded
* we will use a [react-router-config](https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config) lib to do it. a subpackage of react-router
* when starting to use reactrouter config we no longer structure our routes wit the nice plain react-router JSX syntax. routes are defined as JS objects. the router is an array of objects
* we set up our routes in config style
* in ROutes.js we remove the JSX export and we export an array of objects for paths
```
export default [
	{
		path: '/',
		component: Home,
		exact: true
	},
	{
		path: '/users',
		component: UsersList
	}
];
```

### Lecture 44 - Updating Route uses

* we go to renderer.js that imports Router.js to make it use the exportedarray of rote objects
* we import  renderRoutes helper from config `import { renderRoutes } from 'react-router-config';`
* instead of <Routes /> we use the helper `<div>{renderRoutes(Routes)}</div>` in the StaticRouter
* renderRoutes takes the objects and turns them into Route compoentns
* we do the same in client.js

### Lecture 45 - THe MatchRoutes function

* we will use the config lib to determine which components to render on screen
* in index.js we will add som ecode in teh express route handler that will get the req.path and go through the routes array to find which components need to be rendered
* we import Routes.js exported array and a helper from react-router-config `import { matchRoutes } from 'react-router-config';
`
* we use matchRoutes `matchRoutes(Routes,req.path);` it returns a list of components that match the criteria
```
[ { route: { path: '/', component: [Function: Home], exact: true },
    match: { path: '/', url: '/', isExact: true, params: {} } } ]

```
* so we know what we have to render without rendering the app. step 1 is done

### Lecture 46 - LoadData Functions

* usualy w ebind the datafetching methods with the rendering related lifecycle methods
* we will use  our method loadData to find the data the componets to be rendered need
* In the Component file: we will add the lodData method.this method will initiate some data loading process and attempt to load data required by the component
* In Routes file: we will add the loadData function so that the file knows which loaddata function belongs to each component
* In (Server) Index.js: we will call each of the matched components loadData function
* UsersList is the only component that needs data. we add and export (named export) loadData method
```
function loadData() {
	console.log('I am trying to load some  data');
}
export { loadData };
```
* in Routes.js we import the method `import UsersList, {loadData} from './components/UsersList';`
and add it in the object
```
	...{
		loadData: loadData,
		path: '/users',
		component: UsersList
	}...
```
* we test our app. our matched route object now has the method exposed. so we can use it to initiate data loading inthe express route
* we need to map through the list of map routes to call the methods. we need to check if the route component has the method before invoking it
```
	matchRoutes(Routes,req.path).map(({route}) => {
		return route.loadData ? route.loadData() : null;
	});
```
* we test and success. loadData is invoked

### Lecture 47 - Store Dispatch

* we need to put a datafetch request in teh loadData method
* once we make the request we have to wait for it to complete
* THe flow of data is: 
	* (server) index.js: calls loadData() passing Redux store
	* loadData method: manually dispatch action creator.we will pass the action created to the redux store directly
	* loadData method: return a promise
	* (server) index.js: wait promise to resolve
	* (server) index.js: render application
* in index.js we pass store in the loadData(). so all our loadData methods will have access to our server side redux store
* our loadData method now becomes
```
function loadData(store) {
	return store.dispatch(fetchUsers());
}
```
* we manually call dispatch passing the actionCreator. action creator is invoked and the result passed to dispatch. what gets passed to dispatch is a promise from the async fetchusers that will go back to index.js for handling
* so the map returns an array of promises. we will catche thm all with Promise.all
* what goes back to index.js is a pending promise
* when promise gets resolved we will render

### Lecture 48 - Waiting for Data Load Completion

* we use Promise.all. it takes multiple promises and returns a single one
* when it resolves it rrenders
```
	Promise.all(promises).then(()=>{
		res.send(renderer(req,store));
	});
```
* we test on browser disabling js on page. the list renders instantly as what we get from server is the html (of the rendered page)

### Lecture 49 - Breather and Review

* we use store in loadData to manual use dispatch. in normal react-redux we use connect that through PRovider access store. in SSR and custom code in server we need store dispatch actions and refresh state
* when we dispatch an action into the store all redux functionality works as normal

## Section 8 - Organization with Page Components

### Lecture 50 - THe Page Approach

* our component files in /components folder are root level components (roots components shown for a  route)
* we will add reusable components in our app to be added in the root components
* only root level components in our app will have loadData methods
* we will add anew type of componet in our app called  Page. every root component in our app will be  called HomePae, usersPage etc
* Each  of the Page Components: can have loadData method, can use reusable components

### Lecture 51 - Refactoring to Pages

* we add a new folder in /client called /pages. we move Home.js and userslist.js into there.
* we rename them HomePage.js and UsersListPage.js. we ficx the imports at Routes.js

### Lecture 52 - Refactoring Page Exports

* int he future we might have multiple Page COmponents with amethod named loadData creating a conflict
* to fix that we will export one object in the Component file which will contain the component and the method
* our HomePage.js export becomes
```
export default {
	component: Home
};
```
* because we use the same parameters name as the router objects we use spread syntax in the ROutes. object
```
{
		...HomePage,
		path: '/',
		exact: true
```
* our userlistpage export in same way becoems
```
export default {
	component: connect(mapStateToProps, { fetchUsers })(UsersList),
	loadData: loadData
};
```

### Lecture 53 - Client State Rehydration

* we move to the 4th challenge of Redux in SSR. state rehydration on the browser
* an error caused by it is the warning in browser when hitting /users `Warning: Did not expect server HTML to contain a <li> in <ul>.`
* again the HTML genrated in the server does not match with the html generated in the client
* when we render the UserslistPage in server we renjder a list of li in the ul BUT when app is rendered by browser (client side) browser thinks we should not have any li in the ul
* if we refresh page. the list disapeear for a moment and reapears
* to understand what happens we see again the flow diagram:
	* Server Redux fetches data  redux state={users:[{name:'tom'}.{name: 'bill'},..]}
	* page rendered on server
	* page HTML sent to browser
	* client bundle.js sent to browser
	* bundle creates its client side redux store
	* page rendered with store from client side redux -> redux state={users:[]}
* in server render our stoe is fully populated before rendering.
* in client is initialy empty and then gets populated after mount.
* we need to find a way to pass the state from server to client dyring hydration

### Lecture 54 - More on Client State ReHydration

* we  will use the createStore second param AKA 'initial state'
* usually in tradiitonal react apps. our initial state is empty
* in our case it makes sense to use this param to hydrate state
* the way to pass our state from server to client is
	* we will get the redux state with `store.getState()`
	* we will dump it as JSON together with the rendered HTML (SSR)
	* we will use createStore to pass it as initial state

### Lecture 55 - Dumping State to Templates

* we ll do the job in renderer.js where we have access to store and the html template
* when we reache renderer the stotre is already populated and ready to render.
* in our return html template we shove in the JSON representation of state as a JS script. passign it to the browser root object (window) as a variable we can use later
```
	return `
		<html>
			<head></head>
			<body>
				<div id="root">${content}</div>
				<script>
					window.INITIAL_STATE = ${JSON.stringify(store.getState())}
				</script>
				<script src="bundle.js"></script>
			</body>
		</html>
	`;
```
* we test it and we can access the window.INITIAL_STATE variable in our browser console and wee the state in all its glory!
* all we have to do is use it as initial state in client.js at createstore
* our app is rock solid. refresh causes no flickering and is FAST
* we still make a request to users API from the browser (componentDidMount lifecycle method in client use of action creator fetchUsers). we dont need it anymore?
* actually no. it user visits home page first. then redux store wont be populated with users so when he visits USserList he will see an empty page... we keep it

### Lecture 56 - Mitigating XSS Attacks

* this particular piece of code
```
				<script>
					window.INITIAL_STATE = ${JSON.stringify(store.getState())}
				</script>
```
* is vulnerable to attacks adn a security flaw
* to demonstrate the flw we will hit another api from our app 'https://react-ssr-api.herokuapp.com/users/xss'
* we refresh the page an get an alert on screen with a message. where it is comming from?
* we hit the url in broswer and see the following
```
[
{
id: 1,
name: "</script><script>alert(1234567890)</script>"
},
{
id: 2,
name: "Ervin Howell"
},
{
id: 3,
name: "Clementine Bauch"
},
{
id: 4,
name: "Patricia Lebsack"
},
{
id: 5,
name: "Chelsey Dietrich"
}
]
```
* so we are getting a JS script as name.... when we fetch it. it executes directly by browser. thats what <script></script> does...
* browser has protection on XSS attacks but on code react renders.. now we are explicitly sending html to browser already rendered so NO PROTECTIOn
* we are VERY VERY VULNERABLE to XSS attacks. html complains about the </script> tag injected but it renders
* to protect our app we need to scrub the data out of state. we assume there might be malicious data on the api we hit but we will make sure no code is executed.
* we import a lib `import serialize from 'serialize-javascript';` in renderer.js. 
* this script escapts any code executing code. we replate JSON.stringify with serialize
* we see the script in html but is not executed so we are protected
* what the method does it takes any special charavter in the wrapted html and replace it withthe unicode equivalent

## Section 9 - Authentication in a Server Side Rendering World

### Lecture 57 - Authentication Issues

* authenication in a web app is like a contract between a browser and a server
* in every request from the browser to the server it will include an identifying piece of info. a JWT , cookie or else
* API will inspect and allow use to resources depending on the piece of info sent by the browser
* with SSR this piece of info needs to be established on a different level
* our rendering server stands in the middl eof Browser and API and needs to get the identifying info and pass it through to the API (only in the SSR phase)
* SSR rendering server will need to know who is making the request and when hitting the backend APi it will need to fool it into thinking it is the browser talking
* in traditional apps using OAuth. browser hit s the API saying. i went through the oauth process. API replyies: get a cookig with yout identifying coide. use it in your followup requests
* our setup with SSR gives us an issue with authentication.
	* as we host our API server and our Renderer server on different domains,subdomains or ports we will run into issues with cookies. 
	* all cookies in our browser correspond to the domain,subdomain and port of the server who issued them
	* when we get a cookie from api.our-app.com and hit the renderenr server at www.our-api.com our cookie is NOT sent along in the request
	* our auth process with API Wont work with renrderer during SSR

### Lecture 58 - Authentication via Proxy

* we will use some trick (AGAIN ?!?!). we will setup a proxy on our renderer server
* we will make sure that when a user wants to authenticate in our app instead of sending him to the API we will send him to the proxy on the renderer Server.
* browser will think tht the cookie is issued by the renderer server so it wont have a problem anymore
* the auth flow now looks like (messy):
* inital page fetch (SSR phase) - PROXY inactive
	* browser makes an initial page fetch:  he sends the cookie and asks or a page
	* render server makes request to api on behalf of browser: sends the cooie and asks for protected data
	* API server responds with the data. 
	* render server renders page and sends it back
* APP is hydrated (frontend render phase) - PROXY becomes active
	* AJAX request from browser (w/ cookie) to Renderer PRoxy
	* renderer forwards it to API server and cookie
	* API srv sends data to proxy 
	* proxy sends them back to browser

### Lecture 59 - Why Not JWT's?

* as cookies are domain specific we might think. why not use JWT instead?
* in a JWT no cookies approach: in our frontsiderendering phase (after SSR) Redux decides it needs a resource at /users => browser makes a request to /users with the JWT in the HTTP request  to the Renderer server. 
* our expectation from Renderer is to request content fro a route and get (instantly) a renderered page back
* the reality when using JWT tokens int he request header is
	* browser=>renderer: request content at '/'
	* renderer=>browser: whats your JWT?
	* browser=>renderer: heres the JWT
	* renderer=> browser: here is your page
* in a domain request only cookies get automaticaly attached to the request

### Lecture 60 - Proxy Setup

* steps on implementing authentication on SSR
	* 1: setup proxy
	* 2: make sure that any action creators we call during the SSR phase goes to the API
	* 3: make sure that action creators called during Frontside rendering phase are sent to the PROXY and then to API
* to setup the proxy we will use 'express-http-proxy' lib
* we will setup the proxy in /src/index.js file (SSR root file)
* we `import proxy from 'express-http-proxy';`
* we use proxy as express middleware in our app (before all others) `app.use('/api',proxy('http://react-ssr-api.herokuapp.com', {
	proxyReqOptDecorator(opts) {
		opts.headers['x-forwarded-host'] = 'localhost:3000';
		return opts;
	}
}));`
* the statement says any /api route coming to renderer server to be forwarder to the server we spec in proxy (backend API srv)
* the second config object is specific to the API we hit and has to do with GoogleoAuth requirements

### Lecture 61 - Renderer to API Communication

* we move to step 2 (make sure that any action creators we call during the SSR phase goes to the API)
* DISCLAIMER: the code will be complex and subtle
* the flow we will implement for the Initial Page Load Phase (SSR phase) is:
	* request from browser comes (w/ cookie)
	* Renderer server invokes fetchUsers Action Creator where an axios request is called
	* the axios request will be directed to the backend API w/ the cookie from the browser included
* the tricky part is to extract the cookie from the intiial request and use it in our subsequent request to the backend API (fool API impersonating browser)
* our request to /users does not require auth so we dont need the cookie. we need it for the /admins request later on
* the flow we will implement for the FOllowup requests (API requests) during frontside rendering phase:
	* browser invokes fetchUsers Action Creator and in it an axios call to the /api route 
	* axios request comes to renderer (PROXY) with the cookie attached
	*  Proxy server passes through the request as is to the backend API 
* this is more straightforward. but the same Action Creator issues an axios request to a different endpoint during this phase...
* we will not use blatant if statement to do it but a more clever way

### Lecture 62 - Axios Instances with Redux Thunk

* we need to customize the behaviour of AXIOS depending on the environment it is invoked from (browser or server)
* we will use a little know feature of axios([create an instance](https://github.com/axios/axios#creating-an-instance)) and redux-thunk([sourcecode](https://github.com/reduxjs/redux-thunk/blob/master/src/index.js)) to do it.
* we will create a custom axios configuration creating multiple instances
* the other feats we find in thunk source code
```

function createThunkMiddleware(extraArgument) {
  return ({ dispatch, getState }) => next => action => {
    if (typeof action === 'function') {
      return action(dispatch, getState, extraArgument);
    }

    return next(action);
  };
}

const thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;

export default thunk;
```
* we will use the `thunk.withExtraArgument` method of thunk to pass in an extraArgument...
* so when thunk will dispatch an action it will carry on an extra argument
* our approach to solving our problem will be:
	* in server (SSR): create custom Axios => pass to redux-thunk as extraArgument => custom axios available in action creator
	* in client (frontside rendering): create custom Axios => pass to redux-thunk as extraArgument => custom axios available in action creator
* of course the custom Axios instance will be different in each case

### Lecture 63 - Client Axios Instance

* in client.js we create acustom Axios instance and pass it to redux-thunk so it will be availabe to all our action-creators
* we import axios and create our instance
```
const axiosInstance = axios.create({
	baseURL: '/api'
});
```
* when we ll use this axios instance it will prepent the url we pass in the call with the '/api' string. PROXY will take advantage of it to pass it through
* to pas sit in thunk we mod the applyMiddleware argument to `applyMiddleware(thunk.withExtraArgument(axiosInstance)`
* to use it in our action creator (that is already using thunk) we add it in the arguments and use it to make the call. also we no longer need the full url as the base part is prepended by the custom axios instance specific to the environemnt
```
export const FETCH_USERS = 'fetch_users';
export const fetchUsers = () => async (dispatch, getState, api) => {
	const res = await api.get('/users')

	dispatch({
		type: FETCH_USERS,
		payload: res
	});
};
```

### Lecture 64 - Server Axios Instance

* we repeat the exercise for the server part. this time we need to do the cookie trick (extract it and use it in the request) so things are expected to be more complex
* we work in /src/helpers/createStore.js and do the same trick
* this time in the custom axios instance config object apart from teh baseURL we will insert the cookie to be passed trhough.
* to get the cookie we need the req object coming in teh browser http req. 
* the req object is available in the generic express route handler. so we pass it as input arg in the createStor() method call in index.js
* our custom axios insance becomes
```
	const axiosInstance = axios.create({
		baseURL: 'http://react-ssr-api.herokuapp.com',
		headers: {
			cookie: req.get('cookie') || ''
		}
	});
```
* we default the cookie to '' in case the browser calls the route with out any cookie attached to avoid crashes
* we pass the instance in thunk like in client.js
* NOTE! we might still want to keep the standard axios import in teh action creators file in case we want to hit another backend. the custom axios trick is used only for our api
* we test and it WORKS!!! also in devtools -> network we se that our app is hitting the backend api correnctly

### Lecture 65 - The Header Component

* we have implemented the flow to handle resource retrieval for authenticated users. we need to add to our app the ability to trigger authentication and add pages that require authentication
* we start by adding a header component with some links which will change appearance based on auth status
* we have to decide where to put it
* we dont have a central location for reusable components that need to be used in multiple locations (paths)
* a workaround is to manually add the HEader component on both our page components (Not DRY)
* to solve it our Routes.js we import a new App.js root component which then will import our Page components

### Lecture 66 - Adding an App Component

* we will add App.js  directly in /client folder as a functional compoennt
* we export it an import it in Routes.js
* we mod the rooutes array. we want App always visible and the inside component visible on condition (depending on path)
* thw way to do it is put App object on top and the childrens in a routes: property as a nested array
```
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
			}
		]
	}
];
```
* we wiant to render the routes as children of App so we add renderROutes inside the App jsx we pas sin  the App the Routes component as prop so we extract the routes as  routes.route

### Lecture 67 - Builidng a Header

* in /componets we add Header.js as functional component and add a Link
* in App we import Header and add it in JSX

### Lecture 68 - Fetching Auth Status

* we need to determine if user is authenticated to display the appropriate content on header
* we will need an auth reduder and a fetchCurrentuser action creator
* we will hit backend APi /current_user route to see if user is authed or not
* in /actions/index.js we add the action creator
```
export const FETCH_CURRENT_USER = 'fetch_current_user';
export const fetchCurrentuser = () => async (dispatch, getState, api) => {
	const res = await api.get('/current_user');

	dispatch({
		type: FETCH_CURRENT_USER,
		payload: res
	})
};
```
* we add an authReducer.js and add it to combineReducer
```
export default function(state = null, action) {
	switch(action.type) {
		case FETCH_CURRENT_USER:
			return action.payload.data || false;
		default:
			return state;
	}
}
```
* we reurn as state the current user data or false if user is not authenticate (undefined)

### Lecture 69 - Calling FetchCurrentUser

* its the first time we need to add a component that will be called all time and need to have the ability to loadData(). actually App can do it as it is in the routes object list. so we add it there
* we add it as inline arrow function as we only want to use the store.dispatch() to dispatch the action 
```
export default {
	component: App,
	laodData: ({dispatch}) => dispatch(fetchCurrentUser())
};
```

### Lecture 70 - Connection the Header

* we add connect to Header and usit to pass auth piece of state as prop
* we test it. we are not signed in as the sign up rpocess was done directly at  the API not at renderer so the cookie is for the API and we hit it from renderer
* there is no auth contract between browser and renderer

### Lecture 71 - Header Customization

* we add more buttons in the Header. the login/logout button will be implemented like
```
	const authButton = auth ? (
		<a href="/api/logout">Logout</a>
	) : (
		<a href="/api/auth/google">Login</a>
	);
```
* why we use /api to our paths??? we do it so it is proxied to the backend API
* we use the <a href=""></a> as we want to make a full browser request to the backend api  while in the Links we navigate in our react app
* we test it. redirection happens behind the scenes. 
* we a re now authed and button changes status
* google oAuth redirects to localhost:300  because of the X-forwarded-host header option we added in our proxy server setup
* if we loging inside the API this header tag is not existing in the oauth link

### Lecture 72 - Header Styling

* we ll use materliaze css lib.
* we use cdn link and stick it in to html in renderer html
* we wrap our header div in nav tag and add materialize classnames
* we style Header adding some inline css styling `<div className="center-align" style={{marginTop: '200px'}}>`

## Section 10 - Error handling

### Lecture 73 - 404 Not Found Pages

* we want to show a message when user enters a relative path that is not jimplemented.
* currently we show blank content but the res.status is 200 not 404
* we will add a new routing rule and a new NotFoundPage component. a generic rule like ''

### Lecture 74 - Implementing the NotFoundPage

* we add it in /pages
* just a boilerplate react route. 
* we export it in config route object style
```
export default {
	component: NotFoundPage
};
```
* we import and add it to Routes routed array
```
			{
				...NotFoundPage
			}
```

### Lecture 75 - StatiΨRouter Context

* we need to inform the brwoser the page does not exist with status 404
* in express we use res.status(404).send() to set status
* we go to static router in renderer.js the context prop object is what enables us to communicate from our rendered components back to the renderer file
* this context prop is passed as a prop into any component wrapped inside StaticRouter (components it routes)
* we receive the prop in the component and set an error propery in the component that has an issue
* after rendering we check the context and if we see the error property set we mod the res. status in res pobjec tin express. well we pass already the req and store so we ll add res also
* we will add define the context object  in index.js express inside the promise resolve
* we use the context in NotFoundPage as a prop named staticContext as styaticRouter internally remnames it before  passing it to the routes as prop
* in client side rendering the staticContext does not exist!!!!!! so we add defualt val
* in the compoennt qwe set it `staticContext.notFound = true;`
* in our router our code becomes
```
Promise.all(promises).then(()=>{
		const context = {};
		const content = renderer(req,store, context);
		if (context.notFound) {
			res.status(404);
		}
		res.send(content);
	});
```

### Lecture 76 - The Admin Feature 

* is like UsersListPage but with authentication
* our implementation path: 
	* add admin action creator and reducers
	* add admin page
	* add logic to require auth for admin page

### Lecture 77 - Admins Action Creator and Reducer

* we add the action creator, reducer and addi tit to the combineReducer

### Lecture 78 - Admins Route Components

* AdminsListPage.js going to be almost same like UsersListPage. we add it and add it to Routes.js

### Lecture 79 - Testing Admins Route

* we add the page in Routes.js
* to test we make sure we are logged in, we visit /admins and we see the list. even with javascript disabled it works
* we test if we are logged out to hit /admins. with JS disabled our app freezes (unhandled promise)

### Lecture 80 - Promise.all failures

* hanging page is unacceptable.
* when we visit /adming in backend API without being logged in we get 401 error, when we visit /current_user we get 200 that why the app does not hang then
* why tha app hangs?
* in index.js we collect all  matchROutes from ract-config promises and pass them in Promise.all
```
const promises = matchRoutes(Routes,req.path).map(({route}) => {
		return route.loadData ? route.loadData(store) : null;
	});
```
* when ALL resolve we render our app and respond.
* if even one is rejected??? hang up. we need to chain a catch statement

### Lecture 81 - Error Handling Solution #1

* not ideal, bad way
* intercept with catch and send a message

```
.catch(()=>{
	res.send('Something went wrong')
});
```
* with this approach we do not even attempt to render the page
* poor and cheap approach
* many times the fail is because something we can predict and we can communicate the reason to help user

### Lecture 82 - Error Handling Solution #2

* not recommended
* solution? attempt to render the app and send some message back
* we put all code in t.then() in an arrow function aoutside and call it in then() and in catch()
```
const render = () => {
	const context = {};
		const content = renderer(req,store, context);
		if (context.notFound) {
			res.status(404);
		}
		res.send(content);
}
	Promise.all(promises).then(render).catch(render);
```
* with this approach we have content on  but no message
* it is batch because f any of the promises fails it immediately goes to catch(). so if the first fails the following do not even get to finish. so we render unpredictalbe content
* we need to let the other promises finish before rendering

### Lecture 83 - Error Handling Solution #2

* promise.all by default will go to .catch the first time one promise is rejected
* what we will do is nasty. we will wrap each promise in another promise that will monitor its status. when the inner promise is rejected or resolved we will RESOLVE the outer promise
* in this way we give each promise the opprtunity to resolve before we render the page
* matchRoutes returns an array of promises or null. we chain a second map for the wrapper promises
```
.map(promise => {
		if(promise) {
			return new Promise((resolve,reject)=>{
				promise.then(resolve).catch(resolve);
			});
		}
	});
```
* we test again blcking JS and also being logged out

### Lecture 84 - The Require Auth Component

* we need to communicate a message to user to understand why he is not viewing content
* we need to put a new Component in Between like RequireAuth component to do the redirection (like a HOC in a normal React app)
* App( has 'loadData' to get auth state) => RequireAuth (checks auth state, redirect if not auted) => AdminsListPage has 'loadData' to get admin list state
* in that way we split rendering process from auth process. we wont stop one for the other fail
* App LoadData and AdminsListPage 'loadData' run and index.js does nay error handling;when their requests are complete we render the app and do error handling (React error handling using requireAuth)
* we need to do in both places error handling because use might thry to access protected content without loging in in frontside rendering time

### Lecture 85 - Implementing RequireAuth

* requireAUth will be a HOC... we have it from a previous course (adbance redux)
* we cp the code from other course and mod it
```
export default (ChildComponent) => {
	class RequireAuth extends Component {
		
		render() {
			switch(this.props.auth) {
				case false:
					return <Redirect to="/" />
				case null:
					return <div>Loading...</div>
				default:
					return <ChildComponent {...this.props} />;
			}
		}
	}

	function mapStateToProps(state) {
		return {
			auth: state.auth
		};
	}

	return connect(mapStateToProps)(RequireAuth);
};
```

### Lecture 86 - Require Auth in Use

* we need to use the hoc to the pages that need auth.
* we import it in AdminsListPage and wrap the compoent on export
```
export default {
	component: connect(mapStateToProps, { fetchAdmins })(requireAuth(AdminsList)),
	loadData: ({dispatch}) => dispatch(fetchAdmins())
};
```
* we still have JS disabled on our browser and  without being logged in we try to visit /AdminListPage. we see no content.... so something went wrong with redirection

* Redirect has issues with StaticRouter... we need to play with the context prop object

### Lecture 87 - Handling Redirects

* when we use Redirect tag on SSR. the StaticRouter will add some props in context.object... we need to inspect it and do the redirect
* context has a REPLACE action with the path in an object (we log it in the express handler at index.js)
* the actual redirection is donde manually in the promise.all resolve callback by checking the context object for url
```
		if (context.url) {
			return res.redirect(301, context.url);
		}
```
* all this is working with JS disabled....
* to test SSR we kcn disble JS on the page

## Section 11 - Adding Better SEO Support

### Lecture 88 - Meta Tags

* when we put a link on social media engines look in the page pull ing content like image title and subtitle
* we need to open the linked page and see where facebook or twitter pulled the data from
* usually its a bunch of metatags
* usually the tag is og: <something>
* og stands for [open graph protocol](http://ogp.me/)
* in opg it says how to set the metatags to help engines parse our content.
* its a great way to improve seo


### Lecture 89 - Setting Tags with Helmet

* we need to change the metatags depending on the page we are visiting
* we need to render metatags appropriate to that route
* the services have bots running in the background that access our site and scrape the metatags from the content we render for them
* for each route in our app we need to be able to change the metatags
* these metatags are scraped from the lready rendered html of the initial SSR phase
* most of the bots cannot render pages that why SSR is important in SEO
* to set teh tags we use [React Helmet](https://github.com/nfl/react-helmet)
* Helmet docs cover both ways: normal React Apps and SSR React apps
* in a normal React app:
	* user visits /users
	* we render Helmet tag
	* helmet takes new tags and manually tinkers with HTML in head tag
 * on a server:
 	* user visits /users
 	* we render helmet tag
 	* helmet loads up all the meta tags we want to show
 	* we dump helmet's tags directly into the HTML template
* in server we cannot use browser to tinkle hetml . we dont even have a head tag

### Lecture 90 - React Helmet in Practice

* to use the og standard we need at least the folowing 4 tags: og:title og:type og:image og:url
* in our app we showcase ontly the og:title and the title
* in UsersListsPage we import Helmet `import { Helmet } from 'react-helmet';`
* we add Helmet tag in our render() jsx and wrap the meta tags
```
			<Helmet>
				<title>Users App</title>
				<meta property="og:title" content="Users App" />
			</Helmet>
```
* this si the frontside browser rendering way to use helmet
* in SSR we import helmet  in renderer.js after renderTostring and before retuerning html we add `const helmet = Helmet.renderStatic();` extracting all defined tags in Helmet component
* then in html we interpolate the param settign the tag we want to add to heml
```
<head>
				${helmet.title.toString()}
				${helmet.meta.toString()}
				...
```

### Lecture 91 - Dynamic Title Tags

* we want to customize helmt tag text on the fly based on the redux state
* we take out helmet jsx from render
* to  use redux state in helmet we do the obvious 
```
<Helmet>
	<title>{this.props.users.length} Users App</title>
```
* we get an error as helmet expects strings inside the tags as a single expression
* we can fix it with template strings `<title>{`${this.props.users.length} Users App`}</title>`

### Lecture 92 - RenderToString vs RenderToNodeStream

* the cornerstone of our  SSR attempt was [ReactDOMServer](https://reactjs.org/docs/react-dom-server.html) method renderToString
* there arew other methods available
	* renderToStaticMarkup() if we dont intend to rehydrate the app (static content)
	* renderToNodeStream() : like renderToString but this returns a readable stream
	* renderToStaticNodeStream() : 
* to showcase renderToNodeStream we use our app and put a tremendus amoun of text t render.
* we use both methods renderToString and renderToNodeStream
	* renderToString: browser makes api requests -> build entire html doc -> load entire doc in responce and send it to browseer
	* renderTONodeStream: Browser makes Request to Renderer Server => Renderer makes api requests -> build tiny snippet of html doc -> send tiny snippet (portion of response) to browser -> build tiny snippet of HTNL doc -> send tiny snippet of html to browser ...
* so the page is rendrerd and send as a stream bit by bit to browser
* the reason behind it is performance
* with rendertonodestream we minimize waiting time or TTFB (time to first byte) (dev tools ->network) this allows us to get better SEO
* a TTFB of 200ms-300ms is fine. API calls are the bottleneck
* TTFB in render to node stream is 4x shorter.
* The PROBLEM with renderToNodeStream is: 
	* by the time we s tart rendering we start sending content (res object)
	* so we CANNOT apply redirection or change of status repending on the rendering outcome.
	* a solution to this involves running JS on browser

## Section 12 - Wrapup

### Lecture 93 - Next Steps and Wrapup

* If you are going SSR do it from App design phase not after implementation
* To expand the App we stick to the patterns we already implemented