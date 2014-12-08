(function() {
	var underscore = angular.module('underscore', []);
	underscore.factory('_', function() {
		//window._.str = underscore;

		// Mix in non-conflict functions to Underscore namespace if you want
		window._.mixin(_.str.exports());

		return window._;
	});

	var app = angular.module('ng_nodechan', ['ngRoute', 'ngCookies', 'ngSanitize', 'underscore', 'LocalStorageModule']);
	var chantroll = app.controller('ChanController', ["$location", "$cookies", "$cookieStore", "localStorageService", '$sce', "$http", "$rootScope", "$scope", "$route", "$routeParams", function($location, $cookies, $cookieStore, localStorageService, $sce, $http, $rootScope, $scope, $route, $routeParams) {

		$scope.live_host="nodechan.herokuapp.com";
		$scope.page_location=$location.absUrl();
		$scope.page_host = $location.host();
		$scope.page_jquery = $location.search();
		$scope.page_hash = $location.hash();
		$scope.archived=($scope.live_host != $scope.page_host);

		$scope.board_name="Someday we'll sail away";
		$rootScope.preview_reply_num = 3;
		$scope.debug=false;
		$scope.viewmode_last='';
		$scope.viewmode='';

		$rootScope.threads=[];

		$rootScope.cookie_hidden={'threads':{}, 'posts':{}};

		console.log("formcookie");
		console.log(localStorageService.get('ck_nodechan_form'));

		$rootScope.get_dom=function(){
			return $location.host().replace(/(http:\/\/)?(([^.]+)\.)?(vchan|vectorchan)\.com/, '$4');
		}

		$rootScope.get_sub=function(){
			return $location.host().replace(/(http:\/\/)?(([^.]+)\.)?(vchan|vectorchan)\.com/, '$3');
		}

		$rootScope.get_sub_suffix=function(){
			if ($rootScope.get_dom()=='vchan'){
				return '.'+$rootScope.get_dom()+'.com:5000';
			}else{
				return '.'+$rootScope.get_dom()+'.com';
			}
		}

		$rootScope.parse_post_body = function(thread_id, post_body){
		//var temp_url = mytext.replace(/(?:http:\/\/|https:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/g, 'https://www.youtube.com/embed/$1');
			//return '<p class="body">'+post_body.replace(/\n/g, '<br>')+'</p>';
			return post_body
				//.replace(/(?:\>\>op)/gi, '<a href="#op_'+thread_id+'">>>op</a> ')
				.replace(/(>>+)([0-9]+)(\s*)/g, '<a class="clickable" href="/#/'+thread_id+'#$2">&zwnj;>&zwnj;>$2</a> $3')
				.replace(/(>>+op)(\s*)/gi, '<a class="clickable" href="/#/'+thread_id+'#op">&zwnj;>&zwnj;>op</a> $2')
				.replace(/(>>+)((?!op).*)(\n?)/gi, "<span class='quote'>&zwnj;>&zwnj;>$2</span><br>")
				.replace(/(\n\n+)/g, '<br><br>')
				.replace(/\n/g, '<br>')
				.replace(/\[b\](.*?)\[\/b\]/gmi, '<strong>$1</strong>')
				.replace(/\[i\](.*?)\[\/i\]/gmi, '<em>$1</em>');
		}

		window.onbeforeunload = function (event) {

			//$cookieStore.put('ck_nodechan_hidden', $rootScope.cookie_hidden);
			localStorageService.set('ck_nodechan_hidden', $rootScope.cookie_hidden);
			console.log("hidden cookie saved");

			//$cookieStore.put('ck_nodechan_form', $rootScope.cookie_form);
			localStorageService.set('ck_nodechan_form', $rootScope.cookie_form);
			console.log("form cookie saved");

			/*
			var message = 'Sure you want to leave?';
			if (typeof event == 'undefined') {
				event = window.event;
			}
			if (event) {
				event.returnValue = message;
			}
			return message;
			*/
		}

		$rootScope.refresh_boardlist = function(){
			//$location.url('/');
			console.log("something is HAPPENING with the board");
			console.log($rootScope.get_dom());

			var config = {
				params: {
					board_id: get_dom(),
					since_date: undefined
				}
			};

			$http.get('/json/boardlist.json', config)
				.success(function(root_data){
					console.log("data received");
					console.log(root_data);

					threads=root_data;
					//viewmode='board';
					$scope.$apply();
					return "success";
				}
			);
			/*
			*/
		}

		$rootScope.get_threads = function(){
			console.log("returning boardlist:");
			console.log($rootScope.threads);

			$rootScope.done_loading=true;
			return $rootScope.threads;
		}

		$rootScope.set_location = function(new_path){
			console.log("setting new url:", new_path);
			$location.url(new_path);
			//$location.replace();
		}

		$rootScope.set_location_thread = function(requested_thread){
			$rootScope.set_location('/'+requested_thread);
			//$location.hash('op_'+requested_thread);
			//something's wrong with jumping to the correct id
		}

		$rootScope.set_location_thread_and_post = function(requested_thread, requested_post){
			$rootScope.set_location('/'+requested_thread);
			$location.hash('post_no_'+requested_post);
		}

		$rootScope.set_viewmode = function(new_view){
			$rootScope.viewmode=new_view;
			$scope.viewmode=new_view;
			console.log("viewmode set:");
			console.log(new_view);
			//console.log($rootScope.viewmode);
		}

		$rootScope.gotoHash = function(myhash) {
			// set the location.hash to the id of
			// the element you wish to scroll to.
			$location.hash(myhash);

			// call $anchorScroll()
			//$anchorScroll();
		};

		$rootScope.parse_youtube_preview = function(youtube_link) {
			var video_id='';
			var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
			var match = youtube_link.match(regExp);
			if (match&&match[7].length==11){
				video_id = match[7];
			}
			return $sce.trustAsResourceUrl('https://img.youtube.com/vi/'+video_id+'/0.jpg');	//change to '/default.jpg' if this ever breaks
		}

		$rootScope.parse_jquery=function(url){
			var query_string=url.substr(url.lastIndexOf('?') + 1);	//Isolate the query options
			var base_string=url.substr(0, url.lastIndexOf('?'));	//Isolate the url before the query
			var query_list=query_string.split("&");					//segregate each option pair
			var query_obj={};

			console.log("Unparsed options are:");
			console.log(query_list);
			for (var i = 0; query_list[i] != undefined; i++) {
				var pair = query_list[i];
				console.log("Pair string is:");
				console.log(pair);
				query_obj[pair.substr(0, pair.lastIndexOf('='))]=pair.substr(pair.lastIndexOf('=') + 1);
			}
			console.log("Parsed options are:");
			console.log(query_obj);
			return query_obj;
		}

		$rootScope.parse_Link = function(mytext) {

			var file_meta={'link_type':'', 'embed':false, 'embed_hide':false, 'link':''};
			var temp_url = '';

			if (_.str.contains(mytext, 'youtu.be') || _.str.contains(mytext, 'youtube.com')) {

				file_meta.link_type='youtube';
				file_meta.embed=true;
				file_meta.embed_hide=true;
				console.log(mytext);
				/*
				vid_id = mytext.replace(/(?:http:\/\/|https:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)?(.+)?()/g, 'https://www.youtube.com/embed/$1?autoplay=1');
				*/
				
				var video_id='';
				var match = mytext.match(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/);
				if (match&&match[7].length==11){
					video_id = match[7];
					console.log('video id is:');
					console.log(video_id);
				}else{
					console.log("OH NO this isn't a proper youtube link!");
					return;
				}

				var query_obj=$rootScope.parse_jquery(mytext);

				temp_url='https://www.youtube.com/embed/' + video_id + '?autoplay=1';
				//TODO:: make autoplay user configurable in options

				if (query_obj.t != undefined) {
					var time=query_obj.t;
					var seconds=0;

					if (time.lastIndexOf('h')!=-1){

						var seconds=seconds+(parseInt(time.substr(0, time.lastIndexOf('h'))) * 60 * 60);	//convert hours to seconds
						var time=time.substr(time.lastIndexOf('h') + 1);	//remove hours from the time string
					}

					if (time.lastIndexOf('m')!=-1){

						var seconds=seconds+(parseInt(time.substr(0, time.lastIndexOf('m'))) * 60);	//convert minutes to seconds
						var time=time.substr(time.lastIndexOf('m') + 1);	//remove minutes from the time string
					}

					if (time.lastIndexOf('s')!=-1){

						var seconds=seconds+parseInt(time.substr(0, time.lastIndexOf('s')));	//add seconds
					}

					temp_url=temp_url + '&start='+seconds;
					console.log('seconds are:');
					console.log(seconds);
				};

				file_meta.link = $sce.trustAsResourceUrl(temp_url);

				//$scope.file_meta.link = $sce.trustAsResourceUrl($scope.file);

				//$scope.file = $sce.trustAsHtml($scope.file.replace(/(?:http:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/g, '<iframe width="420" height="345" src="http://www.youtube.com/embed/$1" frameborder="0" allowfullscreen></iframe>'));
				//$scope.file = $scope.file.replace(/(?:http:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/g, '<iframe width="420" height="345" src="http://www.youtube.com/embed/$1" frameborder="0" allowfullscreen></iframe>');
			} else if (_.str.contains(mytext, 'vimeo.com')) {

				file_meta.link_type='vimeo';
				file_meta.embed=true;
				console.log(mytext);
				temp_url = mytext.replace(/(?:http:\/\/|https:\/\/)?(?:www\.)?(?:vimeo\.com)\/(.+)/g, '//player.vimeo.com/video/$1');
				file_meta.link = $sce.trustAsResourceUrl(temp_url);
				//rom: https://vimeo.com/63534746 
				//to: http://player.vimeo.com/video/63534746
				console.log("parsed link looks like:");
				console.log(temp_url);
			} else if (_.str.contains(mytext, 'soundcloud.com')) {

				file_meta.link_type='soundcloud';
				file_meta.embed=true;
				console.log(mytext);
				temp_url = mytext.replace(/(?:http:\/\/|https:\/\/)?(?:www\.)?(?:vimeo\.com)\/(?:watch\?v=)?(.+)/g, 'https://www.youtube.com/embed/$1');
				file_meta.link = $sce.trustAsResourceUrl(temp_url);
				//rom: https://vimeo.com/63534746 
				//to: http://player.vimeo.com/video/63534746
			}
			return file_meta;
		};

		$rootScope.submitData = function (post_form, resultVarName){
			post_form.sending=true;

			if (post_form.name != "") $rootScope.cookie_set_postname(post_form.name);

			console.log("current viewmode is:")
			console.log($rootScope.viewmode)

			var post_files_trimmed=[];
			for (var i = 0; i < post_form.files.length; i++) {
				if (post_form.files[i]!=undefined && post_form.files[i]!=''){
					post_files_trimmed.push(post_form.files[i]);
				}
			};
			if (post_files_trimmed==[]) post_files_trimmed=[''];

			if ($rootScope.viewmode == 'thread'){

				var config = {
					params: {
						thread_id: $rootScope.curthread_id,
						name: post_form.name,
						subject: post_form.subject,
						files: post_files_trimmed,
						body: post_form.body,
					}
				};

				console.log("config is:");
				console.log(config);
				$http.post("/json/post_reply", null, config)
				.success(function (data, status, headers, config)
				{
					console.log("New thread is:");
					console.log(data);
					//$rootScope.set_location('/#post_no_'+data.true_id+'/'+data.thread_id);

					$rootScope.threads[0].posts.push(data);
					//^This adds the current post to the reply list: TODO:: fetch any posts made just before client has posted 
				})
				.error(function (data, status, headers, config)
				{
					console.log("SUBMIT ERROR");
				});


			} else {

				var config = {
					params: {
						name: post_form.name,
						board_id: $rootScope.get_sub(),
						subject: post_form.subject,
						files: post_files_trimmed,
						body: post_form.body,
					}
				};

				console.log("config is:");
				console.log(config);
				$http.post("/json/post_thread", null, config)
				.success(function (data, status, headers, config)
				{
					//console.log("new thread op's true_id is:");
					//console.log(data.true_id);
					$rootScope.set_location_thread(data.true_id);
				})
				.error(function (data, status, headers, config)
				{
					console.log("SUBMIT ERROR");
				});
			}
			//var temp_name=post_form.name;
			$rootScope.cookie_form.name=post_form.name;
			//$cookieStore.put('ck_nodechan_form', $rootScope.cookie_form);
			console.log("name is:", $rootScope.cookie_form.name);
			localStorageService.set('ck_nodechan_form', $rootScope.cookie_form);

			//
			post_form.subject="";
			post_form.files=[''];
			post_form.body="";
			$scope.post_form_tag.$setPristine();
			//post_form.name=temp_name;
			post_form.sending=false;
		};

	}]);

	chantroll.load_board = function($rootScope, $http){
		console.log("something is HAPPENING with the board, fetching");
		console.log($rootScope.get_sub());

		var config = {
			params: {
				board_id: $rootScope.get_sub(),
				since_date: undefined
			}
		};

		return $http.get('/json/boardlist.json', config)
			.success(function(root_data){
				console.log("data received");
				console.log(root_data);

				$rootScope.threads=root_data;
				$rootScope.viewmode='board';

				$rootScope.done_loading=true;
				return "success";
			}
		);
	};

	chantroll.load_thread = function($rootScope, $route, $http, $location){
		console.log("a FULL THREAD is loading!");
		console.log("but first, read params!");
		console.log($route.current.params.thread_id);
		return $http.get('/json/thread.'+$route.current.params.thread_id)
			.success(function(data){
				console.log("full thread received");
				console.log(data);

				$rootScope.threads=[data];
				$rootScope.done_loading=true;
				//^This is done for a good reason
				//this.op=data.op;
				//this.posts=data.posts;
				return "success";
			}
		);
	};

	app.config(function (localStorageServiceProvider) {
		localStorageServiceProvider
			.setPrefix('nodeChan');
		//localStorageServiceProvider
			//.setStorageCookie(45, '/');			// Days to live
		localStorageServiceProvider
			.setStorageCookieDomain((window.location.hostname=='localhost' ? '' : window.location.hostname));
  localStorageServiceProvider
    .setNotify(true, true);
	});

	app.config(function($routeProvider){

		//
		$routeProvider
		.when('/catalog', {
			templateUrl: 'nodechan_board_catalog.html',
			controller: 'BoardCatalogController',
			controllerAs: 'board',
			resolve: {
				board_list: chantroll.load_board
			}
		})
		.when('/:thread_id*', {
			templateUrl: 'nodechan_thread.html',
			controller: 'FullThreadController',
			controllerAs: 'thread',
			resolve: {
				full_thread: chantroll.load_thread
			}
		})
		.when('/', {
			templateUrl: 'nodechan_board_list.html',
			controller: 'BoardListController',
			controllerAs: 'board',
			resolve: {
				board_list: chantroll.load_board
			}
		})
		.otherwise({
			redirectTo: '/'
		})
		//
	})
	.directive("nodechanCrown", function() {
		return {
			restrict: 'E',
			templateUrl: "nodechan_crown.html"
		};
	})
	.directive("nodechanHeader", function() {
		return {
			restrict: 'E',
			templateUrl: "nodechan_header.html"
		};
	})
	.controller('BoardListController', ["$http", "$rootScope", "$scope", "$route", function($http, $rootScope, $scope, $location){
		$rootScope.set_viewmode('board');

	}])
	.controller('BoardCatalogController', ["$http", "$rootScope", "$scope", "$route", function($http, $rootScope, $scope, $location){
		$rootScope.set_viewmode('catalog');

	}])
	.controller('FullThreadController', ["$http", "$rootScope", "$scope", "$route", "$location", "$routeParams", function($http, $rootScope, $scope, $location, $route, $routeParams){
		$rootScope.set_viewmode('thread');
		$rootScope.curthread_id = $routeParams.thread_id;
		console.log("current thread ID noted as:", $routeParams.thread_id)

	}]);
	/*
	app.directive('fullThread', function(thread_error){
		return_object={
			restrict: 'E',
			templateUrl: "nodechan_thread.html",
		    link: function (scope, element) {
		    }
			controller:function($scope, $http, $location){
				console.log("new thread is:");
				console.log(this);
				//this.true_id="";	//TODO
				this.nodehidden=false;
				this.posts=[];
				this_thread=this;
				console.log("current thread is:");
				console.log($scope.thread);
			}
		};
				//
				//Note: should have an array of 'replies', strings of the post IDs of repliest to the post. This should be generated clientside after all posts have loaded.
		
		//$scope.board.threads[thread_index].posts = all_posts;

		return return_object;
		//Need a function for getting newer posts, posts in the thread since the last post, then appended to this.posts
	});
	*/
	/*
		$http.get('http://localhost:5000/examplethread.json').then(function(res){
			this.posts = res.data.posts;
		});
			<div class="nodechan-post" ng-repeat="post in thread.posts">
				<h3>{{post.id}}</h3>
				<p>{{post.body}}</p>
				<input type="text" ng-model="yourName" placeholder="Enter a name here">
			</div>
	*/
	app.directive("postOp", function() {
		return {
			restrict: 'E',
			templateUrl: "nodechan_post_op.html",
			controller:function(){
				
			}
		};
	})
	.directive("postReply", function() {
		return {
			restrict: 'E',
			templateUrl: "nodechan_post_reply.html",
			controller:['$scope', '$rootScope', '_', function($scope, $rootScope, _){
			}]
		};
	})
	app.filter("chan_trust_html", ['$sce', function($sce) {
		return function(htmlCode){
			return $sce.trustAsHtml(htmlCode);
		}
	}])
	.directive("nodechanFile", function() {
		return {
			restrict: 'E',
			templateUrl: "nodechan_file.html",
			controller:['$rootScope', '$scope', '_', '$sce', function($rootScope, $scope, _, $sce){

				$scope.file_meta = $rootScope.parse_Link($scope.file);

				$scope.reveal_embed = function(){
					$scope.file_meta.embed_hide=false;
				}

				-->
				//$scope.parsed_link = '<iframe width="560" height="315" src="//www.youtube.com/embed/7E9lt-b3Jtw" frameborder="0" allowfullscreen></iframe>';
			}],
			controllerAs:'nodechanFileController'
		};
	})
	.directive("replyForm", function() {
		return {
			restrict: 'E',
			templateUrl: "nodechan_reply_form.html",
			controller: ['$rootScope', '$cookies', 'localStorageService', function($rootScope, $cookies, localStorageService){

				//$rootScope.cookie_form={'name':$cookies.name};

				$rootScope.get_cookie_name = function(){

					$rootScope.cookie_form=localStorageService.get('ck_nodechan_form');
					console.log("cookieform is:");
					console.log($rootScope.cookie_form);
					if (!($rootScope.cookie_form)){
						$rootScope.cookie_form={'name':''};
					}
					return $rootScope.cookie_form.name;
				}

				$rootScope.reset_cookie_user = function(){

					console.log('Resetting user cookie');
					$cookies.user = {
						name:""
					}
					//TODO:: no more $cookies
				}

				$rootScope.cookie_set_postname = function(new_name){
					if ($cookies.user == undefined) $rootScope.reset_cookie_user();

					console.log("Current cookie name is:");
					console.log($cookies.user.name);
					console.log("New cookie name is:");
					console.log(new_name);
					$cookies.user.name=new_name;
					//TODO:: no more $cookies
				}

				$rootScope.cookie_get_postname = function(){
					if ($cookies.user == undefined) $rootScope.reset_cookie_user();

					return $cookies.user.name;
				}
			}]
		};
	})
	.directive("modFooter", function() {
		return {
			restrict: 'E',
			templateUrl: "nodechan_footer.html",
			controller:function(){

			}
		};
	});
})();
