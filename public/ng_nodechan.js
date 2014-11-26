(function() {
	var app = angular.module('ng_nodechan', ['ngRoute']);
	var chantroll = app.controller('ChanController', ["$location", "$http", "$rootScope", "$scope", "$route", "$routeParams", function($location, $http, $rootScope, $scope, $route, $routeParams) {

		$scope.live_host="nodechan.herokuapp.com";
		$scope.page_location=$location.absUrl();
		$scope.page_host = $location.host();
		$scope.page_jquery = $location.search();
		$scope.page_hash = $location.hash();
		$scope.archived=($scope.live_host != $scope.page_host);

		$scope.board_id="tech";
		$scope.board_name="The Technology Board";
		$scope.viewmode_last='';
		$scope.viewmode='';

		$rootScope.threads=[];

		$rootScope.get_threads = function(){
			console.log("returning threadlist:");
			console.log($rootScope.threads);
			return $rootScope.threads;
		}

		$rootScope.set_location = function(new_path){
			console.log("setting new url:", new_path);
			$location.url(new_path);
			$location.url(new_path);
		}

		$rootScope.set_viewmode = function(new_view){
			$rootScope.viewmode=new_view;
			$scope.viewmode=new_view;
			console.log("viewmode set:");
			console.log(new_view);
			//console.log($rootScope.viewmode);

		}

		$rootScope.submitData = function (post_form, resultVarName)
		{
			post_form.sending=true;
			console.log("current viewmode is:")
			console.log($rootScope.viewmode)
			if ($rootScope.viewmode == 'thread'){

				var config = {
					params: {
						thread_id: post_form.thread_id,
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
					$rootScope.threads[0].posts.push(config.params);
					//^This adds the current post to the reply list: TODO:: fetch any posts made just before client has posted 
					$location.path('/' + config.params.thread_id + '#post_no_'+config.params.true_id).replace();
				})
				.error(function (data, status, headers, config)
				{
					console.log("SUBMIT ERROR");
				});


			} else if ($rootScope.viewmode == 'board'){

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
				$http.post("/json/post_op", null, config)
				.success(function (data, status, headers, config)
				{
					//console.log("new thread op's true_id is:");
					//console.log(data.true_id);
					$location.path('/' + data.true_id).replace();
				})
				.error(function (data, status, headers, config)
				{
					console.log("SUBMIT ERROR");
				});
			}
			post_form.subject="";
			post_form.files=[''];
			post_form.body="";
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
	.controller('FullThreadController', ["$http", "$rootScope", "$scope", "$route", function($http, $rootScope, $scope, $location){
		$rootScope.set_viewmode('thread');

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
			controller:function(){

			}
		};
	})
	.directive("nodechanFile", function() {
		return {
			restrict: 'E',
			templateUrl: "nodechan_file.html",
			controller:function(){
			}
		};
	})
	.directive("replyForm", function() {
		return {
			restrict: 'E',
			templateUrl: "nodechan_reply_form.html",
			controller:function(){

			}
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
