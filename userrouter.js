module.exports = UserRouter;

var path = require("path");
var jsext = require("jsext");
var MemoRouter = require("memodb").MemoRouter;
var MemoUserDB = require("./memouser");

UserRouter.extends( MemoRouter );
function UserRouter (udb, options) {
    var self = this;
    self.options = Object.assign({}, options);
    MemoRouter.call(self, udb);
    self.udb = udb;
}

UserRouter.prototype.signup = function() {
    var self = this;
    return function (req, res) {
        //prepare params
        var user = req.body && req.body["user"];

        //keep userid
        req.session.userid = user.email;

        //call api
        self.udb.signup(user)
        .then(function(newUser) {
            res.json({status:"SUCCESS", user:self.udb.pickUserBadge(newUser)});
        })
        .catch(function(err) {
            res.json({status:"ERROR", error:err && err.error});
        });
    };
}

UserRouter.prototype.signout = function() {
    var self = this;
    return function (req, res) {
        //prepare params
        var userid = req.query.userid;

        //call api
        self.udb.signout(userid)
        .then(function(user) {
            res.json({status:"SUCCESS", info:user.pick(["email", "status"])});
        })
        .catch(function(err) {
            res.json({status:"ERROR", error:err && err.error});
        });
    };
}

UserRouter.prototype.login = function() {
    var self = this;
    return function (req, res) {
        //prepare params
        var userid = req.query.userid;
        var userpass = req.query.password;

        //keep user id
        req.session.userid = userid;
        //reset old user badge
        req.session.userbadge = null;

        //call api
        self.udb.login(userid, userpass)
        .then(function(user) {
            req.session.userbadge = self.udb.pickUserBadge(user);
            res.json({status:"SUCCESS", info:req.session.userbadge});
        })
        .catch(function(err) {
            res.json({status:"ERROR", error:err && err.error});
        });
    };
}

UserRouter.prototype.logout = function() {
    var self = this;
    return function (req, res) {
        //prepare params
        var userid = req.query.userid;

        //reset old user badge
        req.session.userbadge = null;

        //call api
        self.udb.logout(userid)
        .then(function(user) {
            res.json({status:"SUCCESS", info:user.pick(["email", "status"])});
        })
        .catch(function(err) {
            res.json({status:"ERROR", error:err && err.error});
        });
    };
}

UserRouter.prototype.confirm = function() {
    var self = this;
    return function (req, res) {
        //prepare params
        var userid = req.query.userid;
        var usertoken = req.query.usertoken;

        //call api
        self.udb.confirm(userid, usertoken)
        .then(function(user) {
            res.json({status:"SUCCESS", info:user.pick(["email", "status"])});
        })
        .catch(function(err) {
            res.json({status:"ERROR", error:err && err.error});
        });
    };
}

UserRouter.prototype.update = function() {
    var self = this;
    return function (req, res) {
        //prepare params
        var user = req.body && req.body.user;

        //call api
        self.udb.update(user)
        .then(function(user) {
            res.json({status:"SUCCESS", info:self.udb.pickUserBadge(user)});
        })
        .catch(function(err) {
            res.json({status:"ERROR", error:err && err.error});
        });
    };
}

UserRouter.prototype.restore = function() {
    var self = this;
    return function (req, res) {
        //prepare params
        var userid = req.query.userid;
        
        //call api
        self.udb.restore(userid)
        .then(function(user) {
            res.json({status:"SUCCESS", info:user.pick(["email", "status"])});
        })
        .catch(function(err) {
            res.json({status:"ERROR", error:err && err.error});
        });
    };
}

UserRouter.prototype.addPassport = function() {
    var self = this;
    return function (req, res) {
        //prepare params
        var userid = req.body && req.body.userid;
        var passport = req.body && req.body.passport;
        passport = passport && passport.split("|");
        
        //call api
        self.udb.addPassport(userid, passport)
        .then(function(user) {
            res.json({status:"SUCCESS", info:user.pick(["email", "status", "passport"])});
        })
        .catch(function(err) {
            res.json({status:"ERROR", error:err && err.error});
        });
    };
}

UserRouter.prototype.remPassport = function() {
    var self = this;
    return function (req, res) {
        //prepare params
        var userid = req.body && req.body.userid;
        var passport = req.body && req.body.passport;
        passport = passport && passport.split("|");
        
        //call api
        self.udb.remPassport(userid, passport)
        .then(function(user) {
            res.json({status:"SUCCESS", info:user.pick(["email", "status", "passport"])});
        })
        .catch(function(err) {
            res.json({status:"ERROR", error:err && err.error});
        });
    };
}

UserRouter.prototype.resetPassword = function() {
    var self = this;
    return function (req, res) {
        //prepare params
        var userid = req.query.userid;
        
        //call api
        self.udb.resetPassword(userid)
        .then(function(user) {
            res.json({status:"SUCCESS", info:user.pick(["email", "status"])});
        })
        .catch(function(err) {
            res.json({status:"ERROR", error:err && err.error});
        });
    };
}

UserRouter.prototype.newPassword = function() {
    var self = this;
    return function (req, res) {
        //prepare params
        var userid = req.body && req.body.userid;
        var password = req.body && req.body.password;
        var token = req.body && req.body.token;
        
        //call api
        self.udb.newPassword(userid, password)
        .then(function(user) {
            res.json({status:"SUCCESS", info:user.pick(["email", "status"])});
        })
        .catch(function(err) {
            res.json({status:"ERROR", error:err && err.error});
        });
    };
}

UserRouter.prototype.purge = function() {
    var self = this;
    return function (req, res) {
        //prepare params
        var days = req.query.days;
        
        //call api
        self.udb.purge(days)
        .then(function(list) {
            res.json({status:"SUCCESS", list:list});
        })
        .catch(function(err) {
            res.json({status:"ERROR", error:err && err.error});
        });
    };
}