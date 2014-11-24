(function() {
	var app = angular.module('ng_nodechan', []);



	app.controller('ChanController', ["$location", function($location){

		this.live_host="chan.tadeuszow.com";
		this.page_location=$location.absUrl();
		this.page_host = $location.host();
		this.page_jquery = $location.search();
		this.page_hash = $location.hash();
		this.threads = [];
		this.test="Billy!";

		this.set_hash = function(new_hash){
			$location.hash(new_hash);
		}
	}]);
	app.controller('BoardController', ["$http", function($http){

		this.threads = [];
		myboard=this;
		$http.get('/xboard.json').
		success(function(data){
			//console.log(data);
			myboard.threads=data;
		});
		/*
		*/
		this._id="pone";
		this.name="My Diminutive Equine";
	}]);
	app.directive("nodechanHeader", function() {
		return {
			restrict: 'E',
			templateUrl: "nodechan_header.html",
			controller:function(){

			}
		};

	});
	app.directive('fullThread', function(){
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
	});
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
			templateUrl: "reply_form.html",
			controller:function(){

			}
		};
	});
	app.directive("modFooter", function() {
		return {
			restrict: 'E',
			templateUrl: "mod_footer.html",
			controller:function(){

			}
		};
	});
})();
