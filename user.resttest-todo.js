var _expect = require("chai").expect;
var _assert = require("chai").assert;
var _should = require("chai").should();
var _http = require("http");
var _cheerio = require("cheerio");
var _moment = require("moment");

global.ROOT_DIR = __dirname + "/..";

var JsExt = require(ROOT_DIR + "/brain/jsext");
var Log = require(ROOT_DIR + "/brain/log");
var WebMailer = require(ROOT_DIR + "/brain/webmailer");
var Memory = require(ROOT_DIR + "/brain/memory");
var TestRouteApi = require(ROOT_DIR + "/brain/testrouteapi");
var User = require(ROOT_DIR + "/models/user");

WebMailer.FAKE = true;
WebMailer.VERBOSE = false;
User.VERBOSE = false;

/////////////
// TESTCLASS : TestUserApi
///////

TestUserApi.extends( TestRouteApi );
function TestUserApi (options) {
    TestRouteApi.call(this, options);
}

TestUserApi.prototype.register = function (data, callback, forcemethod) {
    var self = this;
    self.request({path : "/u/register", method : forcemethod || "POST", data : data}, callback);
}

TestUserApi.prototype.unregister = function (email, password, callback, forcemethod) {
    var self = this;
    self.request({path : "/u/unregister", method : forcemethod || "POST", data : {email : email, password : password}}, callback);
}

TestUserApi.prototype.confirm = function (token, callback) {
    var self = this;
    self.request({path : "/u/confirm/" + token || "", method : "GET"}, callback);
}

TestUserApi.prototype.login = function (email, password, callback, forcemethod) {
    var self = this;
    self.request({path : "/u/login/", method : forcemethod || "POST", data : {email:email, password:password}}, callback);
}

TestUserApi.prototype.logout = function (callback, forcemethod) {
    var self = this;
    self.request({path : "/u/logout", method : forcemethod || "POST"}, callback);
}

TestUserApi.prototype.askResetPassword = function (email, callback, forcemethod) {
    var self = this;
    self.request({path : "/u/askresetpassword", method : forcemethod || "POST", data : {email : email}}, callback);
}

TestUserApi.prototype.resetPassword = function (userid, token, newpassword, callback, forcemethod) {
    var self = this;
    self.request(
        {
            path : "/u/resetpassword", 
            method : forcemethod || "POST", 
            data : {
                userid : userid, 
                token : token, 
                newpassword : newpassword
            }
        }, 
        callback
    );
}

TestUserApi.prototype.find = function (criteria, callback) {
    var self = this;
    self.request({path : "/u/find", method : "GET", data : criteria}, callback);
}

TestUserApi.prototype.addpassport = function (email, passport, callback) {
    var self = this;
    self.request({path : "/u/addpassport", method : "POST", data : {email:email, passport:passport}}, callback);
}

TestUserApi.prototype.removepassport = function (email, passport, callback) {
    var self = this;
    self.request({path : "/u/removepassport", method : "POST", data : {email:email, passport:passport}}, callback);
}

TestUserApi.prototype.update = function (user, callback) {
    var self = this;
    self.request({path : "/u/update", method : "POST", data : {user:user}}, callback);
}

