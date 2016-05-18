var app = angular.module('wisdom.controllers', ['wisdom.services', 'wisdom.directives'])

    .controller('WisdomController', function($scope, $rootScope, $ionicActionSheet, $log, $ionicPlatform, $state, $location) {

        $ionicPlatform.on('resume', function() {
            if ($location.path() == '/splash' || $location.path() == '/login' || $location.path() == '/gesture') {
            } else {
                $rootScope.path = $location.path();
                $state.go('gesture');
            }
        });
        /////
        $rootScope.$on('system:error', function(event, msg) {
            //TODO
            $log.info("handle system error: " + msg);
            /*$ionicActionSheet.show({
                titleText: msg
            });*/
        });
        $rootScope.$on("auth:failure", function(event) {
            //TODO
            $log.info("handle authentication failure.");
        });

    })

    .controller('HomeController', function($rootScope, $scope, $http, $ionicActionSheet, $ionicHistory, $ionicModal, $state, $ionicViewSwitcher,
        $log, $timeout, $ionicSideMenuDelegate, $ionicScrollDelegate, $location, $window, $interval, ToApproveService) {
        $scope.pageNum = 0;
        $scope.wfTypeId = '';
        $scope.hasMore = false;
        $scope.systems = [];
        $scope.systemId = '001';
        $scope.wfTypeName = "All Category";
        $scope.count;
        $scope.buttons = [];
        $scope.i = 0;
        $scope.monitor = {isDetailLoaded: false};
        var stop;
        var comment = ToApproveService.getComment();
        $scope.comment = comment;
        $scope.goSearch = function() {
            ToApproveService.getRetrieveList().wfTypeId = $scope.wfTypeId;
            $state.go('search');
        }
        ToApproveService.pGetHome($rootScope.gid, $rootScope.token).then(function(data) {
            $scope.userName = data.userInfo.userName;
            $scope.systems = data.systemList;
        });
        
        function initTypeList() {
            var list = ToApproveService.getRetrieveList();
            list.types = [];
            list.buttons = [];
            for (var i in list.typeList) {
                ToApproveService.pGetCount(list.typeList[i].wfTypeId, $rootScope.gid, $rootScope.tokenss).then(function(d) {
                    list.types.push(d);
                    for (var typeIndex in list.typeList) {
                        if (d.wfTypeId == list.typeList[typeIndex].wfTypeId) {
                            list.buttons.push({
                                text: list.typeList[typeIndex].wfTypeName + '<span>' + d.count + '</span>',
                                wfTypeId: list.typeList[typeIndex].wfTypeId, wfTypeName: list.typeList[typeIndex].wfTypeName,
                                count: d.count,
                            });
                            break;
                        }
                    }
                    function asc(x,y)
                    {
                        if (x.wfTypeId > y.wfTypeId)  
                            return 1;
                        if (x.wfTypeId < y.wfTypeId)          
                            return -1;
                    }
                    list.buttons.sort(asc);
                });
            }
            
        }
        
        var chkLoading = function checkDetailLoading() {
            if ($scope.monitor.isDetailLoaded == false) {
                if($scope.getSystem){
                    ToApproveService.pGetListHead($rootScope.gid, $rootScope.token).then(function(data) {
                        ToApproveService.pGetList($rootScope.gid, $rootScope.token).then(function(data) {
                            $("#homeCotent").css('display', 'block');
                            $("#hometop").css('display', 'none');
                            //anim
                            stop = $interval(function() {
                                var retrieveList = ToApproveService.getRetrieveList();
                                if (retrieveList.detailList) {
                                    $scope.stopFight();
                                }
                                clearInterval($scope.monitorInterval);    
                            }, 100);
                            $scope.items = data.detailList;
                            $scope.pageNum = 0;
                            $scope.hasMore = data.detailList.length >= 0;
                            //初试化类型
                            initTypeList();
                            ToApproveService.pGetCount($scope.wfTypeId, $rootScope.gid, $rootScope.token).then(function(d) {
                                $scope.count = d.count;
                            });
                        }, function(e) {
                            $log.info(e);
                        });
                    });
                    $scope.monitor.isDetailLoaded = true; 
                    clearInterval($scope.monitorInterval);
                }
            }
        }
        
        $scope.$on('$ionicView.beforeEnter', function(event) {
            //获取系统Systemid
            ToApproveService.pGetSystem($rootScope.gid, $rootScope.token).then(function(data) {
                $scope.getSystem = data;
            });
            //进入HOME清空searchList
            ToApproveService.getSearchList().detailList = [];
            if (event.targetScope !== $scope) {
                return;
            }
            if ($window.location.href.indexOf('gesture') != -1 && $scope.i == 0) {
                $("#hometop").css('display', 'block');
                $("#homeCotent").css('display', 'none');
                $scope.monitorInterval = setInterval(chkLoading, 2000);
                $scope.i++;
            }
            if ($window.location.href.indexOf('gesture') == -1) {
                $("#hometop").css('display', 'none');
                $scope.items = ToApproveService.getRetrieveList().detailList;
                $scope.pageNum = 0;
                $scope.hasMore = ToApproveService.getRetrieveList().detailList.length >= 0;
                for (var i in ToApproveService.getRetrieveList().buttons) {
                    if ($scope.wfTypeId == ToApproveService.getRetrieveList().buttons[i].wfTypeId) {
                        $scope.count = ToApproveService.getRetrieveList().buttons[i].count;
                    }
                }
            }

        });

        $scope.stopFight = function() {
            if (angular.isDefined(stop)) {
                $("#homeCotent").css('display', 'block');
                $("#hometop").css('display', 'none');
                $interval.cancel(stop);
                stop = undefined;
            }
        };
        $scope.loadMore = function() {
            console.log('loadMore');
            ToApproveService.pGetNextList($scope.wfTypeId, $scope.pageNum, $rootScope.gid, $rootScope.token).then(function(data) {
                if (data.listItem.length > 0) {
                    $scope.items = $scope.items.concat(data.listItem);
                }
                $scope.pageNum++;
                $scope.hasMore = data.listItem.length >= 10;
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }, function(e) {
                console.log('error');
            });
        };
        //xiala
        $scope.doRefresh = function() {
            ToApproveService.pManualUpdateList($scope.wfTypeId, $rootScope.gid, $rootScope.token).then(function(data) {
                $scope.items = data;
                $scope.pageNum = 0;
                $scope.hasMore = data.length >= 0;
                $scope.$broadcast('scroll.refreshComplete');
                ToApproveService.pGetCount($scope.wfTypeId, $rootScope.gid, $rootScope.token).then(function(data) {
                    $scope.count = data.count;
                });
                initTypeList();
            }, function(e) {
                console.log('error');
                $log.info(e);
            });
        };
        $scope.change = function(system) {
            ToApproveService.pGetListHead($rootScope.gid, $rootScope.token).then(function(data) {
                if (data.responseCode == "0") {
                    ToApproveService.pGetList($rootScope.gid, $rootScope.token).then(function(data) {
                        $scope.items = data.detailList;
                        $scope.pageNum = 0;
                        $scope.hasMore = data.detailList.length >= 0;
                    }, function(e) {
                        $log.info(e);
                    });
                }

            });
            $ionicSideMenuDelegate.toggleLeft();
        }
        //进去detail详细画面
        $scope.forward = function(detailItem) {
            var retrivelList = ToApproveService.getRetrieveList();
            //给detail参数
            retrivelList.totalName = detailItem.totalName;
            retrivelList.wfTypeId = detailItem.wfTypeId;
            $ionicViewSwitcher.nextDirection('forward');
            $scope.comment.content = '';
            $state.go('detail');
        }
        //弹出sheet显示各个类型的count数
        $scope.showActionsheet = function() {
            var buttons = [];
            var list = ToApproveService.getRetrieveList().buttons;
            for (var typeIndex in list) {
                buttons.push({
                    text: list[typeIndex].wfTypeName + '<span>' + list[typeIndex].count + '</span>',
                    wfTypeId: list[typeIndex].wfTypeId, wfTypeName: list[typeIndex].wfTypeName,
                    count: list[typeIndex].count,
                });
            }
            $ionicActionSheet.show({
                buttons: buttons,
                cssClass: "actionsheet-home",
                buttonClicked: function(index) {
                    var btn = ToApproveService.getRetrieveList().buttons[index];
                    if (btn.count == 0) {
                        return false;
                    }
                    $scope.wfTypeId = btn.wfTypeId;
                    $scope.count = btn.count;

                    ToApproveService.pGetTyleList(btn.wfTypeId, $rootScope.gid, $rootScope.token).then(function(data) {
                         $scope.items = data;
                         $scope.pageNum = 0;
                         $scope.hasMore = data.length >= 0;
                         $scope.wfTypeName = btn.wfTypeName;
                         ToApproveService.pGetCount(btn.wfTypeId, $rootScope.gid, $rootScope.token).then(function(data) {
                             $scope.count = data.count;
                         });
                         $ionicScrollDelegate.scrollTop();
                    });

                    return true;
                }
            });
        };
    })
    .controller('SearchListController', function($rootScope, $scope, $http, $state, $ionicViewSwitcher, $ionicHistory, $window, ToApproveService) {
        var comment = ToApproveService.getComment();
        $scope.comment = comment;
        //自动获取焦点
        $scope.$on('$ionicView.beforeEnter', function() {
            $('#noSearch').css('display', 'none');
            $scope.searchItems = [];
            var list = ToApproveService.getSearchList();
            console.log(list);
            if (list.detailList.length > 0) {
                $scope.searchItems = list.detailList;
                $scope.searchValue = list.searchValue;
            } else {
                $scope.searchValue = list.searchValue;
                $('#noSearch').css('display', 'block');
            }
        });
        $scope.goBack = function() {
            ToApproveService.getSearchList().detailList = [];
            $ionicHistory.goBack();
        }
        $scope.forward = function(detailItem) {
            var retrivelList = ToApproveService.getRetrieveList();
            retrivelList.totalName = detailItem.totalName;
            retrivelList.wfTypeId = detailItem.wfTypeId;
            $scope.comment.content = '';
            $ionicViewSwitcher.nextDirection('back');
            $state.go('detail');
        }
    })
    .controller('SearchController', function($rootScope, $scope, $state, $window, ToApproveService, $ionicHistory, $ionicLoading ,$timeout) {
        //绑定searchValue
        $scope.search = ToApproveService.getSearch();
        //自动获取焦点
        $scope.$on('$ionicView.afterEnter', function() {
            $('#search').focus();
            if ($window.cordova && $window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.show(); //open keyboard manually
            }
        });
        $scope.$on('$ionicView.beforeEnter', function(event) {
            $("#tops").css('display', 'none');
            $("#search").val('');
            $("#pnull").css('display', 'none');
        });
        //获取焦点
        $scope.hide = function() {
            //判断search是否为空
            if ($("#search").val() == '') {
                //为空clear按钮不显示
                $("#clear").css('display', 'none');
            } else {
                $("#clear").css('display', 'block');
            }
        }
        //失去焦点
        $scope.show = function() {
            //clear按钮隐藏
            $("#clear").css('display', 'none');
        }
        //当输入search内容时触发
        $scope.clearShowOrHide = function(event) {
            //判断search是否为空
            if ($("#search").val() == '') {
                $("#clear").css('display', 'none');
            } else {
                //不为空clear按钮显示
                $("#clear").css('display', 'block');
            }
        }
        //清空search
        $scope.clear = function() {
            $("#search").val('');
        }
        //回车事件
        $scope.keydown = function(event) {
            if (event.keyCode == 13) {
                if ($("#search").val() != '') {
                    //获取search内容
                    var search = ToApproveService.getSearch();
                    var wfTypeId = ToApproveService.getRetrieveList().wfTypeId;
                    $("#tops").css('display', 'block');
                    //调用service
                    ToApproveService.pSearch(search.searchValue, wfTypeId, $rootScope.gid, $rootScope.token).then(function(data) {
                        $state.go("searchlist");
                    });
                } else {
                    $("#pnull").css('display', 'block');
                    $("#pright").css('display', 'none');
                    $timeout(function() {
                        $("#pright").css('display', 'block');
                        $("#pnull").css('display', 'none');
                    }, 3000);
                    
                }
            }
        }
        //回退事件
        $scope.goBack = function() {
            $ionicHistory.goBack();
        }
    })


    .controller('LoginController',
    function($rootScope, $scope, $ionicPopup, $state, $timeout, $ionicLoading, ToApproveService, IMEI, $ionicScrollDelegate, $cordovaNetwork, $window) {
        document.addEventListener("deviceready", function () {

            // listen for Online event
            $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
                var onlineState = networkState;
                //alert("online: " + onlineState);
            })

            // listen for Offline event
            $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
                var offlineState = networkState;
                //alert("offline: " + offlineState);
            })

        }, false);
        var sendlogin = function(token) {

            console.log('gid===' + $scope.data.gid);
            console.log('imei======' + $rootScope.imei);
            ToApproveService.pLogin($scope.data.gid, $rootScope.imei, token).then(function(data) {

                switch (data.result) {
                    case "0":
                        $rootScope.gid = $scope.data.gid;
                        $ionicLoading.hide();
                        $state.go('gesture');
                        break;

                    case "301":
                        $ionicLoading.hide();
                        var alertPopup = $ionicPopup.alert({
                            title: 'Login failed!',
                            template: 'This device has been locked.'
                        });
                        break;

                    case "302":
                        $ionicLoading.hide();
                        var alertPopup = $ionicPopup.alert({
                            title: 'Login failed!',
                            template: 'This device is not approved.'
                        });
                        break;

                    case "303":
                        $ionicLoading.hide();
                        var alertPopup = $ionicPopup.alert({
                            title: 'Login failed!',
                            template: 'You have tried too many times. This device has been locked. '
                        });
                        break;

                    case "501":
                        $ionicLoading.hide();
                        var alertPopup = $ionicPopup.alert({
                            title: 'Login failed!',
                            template: 'The Current user was locked already. '
                        });
                        break;

                    case "502":
                        $ionicLoading.hide();
                        var alertPopup = $ionicPopup.alert({
                            title: 'Login failed!',
                            template: 'LockFlg is not available. '
                        });
                        break;
                }

            }, function(e) {
                $ionicLoading.hide();
                var alertPopup = $ionicPopup.alert({
                    title: 'Login failed!',
                    template: 'Please check your network!'
                });
            });
        }

        $scope.$on('$ionicView.afterEnter', function() {
            //清空文本框
            $('#gid').val('');
            $('#password').val('');
            $scope.data = {};
            $('#gid').focus();
            $ionicScrollDelegate.scrollBottom();
        });

        IMEI.then(function(data) {
            $rootScope.imei = data;
        });
        $scope.hidden_plus = function() {
            $("#plus").css('display', 'none');
            $("#alhpa").css('top', '3rem');
        }
        $scope.block_plus = function() {
            $("#plus").css('display', 'block');
            $("#alhpa").css('top', '7rem');
        }
        $scope.login = function() {

            if ($('#gid').val() == null || $('#gid').val() == '') {
                var alertPopup = $ionicPopup.alert({
                    title: 'Sorry!',
                    template: 'Please check your GID!'
                });
                return;
            }
            if ($('#password').val() == null || $('#password').val() == '') {
                var alertPopup = $ionicPopup.alert({
                    title: 'Sorry!',
                    template: 'Please check your PASSWORD!'
                });
                return;
            }
            if (window.plugins) {

                $ionicLoading.show({
                    template: "<ion-spinner icon='circles'></ion-spinner>"
                });
                window.plugins.myEcho('https://touchdoneqas.sony.com.cn/Search', $scope.data.gid, $scope.data.password,
                    function(data) {
                        //SSSOTICKETID
                        if (data.indexOf('SSSOTICKETID') > -1) {
                            $rootScope.token = data;
                            sendlogin(data);
                        } else {
                            $ionicLoading.hide();
                            var alertPopup = $ionicPopup.alert({
                                title: 'Login failed!',
                                template: 'Please check your credentials!'
                            });
                        }
                    },
                    function(error) {
                        $ionicLoading.hide();
                        var alertPopup = $ionicPopup.alert({
                            title: 'Login failed!',
                            template: 'Please check your network!'
                        });
                    });

            } else {

                //205账号
                // $rootScope.imei = '351832061743234';
                $rootScope.imei = '358094051215649';
                $rootScope.token = 'token:0151556456454564564';
                sendlogin($rootScope.token);
            }
        }
    })

    .controller('DetailController', function($rootScope, $scope, $ionicScrollDelegate, $timeout,
        $ionicActionSheet, $state, $stateParams, $ionicHistory, ToApproveService, $window) {
        var totalName;
        $scope.monitor = {isDetailLoaded: false};
        var chkLoading = function checkDetailLoading() {
            //显示详细信息
            if ($scope.monitor.isDetailLoaded == false) {
                $scope.item = ToApproveService.getDetailById(totalName);
                //隐藏动画
                if ($scope.item) {
                    $scope.monitor.isDetailLoaded = true;
                    clearInterval($scope.monitorInterval);

                    $scope.$apply(function() {
                        $("#centent").css('display', 'block');
                        $("#top").css('display', 'none');
                        $("#detailscroll").removeClass("detailscrolls");
                    });
                }   
            }
        }
        $scope.$on('$ionicView.beforeEnter', function(event) {
            //从home或searchList进来显示动画
            if ($window.location.href.indexOf('comment') == -1
                && $window.location.href.indexOf('fileviewer') == -1) {
                $("#centent").css('display', 'none');
                $("#top").css('display', 'block');
                $("#detailscroll").addClass("detailscrolls");
                $ionicScrollDelegate.scrollTop();
            }
            if (event.targetScope !== $scope) {
                return;
            }
            $scope.monitor.isDetailLoaded = false;
            //获取comment信息
            var comment = ToApproveService.getComment();
            $scope.comment = comment;
            //获取typeid
            var wfTypeId = ToApproveService.getRetrieveList().wfTypeId;
            $scope.wfTypeId = wfTypeId;
            //获取ID
            totalName = ToApproveService.getRetrieveList().totalName;

            ToApproveService.setDetail(totalName, $rootScope.gid, $rootScope.token);
            
            //显示头部信息
            var tmpDetail = ToApproveService.getDetailHeader(totalName);
            $scope.tmpDetail = tmpDetail;

            $scope.monitorInterval = setInterval(chkLoading, 2000);
            $scope.comment.isValid = true;
        });
        
        //回退事件
        $scope.goBack = function() {
            $ionicHistory.goBack();
        }
        //拒绝操作
        $scope.reject = function() {
            //判断comment内容
            if ($scope.comment.content == "") {
                $scope.comment.isValid = false;
                //画面滚动到底部
                $ionicScrollDelegate.scrollBottom();
                return true;
            }
            $scope.comment.isValid = true;

            $ionicActionSheet.show({
                //显示提示框内容和按钮
                titleText: 'Are you sure to REJECT?',
                buttons: [
                    { text: 'NO' },
                    { text: 'YES' }
                ],
                cssClass: "actionsheet-approvement",
                buttonClicked: function(index) {
                    if (index === 0) {
                        //点击OK
                    } else if (index === 1) {
                        ToApproveService.pApprove($scope.comment.content, 3, totalName, $rootScope.gid, $rootScope.token).then(
                            function(data) {
                                if (data.responseCode == "407") {
                                    var hideSheet = $ionicActionSheet.show({
                                        //提示该信息已被别人拒绝
                                        titleText: 'Sorry! The data has been Reject by other users',
                                        cssClass: "actionsheet-success"
                                    });
                                    var promize = $timeout(function() {
                                        hideSheet();
                                        $ionicHistory.goBack();
                                    }, 2000);
                                } else {
                                    var hideSheet = $ionicActionSheet.show({
                                        //显示拒绝成功信息
                                        titleText: 'REJECT successfully.',
                                        cssClass: "actionsheet-success",
                                        cancel: function() {
                                            $timeout.cancel(promize);
                                            $ionicHistory.goBack();
                                        }
                                    });
                                    var promize = $timeout(function() {
                                        hideSheet();
                                    }, 2000);
                                }
                                //本地干掉该条数据
                                ToApproveService.approve(totalName);
                            },
                            function(e) {
                            });

                    }
                    return true;
                }
            });
        };
        //承认操作
        $scope.accept = function() {
            $scope.comment.isValid = true;
            var hideSheet = $ionicActionSheet.show({
                //显示提示框内容和按钮
                titleText: 'Are you sure to APPROVE?',
                buttons: [
                    { text: 'NO' },
                    { text: 'YES' }
                ],
                cssClass: "actionsheet-approvement",
                buttonClicked: function(index) {
                    if (index === 0) {
                        //点击OK
                    } else if (index === 1) {
                        ToApproveService.pApprove($scope.comment.content, 1, totalName, $rootScope.gid, $rootScope.token).then(
                            function(data) {
                                if (data.responseCode == "407") {
                                    var hideSheet = $ionicActionSheet.show({
                                        //提示该信息已被别人承认
                                        titleText: 'Sorry! The data has been Approve by other users',
                                        cssClass: "actionsheet-success"
                                    });
                                    var promize = $timeout(function() {
                                        hideSheet();
                                        $ionicHistory.goBack();
                                    }, 2000);
                                } else {
                                    var hideSheet = $ionicActionSheet.show({
                                        //显示承认成功信息
                                        titleText: 'Approve successfully.',
                                        cssClass: "actionsheet-success",
                                        cancel: function() {
                                            $timeout.cancel(promize);
                                            $ionicHistory.goBack();
                                        }
                                    });
                                    var promize = $timeout(function() {
                                        hideSheet();
                                    }, 2000);
                                }
                                //本地干掉该条数据
                                ToApproveService.approve(totalName);
                            },
                            function(e) {
                            });

                    }
                    return true;
                }
            });
        };
        //判断附件类型并打开
        $scope.openDocument = function(doc) {
            if (doc.fileType == 'pdf' || doc.fileType == 'txt' || doc.fileType == 'pic') {
                $state.go('fileviewer', { 'activeDocument': doc });
            } else {
                var hideSheet = $ionicActionSheet.show({
                    //附件打不开的提示信息
                    titleText: 'Sorry! This kind of attachment is not supported yet.',
                    cssClass: "actionsheet-success"
                });
                var promize = $timeout(function() {
                    hideSheet();
                }, 2000);
            }
        };
        //跳转到comment
        $scope.editComment = function() {
            $state.go('comment');
        }
    })

    .controller('FileController', function($rootScope, $scope, $stateParams, $ionicModal, $ionicScrollDelegate, ngProgressFactory, ToApproveService, baseUrl) {
        $scope.zoomMin = 1;
        $scope.progressbar = ngProgressFactory.createInstance();
        $scope.progressbar.setColor("#439edf");
        $scope.progressbar.setHeight("5px");

        $scope.onLoad = function(event) {
            $scope.progressbar.complete();
            if ($scope.isPDF) {
                $scope.isLoaded = true;
            }
        };

        $scope.$on('$ionicView.beforeEnter', function(event) {
            if (event.targetScope !== $scope) {
                return;
            }
            $scope.progressbar.reset();
            $scope.isPDF = false;
            $scope.isIMG = false;
            $scope.isTXT = false;
            $scope.isLoaded = false;
            $scope.fileType = $stateParams.activeDocument.fileType;
            $scope.fileUrl = $stateParams.activeDocument.fileUrl;
            $scope.fileName = $stateParams.activeDocument.fileName;
            $scope.fileSize = $stateParams.activeDocument.fileSize;
            $scope.src = baseUrl + $scope.fileUrl;

            if ($scope.fileType == "pdf") {
                $scope.pdfUrl = $scope.src;
                $scope.isPDF = true;
                $scope.progressbar.start();
            }
            else if ($scope.fileType == "txt") {
                $scope.progressbar.start();
                ToApproveService.pGetAttachment($scope.fileUrl, $rootScope.gid, $rootScope.token)
                    .then(function(data) {
                        $scope.txtData = data;
                        $scope.progressbar.complete();
                    }, function(e) {
                        $scope.progressbar.reset();
                        console.log(e);
                    });
                $scope.isTXT = true;
            }
            else if ($scope.fileType == "pic") {
                $scope.isIMG = true;
                $scope.progressbar.start();
            }
            $ionicScrollDelegate.resize();
            $scope.scroll = 0;
        });

        $scope.$on('$ionicView.beforeLeave', function() {
            $scope.progressbar.reset();
        });

        $scope.onError = function(error) {
            $scope.progressbar.reset();
            console.log(error);
        };
    })

    .controller('CommentController', function($scope, $state, $ionicHistory, ToApproveService, $rootScope) {
        $scope.$on('$ionicView.beforeEnter', function(event) {
            if (event.targetScope !== $scope) {
                return;
            }
            $scope.comment = ToApproveService.getComment();
            $scope.comment.draft = $scope.comment.content;
        });
        $scope.doOnKeydown = function(event) {
            if (event.keyCode == 13) {
                $scope.comment.content = $scope.comment.draft;
                $scope.comment.draft = "";
                if ($scope.comment.content != '' && !$scope.comment.isValid) {
                    $scope.comment.isValid = true;
                }
                ToApproveService.setComment($scope.comment);
                $ionicHistory.goBack();
            }
        }
    })

    //  手势解锁控制

    .controller('LockController',
    function($rootScope, $scope, ToApproveService, $ionicPopup, $state, $timeout, $ionicActionSheet, $http, $window, $ionicHistory, $location) {

        var gestureNum = '0';
        //  数据双向绑定
        var gesture = ToApproveService.getGesture();
        $scope.gesture = gesture;
        $scope.$on('$ionicView.beforeEnter', function(event) {
            if (event.targetScope !== $scope) {
                return;
            }
            console.log($rootScope.gid + $rootScope.imei);

            $scope.log_pattern = ToApproveService.getLoginPattern();

            if ($scope.log_pattern != null) {
                $scope.hidden = 'lookout';
                document.getElementById('res').style.display = "block";
                document.getElementById('res').style.color = '#FFFFFF';
                gesture.css = 'gestureinit';
                gesture.title = "";
                gesture.titlebar = "";

            } else {
                $scope.hidden = 'hidden';
                document.getElementById('res').style.display = 'none';
                gesture.css = 'write';
                gesture.title = "Please create a new gesture.";
                gesture.titlebar = "Set Unlock Gesture";
            }

        });

        //重置密码
        $scope.data = {};
        $scope.Reset = function() {
            window.localStorage.clear("login_pattern");
            $rootScope.gid = '';
            $rootScope.token = '';
            gesture.css = 'write';
            gesture.title = "Please create a new gesture."
            pattern = 0;
            count = 0;
            ConfirmPassword = 0;
            $state.go('login');
        }

        $scope.log_pattern = ToApproveService.getLoginPattern();
        var ConfirmPassword;
        var count = 0;

        var lock = new PatternLock("#lockPattern", {
            // 3
            onDraw: function(pattern) {
                // 4

                if ($scope.log_pattern) {

                    if (gestureNum == '0') {
                        // 5
                        ToApproveService.checkLoginPattern(pattern).success(function(data) {
                            lock.reset();
                            ToApproveService.pGesture($rootScope.gid, $rootScope.imei, 'SLIDE_STATE_OK').then(function(data) {

                                if (data.result == '0') {

                                    var path = $rootScope.path;
                                    if (path == null || path == '' || (path.indexOf('/app/home') >= 0)) {
                                        $state.go('app.home');
                                    } else {
                                        $rootScope.path = '';
                                        $ionicHistory.goBack();
                                    }
                                }

                            }, function() {

                                var alertPopup = $ionicPopup.alert({
                                    title: 'Sorry!',
                                    template: 'Please check your network!'
                                });
                            });

                        }).error(function(data) {
                            gesture.css = 'red';
                            gesture.title = "Sorry,wrong gesture."
                            ToApproveService.pGesture($rootScope.gid, $rootScope.imei, 'SLIDE_STATE_ERROR').then(function(data) {

                                console.log('lock=' + data.result);
                                if (data.result == '0') {
                                    gestureNum = '0';
                                    $timeout(function() {
                                        gesture.css = 'write';
                                        gesture.title = "Please slide the correct gesture."

                                    }, 1000);

                                } else {
                                    gestureNum = '1';///000
                                    document.getElementById('res').style.visibility = 'hidden';
                                    gesture.css = 'red';
                                    gesture.title = "Exceeded the upper limit ."

                                }

                            }, function() {

                                gestureNum = '0';  ////0000
                                var alertPopup = $ionicPopup.alert({
                                    title: 'Sorry!',
                                    template: 'Please check your network!'
                                });

                            });
                            lock.error();
                            lock.reset();
                        });
                    } else {
                        lock.reset();
                    }
                } else {
                    // 6
                    if (pattern.length < 6) {

                        gesture.css = 'red';
                        gesture.title = "Connect at least six dots."
                        $timeout(function() {
                            gesture.css = 'write';
                            gesture.title = "Please create a new gesture."

                        }, 1000);
                        pattern = 0;
                        count = 0;
                        ConfirmPassword = 0;
                    } else {
                        if (count == 0) {
                            ConfirmPassword = pattern;
                            gesture.css = 'write';
                            gesture.title = "Please draw gesture again."
                            count++;
                        } else {
                            if (pattern == ConfirmPassword) {
                                ToApproveService.setLoginPattern(pattern);
                                var hideSheet = $ionicActionSheet.show({
                                    titleText: 'Set gesture successfully.',
                                    cssClass: "actionsheet-gesture",
                                });
                                $timeout(function() {
                                    $state.go('app.home');
                                }, 2000)

                            } else {
                                gesture.css = 'red';
                                gesture.title = "Different from last drawing."

                                var hideSheet = $ionicActionSheet.show({
                                    titleText: 'Failed to set gesture.',
                                    cssClass: "actionsheet-gesture",
                                });
                                $timeout(function() {
                                    gesture.css = 'write';
                                    gesture.title = "Please create a new gesture."
                                }, 1000);
                                count = 0;
                                ConfirmPassword = 0;
                                pattern = 0;
                            }
                        }
                    }
                    lock.reset();
                    $scope.$apply(function() {
                        $scope.log_pattern = ToApproveService.getLoginPattern();
                    });

                }

            }
        });
    })



