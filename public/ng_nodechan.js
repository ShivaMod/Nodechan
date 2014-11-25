(function() {
	var app = angular.module('ng_nodechan', []);



	app.controller('ChanController', ["$location", "$scope", function($location, $scope){

		$scope.live_host="nodechan.herokuapp.com";
		$scope.page_location=$location.absUrl();
		$scope.page_host = $location.host();
		$scope.page_jquery = $location.search();
		$scope.page_hash = $location.hash();
		$scope.archived=($scope.live_host != $scope.page_host);
	}]);
	app.controller('BoardController', ["$http", "$scope", "$location", function($http, $scope, $location){

		this.threads = [];
		var myboard=this;

		this._id="tech";
		this.name="The Technology Board";

		//$scope.curpath=$scope.archived ? $scope.page_host : (this._id+'.'+$scope.live_host+'/#/');
		$scope.curpath=$scope.archived ? $scope.page_host : ($scope.live_host+'/#/');
		//$scope.viewmode='board';
		$scope.viewmode= (($scope.page_jquery.t == undefined) ? 'board' : ($scope.page_jquery.t=='catalog' ? 'catalog' : 'thread'));
		$scope.sub_result={};

		$scope.refresh_thread_data=function(){
			
			$location.replace();

			console.log($scope.viewmode);
			if ($scope.viewmode == 'thread'){

				console.log($scope.page_jquery.t);
				$http.get('/json/thread.'+$scope.page_jquery.t).
				success(function(data){
					//console.log(data);
					myboard.threads=[data];
					console.log("data received");
					console.log(data);
				});

				/*
				var config = {
					params: {
						thread_id: post_form.thread_id,
						name: post_form.name,
						subject: post_form.subject,
						files: post_form.files,
						body: post_form.body,
					}
				};

				console.log(config);
				$http.post("/json/post_reply", null, config)
				.success(function (data, status, headers, config)
				{
					$scope[resultVarName] = data;
					$location.path('/#/?t=' + data.thread_id).replace();
				})
				.error(function (data, status, headers, config)
				{
					$scope[resultVarName] = "SUBMIT ERROR";
				});
				*/

			} else{

				$http.get('/json/threadlist.json').
				success(function(data){
					//console.log(data);
					myboard.threads=data;
					console.log("data received");
					console.log(data);

					for(var i=0; i<myboard.threads.length; i++){

						var url='/json/posts.'+myboard.threads[i].op._id+'.preview';
						console.log(url);
						$http.get(url).
						success(function(data){
							//console.log(data);
							myboard.threads[i].posts=data;
							console.log("data received");
							console.log(data);
						});
					}
				});
			}
		}

		$scope.activate_new_path = function(new_path){
			$location.path(new_path);
			$scope.refresh_thread_data();
		}

		$scope.refresh_thread_data();

		$scope.set_hash = function(new_hash){
			$location.hash(new_hash);
		}
		$scope.submitData = function (post_form, resultVarName)
		{
			post_form.sending=true;
			if ($scope.viewmode == 'thread'){

				var config = {
					params: {
						thread_id: post_form.thread_id,
						name: post_form.name,
						subject: post_form.subject,
						files: post_form.files,
						body: post_form.body,
					}
				};

				console.log(config);
				$http.post("/json/post_reply", null, config)
				.success(function (data, status, headers, config)
				{
					$scope[resultVarName] = data;
					$location.path('/#post_no_'+data._id+'/?t=' + data.thread_id).replace();
				})
				.error(function (data, status, headers, config)
				{
					$scope[resultVarName] = "SUBMIT ERROR";
				});


			} else if ($scope.viewmode == 'board'){

				var config = {
					params: {
						name: post_form.name,
						subject: post_form.subject,
						files: post_form.files,
						body: post_form.body,
					}
				};

				console.log(config);
				$http.post("/json/post_op", null, config)
				.success(function (data, status, headers, config)
				{
					$scope[resultVarName] = data;
					$location.path('/#post_no_' + data._id + '/?t=' + data._id).replace();
				})
				.error(function (data, status, headers, config)
				{
					$scope[resultVarName] = "SUBMIT ERROR";
				});
			}
			post_form.subject="";
			post_form.files=[''];
			post_form.body="";
			post_form.sending=false;

			$scope.refresh_thread_data();
		};
	}]);
	app.directive("nodechanHeader", function() {
		return {
			restrict: 'E',
			templateUrl: "nodechan_header.html",
			controller:function(){

			}
		};

	});
	app.directive('fullThread', ["$http", function(){
		return_object={
			restrict: 'E',
			templateUrl: "nodechan_thread.html",
			controller:function(){
				this._id="10";	//TODO
				this.nodehidden=false;
				this.op={};	//TODO
				this.posts=[];
				//Note: should have an array of 'replies', strings of the post IDs of repliest to the post. This should be generated clientside after all posts have loaded.
			}
		};
		return return_object;
		//Need a function for getting newer posts, posts in the thread since the last post, then appended to this.posts
	}]);
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
	});
	app.directive("postReply", function() {
		return {
			restrict: 'E',
			templateUrl: "nodechan_post_reply.html",
			controller:function(){

			}
		};
	});
	app.directive("nodechanFile", function() {
		return {
			restrict: 'E',
			templateUrl: "nodechan_file.html",
			controller:function(){
			}
		};
	});
	app.directive("replyForm", function() {
		return {
			restrict: 'E',
			templateUrl: "nodechan_reply_form.html",
			controller:function(){

			}
		};
	});
	app.directive("modFooter", function() {
		return {
			restrict: 'E',
			templateUrl: "nodechan_footer.html",
			controller:function(){

			}
		};
	});
})();