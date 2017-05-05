global.ROOT_DIR = process.cwd() || __dirname;

var jsext = require("jsext");
var expect = require("chai").expect;
var bodyparser = require("body-parser");
var express = require("express");
var MemoCache = require("memocache");
var RestTest = require("webdrone").RestTest;

var MemoUserDB = require("./memouser");
var UserRouter = require("./userrouter");

/////////////
// TESTCLASS : MemoUserRestTest
///////
MemoUserRestTest.extends( RestTest );
function MemoUserRestTest (options) {
    var self = this;
    RestTest.call(this, options);
    self.app = express();
    self.app.use(bodyparser.json());
    self.app.use(bodyparser.json({ type: 'application/vnd.api+json' })); 
    self.app.use(bodyparser.urlencoded({extended:true}));
    self.router = express.Router();
    self.mcache = new MemoCache({
        maxSize:5000000,
        alertRatio : 0.9,
        alertCallback : function(stats) {
            console.log("MEMOUSERRESTTEST::WARNING : memory was attempt next to the limit : ", stats);
        }
    });
    self.userdb = new MemoUserDB({
        mcache:self.mcache, memopath:"./test/user",
        message: false //silence is golden
    });
    self.userRouter = new UserRouter(self.userdb);
    self.router.param("user", self.userRouter.memoParam());
    self.router.post("/signup", self.userRouter.signup());
    self.router.get("/signout", self.userRouter.signout());
    self.router.get("/login", self.userRouter.login());
    self.app.use("/", self.router);
    self.server = self.app.listen(self.options.port || 3000, function(){
        console.log("Test server live at port " + (self.options.port || 3000));
    });
}

MemoUserRestTest.prototype.close = function (cb) {
    var self = this;
    self.server.close(cb);
}

MemoUserRestTest.prototype.signup = function (user) {
    var self = this;
    return self.request({path : "/signup", data:{user:user}, method : "POST", responseType:"json"});
}

MemoUserRestTest.prototype.signout = function (userid) {
    var self = this;
    return self.request({path : "/signout", data:{userid:userid}, method : "GET", responseType:"json"});
}

MemoUserRestTest.prototype.login = function (userid, password) {
    var self = this;
    return self.request({path : "/login", data:{userid:userid, password:password}, method : "GET", responseType:"json"});
}



/////////////
// TESTCASES : MemoUserRestTest
///////

