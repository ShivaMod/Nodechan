(function() {
	var underscore = angular.module('underscore', []);
	underscore.factory('_', function() {
		//window._.str = underscore;

		// Mix in non-conflict functions to Underscore namespace if you want
		window._.mixin(_.str.exports());

		return window._;
	});

	var app = angular.module('ng_nodechan', ['ngRoute', 'ngCookies', 'ngSanitize', 'underscore']);
	var chantroll = app.controller('ChanController', ["$location", '$cookieStore', '$sce', "$http", "$rootScope", "$scope", "$route", "$routeParams", function($location, $cookieStore, $sce, $http, $rootScope, $scope, $route, $routeParams) {

		$scope.live_host="nodechan.herokuapp.com";
		$scope.page_location=$location.absUrl();
		$scope.page_host = $location.host();
		$scope.page_jquery = $location.search();
		$scope.page_hash = $location.hash();
		$scope.archived=($scope.live_host != $scope.page_host);

		$scope.board_id="boatdev";
		$scope.board_name="Someday we'll sail away";
		$rootScope.preview_reply_num = 3;
		$scope.debug=false;
		$scope.viewmode_last='';
		$scope.viewmode='';

		$rootScope.threads=[];

		// Removing a cookie
		//$cookieStore.remove('ck_nodechan_hidden');
		// Get cookie
		$rootScope.cookie_hidden = $cookieStore.get('ck_nodechan_hidden');

		if ($rootScope.cookie_hidden==undefined){

			$rootScope.cookie_hidden = {'threads': {}, 'posts': {}};
			// Put cookie
			$cookieStore.put('ck_nodechan_hidden', $rootScope.cookie_hidden);
			//TODO::each board should have its own cookie
			console.log("Cookie hidden test:");
			console.log($rootScope.cookie_hidden);
		}

		// Get cookie
		$rootScope.cookie_form = $cookieStore.get('ck_nodechan_form');
			console.log("Cookie form test:");
			console.log($rootScope.cookie_form);

		if ($rootScope.cookie_form==undefined){

			$rootScope.cookie_form = {'name': ''};
			// Put cookie
			$cookieStore.put('ck_nodechan_form', $rootScope.cookie_form);
			//TODO::each board should have its own cookie
			console.log("Cookie form test:");
			console.log($rootScope.cookie_form);
		}

		$rootScope.refresh_threadlist = function(){
			//$location.url('/');
			console.log("something is HAPPENING with the board");
			$http.get('/json/threadlist.json')
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
			console.log("returning threadlist:");
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

		$rootScope.parse_Link = function(mytext) {

			var file_meta={'link_type':'', 'embed':false, 'embed_hide':false, 'link':''};
			var temp_url = '';

			if (_.str.contains(mytext, 'youtu.be') || _.str.contains(mytext, 'youtube.com')) {

				file_meta.link_type='youtube';
				file_meta.embed=true;
				file_meta.embed_hide=true;
				console.log(mytext);
				temp_url = mytext.replace(/(?:http:\/\/|https:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/g, 'https://www.youtube.com/embed/$1');
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
			if ($rootScope.viewmode == 'thread'){

				var config = {
					params: {
						thread_id: $rootScope.curthread_id,
						name: post_form.name,
						subject: post_form.subject,
						files: post_form.files,
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
						subject: post_form.subject,
						files: post_form.files,
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
			$cookieStore.put('ck_nodechan_form', $rootScope.cookie_form);

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
		console.log("something is HAPPENING with the board");
		return $http.get('/json/threadlist.json')
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

	}])
	.directive("nodechanHeader", function() {
		return {
			restrict: 'E',
			templateUrl: "nodechan_header.html"
		};
	});
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

				$scope.test_post=$scope.post.body.replace(/(>+)([0-9]+)(\s*)/g, '<a class="clickable" href="/#/'+$scope.thread.op.true_id+'#$2">>>$2</a>$3').replace(/(>+)(op)(\s*)/g, '<a class="clickable" href="/#/'+$scope.thread.op.true_id+'#$2">>>$2</a>$3').replace(/(\n\n+)/g, '<br><br>').replace(/\n/g, '<br>');

				//It would be nice to allow linking to posts in other threads, but maybe some other time...
				$scope.parse_post_body = function(post_body){
					var tempy= post_body.replace(/\n/g, '<br>')
					console.log("This is tempy");
					console.log(tempy);

					tempy = tempy.replace(/(?:\>\>op)/g, '<a href="#op_'+$rootScope.curthread_id+'">>>op</a> ');
				//var temp_url = mytext.replace(/(?:http:\/\/|https:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/g, 'https://www.youtube.com/embed/$1');
					//return '<p class="body">'+post_body.replace(/\n/g, '<br>')+'</p>';
					console.log(tempy);
					return tempy;
				}
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
			controller: ['$rootScope', '$cookies', function($rootScope, $cookies){

				window.onbeforeunload = function (event) {

					$rootScope.cookie_form.name = $cookies.user.name;
					$cookieStore.put('ck_nodechan_form', $rootScope.cookie_form);
					console.log("cookie saved");

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

				$rootScope.reset_cookie_user = function(){

					console.log('Resetting user cookie');
					$cookies.user = {
						name:""
					}
				}

				$rootScope.cookie_set_postname = function(new_name){
					if ($cookies.user == undefined) $rootScope.reset_cookie_user();

					console.log("Current cookie name is:");
					console.log($cookies.user.name);
					console.log("New cookie name is:");
					console.log(new_name);
					$cookies.user.name=new_name;
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