describe("api.user", function() {
    var m, test;
    var email1 = "rodrigobuas+unittest@gmail.com";
    var email2 = "rodrigobuas+unittest2@gmail.com";
    var email3 = "rodrigobuas+unittest3@gmail.com";
    var email4 = "rodrigobuas+unittest4@gmail.com";
    var password = "123456";

    before(function(done) {
        test = new TestUserApi({ urlbase : "localhost", port:8080 });
        m = new Memory({onconnect:done});
    });

    after(function(done){
        m.disconnect(done);
    });

    describe("register", function() {
        afterEach(function(done) {
            User.Remove({email: email1}, function() {
                done();
            });
        });

        it("method-ko", function(done) {
            test.register({}, function(err, info, data) {
                _expect(err).to.not.be.null;
                _expect(err.code).to.be.equal(TestRouteApi.ERROR.TEST_SERVER);
                _expect(info).to.not.be.null;
                _expect(info.statusCode).to.be.equal(404);
                done();
            }, "GET");
        });

        it("method-ok", function(done) {
            test.register({}, function(err, info, data) {
                _expect(info).to.not.be.null;
                _expect(info.statusCode).to.be.equal(200);
                done();
            }, "POST");
        });

        it("missingpassword", function(done) {
            test.register(
                {
                    email : email1
                }, 
                function(err, info, data) {
                    _expect(info).to.not.be.null;
                    _expect(info.statusCode).to.be.equal(200);
                    _expect(data).to.not.be.null;
                    _expect(data.error).to.not.be.null;
                    _expect(data.error.code).to.be.equal(User.ERROR.USER_PARAMS);
                    done();
                }
            );
        });

        it("missingemail", function(done) {
            test.register(
                {
                    password : password
                }, 
                function(err, info, data) {
                    _expect(info).to.not.be.null;
                    _expect(info.statusCode).to.be.equal(200);
                    _expect(data).to.not.be.null;
                    _expect(data.error).to.not.be.null;
                    _expect(data.error.code).to.be.equal(User.ERROR.USER_PARAMS);
                    done();
                }
            );
        });

        it("success", function(done) {
            test.register(
                {
                    email : email1,
                    password : password
                }, 
                function(err, info, data) {
                    _expect(info).to.not.be.null;
                    _expect(info.statusCode).to.be.equal(200);
                    _expect(data).to.not.be.null;
                    _expect(data.success).to.be.equal(User.MESSAGE.USER_SUCCESS);
                    _expect(data.user).to.not.be.null;
                    _expect(data.user.email).to.be.equal(email1);
                    _expect(data.user.password).to.not.be.ok;
                    done();
                }
            );
        });

        it("full", function(done) {
            var label = "testlabel";
            var name = "testname";
            var gender = User.GENDER.M;
            var lang = "PT";
            var birthday = "01/01/1982";
            var origin = "testorigin";
            var profile = User.PROFILE.CLIENT;
            test.register(
                {
                    email : email1,
                    password : password,
                    label : label,
                    name : name,
                    gender : gender,
                    lang : lang,
                    birthday : birthday,
                    origin : origin,
                    profile : profile
                }, 
                function(err, info, data) {
                    _expect(err).to.be.null;
                    _expect(info).to.not.be.null;
                    _expect(info.statusCode).to.be.equal(200);
                    _expect(data).to.not.be.null;
                    _expect(data.success).to.be.equal(User.MESSAGE.USER_SUCCESS);
                    _expect(data.user).to.not.be.null;
                    _expect(data.user.email).to.be.equal(email1);
                    _expect(data.user.label).to.be.equal(label);
                    _expect(data.user.name).to.be.equal(name);
                    _expect(data.user.status).to.be.equal(User.STATUS.CONFIRM);
                    _expect(data.user.logged).to.be.equal(false);
                    User.Get(email1, function(err2, user) {
                        _expect(err2).to.be.null;
                        _expect(user.label).to.be.equal(label);
                        _expect(user.gender).to.be.equal(gender);
                        _expect(user.lang).to.be.equal(lang);
                        _expect(user.birthday).to.not.be.null;
                        _expect(_moment(user.birthday).format("DD/MM/YYYY")).to.be.equal(birthday);
                        _expect(user.origin).to.be.equal(origin);
                        _expect(user.profile).to.be.equal(profile);
                        done();
                    });
                }
            );
        });

    });

    describe("uregister", function() {
        beforeEach(function(done) {
            User.Create({email: email1, password: password}, function() {
                done();
            });
        });

        afterEach(function(done) {
            User.Remove({email: email1}, function() {
                done();
            });
        });

        it("method-ko", function(done) {
            test.unregister(null, null, function(err, info, data) {
                _expect(err).to.not.be.null;
                _expect(err.code).to.be.equal(TestRouteApi.ERROR.TEST_SERVER);
                _expect(info).to.not.be.null;
                _expect(info.statusCode).to.be.equal(404);
                done();
            }, "GET");
        });

        it("method-ok", function(done) {
            test.unregister(null, null, function(err, info, data) {
                _expect(info).to.not.be.null;
                _expect(info.statusCode).to.be.equal(200);
                done();
            }, "POST");
        });

        it("missingparams", function(done) {
            test.unregister(null, null, function(err, info, data) {
                _expect(err).to.be.null;
                _expect(info).to.not.be.null;
                _expect(info.statusCode).to.be.equal(200);
                _expect(data).to.not.be.null;
                _expect(data.error).to.not.be.null;
                _expect(data.error.code).to.be.equal(User.ERROR.USER_PARAMS);
                done();
            });
        });

        it("unregistered", function(done) {
            test.unregister(email2, password, function(err, info, data) {
                _expect(err).to.be.null;
                _expect(info).to.not.be.null;
                _expect(info.statusCode).to.be.equal(200);
                _expect(data).to.not.be.null;
                _expect(data.error).to.not.be.null;
                _expect(data.error.code).to.be.equal(User.ERROR.USER_UNKNOW);
                done();
            });
        });

        it("wrongpassword", function(done) {
            test.unregister(email1, password + "kkk", function(err, info, data) {
                _expect(err).to.be.null;
                _expect(info).to.not.be.null;
                _expect(info.statusCode).to.be.equal(200);
                _expect(data).to.not.be.null;
                _expect(data.error).to.not.be.null;
                _expect(data.error.code).to.be.equal(User.ERROR.USER_WRONG_PASSWORD);
                done();
            });
        });

        it("success", function(done) {
            test.unregister(email1, password, function(err, info, data) {
                _expect(err).to.be.null;
                _expect(info).to.not.be.null;
                _expect(info.statusCode).to.be.equal(200);
                _expect(data).to.not.be.null;
                _expect(data.success).to.be.equal(User.MESSAGE.USER_SUCCESS);
                _expect(data.user).to.not.be.null;
                _expect(data.user.email).to.be.equal(email1);
                done();
            });
        });
    });

    describe("confirm", function() {
        var token;

        beforeEach(function(done) {
            User.Create({email: email1, password: password}, function(err, savedUser) {
                _expect(err).to.be.null;
                _expect(savedUser).to.not.be.null;
                _expect(savedUser.id).to.not.be.null;
                _expect(savedUser.status).to.be.equal(User.STATUS.CONFIRM);
                token = savedUser.id;
                done();
            });
        });

        afterEach(function(done) {
            User.Remove({email: email1}, function() {
                done();
            });
        });

        it("success", function(done) {
            test.confirm(token, function(err, info, data) {
                _expect(err).to.be.null;
                _expect(info).to.not.be.null;
                _expect(info.statusCode).to.be.equal(200);
                User.Get(email1, function (err, user) {
                    _expect(err).to.be.null;
                    _expect(user).to.not.be.null;
                    _expect(user.status).to.be.equal(User.STATUS.OFF);
                    _expect(user.id).to.be.equal(token);
                    done();
                });
            });
        });

        it("missingtoken", function(done) {
            test.confirm(null, function(err, info, data) {
                _expect(err).to.be.null;
                _expect(data).to.not.be.null;
                _expect(data.error).to.not.be.null;
                _expect(data.error.code).to.be.equal(User.ERROR.USER_TOKEN);
                _expect(info).to.not.be.null;
                _expect(info.statusCode).to.be.equal(200);
                User.Get(email1, function (err, user) {
                    _expect(err).to.be.null;
                    _expect(user).to.not.be.null;
                    _expect(user.status).to.be.equal(User.STATUS.CONFIRM);
                    _expect(user.id).to.be.equal(token);
                    done();
                });
            });
        });

        it("wrongtoken", function(done) {
            test.confirm("aaa", function(err, info, data) {
                _expect(err).to.be.null;
                _expect(data).to.not.be.null;
                _expect(data.error).to.not.be.null;
                _expect(data.error.code).to.be.equal(User.ERROR.USER_TOKEN);
                _expect(info).to.not.be.null;
                _expect(info.statusCode).to.be.equal(200);
                User.Get(email1, function (err, user) {
                    _expect(err).to.be.null;
                    _expect(user).to.not.be.null;
                    _expect(user.status).to.be.equal(User.STATUS.CONFIRM);
                    _expect(user.id).to.be.equal(token);
                    done();
                });
            });
        });

    });

    describe("login", function() {

        beforeEach(function(done) {
            User.Create({email: email1, password: password}, function(err, savedUser) {
                _expect(err).to.be.null;
                _expect(savedUser).to.not.be.null;
                _expect(savedUser.id).to.not.be.null;
                _expect(savedUser.status).to.be.equal(User.STATUS.CONFIRM);
                User.Create(
                    {email: email2, password: password, forcestatus:User.STATUS.OFF}, 
                    function(err, savedUser) {
                        _expect(err).to.be.null;
                        _expect(savedUser).to.not.be.null;
                        _expect(savedUser.id).to.not.be.null;
                        _expect(savedUser.status).to.be.equal(User.STATUS.OFF);
                        done();
                    }
                );
            });
        });

        afterEach(function(done) {
            User.Remove({email: email1}, function() {
                User.Remove({email: email2}, function() {
                    done();
                });
            });
        });

        it("success", function(done) {
            test.login(email2, password, function(err, info, data) {
                _expect(err).to.be.null;
                _expect(info).to.not.be.null;
                _expect(info.statusCode).to.be.equal(200);
                User.Get(email2, function (err, user) {
                    _expect(err).to.be.null;
                    _expect(user).to.not.be.null;
                    _expect(user.status).to.be.equal(User.STATUS.ON);
                    done();
                });
            });
        });

        it("confirm", function(done) {
            test.login(email1, password, function(err, info, data) {
                _expect(err).to.be.null;
                _expect(info).to.not.be.null;
                _expect(info.statusCode).to.be.equal(200);
                User.Get(email1, function (err, user) {
                    _expect(err).to.be.null;
                    _expect(user).to.not.be.null;
                    _expect(user.status).to.be.equal(User.STATUS.CONFIRM);
                    done();
                });
            });
        });

        it("wrongpassword", function(done) {
            test.login(email2, password + "aaa", function(err, info, data) {
                _expect(err).to.be.null;
                _expect(info).to.not.be.null;
                _expect(info.statusCode).to.be.equal(200);
                _expect(data).to.not.be.null;
                _expect(data.error).to.not.be.null;
                _expect(data.error.code).to.be.equal(User.ERROR.USER_WRONG_PASSWORD);
                done();
            });
        });

        it("unknow", function(done) {
            test.login(email3, password, function(err, info, data) {
                _expect(err).to.be.null;
                _expect(info).to.not.be.null;
                _expect(info.statusCode).to.be.equal(200);
                _expect(data).to.not.be.null;
                _expect(data.error).to.not.be.null;
                _expect(data.error.code).to.be.equal(User.ERROR.USER_NOTFOUND);
                done();
            });
        });
    });

    describe("logout", function() {

        beforeEach(function(done) {
            User.Create(
                {email: email2, password: password, forcestatus:User.STATUS.OFF}, 
                function(err, savedUser) {
                    _expect(err).to.be.null;
                    _expect(savedUser).to.not.be.null;
                    _expect(savedUser.id).to.not.be.null;
                    _expect(savedUser.status).to.be.equal(User.STATUS.OFF);
                    test.setKeepSession(true);
                    test.login(email2, password, function(err, info, data) {
                        _expect(err).to.be.null;
                        _expect(info).to.not.be.null;
                        _expect(info.statusCode).to.be.equal(200);
                        _expect(data).to.not.be.null;
                        done();
                    });
                }
            );
        });

        afterEach(function(done) {
            test.logout(function(err, info, data) {
                _expect(info).to.be.ok;
                _expect(info.statusCode).to.be.equal(200);
                _expect(data).to.be.ok;
                User.Remove({email: email2}, function() {
                    test.resetSession();
                    test.setKeepSession(false);
                    done();
                });
            });
        });

        it("success", function(done) {
            test.logout(function(err, info, data) {
                _expect(err).to.be.null;
                _expect(info).to.not.be.null;
                _expect(info.statusCode).to.be.equal(200);
                _expect(data.user).to.not.be.null;
                _expect(data.user.email).to.be.equal(email2);
                User.Get(email2, function (err, user) {
                    _expect(err).to.be.null;
                    _expect(user).to.not.be.null;
                    _expect(user.status).to.be.equal(User.STATUS.OFF);
                    done();
                });
            });
        });

        it("doublerequest", function(done) {
            test.logout(function(err, info, data) {
                _expect(err).to.be.null;
                _expect(info).to.not.be.null;
                _expect(info.statusCode).to.be.equal(200);
                _expect(data.user).to.not.be.null;
                _expect(data.user.email).to.be.equal(email2);
                User.Get(email2, function (err, user) {
                    _expect(err).to.be.null;
                    _expect(user).to.not.be.null;
                    _expect(user.status).to.be.equal(User.STATUS.OFF);
                    test.logout(function(err, info, data) {
                        _expect(err).to.be.not.ok;
                        _expect(info).to.be.ok;
                        _expect(info.statusCode).to.be.equal(200);
                        _expect(data).to.be.ok;
                        _expect(data.error).to.be.ok;
                        _expect(data.error.code).to.be.equal(User.ERROR.USER_NOTLOGGED);
                        done();
                    });
                });
            });
        });
    });

    describe("askresetpassword", function() {

        beforeEach(function(done) {
            User.Create(
                {email: email1, password: password, forcestatus:User.STATUS.OFF}, 
                function(err, savedUser) {
                    _expect(err).to.be.null;
                    _expect(savedUser).to.not.be.null;
                    _expect(savedUser.id).to.not.be.null;
                    _expect(savedUser.status).to.be.equal(User.STATUS.OFF);
                    done();
                }
            );
        });

        afterEach(function(done) {
            User.Remove({email: email1}, function() {
                done();
            });
        });

        it("success", function(done) {
            test.askResetPassword(email1, function(err, info, data) {
                _expect(err).to.be.null;
                _expect(info).to.be.ok;
                _expect(info.statusCode).to.be.equal(200);
                _expect(data.user).to.be.ok;
                _expect(data.user.email).to.be.equal(email1);
                done();
            });
        });

        it("missingmail", function(done) {
            test.askResetPassword(null, function(err, info, data) {
                _expect(err).to.be.null;
                _expect(info).to.not.be.null;
                _expect(info.statusCode).to.be.equal(200);
                _expect(data).to.not.be.null;
                _expect(data.error).to.not.be.null;
                _expect(data.error.code).to.be.equal(User.ERROR.USER_PARAMS);
                done();
            });
        });

    });

    describe("resetpassword", function() {
        var userid;
        var token;

        beforeEach(function(done) {
            User.Create(
                {email: email1, password: "aaa", forcestatus:User.STATUS.OFF}, 
                function(err, savedUser) {
                    _expect(err).to.be.null;
                    _expect(savedUser).to.not.be.null;
                    _expect(savedUser.id).to.not.be.null;
                    _expect(savedUser.status).to.be.equal(User.STATUS.OFF);
                    userid = savedUser.id;
                    token = savedUser.token;
                    done();
                }
            );
        });

        afterEach(function(done) {
            User.Remove({email: email1}, function() {
                done();
            });
        });

        it("success", function(done) {
            test.resetPassword(userid, token, password, function(err, info, data) {
                _expect(err).to.be.null;
                _expect(info).to.be.ok;
                _expect(info.statusCode).to.be.equal(200);
                _expect(data.user).to.be.ok;
                _expect(data.user.email).to.be.equal(email1);
                User.Login(email1, "aaa", function(err, user) {
                    _expect(err).to.be.ok;
                    _expect(err.code).to.be.equal(User.ERROR.USER_WRONG_PASSWORD);
                     User.Login(email1, password, function(err, user) {
                        _expect(err).to.be.null;
                        _expect(user).to.be.ok;
                        _expect(user.email).to.be.equal(email1);
                        done();
                    })
                });
            });
        });

    });

    describe("find", function() {
        beforeEach(function(done) {
            User.Create({
                    email : email1,
                    password : password,
                    profile : User.PROFILE.ADMIN,
                    forcestatus : User.STATUS.OFF
                },
                function(err, savedUser) {
                    _expect(err).to.be.null;
                    _expect(savedUser).to.not.be.null;
                    _expect(savedUser.profile).to.equal(User.PROFILE.ADMIN);
                    _expect(savedUser.status).to.equal(User.STATUS.OFF);
                    _expect(savedUser.email).to.equal(email1);
                    User.Create({
                        email : email2,
                        password : password,
                        profile : User.PROFILE.EDITOR,
                        forcestatus : User.STATUS.ANONYMOUS
                    },
                    function(err2, savedUser2) {
                            _expect(err2).to.be.null;
                            _expect(savedUser2).to.not.be.null;
                            _expect(savedUser2.email).to.equal(email2);
                            _expect(savedUser2.status).to.equal(User.STATUS.ANONYMOUS);
                            User.Create({
                                    email : email3,
                                    password : password,
                                    profile : User.PROFILE.WRITER,
                                    forcestatus : User.STATUS.ANONYMOUS
                                },
                                function(err3, savedUser3) {
                                    _expect(err3).to.be.null;
                                    _expect(savedUser3).to.not.be.null;
                                    _expect(savedUser3.email).to.equal(email3);
                                    _expect(savedUser3.status).to.equal(User.STATUS.ANONYMOUS);
                                    done();
                                }
                            );
                        }
                    );
                }
            );
        });

        afterEach(function(done) {
            User.Remove({email: email1}, function() {
                User.Remove({email: email2}, function() {
                    User.Remove({email: email3}, done);
                });
            });
        });

        it("notauthorized", function(done) {
            test.find({email:email1}, function(err, info, data) {
                _expect(err).to.be.null;
                _expect(info).to.be.ok;
                _expect(info.statusCode).to.be.equal(200);
                _expect(data).to.be.ok;
                _expect(data.error).to.be.ok;
                _expect(data.error.code).to.be.equal(User.ERROR.USER_NOTAUTHORIZED);
                _expect(data.users).to.be.not.ok;
                done();
            });
        });

        it("found", function(done) {
            test.setKeepSession(true);
            test.login(email1, password, function(errLogin, infoLogin, dataLogin) {
                test.find({email:email1}, function(err, info, data) {
                    _expect(err).to.be.null;
                    _expect(info).to.be.ok;
                    _expect(info.statusCode).to.be.equal(200);
                    _expect(data).to.be.ok;
                    _expect(data.users).to.be.ok;
                    _expect(data.users.length).to.be.equal(1);
                    _expect(data.users[0].email).to.be.equal(email1);
                    test.resetSession();
                    test.setKeepSession(false);
                    done();
                });
            });
        });

        it("notfound", function(done) {
            test.setKeepSession(true);
            test.login(email1, password, function(errLogin, infoLogin, dataLogin) {
                test.find({email:email4}, function(err, info, data) {
                    _expect(err).to.be.null;
                    _expect(info).to.be.ok;
                    _expect(info.statusCode).to.be.equal(200);
                    _expect(data).to.be.ok;
                    _expect(data.users).to.be.ok;
                    _expect(data.users.length).to.be.equal(0);
                    test.resetSession();
                    test.setKeepSession(false);
                    done();
                });
            });
        });

        it("multiples", function(done) {
            test.setKeepSession(true);
            test.login(email1, password, function(errLogin, infoLogin, dataLogin) {
                test.find({status : User.STATUS.ANONYMOUS}, function(err, info, data) {
                    _expect(err).to.be.null;
                    _expect(info).to.be.ok;
                    _expect(info.statusCode).to.be.equal(200);
                    _expect(data).to.be.ok;
                    _expect(data.users).to.be.ok;
                    _expect(data.users.length).to.be.equal(2);
                    test.resetSession();
                    test.setKeepSession(false);
                    done();
                });
            });
        });

        it("all", function(done) {
            test.setKeepSession(true);
            test.login(email1, password, function(errLogin, infoLogin, dataLogin) {
                test.find({}, function(err, info, data) {
                    _expect(err).to.be.null;
                    _expect(info).to.be.ok;
                    _expect(info.statusCode).to.be.equal(200);
                    _expect(data).to.be.ok;
                    _expect(data.users).to.be.ok;
                    _expect(data.users.length).to.be.equal(3);
                    test.resetSession();
                    test.setKeepSession(false);
                    done();
                });
            });
        });
    });

    describe("addpassport", function() {
        beforeEach(function(done) {
            User.Create({
                    email : email1,
                    password : password,
                    profile : User.PROFILE.ADMIN,
                    forcestatus : User.STATUS.OFF
                },
                function(err, savedUser) {
                    _expect(err).to.be.null;
                    _expect(savedUser).to.not.be.null;
                    _expect(savedUser.email).to.equal(email1);
                    test.setKeepSession(true);
                    test.login(email1, password, function(errLogin, infoLogin, dataLogin) {
                        done();
                    });
                }
            );
        });

        afterEach(function(done) {
            test.resetSession();
            test.setKeepSession(false);
            User.Remove({email: email1}, done);
        });

        it("single", function(done) {
            test.addpassport(email1, "test", function(err, info, data) {
                _expect(err).to.be.null;
                _expect(info).to.be.ok;
                _expect(info.statusCode).to.be.equal(200);
                _expect(data).to.be.ok;
                _expect(data.success).to.be.equal(User.MESSAGE.USER_SUCCESS);
                _expect(data.user).to.be.ok;
                _expect(data.user.passport).to.be.ok;
                _expect(data.user.passport.length).to.be.equal(1);
                done();
            });
        });

        it("multiple", function(done) {
            test.addpassport(email1, ["test1", "test2", "test3"], function(err, info, data) {
                _expect(err).to.be.null;
                _expect(info).to.be.ok;
                _expect(info.statusCode).to.be.equal(200);
                _expect(data).to.be.ok;
                _expect(data.success).to.be.equal(User.MESSAGE.USER_SUCCESS);
                _expect(data.user).to.be.ok;
                _expect(data.user.passport).to.be.ok;
                _expect(data.user.passport.length).to.be.equal(3);
                done();
            });
        });

        it("merge", function(done) {
            User.AddPassport(email1, "test0", function(err, user) {
                _expect(err).to.be.null;
                _expect(user).to.be.ok;
                _expect(user.passport).to.be.ok;
                _expect(user.passport.length).to.be.equal(1);
                test.addpassport(email1, ["test1", "test2", "test3"], function(err, info, data) {
                    _expect(err).to.be.null;
                    _expect(info).to.be.ok;
                    _expect(info.statusCode).to.be.equal(200);
                    _expect(data).to.be.ok;
                    _expect(data.success).to.be.equal(User.MESSAGE.USER_SUCCESS);
                    _expect(data.user).to.be.ok;
                    _expect(data.user.passport).to.be.ok;
                    _expect(data.user.passport.length).to.be.equal(4);
                    _expect(data.user.passport[3]).to.be.equal("test3");
                    done();
                });
            });
        });

        it("duplicate", function(done) {
            test.addpassport(email1, ["test0", "test0", "test1", "test2", "test3"], function(err, info, data) {
                _expect(err).to.be.null;
                _expect(info).to.be.ok;
                _expect(info.statusCode).to.be.equal(200);
                _expect(data).to.be.ok;
                _expect(data.success).to.be.equal(User.MESSAGE.USER_SUCCESS);
                _expect(data.user).to.be.ok;
                _expect(data.user.passport).to.be.ok;
                _expect(data.user.passport.length).to.be.equal(4);
                _expect(data.user.passport[3]).to.be.equal("test3");
                done();
            });
        });
    });

    describe("removepassport", function() {
        beforeEach(function(done) {
            User.Create({
                    email : email1,
                    password : password,
                    profile : User.PROFILE.ADMIN,
                    forcestatus : User.STATUS.OFF
                },
                function(err, savedUser) {
                    _expect(err).to.be.null;
                    _expect(savedUser).to.not.be.null;
                    _expect(savedUser.email).to.equal(email1);
                    User.AddPassport(email1, ["test1", "test2", "test3"], function(err, user) {
                        _expect(err).to.be.null;
                        _expect(user).to.be.ok;
                        _expect(user.passport).to.be.ok;
                        _expect(user.passport.length).to.be.equal(3);
                        test.setKeepSession(true);
                        test.login(email1, password, function(errLogin, infoLogin, dataLogin) {
                            done();
                        });
                    });
                }
            );
        });

        afterEach(function(done) {
            test.resetSession();
            test.setKeepSession(false);
            User.Remove({email: email1}, done);
        });

        it("unknow", function(done) {
            test.removepassport(email1, "test", function(err, info, data) {
                _expect(err).to.be.null;
                _expect(info).to.be.ok;
                _expect(info.statusCode).to.be.equal(200);
                _expect(data).to.be.ok;
                _expect(data.success).to.be.equal(User.MESSAGE.USER_SUCCESS);
                _expect(data.user).to.be.ok;
                _expect(data.user.passport).to.be.ok;
                _expect(data.user.passport.length).to.be.equal(3);
                done();
            });
        });

        it("multiple", function(done) {
            test.removepassport(email1, ["test1", "test3"], function(err, info, data) {
                _expect(err).to.be.null;
                _expect(info).to.be.ok;
                _expect(info.statusCode).to.be.equal(200);
                _expect(data).to.be.ok;
                _expect(data.success).to.be.equal(User.MESSAGE.USER_SUCCESS);
                _expect(data.user).to.be.ok;
                _expect(data.user.passport).to.be.ok;
                _expect(data.user.passport.length).to.be.equal(1);
                done();
            });
        });
    });

    describe("update", function() {
        beforeEach(function(done) {
            User.Create({
                    email : email1,
                    password : password,
                    profile : User.PROFILE.ADMIN,
                    forcestatus : User.STATUS.OFF
                },
                function(err, savedUser) {
                    _expect(err).to.be.null;
                    _expect(savedUser).to.not.be.null;
                    _expect(savedUser.email).to.equal(email1);
                    _expect(savedUser.profile).to.equal(User.PROFILE.ADMIN);
                    _expect(savedUser.status).to.equal(User.STATUS.OFF)
                    done();
                }
            );
        });

        afterEach(function(done) {
            User.Remove({email: email1}, done);
        });

        it("basic", function(done) {
            test.update(
                {
                    email : email1,
                    label : "labeltest",
                    name : "nametest"
                },
                function(err, info, data) {
                    _expect(err).to.be.null;
                    _expect(info).to.be.ok;
                    _expect(info.statusCode).to.be.equal(200);
                    _expect(data).to.be.ok;
                    _expect(data.success).to.be.equal(User.MESSAGE.USER_SUCCESS);
                    _expect(data.user).to.be.ok;
                    _expect(data.user.label).to.be.equal("labeltest");
                    _expect(data.user.name).to.be.equal("nametest");
                    done();
                }
            );
        });
    });
});