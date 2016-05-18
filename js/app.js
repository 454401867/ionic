// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('wisdom', ['ionic', 'pdf', 'ngProgress', 'ngCordova', 'wisdom.controllers'])

  //android返回键监听
    .run(['$ionicPlatform', '$ionicPopup', '$rootScope', '$location', '$ionicHistory', '$ionicActionSheet',
        function($ionicPlatform, $ionicPopup, $rootScope, $location, $ionicHistory, $ionicActionSheet) {
            //主页面显示退出提示框
            $ionicPlatform.registerBackButtonAction(function(e) {
                e.preventDefault();
                function showConfirm() {
                    var hideSheet = $ionicActionSheet.show({
                        //显示提示框内容和按钮
                        titleText: 'Are you sure to quite?',
                        buttons: [
                            { text: 'NO' },
                            { text: 'YES' }
                        ],
                        cssClass: "actionsheet-approvement",
                        buttonClicked: function(index) {
                            if (index == 1) {
                                ionic.Platform.exitApp();
                            }
                            return true;
                        }
                    });
                }

                if ($location.path() == '/gesture' || $location.path() == '/splash') {
                    ionic.Platform.exitApp();
                } else if ($location.path() == '/app/home') {

                    showConfirm();
                } else {
                    $ionicHistory.goBack();
                  
                }

                return false;
            }, 101);

        }])
//
    .run(function($ionicPlatform) {
        $ionicPlatform.ready(function() {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })

    .config(function($ionicConfigProvider) {
        //$ionicConfigProvider.views.transition('none');
    })

    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('splash', {
                url: '/splash',
                templateUrl: "templates/splash.html"
            })

            .state('login', {
                url: '/login',
                templateUrl: "templates/login.html",
                controller: "LoginController"
            })

            .state('gesture', {
                url: '/gesture',
                templateUrl: "templates/gesture.html"

            })
            .state('app', {
                url: '/app',
                abstract: true,
                templateUrl: "templates/menu.html"
            })

            .state('app.home', {
                url: '/home',
                views: {
                    'menuContent': {
                      templateUrl: "templates/home.html",
                      controller: 'HomeController'
                    }
                }
            })
            .state('searchlist', {
                url: '/searchlist',
                controller: 'SearchListController',
                templateUrl: "templates/searchlist.html"
            })

            .state('search', {
                url: '/search',
                templateUrl: "templates/search.html",
                controller: 'SearchController'
            })
            .state('detail', {
                url: '/detail',
                templateUrl: "templates/detail.html",
                controller: 'DetailController'
            })
            .state('comment', {
                url: '/comment',
                templateUrl: "templates/comment.html",
                controller: 'CommentController'
            })
            .state('fileviewer', {
                url: '/fileviewer',
                templateUrl: "templates/fileviewer.html",
                params: { 'activeDocument': null },
                controller: 'FileController'
            })
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/splash');
    });
