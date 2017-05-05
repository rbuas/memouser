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
        .then(function(newuser) {
            res.json({status:"SUCCESS", user:newuser});
        })
        .catch(function(err) {
            res.json({status:"ERROR", error:err && err.error});
        });
    };
}