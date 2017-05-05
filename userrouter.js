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

        //call api
        self.udb.signup(user)
        .then(function(newUserBadge) {
            res.json({status:"SUCCESS", user:newUserBadge});
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
            res.json({status:"SUCCESS", info:self.udb.pickUserBadge(user)});
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

        //call api
        self.udb.login(userid, userpass)
        .then(function(user) {
            res.json({status:"SUCCESS", info:self.udb.pickUserBadge(user)});
        })
        .catch(function(err) {
            res.json({status:"ERROR", error:err && err.error});
        });
    };
}