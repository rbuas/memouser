global.ROOT_DIR = process.cwd() || __dirname;

var jsext = require("jsext");
var expect = require("chai").expect;
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
    self.router = express.Router();
    self.mcache = new MemoCache({
        maxSize:5000000,
        alertRatio : 0.9,
        alertCallback : function(stats) {
            console.log("MEMOUSERRESTTEST::WARNING : memory was attempt next to the limit : ", stats);
        }
    });
    self.userdb = new MemoUserDB({mcache:self.mcache, memopath:"./test/user"});
    self.userRouter = new UserRouter(self.userdb);
    //self.router.param("user", self.userRouter.memoParam());
    self.router.post("/signup", self.userRouter.signup());
    // self.router.get("/keys", self.userRouter.keys());
    // self.router.get("/count", self.userRouter.count());
    // self.router.get("/get/:user/:pick?", self.userRouter.get());
    // self.router.get("/getlist/:memolist/:pick?", self.userRouter.getList());
    // self.router.get("/random/:count?/:pick?", self.userRouter.random());
    // self.router.post("/create", self.userRouter.create());
    // self.router.get("/clone/:user/:clone", self.userRouter.clone());
    // self.router.post("/update", self.userRouter.update());
    // self.router.get("/remove/:user", self.userRouter.remove());
    // self.router.post("/removelist", self.userRouter.removeList());
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

        it.only("must get an error because there is no user identification", function(done) {
            return urt.signup({email:"test@test.com", password:"123456"})
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
            return urt.signup({email:"test@test.com", password:"123456"})
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

        it("must return the registered memo keys", function(done) {
            return urt.keys()
            .then(
                function(response) {
                    expect(response).to.be.ok;
                    expect(response.info).to.be.ok;
                    expect(response.info.duration).to.be.lessThan(500);
                    expect(response.info.statusCode).to.be.equal(200);
                    expect(response.data).to.be.ok;
                    expect(response.data.status).to.be.equal("SUCCESS");
                    expect(response.data.keys).to.be.ok;
                    expect(response.data.keys.length).to.be.equal(3);
                    done();
                },
                function(error) {
                    done(error);
                }
            )
            .catch(function(err) { done(err); });
        });
    });
});