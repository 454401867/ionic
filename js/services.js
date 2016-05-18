"use strict";

angular.module('wisdom.services', [])

    .constant('baseUrl', "https://touchdone.sony.com.cn")//http://43.82.201.60:9011

    .factory('IMEI', function($q, $log) {
        var d = $q.defer();
        if (window.plugins && window.plugins.imeiplugin) {
            window.plugins.imeiplugin.getImei(function(imei) {
                d.resolve(imei);
                $log.info("device IMEI:" + imei);
            });
        }
        return d.promise;
    })

    .factory('authInterceptor', function($log) {
        var interceptor = {
            'request': function(request) {
                return request;
            },
            'response': function(response) {
                $log.info("handle response in authInterceptor.");
                // TODO cas session timeout page.
                console.log(response.data);
                return response;
            },
            'responseError': function(rejection) {
                return rejection;
            }
        };
        return interceptor;
    })

    .config(function($httpProvider) {
        $httpProvider.interceptors.push("authInterceptor");
    })

    .factory('ToApproveService', function($q, $log, $http, baseUrl) {

        var toApproveList = [];
        
        var toSearchList = [];

        var toSystemList = [];
        var activeItem = {
            systemId: '',
            itemId: ''
        };
        var gesture = {
            css: '',
            title: '',
            titlebar:''
        };
        var search = {};
        var detail = {};
        var typeId = {};
        var mergeId = {};
        var comment = {
            draft: '',
            content: '',
            isValid: true
        };
        var getTypeList = function() {
            var d = $q.defer();
            d.resolve(typeList);
            return d.promise;
        }

        var getRetrieveList = function() {
            return toApproveList;
        }
        
         var getSearchList = function() {
            return toSearchList;
        }
        var setActiveItem = function(id) {
            activeItem = FindById(id);
        }

        var getSystemList = function() {
            return toSystemList;
        }

        var getGesture = function() {
            return gesture;
        };
        var getActiveItem = function() {
            return activeItem;
        };
        var getSearch = function() {
            return search;
        };
        var getComment = function() {
            return comment;
        }
        var getDetail = function() {
            return detail;
        }
        var setDetail = function(id, gid, token) {
            detail = pFindById(id, gid, token);
        }

        var setTypeId = function(_typeId) {
            typeId = _typeId;
        }
        var getTypeId = function() {
            return typeId;
        }
        var getMergeId = function() {
            return mergeId;
        }
        var setMergeId = function(_mergeId) {
            mergeId = _mergeId;
        }
        var clearGesture = function() {
            gesture.num1 = "";
            gesture.num2 = "";
            gesture.num3 = "";
            gesture.num4 = "";
        };
        var pRetrieveList = function() {
            var d = $q.defer();
            // TODO dummy code.
            d.resolve(toApproveList);
            return d.promise;
        };
        
        //search操作
        var pSearch = function(search, wf_TypeId, gid, token) {
            var d = $q.defer();
            $http({
                'url': baseUrl + '/DoSearch?systemId=' + toSystemList.systemList[0].systemId + '&search=' + search + '&wfTypeId=' + wf_TypeId,
                'method': 'get',
                'headers': {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'SSO-AUTH-ID': gid,
                    'Cookie': token
                }
            }).success(function(data) {
                toSearchList = data;
                d.resolve(data);
            }).error(function(e) {
                d.reject(e);
            })
            return d.promise;
        }

        //页面初试化
        var pGetListHead = function(gid, token) {
            var d = $q.defer();
            $http({
                'url': baseUrl + '/GetListHead?systemId=' + toSystemList.systemList[0].systemId,
                'method': 'get',
                'headers': {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'SSO-AUTH-ID': gid,
                    'Cookie': token
                }
            }).success(function(data) {
                toApproveList = data;
                d.resolve(data);
            }).error(function(e) {
                console.info("e" + e);
                d.reject(e);
            })
            return d.promise;
        }
        
        //页面初试化
        var pGetList = function(gid, token) {
            var d = $q.defer();
            $http({
                'url': baseUrl + '/List?systemId=' + toSystemList.systemList[0].systemId,
                'method': 'get',
                'headers': {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'SSO-AUTH-ID': gid,
                    'Cookie': token
                }
            }).success(function(data) {
                toApproveList = data;
                d.resolve(data);
            }).error(function(e) {
                d.reject(e);
            })
            return d.promise;
        }
        
        //获取系统Systemid
        var pGetSystem = function(gid, token) {
            var d = $q.defer();
            $http({
                'url': baseUrl + '/Home',
                'method': 'get',
                'headers': {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'SSO-AUTH-ID': gid,
                    'Cookie': token
                }
            }).success(function(data) {
                toSystemList = data;
                d.resolve(data);
            }).error(function(e) {
                d.reject(e);
            })
            return d.promise;
        }
        
        //Home刷新
        var pGetHome = function(gid, token) {
            var d = $q.defer();
            $http({
                'url': baseUrl + '/Home',
                'method': 'get',
                'headers': {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'SSO-AUTH-ID': gid,
                    'Cookie': token
                }
            }).success(function(data) {
                toSystemList = data;
                d.resolve(data);
            }).error(function(e) {
                d.reject(e);
            })
            return d.promise;
        }

        //下拉刷新
        var pManualUpdateList = function(wfTypeId, gid, token) {
            var d = $q.defer();
            $http({
                'url': baseUrl + '/ManualUpdateList?systemId=' + toSystemList.systemList[0].systemId + '&wfTypeId=' + wfTypeId,
                'method': 'get',
                'headers': {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'SSO-AUTH-ID': gid,
                    'Cookie': token
                }
            }).success(function(data) {
                toApproveList.detailList = data;
                d.resolve(data);
            }).error(function(e) {
                d.reject(e);
            })
            return d.promise;
        }
        //类型总数
        var pGetCount = function(wfTypeId, gid, token) {
            var d = $q.defer();
            $http({
                'url': baseUrl + '/ListCount?systemId=' + toSystemList.systemList[0].systemId + '&wfTypeId=' + wfTypeId,
                'method': 'get',
                'headers': {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'SSO-AUTH-ID': gid,
                    'Cookie': token
                }
            }).success(function(data) {
                d.resolve(data);
            }).error(function(e) {
                d.reject(e);
            })
            return d.promise;
        }
        
        //获取typelist
        var pGetTyleList = function(wfTypeId, gid, token) {
            console.log("typeid:" + wfTypeId);
            var d = $q.defer();
            $http({
                'url': baseUrl + '/Typelist?systemId=' + toSystemList.systemList[0].systemId + '&wfTypeId=' + wfTypeId,
                'method': 'get',
                'headers': {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'SSO-AUTH-ID': gid,
                    'Cookie': token
                }
            }).success(function(data) {
                if (data.detailList.length > 0) {
                    toApproveList.detailList = data.detailList;
                    toApproveList.typeList = data.typeList;
                }
                d.resolve(data.detailList);
            }).error(function(e) {
                console.info("e" + e);
                d.reject(e);
            })
            return d.promise;
        }
        
        //上拉加载更多
        var pGetNextList = function(wfTypeId, pageNum, gid, token) {
            console.log('service pageNum' + pageNum);
            var d = $q.defer();
            $http({
                'url': baseUrl + '/GetNextList?systemId=' + toSystemList.systemList[0].systemId + '&wfTypeId=' + wfTypeId + '&pageNum=' + pageNum,
                'method': 'get',
                'headers': {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'SSO-AUTH-ID': gid,
                    'Cookie': token
                }
            }).success(function(data) {
                if (data.listItem) {
                    toApproveList.detailList = toApproveList.detailList.concat(data.listItem);
                }
                d.resolve(data);
            }).error(function(e) {
                d.reject(e);
            })
            return d.promise;
        }
        
        //根据typeid查找count
        var getCountByTypeId = function(wfTypeId){
            for(var i in toApproveList.buttons){
                if(toApproveList.buttons[i].wfTypeId==wfTypeId){
                    return toApproveList.buttons[i].count;
                }
            }
        }
        
        //根据typeid绑定detailList
        var getTypeDetailList = function(wfTypeId){
            var typeList = [];
            for(var i in toApproveList.detailList){
                if(toApproveList.detailList[i].wfTypeId == wfTypeId){
                    typeList.push(toApproveList.detailList[i]);
                }
            }
            return typeList;
        }
        
        //登录请求1-2:post
        var pLogin = function(gid, imei, token) {
            var d = $q.defer();
            $http({
                'url': baseUrl + '/AppGesture?imei=' + imei + '&sendtype=2',
                'method': 'get',
                'headers': {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'SSO-AUTH-ID': gid,
                    'Cookie': token
                }
            }).success(function(data) {

                d.resolve(data);

            }).error(function(e) {
                d.reject(e);
            })

            return d.promise;
        }

        //解锁页面
        var pGesture = function(gid, imei, status) {
            var d = $q.defer();
            $http({
                'url': baseUrl + '/AppGesture?imei=' + imei + '&status=' + status + '&sendtype=3',
                'method': 'get',
                'headers': {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'SSO-AUTH-ID': gid
                }
            }).success(function(data) {
                d.resolve(data);

            }).error(function(e) {
                d.reject(e);
            })
            return d.promise;
        }

        var getLoginPattern = function() {
            return window.localStorage.getItem("login_pattern");
        }

        var setLoginPattern = function(pattern) {
            window.localStorage.setItem("login_pattern", pattern);
        }
        var checkLoginPattern = function(pattern) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            promise.success = function(fn) {
                promise.then(fn);
                return promise;
            }
            promise.error = function(fn) {
                promise.then(null, fn);
                return promise;
            }

            if (pattern == getLoginPattern()) {
                deferred.resolve();
            } else {
                deferred.reject();
            }
            return promise;
        }

        // retrieve to-approve list from server and produces a promise.
        var pRetrieveList = function() {
            var d = $q.defer();
            // TODO dummy code.
            d.resolve(toApproveList);
            return d.promise;
        };

        var getList = function() {
            return toApproveList;
        }

        var pQuery = function(qStr) { };

        //通过ID查询detail信息
        var pFindById = function(id, gid, token) {
            var d = $q.defer();
            $http({
                'url': baseUrl + '/DetailTemplate?systemId=' + toSystemList.systemList[0].systemId + '&totalName=' + id,
                'method': 'get',
                'headers': {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'SSO-AUTH-ID': gid,
                    'Cookie': token
                }
            }).success(function(data) {
                for (var index in toApproveList.detailList) {
                    if (toApproveList.detailList[index].totalName == id) {
                        toApproveList.detailList[index].detail = data;
                        break;
                    }
                }
                //从searchList进入detail
                for (var index in toSearchList.detailList) {
                    if (toSearchList.detailList[index].totalName == id) {
                        toSearchList.detailList[index].detail = data;
                        break;
                    }
                }
                d.resolve(toApproveList);

            }).error(function(e) {
                d.reject(e);
            })
            return d.promise;
        }

        var FindById = function(id) {
            for (var index in toApproveList) {
                if (toApproveList[index].id == id) {
                    return toApproveList[index];
                }
            }
            return null;
        };
        //detail获取头部信息
        var getDetailHeader = function(_id) {
            for (var index in toApproveList.detailList) {
                if (toApproveList.detailList[index].totalName == _id) {
                    toApproveList.tmpDetail = toApproveList.detailList[index];
                    return toApproveList.tmpDetail;
                }
            }
            for (var index in toSearchList.detailList) {
                if (toSearchList.detailList[index].totalName == _id) {
                    toSearchList.tmpDetail = toSearchList.detailList[index];
                    return toSearchList.tmpDetail;
                }
            }
        }
        //detail获取详信息
        var getDetailById = function(_id) {
            for (var index in toApproveList.detailList) {
                if (toApproveList.detailList[index].totalName == _id) {
                    return toApproveList.detailList[index].detail;
                }
            }
            for (var index in toSearchList.detailList) {
                if (toSearchList.detailList[index].totalName == _id) {
                    return toSearchList.detailList[index].detail;
                }
            }
        }

        var setComment = function(_comment) {
            comment = _comment;
        };
        
        //附件的打开
        var pGetAttachment = function(fileUrl, gid, token) {
            var d = $q.defer();
            $http({
                'url': baseUrl + fileUrl,
                'method': 'get',
                'headers': {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'SSO-AUTH-ID': gid,
                    'Cookie': token
                }
            }).success(function(data) {
                d.resolve(data);

            }).error(function(e) {
                d.reject(e);
            })
            return d.promise;
        }	
		
		
        //detail承认拒绝
        var pApprove = function(_comment, commitStatus, _id, gid, token) {
            var d = $q.defer();
            $http({
                'url': baseUrl + '/Approve?systemId='+ toSystemList.systemList[0].systemId + '&totalName=' + _id + '&comment=' + _comment + '&commitStatus=' + commitStatus,
                'method': 'get',
                  'headers': {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'SSO-AUTH-ID': gid,
                    'Cookie':token
                }
            }).success(function(data) {
                  d.resolve(data);
            }).error(function() {
                d.reject();
            })
            return d.promise;
        }
        
        //detail承认拒绝删除本地数据
        var approve = function(_id) {
            console.log(toApproveList.types);
            //从home集合中删除
            for (var index in toApproveList.detailList) {
                if (toApproveList.detailList[index].totalName == _id) {
                    toApproveList.detailList.splice(index, 1);
                    for (var typeIndex in toApproveList.buttons) {
                        if (toApproveList.tmpDetail.wfTypeId == toApproveList.buttons[typeIndex].wfTypeId) {
                            toApproveList.buttons[typeIndex].count--;
                        }
                        if (toApproveList.buttons[typeIndex].wfTypeId == '') {
                            toApproveList.buttons[typeIndex].count--;
                        }
                    }
                    break;
                }
            }
            //从searchList集合中删除
            if (toSearchList.detailList) {
                for (var index in toSearchList.detailList) {
                    if (toSearchList.detailList[index].totalName == _id) {
                        toSearchList.detailList.splice(index, 1);
                        break;
                    }
                }
            }
            console.log(toApproveList.types);
        };
        var reject = function(_id) {
        };
        
        return {
            getCountByTypeId:getCountByTypeId,
            getTypeDetailList:getTypeDetailList,
            pGetSystem: pGetSystem,
            getSearchList:getSearchList,
            pGetListHead:pGetListHead,
            pGetNextList:pGetNextList,
            getTypeList: getTypeList,
            getSystemList: getSystemList,
            getMergeId: getMergeId,
            setMergeId: setMergeId,
            getDetailHeader: getDetailHeader,
            getDetailById: getDetailById,
            setTypeId: setTypeId,
            getDetail: getDetail,
            setDetail: setDetail,
            getTypeId: getTypeId,
            pGetCount: pGetCount,
            pGetHome: pGetHome,
            pManualUpdateList: pManualUpdateList,
            getLoginPattern:getLoginPattern,
            setLoginPattern:setLoginPattern,
            checkLoginPattern:checkLoginPattern,
            pGesture: pGesture,
            pLogin: pLogin,
            pGetTyleList: pGetTyleList,
            getRetrieveList: getRetrieveList,
            getSearch: getSearch,
            pSearch: pSearch,
            pGetList: pGetList,
            clearGesture: clearGesture,
            pRetrieveList: pRetrieveList,
            getList: getList,
            setActiveItem: setActiveItem,
            getActiveItem: getActiveItem,
            pQuery: pQuery,
            pFindById: pRetrieveList,
            FindById: FindById,
            getComment: getComment,
            setComment: setComment,
            pGetAttachment: pGetAttachment,
            pApprove: pApprove,
            approve: approve,
            reject: reject,
            pReject: pApprove,
            getGesture: getGesture

        };
    })

    .factory('GestureService', function() {
        return {
            pSetGesture: function(password) { },
            pVerifyGesture: function(password) { },
            pClearGesture: function() { }
        }
    })

    .factory('LoginService', function() {
        return {
            pLogin: function(gid, password) { },
            logout: function() { },
            pGetMyInfo: function() { },
            getStoragedGID: function() { }
        }
    })
    .factory('AuthService', function() {
        return {
            hasLoggedIn: function() {
                return true;
            }
        }

    })//本地存储数据===================================
    .factory('LocalsService', ['$window', function($window) {
        return {
            //存储单个属性
            set: function(key, value) {
                $window.localStorage[key] = value;
            },
            //读取单个属性
            get: function(key, defaultValue) {
                return $window.localStorage[key] || defaultValue;
            },
            //存储对象，以JSON格式存储
            setObject: function(key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            //读取对象
            getObject: function(key) {
                return JSON.parse($window.localStorage[key] || '{}');
            }
        }
    }]);
