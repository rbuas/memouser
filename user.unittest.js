var expect = require("chai").expect;
var moment = require("moment");

var MemoCache = require("memocache");
var MemoUser = require("./memouser");

describe("unit.memouser", function() {
    var mcache;
    var memouser;

    before(function(done) {
        mcache = new MemoCache({maxSize:5000});
        memouser = new MemoUser({mcache:mcache, memopath:"./test/memouser", message:false});
        done();
    });

    after(function() { delete(mcache); });

    describe("signup", function() {
        beforeEach(function(done) { 
            memouser.removeAll()
            .then(function() {done();})
            .catch(done); 
        });

        afterEach(function(done) { 
            memouser.removeAll()
            .then(function() {done();})
            .catch(done); 
        });

        it("must get an error because missing user parameter", function(done) {
            memouser.signup(null)
            .then(function(newUser) {
                done(new Error("should not pass here, because the operation have to fail"));
            })
            .catch(function(err) {
                expect(err).to.be.ok;
                expect(err.error).to.be.equal(MemoUser.ERROR.MISSING_ID);
                done();
            })
            .catch(done);
        });

        it("must get an error because missing user.email and user.id parameter", function(done) {
            memouser.signup({})
            .then(function(newUser) {
                done(new Error("should not pass here, because the operation have to fail"));
            })
            .catch(function(err) {
                expect(err).to.be.ok;
                expect(err.error).to.be.equal(MemoUser.ERROR.MISSING_ID);
                done();
            })
            .catch(done);
        });

        it("must get an error because missing user.password parameter", function(done) {
            memouser.signup({email:"test@test.com"})
            .then(function(newUser) {
                done(new Error("should not pass here, because the operation have to fail"));
            })
            .catch(function(err) {
                expect(err).to.be.ok;
                expect(err.error).to.be.equal(MemoUser.ERROR.MISSING_PASSWORD);
                done();
            })
            .catch(done);
        });

        it("must singup a valid user", function(done) {
            memouser.signup({email:"test@test.com", password:"123456"})
            .then(function(userBadge) {
                expect(userBadge).to.be.ok;
                expect(userBadge.id).to.be.equal("test@test.com");
                expect(userBadge.status).to.be.equal(MemoUser.STATUS.CONFIRM);
                done();
            })
            .catch(done);
        });

        it("must singup a valid full user", function(done) {
            memouser.signup({
                email:"test@test.com",
                password:"123456",
                label : "Test test TEST",
                name : "TEST",
                birthday : "19820101",
                gender : MemoUser.GENDER.MALE,
                profile : MemoUser.PROFILE.GUEST,
                lang : "pt"
            })
            .then(function(userBadge) {
                expect(userBadge).to.be.ok;
                expect(userBadge.id).to.be.equal("test@test.com");
                expect(userBadge.status).to.be.equal(MemoUser.STATUS.CONFIRM);
                done();
            })
            .catch(done);
        });

        it("must singup a valid user and encrypt the password", function(done) {
            memouser.signup({email:"test@test.com",password:"123456"})
            .then(function(userBadge) {
                expect(userBadge).to.be.ok;
                expect(userBadge.id).to.be.equal("test@test.com");
                expect(userBadge.password).to.be.not.equal("123456");
                expect(userBadge.status).to.be.equal(MemoUser.STATUS.CONFIRM);
                done();
            })
            .catch(done);
        });

        it("must get an error when singup a duplicate", function(done) {
            memouser.signup({email:"test@test.com",password:"123456"})
            .then(function(userBadge) {
                expect(userBadge).to.be.ok;
                expect(userBadge.id).to.be.equal("test@test.com");
                expect(userBadge.password).to.be.not.equal("123456");
                expect(userBadge.status).to.be.equal(MemoUser.STATUS.CONFIRM);
                return memouser.signup({email:"test@test.com",password:"123456"});
            })
            .then(function(duplicateUserBadge) {
                done(new Error("should not pass here, because the operation have to fail"));
            })
            .catch(function(err) {
                expect(err).to.be.ok;
                expect(err.error).to.be.equal(MemoUser.ERROR.DUPLICATE);
                done();
            })
            .catch(done);
        });

        it("must get an error when singup with wrong genre type", function(done) {
            memouser.signup({email:"test@test.com",password:"123456",gender:"qsdqsdqs"})
            .then(function(userBadge) {
                done(new Error("should not pass here, because the operation have to fail"));
            })
            .catch(function(err) {
                expect(err).to.be.ok;
                expect(err.error).to.be.equal(MemoUser.ERROR.GENDER_VALUE);
                done();
            })
            .catch(done);
        });

        it("must get an error when singup with wrong status type", function(done) {
            memouser.signup({email:"test@test.com",password:"123456",status:"qsdqdqsdqs"})
            .then(function(userBadge) {
                done(new Error("should not pass here, because the operation have to fail"));
            })
            .catch(function(err) {
                expect(err).to.be.ok;
                expect(err.error).to.be.equal(MemoUser.ERROR.STATUS_VALUE);
                done();
            })
            .catch(done);
        });

        it("must get an error when singup with wrong profile type", function(done) {
            memouser.signup({email:"test@test.com",password:"123456",profile:"qsdqdqsdqs"})
            .then(function(userBadge) {
                done(new Error("should not pass here, because the operation have to fail"));
            })
            .catch(function(err) {
                expect(err).to.be.ok;
                expect(err.error).to.be.equal(MemoUser.ERROR.PROFILE_VALUE);
                done();
            })
            .catch(done);
        });

    });

    describe("signout", function() {
        var testtoken;

        beforeEach(function(done) { 
            memouser.removeAll()
            .then(function() {
                return memouser.signup({email:"test@test.com",password:"123456"});
            })
            .then(function(newuser) {
                testtoken = newuser.token;
                return newuser;
            })
            .then(function() { done(); })
            .catch(done); 
        });

        afterEach(function(done) { 
            memouser.removeAll()
            .then(function() {done();})
            .catch(done); 
        });

        it("must get an error when signout without user", function(done) {
            memouser.signout()
            .then(function(newUser) {
                done(new Error("should not pass here, because the operation have to fail"));
            })
            .catch(function(err) {
                expect(err).to.be.ok;
                expect(err.error).to.be.equal(MemoUser.ERROR.MISSING_ID);
                done();
            })
            .catch(done);
        });

        it("must get an error when signout a non existent user", function(done) {
            memouser.signout("test333@test.com")
            .then(function(newUser) {
                done(new Error("should not pass here, because the operation have to fail"));
            })
            .catch(function(err) {
                expect(err).to.be.ok;
                expect(err.error).to.be.equal(MemoUser.ERROR.NOTFOUND);
                done();
            })
            .catch(done);
        });

        it("must change the user status to STATUS.OUT", function(done) {
            memouser.confirm("test@test.com", testtoken)
            .then(function(user) {
                return memouser.login("test@test.com", "123456");
            })
            .then(function(userBadge) {
                return memouser.signout("test@test.com");
            })
            .then(function(userBadge) {
                expect(userBadge).to.be.ok;
                expect(userBadge.id).to.be.equal("test@test.com");
                expect(userBadge.status).to.be.equal(MemoUser.STATUS.OUT);
                done();
            })
            .catch(done);
        });
    });

    describe("restore", function() {
        var testtoken;

        beforeEach(function(done) { 
            memouser.removeAll()
            .then(function() {
                return memouser.signup({email:"test@test.com",password:"123456"});
            })
            .then(function(newuser) {
                testtoken = newuser.token;
                return newuser;
            })
            .then(function() { done(); })
            .catch(done); 
        });

        afterEach(function(done) { 
            memouser.removeAll()
            .then(function() {done();})
            .catch(done); 
        });

        it("must get an error with a wrong state operation", function(done) {
            memouser.restore("test@test.com")
            .then(function(newUser) {
                done(new Error("should not pass here, because the operation have to fail"));
            })
            .catch(function(err) {
                expect(err).to.be.ok;
                expect(err.error).to.be.equal(MemoUser.ERROR.STATUS);
                done();
            })
            .catch(done);
        });

        it("must restore user and change the user status to STATUS.CONFIRM", function(done) {
            memouser.confirm("test@test.com", testtoken)
            .then(function(userBadge) {
                return memouser.signout("test@test.com");
            })
            .then(function(userBadge) {
                return memouser.restore("test@test.com");
            })
            .then(function(restoredUser) {
                expect(restoredUser).to.be.ok;
                expect(restoredUser.id).to.be.equal("test@test.com");
                expect(restoredUser.status).to.be.equal(MemoUser.STATUS.CONFIRM);
                done();
            })
            .catch(done);
        });
    });

    describe("confirm", function() {
        var testtoken;

        beforeEach(function(done) { 
            memouser.removeAll()
            .then(function() {
                return memouser.signup({email:"test@test.com",password:"123456"});
            })
            .then(function(newuser) {
                testtoken = newuser.token;
                return newuser;
            })
            .then(function() { done(); })
            .catch(done); 
        });

        afterEach(function(done) { 
            memouser.removeAll()
            .then(function() {done();})
            .catch(done); 
        });

        it("must get an error when confirm without token", function(done) {
            memouser.confirm("test@test.com")
            .then(function(newUser) {
                done(new Error("should not pass here, because the operation have to fail"));
            })
            .catch(function(err) {
                expect(err).to.be.ok;
                expect(err.error).to.be.equal(MemoUser.ERROR.TOKEN);
                done();
            })
            .catch(done);
        });

        it("must get an error when confirm with a wrong token", function(done) {
            memouser.confirm("test@test.com", "ttttt")
            .then(function(newUser) {
                done(new Error("should not pass here, because the operation have to fail"));
            })
            .catch(function(err) {
                expect(err).to.be.ok;
                expect(err.error).to.be.equal(MemoUser.ERROR.TOKEN);
                done();
            })
            .catch(done);
        });

        it("must to confirm an user and changes it's status to STATUS.OFF", function(done) {
            memouser.confirm("test@test.com", testtoken)
            .then(function(confirmedUser) {
                expect(confirmedUser).to.be.ok;
                expect(confirmedUser.id).to.be.equal("test@test.com");
                expect(confirmedUser.status).to.be.equal(MemoUser.STATUS.OFF);
                done();
            })
            .catch(done);
        });
    });

    describe("login", function() {
        var testtoken;

        beforeEach(function(done) { 
            memouser.removeAll()
            .then(function() {
                return memouser.signup({email:"test@test.com",password:"123456"});
            })
            .then(function(newuser) {
                testtoken = newuser.token;
                return memouser.confirm("test@test.com", testtoken);
            })
            .then(function() { done(); })
            .catch(done); 
        });

        afterEach(function(done) { 
            memouser.removeAll()
            .then(function() {done();})
            .catch(done); 
        });

        it("must get an error when login without a password", function(done) {
            memouser.login("test@test.com")
            .then(function(user) {
                done(new Error("should not pass here, because the operation have to fail"));
            })
            .catch(function(err) {
                expect(err).to.be.ok;
                expect(err.id).to.be.equal("test@test.com");
                expect(err.error).to.be.equal(MemoUser.ERROR.MISSING_PASSWORD);
                done();
            })
            .catch(done);
        });

        it("must get an error when login with a wrong password", function(done) {
            memouser.login("test@test.com", "123")
            .then(function(user) {
                done(new Error("should not pass here, because the operation have to fail"));
            })
            .catch(function(err) {
                expect(err).to.be.ok;
                expect(err.error).to.be.equal(MemoUser.ERROR.WRONG_PASSWORD);
                done();
            })
            .catch(done);
        });

        it("must to login", function(done) {
            memouser.login("test@test.com", "123456")
            .then(function(userBadge) {
                expect(userBadge).to.be.ok;
                expect(userBadge.id).to.be.equal("test@test.com");
                expect(userBadge.status).to.be.equal(MemoUser.STATUS.ON);
                done();
            })
            .catch(done);
        });
    });

    describe("logout", function() {
        beforeEach(function(done) { 
            memouser.removeAll()
            .then(function() {
                return Promise.all([
                    memouser.signup({email:"test@test.com",password:"123456"}),
                    memouser.signup({email:"test22@test.com",password:"123456"})
                ]);
            })
            .then(function(userlist) {
                return memouser.confirm("test@test.com", userlist[0].token);
            })
            .then(function(confirmedUser) {
                return memouser.login("test@test.com", "123456");
            })
            .then(function() { done(); })
            .catch(done); 
        });

        afterEach(function(done) { 
            memouser.removeAll()
            .then(function() {done();})
            .catch(done); 
        });

        it("must get an error when logout an unknowed user", function(done) {
            memouser.logout("test33333@test.com")
            .then(function(user) {
                done(new Error("should not pass here, because the operation have to fail"));
            })
            .catch(function(err) {
                expect(err).to.be.ok;
                expect(err.error).to.be.equal(MemoUser.ERROR.NOTFOUND);
                done();
            })
            .catch(done);
        });

        it("must get an error when logout with login", function(done) {
            memouser.logout("test22@test.com")
            .then(function(user) {
                done(new Error("should not pass here, because the operation have to fail"));
            })
            .catch(function(err) {
                expect(err).to.be.ok;
                expect(err.error).to.be.equal(MemoUser.ERROR.NOTLOGGED);
                done();
            })
            .catch(done);
        });

        it("must to logout", function(done) {
            memouser.logout("test@test.com", "123456")
            .then(function(userBadge) {
                expect(userBadge).to.be.ok;
                expect(userBadge.id).to.be.equal("test@test.com");
                expect(userBadge.status).to.be.equal(MemoUser.STATUS.OFF);
                done();
            })
            .catch(function(err){
                expect(err).to.be.not.ok;
            })
            .catch(done);
        });
    });

    describe("addPassport", function() {
        beforeEach(function(done) { 
            memouser.removeAll()
            .then(function() {
                return memouser.signup({email:"test@test.com",password:"123456"});
            })
            .then(function() { done(); })
            .catch(done); 
        });

        afterEach(function(done) { 
            memouser.removeAll()
            .then(function() {done();})
            .catch(done); 
        });

        it("must get an error when add passport without a parameter", function(done) {
            memouser.addPassport("test@test.com")
            .then(function(user) {
                done(new Error("should not pass here, because the operation have to fail"));
            })
            .catch(function(err) {
                expect(err).to.be.ok;
                expect(err.error).to.be.equal(MemoUser.ERROR.MISSING_PARAMS);
                done();
            })
            .catch(done);
        });

        it("must add a passport to user by passing a string", function(done) {
            memouser.addPassport("test@test.com", "/a")
            .then(function(userBadge) {
                expect(userBadge).to.be.ok;
                expect(userBadge.id).to.be.equal("test@test.com");
                expect(userBadge.passport).to.be.ok;
                expect(userBadge.passport.length).to.be.equal(1);
                done();
            })
            .catch(done);
        });

        it("must add a passport to user by passing a string and duplicated", function(done) {
            memouser.addPassport("test@test.com", "/a")
            .then(function() {
                return memouser.addPassport("test@test.com", "/a");
            })
            .then(function() {
                return memouser.addPassport("test@test.com", "/b");
            })
            .then(function() {
                return memouser.addPassport("test@test.com", "/a");
            })
            .then(function(userBadge) {
                expect(userBadge).to.be.ok;
                expect(userBadge.id).to.be.equal("test@test.com");
                expect(userBadge.passport).to.be.ok;
                expect(userBadge.passport.length).to.be.equal(2);
                expect(userBadge.passport).to.contains("/a");
                expect(userBadge.passport).to.contains("/b");
                done();
            })
            .catch(done);
        });

        it("must add a passport to user by passing an array", function(done) {
            memouser.addPassport("test@test.com", ["/a", "/b", "/a", "a"])
            .then(function(userBadge) {
                expect(userBadge).to.be.ok;
                expect(userBadge.id).to.be.equal("test@test.com");
                expect(userBadge.passport).to.be.ok;
                expect(userBadge.passport.length).to.be.equal(3);
                expect(userBadge.passport).to.contains("/a");
                expect(userBadge.passport).to.contains("/b");
                expect(userBadge.passport).to.contains("a");
                done();
            })
            .catch(done);
        });
    });

    describe("remPassport", function() {
        beforeEach(function(done) { 
            memouser.removeAll()
            .then(function() {
                return memouser.signup({email:"test@test.com",password:"123456"});
            })
            .then(function() { done(); })
            .catch(done); 
        });

        afterEach(function(done) { 
            memouser.removeAll()
            .then(function() {done();})
            .catch(done); 
        });

        it("must get an error when add passport without a parameter", function(done) {
            memouser.remPassport("test@test.com")
            .then(function(user) {
                done(new Error("should not pass here, because the operation have to fail"));
            })
            .catch(function(err) {
                expect(err).to.be.ok;
                expect(err.error).to.be.equal(MemoUser.ERROR.MISSING_PARAMS);
                done();
            })
            .catch(done);
        });

        it("must do nothing when remove a passport that is not there", function(done) {
            memouser.remPassport("test@test.com", "/a")
            .then(function(userBadge) {
                expect(userBadge).to.be.ok;
                expect(userBadge.id).to.be.equal("test@test.com");
                expect(userBadge.passport).to.be.ok;
                expect(userBadge.passport.length).to.be.equal(0);
                done();
            })
            .catch(done);
        });

        it("must remove the existent passports already there and keep the others", function(done) {
            memouser.addPassport("test@test.com", "/a")
            .then(function() {
                return memouser.addPassport("test@test.com", "/b");
            })
            .then(function() {
                return memouser.remPassport("test@test.com", "/a");
            })
            .then(function() {
                return memouser.remPassport("test@test.com", "/c");
            })
            .then(function(userBadge) {
                expect(userBadge).to.be.ok;
                expect(userBadge.id).to.be.equal("test@test.com");
                expect(userBadge.passport).to.be.ok;
                expect(userBadge.passport.length).to.be.equal(1);
                done();
            })
            .catch(done);
        });

        it("must remove the existent passports already there and keep the others", function(done) {
            memouser.addPassport("test@test.com", "/a")
            .then(function() {
                return memouser.addPassport("test@test.com", ["/c", "/d", "/e", "/f"])
            })
            .then(function() {
                return memouser.remPassport("test@test.com", ["/a", "/b", "/e", "a"])
            })
            .then(function(userBadge) {
                expect(userBadge).to.be.ok;
                expect(userBadge.id).to.be.equal("test@test.com");
                expect(userBadge.passport).to.be.ok;
                expect(userBadge.passport.length).to.be.equal(3);
                expect(userBadge.passport).to.contains("/c");
                expect(userBadge.passport).to.contains("/d");
                expect(userBadge.passport).to.contains("/f");
                done();
            })
            .catch(done);
        });
    });

    describe("find", function() {
        var dateMinus0 = moment();
        var dateMinus10 = moment().subtract(10, "days");
        var dateMinus30 = moment().subtract(30, "days");

        beforeEach(function(done) { 
            memouser.removeAll()
            .then(function() {
                return Promise.all([
                    memouser.signup({email:"01@test.com",password:"123456",since:dateMinus0}, {status:MemoUser.STATUS.ON}),
                    memouser.signup({email:"02@test.com",password:"123456",since:dateMinus10}, {status:MemoUser.STATUS.ON}),
                    memouser.signup({email:"03@test.com",password:"123456",since:dateMinus30}, {status:MemoUser.STATUS.ON}),

                    memouser.signup({email:"04@test.com",password:"123456",since:dateMinus0}, {status:MemoUser.STATUS.OFF}),
                    memouser.signup({email:"05@test.com",password:"123456",since:dateMinus10}, {status:MemoUser.STATUS.OFF}),
                    memouser.signup({email:"06@test.com",password:"123456",since:dateMinus30}, {status:MemoUser.STATUS.OFF}),

                    memouser.signup({email:"07@test.com",password:"123456",since:dateMinus0}, {status:MemoUser.STATUS.OUT}),
                    memouser.signup({email:"08@test.com",password:"123456",since:dateMinus10}, {status:MemoUser.STATUS.OUT}),
                    memouser.signup({email:"09@test.com",password:"123456",since:dateMinus30}, {status:MemoUser.STATUS.OUT}),

                    memouser.signup({email:"10@test.com",password:"123456",since:dateMinus0}, {status:MemoUser.STATUS.CONFIRM}),
                    memouser.signup({email:"11@test.com",password:"123456",since:dateMinus10}, {status:MemoUser.STATUS.CONFIRM}),
                    memouser.signup({email:"12@test.com",password:"123456",since:dateMinus30}, {status:MemoUser.STATUS.CONFIRM}),

                    memouser.signup({email:"13@test.com",password:"123456",since:dateMinus0}, {status:MemoUser.STATUS.REVIVE}),
                    memouser.signup({email:"14@test.com",password:"123456",since:dateMinus10}, {status:MemoUser.STATUS.REVIVE}),
                    memouser.signup({email:"15@test.com",password:"123456",since:dateMinus30}, {status:MemoUser.STATUS.REVIVE}),

                    memouser.signup({email:"16@test.com",password:"123456",since:dateMinus0}, {status:MemoUser.STATUS.BLOCK}),
                    memouser.signup({email:"17@test.com",password:"123456",since:dateMinus10}, {status:MemoUser.STATUS.BLOCK}),
                    memouser.signup({email:"18@test.com",password:"123456",since:dateMinus30}, {status:MemoUser.STATUS.BLOCK})
                ]);
            })
            .then(function() { done(); })
            .catch(done); 
        });

        afterEach(function(done) { 
            memouser.removeAll()
            .then(function() {done();})
            .catch(done); 
        });

        it("must get an array of 3 users", function(done) {
            memouser.find({status:MemoUser.STATUS.REVIVE})
            .then(function(userlist) {
                expect(userlist).to.be.ok;
                expect(userlist.length).to.be.equal(3);
                done();
            })
            .catch(done);
        });

        it("must get an error with 6 users", function(done) {
            memouser.find({since:function(val) {return moment(val) >= dateMinus10;}})
            .then(function(userlist) {
                expect(userlist).to.be.ok;
                expect(userlist.length).to.be.equal(12);
                done();
            })
            .catch(done);
        });
    });

    describe("purge", function() {
        var dateMinus0 = moment();
        var dateMinus10 = moment().subtract(10, "days");
        var dateMinus30 = moment().subtract(30, "days");

        beforeEach(function(done) { 
            memouser.removeAll()
            .then(function() {
                return Promise.all([
                    memouser.signup({email:"01@test.com",password:"123456",since:dateMinus0}, {status:MemoUser.STATUS.ON}),
                    memouser.signup({email:"02@test.com",password:"123456",since:dateMinus10}, {status:MemoUser.STATUS.ON}),
                    memouser.signup({email:"03@test.com",password:"123456",since:dateMinus30}, {status:MemoUser.STATUS.ON}),

                    memouser.signup({email:"04@test.com",password:"123456",since:dateMinus0}, {status:MemoUser.STATUS.OFF}),
                    memouser.signup({email:"05@test.com",password:"123456",since:dateMinus10}, {status:MemoUser.STATUS.OFF}),
                    memouser.signup({email:"06@test.com",password:"123456",since:dateMinus30}, {status:MemoUser.STATUS.OFF}),

                    memouser.signup({email:"07@test.com",password:"123456",since:dateMinus0}, {status:MemoUser.STATUS.OUT}),
                    memouser.signup({email:"08@test.com",password:"123456",since:dateMinus10}, {status:MemoUser.STATUS.OUT}),
                    memouser.signup({email:"09@test.com",password:"123456",since:dateMinus30}, {status:MemoUser.STATUS.OUT}),

                    memouser.signup({email:"10@test.com",password:"123456",since:dateMinus0}, {status:MemoUser.STATUS.CONFIRM}),
                    memouser.signup({email:"11@test.com",password:"123456",since:dateMinus10}, {status:MemoUser.STATUS.CONFIRM}),
                    memouser.signup({email:"12@test.com",password:"123456",since:dateMinus30}, {status:MemoUser.STATUS.CONFIRM}),

                    memouser.signup({email:"13@test.com",password:"123456",since:dateMinus0}, {status:MemoUser.STATUS.REVIVE}),
                    memouser.signup({email:"14@test.com",password:"123456",since:dateMinus10}, {status:MemoUser.STATUS.REVIVE}),
                    memouser.signup({email:"15@test.com",password:"123456",since:dateMinus30}, {status:MemoUser.STATUS.REVIVE}),

                    memouser.signup({email:"16@test.com",password:"123456",since:dateMinus0}, {status:MemoUser.STATUS.BLOCK}),
                    memouser.signup({email:"17@test.com",password:"123456",since:dateMinus10}, {status:MemoUser.STATUS.BLOCK}),
                    memouser.signup({email:"18@test.com",password:"123456",since:dateMinus30}, {status:MemoUser.STATUS.BLOCK})
                ]);
            })
            .then(function() { done(); })
            .catch(done); 
        });

        afterEach(function(done) { 
            memouser.removeAll()
            .then(function() {done();})
            .catch(done); 
        });

        it("must purge until last 10 days", function(done) {
            memouser.purge(10)
            .then(function(purgelist) {
                expect(purgelist).to.be.ok;
                expect(purgelist.length).to.be.equal(2);
                expect(purgelist[0].id).to.be.equal("11@test.com");
                expect(purgelist[1].id).to.be.equal("12@test.com");
                done();
            })
            .catch(done);
        });
    });
});