describe("memouser.rest", function() {
    var urt;

    before(function(done) {
        urt = new MemoUserRestTest({ urlbase : "localhost", port:5005 });
        done();
    });

    after(function(done){
        urt.close(done);
    });

    beforeEach(function(done) { 
        urt.userdb.removeAll()
        .then(function() {
            return Promise.all([
                urt.userdb.create({id:"test1",author:"rbl",content:"RRR"}),
                urt.userdb.create({id:"test2",author:"llo",content:"LLL"}),
                urt.userdb.create({id:"test3",author:"ll",content:"lll"})
            ]);
        })
        .then(function() {done();})
        .catch(done);
    });

    afterEach(function(done) { 
        urt.userdb.removeAll()
        .then(function() {done();})
        .catch(done); 
    });

    describe("signup", function() {
        it("must get an error because there is no user information", function(done) {
            return urt.signup()
            .then(function(response) { 
                expect(response).to.be.ok;
                expect(response.info).to.be.ok;
                expect(response.info.duration).to.be.lessThan(500);
                expect(response.info.statusCode).to.be.equal(200);
                expect(response.data).to.be.ok;
                expect(response.data.status).to.be.equal("ERROR");
                expect(response.data.error).to.be.equal(MemoUserDB.ERROR.MISSING_ID);
                done();
            })
            .catch(function(err) { done(err); });
        });

        it("must get an error because there is no user identification", function(done) {
            return urt.signup({password:"123456"})
            .then(function(response) { 
                expect(response).to.be.ok;
                expect(response.info).to.be.ok;
                expect(response.info.duration).to.be.lessThan(500);
                expect(response.info.statusCode).to.be.equal(200);
                expect(response.data).to.be.ok;
                expect(response.data.status).to.be.equal("ERROR");
                expect(response.data.error).to.be.equal(MemoUserDB.ERROR.MISSING_ID);
                done();
            })
            .catch(function(err) { done(err); });
        });

        it("must to well signup a new user", function(done) {
            return urt.signup({email:"test@test.com", password:"123456"})
            .then(function(response) { 
                expect(response).to.be.ok;
                expect(response.info).to.be.ok;
                expect(response.info.duration).to.be.lessThan(500);
                expect(response.info.statusCode).to.be.equal(200);
                expect(response.data).to.be.ok;
                expect(response.data.status).to.be.equal("SUCCESS");
                expect(response.data.user).to.be.ok;
                expect(response.data.user.email).to.be.equal("test@test.com");
                done();
            })
            .catch(function(err) { done(err); });
        });

        it("must get a duplicate error", function(done) {
            return urt.signup({email:"test@test.com", password:"123456"})
            .then(function(response) {
                expect(response).to.be.ok;
                expect(response.info).to.be.ok;
                expect(response.info.duration).to.be.lessThan(500);
                expect(response.info.statusCode).to.be.equal(200);
                expect(response.data).to.be.ok;
                expect(response.data.status).to.be.equal("SUCCESS");
                expect(response.data.user).to.be.ok;
                expect(response.data.user.email).to.be.equal("test@test.com");
                return urt.signup({email:"test@test.com", password:"123456"});
            })
            .then(function(response) {
                expect(response).to.be.ok;
                expect(response.info).to.be.ok;
                expect(response.info.duration).to.be.lessThan(500);
                expect(response.info.statusCode).to.be.equal(200);
                expect(response.data).to.be.ok;
                expect(response.data.status).to.be.equal("ERROR");
                expect(response.data.error).to.be.equal(MemoUserDB.ERROR.DUPLICATE);
                done();
            })
            .catch(function(err) { done(err); });
        });

    });

    describe("signout", function() {
        it("must to signout a user", function(done) {
            return urt.signup({email:"test1@test.com", password:"123456"})
            .then(function(response) {
                return urt.signout("test1@test.com")
            })
            .then(function(response) { 
                expect(response).to.be.ok;
                expect(response.info).to.be.ok;
                expect(response.info.duration).to.be.lessThan(500);
                expect(response.info.statusCode).to.be.equal(200);
                expect(response.data).to.be.ok;
                expect(response.data.status).to.be.equal("SUCCESS");
                expect(response.data.info).to.be.ok;
                expect(response.data.info.email).to.be.equal("test1@test.com");
                expect(response.data.info.status).to.be.equal(MemoUserDB.STATUS.OUT);
                done();
            })
            .catch(function(err) { done(err); });
        });

        it("must to get an error signout a non signup user", function(done) {
            return urt.signout("test1@test.com")
            .then(function(response) { 
                expect(response).to.be.ok;
                expect(response.info).to.be.ok;
                expect(response.info.duration).to.be.lessThan(500);
                expect(response.info.statusCode).to.be.equal(200);
                expect(response.data).to.be.ok;
                expect(response.data.status).to.be.equal("ERROR");
                expect(response.data.error).to.be.equal(MemoUserDB.ERROR.NOTFOUND);
                done();
            })
            .catch(function(err) { done(err); });
        });

        it("must to get an error missing parameter", function(done) {
            return urt.signout()
            .then(function(response) { 
                expect(response).to.be.ok;
                expect(response.info).to.be.ok;
                expect(response.info.duration).to.be.lessThan(500);
                expect(response.info.statusCode).to.be.equal(200);
                expect(response.data).to.be.ok;
                expect(response.data.status).to.be.equal("ERROR");
                expect(response.data.error).to.be.equal(MemoUserDB.ERROR.MISSING_ID);
                done();
            })
            .catch(function(err) { done(err); });
        });
    });

    describe("login", function() {
        beforeEach(function(done) {
            urt.userdb.signup({email:"test1@test.com", password:"123456"}, {status:MemoUserDB.STATUS.OFF}).then(function() {done();});
        });

        afterEach(function(done) {
            urt.userdb.signout("test1@test.com").then(function() {done();});
        });

        it("must to login user", function(done) {
            return urt.login("test1@test.com", "123456")
            .then(function(response) { 
                expect(response).to.be.ok;
                expect(response.info).to.be.ok;
                expect(response.info.duration).to.be.lessThan(500);
                expect(response.info.statusCode).to.be.equal(200);
                expect(response.data).to.be.ok;
                expect(response.data.status).to.be.equal("SUCCESS");
                expect(response.data.info).to.be.ok;
                expect(response.data.info.email).to.be.equal("test1@test.com");
                expect(response.data.info.status).to.be.equal(MemoUserDB.STATUS.ON);
                done();
            })
            .catch(function(err) { done(err); });
        });

        it("must get an error when login with a wrong password", function(done) {
            return urt.login("test1@test.com", "qsdq")
            .then(function(response) { 
                expect(response).to.be.ok;
                expect(response.info).to.be.ok;
                expect(response.info.duration).to.be.lessThan(500);
                expect(response.info.statusCode).to.be.equal(200);
                expect(response.data).to.be.ok;
                expect(response.data.status).to.be.equal("ERROR");
                expect(response.data.error).to.be.equal(MemoUserDB.ERROR.WRONG_PASSWORD);
                done();
            })
            .catch(function(err) { done(err); });
        });

        it("must get an error when login without a password", function(done) {
            return urt.login("test1@test.com")
            .then(function(response) { 
                expect(response).to.be.ok;
                expect(response.info).to.be.ok;
                expect(response.info.duration).to.be.lessThan(500);
                expect(response.info.statusCode).to.be.equal(200);
                expect(response.data).to.be.ok;
                expect(response.data.status).to.be.equal("ERROR");
                expect(response.data.error).to.be.equal(MemoUserDB.ERROR.MISSING_PASSWORD);
                done();
            })
            .catch(function(err) { done(err); });
        });

        it("must get an error when login a non existent user", function(done) {
            return urt.login("test2@test.com", "qsdq")
            .then(function(response) { 
                expect(response).to.be.ok;
                expect(response.info).to.be.ok;
                expect(response.info.duration).to.be.lessThan(500);
                expect(response.info.statusCode).to.be.equal(200);
                expect(response.data).to.be.ok;
                expect(response.data.status).to.be.equal("ERROR");
                expect(response.data.error).to.be.equal(MemoUserDB.ERROR.NOTFOUND);
                done();
            })
            .catch(function(err) { done(err); });
        });

    });
});