var expect = require("chai").expect;
var moment = require("moment");

var MemoCache = require("memocache");
var MemoUser = require("./memouser");

describe("unit.memouser", function() {
    var mcache;
    var memouser;

    before(function(done) {
        mcache = new MemoCache({maxSize:5000});
        memouser = new MemoUser({mcache:mcache, memopath:"./test/memouser"});
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

    });
/*
        var email1 = "rodrigobuas+unittest@gmail.com";
        var email2 = "rodrigobuas+unittest2@gmail.com";
        var email3 = "rodrigobuas+unittest3@gmail.com";
        var email4 = "rodrigobuas+unittest4@gmail.com";
        var password = "123456";
        it("duplicate", function(done) {
            var user = {email: email1, password: password};
            User.Create(user, function(err, savedUser) {
                expect(err).to.be.null;
                expect(savedUser).to.not.be.null;
                expect(savedUser.status).to.equal(User.STATUS.CONFIRM);
                User.Create(user, function(err2, savedUser2) {
                    expect(err2).to.not.be.null;
                    expect(err2.code).to.equal(11000);
                    done();
                });
            });
        });
        it("type-name", function(done) {
            var user = {
                email: email1, 
                password: password ,
                name : 555
            };
            User.Create(user, function(err, savedUser) {
                expect(err).to.be.null;
                expect(savedUser).to.not.be.null;
                expect(savedUser.status).to.equal(User.STATUS.CONFIRM);
                done();
            });
        });
        it("type-genre-ko", function(done) {
            var user = {
                email: email1, 
                password: password,
                gender : "HHH"
            };
            User.Create(user, function(err, savedUser) {
                expect(err).to.not.be.null;
                done();
            });
        });
        it("type-genre-ok", function(done) {
            var user = {
                email: email1, 
                password: password,
                gender : User.GENDER.F
            };
            User.Create(user, function(err, savedUser) {
                expect(err).to.be.null;
                done();
            });
        });
        it("type-profile-ko", function(done) {
            var user = {
                email: email1, 
                password: password,
                profile : "HHH"
            };
            User.Create(user, function(err, savedUser) {
                expect(err).to.not.be.null;
                done();
            });
        });
        it("type-profile-ok", function(done) {
            var user = {
                email: email1, 
                password: password,
                profile : User.PROFILE.ADMIN
            };
            User.Create(user, function(err, savedUser) {
                expect(err).to.be.null;
                done();
            });
        });
    });

    describe("createanonymous", function() {
        after(function(done) {
            User.Purge(0, User.STATUS.ANONYMOUS, done);
        });

        it("success", function(done) {
            User.CreateAnonymous(function(err, savedUser) {
                expect(err).to.be.null;
                expect(savedUser).to.not.be.null;
                expect(savedUser.status).to.equal(User.STATUS.ANONYMOUS);
                done();
            });
        });
        it("multiple", function(done) {
            User.CreateAnonymous(function(err, savedUser) {
                expect(err).to.be.null;
                expect(savedUser).to.not.be.null;
                expect(savedUser.status).to.equal(User.STATUS.ANONYMOUS);
                User.CreateAnonymous(function(err2, savedUser2) {
                    expect(err2).to.be.null;
                    expect(savedUser2).to.not.be.null;
                    expect(savedUser2.status).to.equal(User.STATUS.ANONYMOUS);
                    User.CreateAnonymous(function(err3, savedUser3) {
                        expect(err3).to.be.null;
                        expect(savedUser3).to.not.be.null;
                        expect(savedUser3.status).to.equal(User.STATUS.ANONYMOUS);
                        done();
                    });
                });
            });
        });
    });

    describe("purge", function() {
        var dateMinus0 = moment();
        var dateMinus10 = moment().subtract(10, "days");
        var dateMinus30 = moment().subtract(30, "days");
        beforeEach(function(done) {
            User.Create({
                    email : email1,
                    password : "a",
                    forcestatus : User.STATUS.ANONYMOUS,
                    since : dateMinus10
                },
                function(err, savedUser) {
                    expect(err).to.be.null;
                    expect(savedUser).to.not.be.null;
                    expect(savedUser.status).to.equal(User.STATUS.ANONYMOUS);
                    expect(savedUser.email).to.equal(email1);
                    expect(dateMinus10.isSame(savedUser.since)).to.equal(true);
                    User.Create({
                        email : email2,
                        password : "a",
                        forcestatus : User.STATUS.ANONYMOUS,
                        since : dateMinus30
                    },
                    function(err2, savedUser2) {
                            expect(err2).to.be.null;
                            expect(savedUser2).to.not.be.null;
                            expect(savedUser2.email).to.equal(email2);
                            expect(savedUser2.status).to.equal(User.STATUS.ANONYMOUS);
                            expect(dateMinus30.isSame(savedUser2.since)).to.equal(true);
                            User.Create({
                                    email : email3,
                                    password : "a",
                                    forcestatus : User.STATUS.ANONYMOUS,
                                },
                                function(err3, savedUser3) {
                                    expect(err3).to.be.null;
                                    expect(savedUser3).to.not.be.null;
                                    expect(savedUser3.email).to.equal(email3);
                                    expect(savedUser3.status).to.equal(User.STATUS.ANONYMOUS);
                                    User.Create({
                                            email : email4,
                                            password : "a",
                                            forcestatus : User.STATUS.CONFIRM,
                                            since : dateMinus10
                                        },
                                        function(err4, savedUser4) {
                                            expect(err4).to.be.null;
                                            expect(savedUser4).to.not.be.null;
                                            expect(savedUser4.email).to.equal(email4);
                                            expect(savedUser4.status).to.equal(User.STATUS.CONFIRM);
                                            expect(dateMinus10.isSame(savedUser.since)).to.equal(true);
                                            done();
                                        }
                                    );
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
                    User.Remove({email: email3}, function() {
                        User.Remove({email: email4}, function() {
                            done();
                        });
                    });
                });
            });
        });

        it("days-0-anonymous", function(done) {
            User.Purge(0, User.STATUS.ANONYMOUS, function(err) {
                expect(err).to.be.null;
                User.Get(email1, function(err, user) {
                    expect(err).to.not.be.null;
                    expect(err.code).to.equal(User.ERROR.USER_NOTFOUND);
                    expect(user).to.be.null;
                    User.Get(email2, function(err, user) {
                        expect(err).to.not.be.null;
                        expect(err.code).to.equal(User.ERROR.USER_NOTFOUND);
                        expect(user).to.be.null;
                        User.Get(email3, function(err, user) {
                            expect(err).to.not.be.null;
                            expect(err.code).to.equal(User.ERROR.USER_NOTFOUND);
                            expect(user).to.be.null;
                            User.Get(email4, function(err, user4) {
                                expect(err).to.be.null;
                                expect(user4).to.not.be.null;
                                expect(user4.email).to.equal(email4);
                                done();
                            });
                        });
                    });
                });
            })
        });

        it("days-10-anonymous", function(done) {
            User.Purge(10, User.STATUS.ANONYMOUS, function(err) {
                expect(err).to.be.null;
                User.Get(email1, function(err, user) {
                    expect(err).to.not.be.null;
                    expect(err.code).to.equal(User.ERROR.USER_NOTFOUND);
                    expect(user).to.be.null;
                    User.Get(email2, function(err, user) {
                        expect(err).to.not.be.null;
                        expect(err.code).to.equal(User.ERROR.USER_NOTFOUND);
                        expect(user).to.be.null;
                        User.Get(email3, function(err, user3) {
                            expect(err).to.be.null;
                            expect(user3).to.not.be.null;
                            expect(user3.email).to.equal(email3);
                            User.Get(email4, function(err, user4) {
                                expect(err).to.be.null;
                                expect(user4).to.not.be.null;
                                expect(user4.email).to.equal(email4);
                                done();
                            });
                        });
                    });
                });
            })
        });

        it("days-10-confirm", function(done) {
            User.Purge(10, User.STATUS.CONFIRM, function(err) {
                expect(err).to.be.null;
                User.Get(email1, function(err, user1) {
                    expect(err).to.be.null;
                    expect(user1).to.not.be.null;
                    expect(user1.email).to.equal(email1);
                    User.Get(email2, function(err, user2) {
                        expect(err).to.be.null;
                        expect(user2).to.not.be.null;
                        expect(user2.email).to.equal(email2);
                        User.Get(email3, function(err, user3) {
                            expect(err).to.be.null;
                            expect(user3).to.not.be.null;
                            expect(user3.email).to.equal(email3);
                            User.Get(email4, function(err, user4) {
                                expect(err).to.not.be.null;
                                expect(err.code).to.equal(User.ERROR.USER_NOTFOUND);
                                expect(user4).to.be.null;
                                done();
                            });
                        });
                    });
                });
            })
        });

        it("days-30-anonymous", function(done) {
            User.Purge(30, User.STATUS.ANONYMOUS, function(err) {
                expect(err).to.be.null;
                User.Get(email1, function(err, user1) {
                    expect(err).to.be.null;
                    expect(user1).to.not.be.null;
                    expect(user1.email).to.equal(email1);
                    User.Get(email2, function(err, user2) {
                        expect(err).to.not.be.null;
                        expect(err.code).to.equal(User.ERROR.USER_NOTFOUND);
                        expect(user2).to.be.null;
                        User.Get(email3, function(err, user3) {
                            expect(err).to.be.null;
                            expect(user3).to.not.be.null;
                            expect(user3.email).to.equal(email3);
                            User.Get(email4, function(err, user4) {
                                expect(err).to.be.null;
                                expect(user4).to.not.be.null;
                                expect(user4.email).to.equal(email4);
                                done();
                            });
                        });
                    });
                });
            })
        });
    });

    describe("remove", function() {
        it("success", function(done) {
            User.CreateAnonymous(function(err, savedUser) {
                expect(err).to.be.null;
                expect(savedUser).to.not.be.null;
                expect(savedUser.id).to.not.be.null;
                User.Find({_id: savedUser.id}, function(err2, users) {
                    expect(err2).to.be.null;
                    expect(users).to.not.be.null;
                    expect(users.length).to.equal(1);
                    User.Remove({_id: savedUser.id}, function() {
                        User.Find({id: savedUser.id}, function(err2, users) {
                            expect(err2).to.be.null;
                            expect(users).to.not.be.null;
                            expect(users.length).to.equal(0);
                            done();
                        });
                    });
                });
            });
        });
        it("notfound", function(done) {
            User.Find({email: email1}, function(err, users) {
                expect(err).to.be.null;
                expect(users).to.not.be.null;
                expect(users.length).to.equal(0);
                User.Remove({email: email1}, function(err2) {
                    expect(err2).to.be.null;
                    done();
                });
            });
        });
    });

    describe("softremove", function() {
        afterEach(function(done) {
            User.Remove({email: email1}, function() {
                done();
            });
        });

        it("success", function(done) {
            User.Create({email: email1, password: password}, function(err, savedUser) {
                expect(err).to.be.null;
                expect(savedUser).to.not.be.null;
                expect(savedUser.status).to.equal(User.STATUS.CONFIRM);
                User.SoftRemove(email1, password, function(err2, savedUser2) {
                    expect(err2).to.be.null;
                    expect(savedUser2).to.not.be.null;
                    expect(savedUser2.status).to.be.equal(User.STATUS.REMOVED);
                    User.Find({email: email1}, function(err3, users) {
                        expect(err3).to.be.null;
                        expect(users).to.not.be.null;
                        expect(users.length).to.equal(1);
                        var user = users[0];
                        expect(user.status).to.be.equal(User.STATUS.REMOVED);
                        done();
                    });
                });
            });
        });
        it("notfound", function(done) {
            User.SoftRemove(email1, password, function(err, savedUser) {
                expect(err).to.not.be.null;
                expect(err.code).to.be.equal(User.ERROR.USER_UNKNOW);
                expect(savedUser).to.be.null;
                done();
            });
        });
    });


    describe("restore", function() {
        afterEach(function(done) {
            User.Remove({email: email1}, function() {
                done();
            });
        });

        it("success", function(done) {
            User.Create({email: email1, password: password}, function(err, savedUser) {
                expect(err).to.be.null;
                expect(savedUser).to.not.be.null;
                expect(savedUser.status).to.equal(User.STATUS.CONFIRM);
                User.SoftRemove(email1, password, function(err2, savedUser2) {
                    expect(err2).to.be.null;
                    expect(savedUser2).to.not.be.null;
                    expect(savedUser2.status).to.be.equal(User.STATUS.REMOVED);
                    User.Find({email: email1}, function(err3, users) {
                        expect(err3).to.be.null;
                        expect(users).to.not.be.null;
                        expect(users.length).to.equal(1);
                        var user = users[0];
                        expect(user.status).to.be.equal(User.STATUS.REMOVED);
                        User.Restore(email1, function(err4, savedUser4) {
                            expect(err4).to.be.null;
                            expect(savedUser4).to.not.be.null;
                            expect(savedUser4.status).to.be.equal(User.STATUS.CONFIRM);
                            done();
                        });
                    });
                });
            });
        });
        it("notfound", function(done) {
            User.Restore(email1, function(err, savedUser) {
                expect(err).to.not.be.null;
                expect(err.code).to.be.equal(User.ERROR.USER_UNKNOW);
                expect(savedUser).to.be.null;
                done();
            });
        });
    });

    describe("update", function() {
        beforeEach(function (done) {
            User.Create({
                email: email1, 
                password: password,
                name: "a",
                label: "b",
                birthday: new Date(),
                gender:User.GENDER.M,
                profile:User.PROFILE.WRITER,
                origin:"rbuas sa",
                lang:"br"
            }, function(err, savedUser) {
                expect(err).to.be.null;
                expect(savedUser).to.not.be.null;
                done();
            });
        });
        afterEach(function(done) {
            User.Remove({email:email1}, function() {
                User.Remove({email:email2}, done);
            });
        })

        it("name", function(done) {
            User.Update({
                email: email1,
                name: "aa"
            }, function(err, savedUser) {
                expect(err).to.be.null;
                expect(savedUser).to.not.be.null;
                expect(savedUser.name).to.equal("aa");
                User.Get(email1, function(err, user) {
                    expect(err).to.be.null;
                    expect(user).to.not.be.null;
                    expect(user.name).to.equal("aa");
                    done();
                })
            });
        });

        it("label", function(done) {
            User.Update({
                email: email1,
                label: "bb"
            }, function(err, savedUser) {
                expect(err).to.be.null;
                expect(savedUser).to.not.be.null;
                expect(savedUser.label).to.equal("bb");
                User.Get(email1, function(err, user) {
                    expect(err).to.be.null;
                    expect(user).to.not.be.null;
                    expect(user.label).to.equal("bb");
                    done();
                })
            });
        });

        it("birthday", function(done) {
            User.Update({
                email: email1,
                birthday: new Date(1982,0,1,21,45)
            }, function(err, savedUser) {
                expect(err).to.be.null;
                expect(savedUser).to.not.be.null;
                User.Get(email1, function(err, user) {
                    expect(err).to.be.null;
                    expect(user).to.not.be.null;
                    var birthday = user.birthday;
                    expect(birthday).to.not.be.null;
                    expect(birthday.getFullYear()).to.equal(1982);
                    expect(birthday.getMonth()).to.equal(0);
                    expect(birthday.getDate()).to.equal(1);
                    expect(birthday.getHours()).to.equal(21);
                    expect(birthday.getMinutes()).to.equal(45);
                    done();
                })
            });
        });

        it("status-ok", function(done) {
            User.Update({
                email: email1,
                status: User.STATUS.BLOCK
            }, function(err, savedUser) {
                expect(err).to.be.null;
                expect(savedUser).to.not.be.null;
                User.Get(email1, function(err, user) {
                    expect(err).to.be.null;
                    expect(user).to.not.be.null;
                    expect(user.status).to.equal(User.STATUS.BLOCK);
                    done();
                })
            });
        });

        it("status-ko", function(done) {
            User.Update({
                email: email1,
                status: "STATUS NOT VALID"
            }, function(err, savedUser) {
                User.Get(email1, function(err, user) {
                    expect(err).to.be.null;
                    expect(user).to.not.be.null;
                    expect(user.status).to.not.equal("STATUS NOT VALID");
                    done();
                })
            });
        });

        it("gender-ok", function(done) {
            User.Update({
                email: email1,
                gender: User.GENDER.F
            }, function(err, savedUser) {
                expect(err).to.be.null;
                expect(savedUser).to.not.be.null;
                User.Get(email1, function(err, user) {
                    expect(err).to.be.null;
                    expect(user).to.not.be.null;
                    expect(user.gender).to.equal(User.GENDER.F);
                    done();
                })
            });
        });

        it("gender-ko", function(done) {
            User.Update({
                email: email1,
                gender: "GENDER NOT VALID"
            }, function(err, savedUser) {
                User.Get(email1, function(err, user) {
                    expect(err).to.be.null;
                    expect(user).to.not.be.null;
                    expect(user.status).to.not.equal("GENDER NOT VALID");
                    done();
                })
            });
        });

        it("profile-ok", function(done) {
            User.Update({
                email: email1,
                profile: User.PROFILE.ADMIN
            }, function(err, savedUser) {
                expect(err).to.be.null;
                expect(savedUser).to.not.be.null;
                User.Get(email1, function(err, user) {
                    expect(err).to.be.null;
                    expect(user).to.not.be.null;
                    expect(user.profile).to.equal(User.PROFILE.ADMIN);
                    done();
                })
            });
        });

        it("profile-ko", function(done) {
            User.Update({
                email: email1,
                profile: "PROFILE NOT VALID"
            }, function(err, savedUser) {
                User.Get(email1, function(err, user) {
                    expect(err).to.be.null;
                    expect(user).to.not.be.null;
                    expect(user.profile).to.not.equal("PROFILE NOT VALID");
                    done();
                })
            });
        });

        it("origin", function(done) {
            User.Update({
                email: email1,
                origin: "RBUAS CO"
            }, function(err, savedUser) {
                User.Get(email1, function(err, user) {
                    expect(err).to.be.null;
                    expect(user).to.not.be.null;
                    expect(user.origin).to.equal("RBUAS CO");
                    done();
                })
            });
        });

        it("email", function(done) {
            User.Update({
                email: email1,
                newemail: email2
            }, function(err, savedUser) {
                User.Get(email2, function(err, user) {
                    expect(err).to.be.null;
                    expect(user).to.not.be.null;
                    expect(user.email).to.equal(email2);
                    expect(user.status).to.equal(User.STATUS.CONFIRM);
                    done();
                })
            });
        });

        it("email-trystatus", function(done) {
            User.Update({
                email: email1,
                newemail: email2,
                status:User.STATUS.ON
            }, function(err, savedUser) {
                User.Get(email2, function(err, user) {
                    expect(err).to.be.null;
                    expect(user).to.not.be.null;
                    expect(user.email).to.equal(email2);
                    expect(user.status).to.equal(User.STATUS.CONFIRM);
                    done();
                })
            });
        });
    });

    describe("get", function() {
        beforeEach(function(done) {
            User.Create({
                    email : email1,
                    password : "a"
                },
                function(err, savedUser) {
                    expect(err).to.be.null;
                    expect(savedUser).to.not.be.null;
                    expect(savedUser.email).to.equal(email1);
                    done();
                }
            );
        });

        afterEach(function(done) {
            User.Remove({email: email1}, done);
        });

        it("found", function(done) {
            User.Get(email1, function(err, user) {
                expect(err).to.be.null;
                expect(user).to.not.be.null;
                expect(user.email).to.equal(email1);
                done();
            });
        });

        it("notfound", function(done) {
            User.Get(email2, function(err, user) {
                expect(err).to.not.be.null;
                expect(err.code).to.equal(User.ERROR.USER_NOTFOUND);
                done();
            });
        });

        it("missingparams", function(done) {
            User.Get(null, function(err, user) {
                expect(err).to.not.be.null;
                expect(err.code).to.equal(User.ERROR.USER_PARAMS);
                done();
            });
        });

    });

    describe("find", function() {
        beforeEach(function(done) {
            User.Create({
                    email : email1,
                    password : "a",
                    forcestatus : User.STATUS.ANONYMOUS
                },
                function(err, savedUser) {
                    expect(err).to.be.null;
                    expect(savedUser).to.not.be.null;
                    expect(savedUser.status).to.equal(User.STATUS.ANONYMOUS);
                    expect(savedUser.email).to.equal(email1);
                    User.Create({
                        email : email2,
                        password : "a",
                        forcestatus : User.STATUS.ANONYMOUS
                    },
                    function(err2, savedUser2) {
                            expect(err2).to.be.null;
                            expect(savedUser2).to.not.be.null;
                            expect(savedUser2.email).to.equal(email2);
                            expect(savedUser2.status).to.equal(User.STATUS.ANONYMOUS);
                            User.Create({
                                    email : email3,
                                    password : "a",
                                    forcestatus : User.STATUS.CONFIRM
                                },
                                function(err3, savedUser3) {
                                    expect(err3).to.be.null;
                                    expect(savedUser3).to.not.be.null;
                                    expect(savedUser3.email).to.equal(email3);
                                    expect(savedUser3.status).to.equal(User.STATUS.CONFIRM);
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

        it("found", function(done) {
            User.Find({email:email1}, function(err, users) {
                expect(err).to.be.null;
                expect(users).to.not.be.null;
                expect(users.length).to.equal(1);
                expect(users[0].email).to.equal(email1);
                done();
            });
        });

        it("notfound", function(done) {
            User.Find({email:email4}, function(err, users) {
                expect(err).to.be.null;
                expect(users).to.not.be.null;
                expect(users.length).to.equal(0);
                done();
            });
        });

        it("multiples", function(done) {
            User.Find({status : User.STATUS.ANONYMOUS}, function(err, users) {
                expect(err).to.be.null;
                expect(users).to.not.be.null;
                expect(users.length).to.be.at.least(2);
                done();
            });
        });

        it("all", function(done) {
            User.Find({}, function(err, users) {
                expect(err).to.be.null;
                expect(users).to.not.be.null;
                expect(users.length).to.be.at.least(3);
                done();
            });
        });
    });

    describe("confirm", function() {
        var userid;

        beforeEach(function(done) {
            User.Create({
                    email : email1,
                    password : password
                },
                function(err, savedUser) {
                    expect(err).to.be.null;
                    expect(savedUser).to.not.be.null;
                    expect(savedUser.email).to.equal(email1);
                    expect(savedUser.status).to.equal(User.STATUS.CONFIRM);
                    userid = savedUser.id;
                    done();
                }
            );
        });

        afterEach(function(done) {
            User.Remove({email: email1}, done);
        });

        it("missingparams", function(done) {
            User.Confirm(null, function(err, savedUser) {
                expect(err).to.not.be.null;
                expect(err.code).to.equal(User.ERROR.USER_PARAMS);
                expect(savedUser).to.be.null;
                done();
            });
        });

        it("success", function(done) {
            User.Confirm(userid, function(err, savedUser) {
                expect(err).to.be.null;
                expect(savedUser).to.not.be.null;
                expect(savedUser.status).to.equal(User.STATUS.OFF);
                done();
            });
        });
    });

    describe("getresettoken", function() {
        var usertoken;

        beforeEach(function(done) {
            User.Create({
                    email : email1,
                    password : password
                },
                function(err, savedUser) {
                    expect(err).to.be.null;
                    expect(savedUser).to.not.be.null;
                    expect(savedUser.email).to.equal(email1);
                    usertoken = savedUser.token;
                    done();
                }
            );
        });

        afterEach(function(done) {
            User.Remove({email: email1}, done);
        });

        it("missingemail", function(done) {
            User.GetResetToken(null, function(err, token) {
                expect(err).to.not.be.null;
                expect(err.code).to.equal(User.ERROR.USER_PARAMS);
                expect(token).to.be.null;
                done();
            });
        });

        it("success", function(done) {
            User.GetResetToken(email1, function(err, token) {
                expect(err).to.be.null;
                expect(token).to.not.be.null;
                expect(usertoken).to.equal(token);
                done();
            });
        });
    });

    describe("resetpassword", function() {
        var usertoken;
        var userid;

        beforeEach(function(done) {
            User.Create({
                    email : email1,
                    password : password
                },
                function(err, savedUser) {
                    expect(err).to.be.null;
                    expect(savedUser).to.not.be.null;
                    expect(savedUser.email).to.equal(email1);
                    expect(savedUser.id).to.be.ok;
                    userid = savedUser.id;
                    User.GetResetToken(email1, function(err, token) {
                        expect(err).to.be.null;
                        expect(token).to.not.be.null;
                        usertoken = token;
                        done();
                    });
                }
            );
        });

        afterEach(function(done) {
            User.Remove({email: email1}, done);
        });

        it("missingemail", function(done) {
            User.ResetPassword(null, usertoken, "123456", function(err, savedUser) {
                expect(err).to.not.be.null;
                expect(err.code).to.equal(User.ERROR.USER_PARAMS);
                done();
            });
        });

        it("missingusertoken", function(done) {
            User.ResetPassword(userid, null, "123456", function(err, savedUser) {
                expect(err).to.not.be.null;
                expect(err.code).to.equal(User.ERROR.USER_PARAMS);
                done();
            });
        });

        it("missinguserpassword", function(done) {
            User.ResetPassword(userid, usertoken, null, function(err, savedUser) {
                expect(err).to.not.be.null;
                expect(err.code).to.equal(User.ERROR.USER_PARAMS);
                done();
            });
        });

        it("success", function(done) {
            User.ResetPassword(userid, usertoken, "123456", function(err, savedUser) {
                expect(err).to.be.null;
                expect(savedUser).to.not.be.null;
                expect(savedUser.password).to.not.be.null;
                expect(savedUser.password).to.not.be.equal(usertoken);
                done();
            });
        });
    });

    describe("login", function() {
        var userid;

        beforeEach(function(done) {
            User.Create({
                    email : email1,
                    password : password
                },
                function(err, savedUser) {
                    expect(err).to.be.null;
                    expect(savedUser).to.not.be.null;
                    expect(savedUser.email).to.equal(email1);
                    userid = savedUser.id;
                    done();
                }
            );
        });

        afterEach(function(done) {
            User.Remove({email: email1}, done);
        });

        it("missingemail", function(done) {
            User.Login(null, password, function(err, savedUser) {
                expect(err).to.not.be.null;
                expect(err.code).to.equal(User.ERROR.USER_PARAMS);
                done();
            });
        });

        it("missingpassword", function(done) {
            User.Login(email1, null, function(err, savedUser) {
                expect(err).to.not.be.null;
                expect(err.code).to.equal(User.ERROR.USER_PARAMS);
                done();
            });
        });

        it("confirm", function(done) {
            User.Login(email1, password, function(err, savedUser) {
                expect(err).to.not.be.null;
                expect(err.code).to.equal(User.ERROR.USER_CONFIRMATION);
                done();
            });
        });

        it("password-ok", function(done) {
            User.Confirm(userid, function(err, savedUser) {
                expect(err).to.be.null;
                expect(savedUser).to.not.be.null;
                expect(savedUser.status).to.equal(User.STATUS.OFF);
                User.Login(email1, password, function(err, savedUser) {
                    expect(err).to.be.null;
                    expect(savedUser).to.not.be.null;
                    expect(savedUser.status).to.equal(User.STATUS.ON);
                    done();
                });
            });
        });

        it("password-ko", function(done) {
            User.Confirm(userid, function(err, savedUser) {
                expect(err).to.be.null;
                expect(savedUser).to.not.be.null;
                expect(savedUser.status).to.equal(User.STATUS.OFF);
                User.Login(email1, password + "dsqsdqs", function(err, savedUser) {
                    expect(err).to.not.be.null;
                    expect(err.code).to.equal(User.ERROR.USER_WRONG_PASSWORD);
                    done();
                });
            });
        });
    });

    describe("logout", function() {

        beforeEach(function(done) {
            User.Create({
                    email : email1,
                    password : password
                },
                function(err, savedUser) {
                    expect(err).to.be.null;
                    expect(savedUser).to.not.be.null;
                    expect(savedUser.email).to.equal(email1);
                    User.Confirm(savedUser.id, function(err, savedUser) {
                        expect(err).to.be.null;
                        expect(savedUser).to.not.be.null;
                        expect(savedUser.status).to.equal(User.STATUS.OFF);
                        User.Login(email1, password, function(err, savedUser) {
                            expect(err).to.be.null;
                            expect(savedUser).to.not.be.null;
                            expect(savedUser.status).to.equal(User.STATUS.ON);
                            done();
                        });
                    });
                }
            );
        });

        afterEach(function(done) {
            User.Remove({email: email1}, done);
        });

        it("missingemail", function(done) {
            User.Logout(null, function(err, savedUser) {
                expect(err).to.not.be.null;
                expect(err.code).to.equal(User.ERROR.USER_PARAMS);
                done();
            });
        });

        it("success", function(done) {
            User.Logout(email1, function(err, savedUser) {
                expect(err).to.be.null;
                expect(savedUser).to.not.be.null;
                expect(savedUser.status).equal(User.STATUS.OFF);
                done();
            });
        });

        it("alreadyout", function(done) {
            User.Logout(email1, function(err, savedUser) {
                expect(err).to.be.null;
                expect(savedUser).to.not.be.null;
                expect(savedUser.status).equal(User.STATUS.OFF);
                User.Logout(email1, function(err, savedUser) {
                    expect(err).to.be.null;
                    expect(savedUser).to.not.be.null;
                    expect(savedUser.status).equal(User.STATUS.OFF);
                    done();
                });
            });
        });
    });

    describe("addpassport", function() {
        beforeEach(function(done) {
            User.Create({
                    email : email1,
                    password : password
                },
                function(err, savedUser) {
                    expect(err).to.be.null;
                    expect(savedUser).to.not.be.null;
                    expect(savedUser.email).to.equal(email1);
                    done();
                }
            );
        });

        afterEach(function(done) {
            User.Remove({email: email1}, done);
        });

        it("single", function(done) {
            User.AddPassport(email1, "test", function(err, user) {
                expect(err).to.be.null;
                expect(user).to.be.ok;
                expect(user.passport).to.be.ok;
                expect(user.passport.length).to.be.equal(1);
                done();
            });
        });

        it("multiple", function(done) {
            User.AddPassport(email1, ["test1", "test2", "test3"], function(err, user) {
                expect(err).to.be.null;
                expect(user).to.be.ok;
                expect(user.passport).to.be.ok;
                expect(user.passport.length).to.be.equal(3);
                done();
            });
        });

        it("merge", function(done) {
            User.AddPassport(email1, "test0", function(err, user) {
                expect(err).to.be.null;
                expect(user).to.be.ok;
                expect(user.passport).to.be.ok;
                expect(user.passport.length).to.be.equal(1);
                User.AddPassport(email1, ["test1", "test2", "test3"], function(err, user) {
                    expect(err).to.be.null;
                    expect(user).to.be.ok;
                    expect(user.passport).to.be.ok;
                    expect(user.passport.length).to.be.equal(4);
                    expect(user.passport[3]).to.be.equal("test3");
                    done();
                });
            });
        });

        it("duplicate", function(done) {
            User.AddPassport(email1, "test0", function(err, user) {
                expect(err).to.be.null;
                expect(user).to.be.ok;
                expect(user.passport).to.be.ok;
                expect(user.passport.length).to.be.equal(1);
                User.AddPassport(email1, ["test0", "test1", "test2", "test3"], function(err, user) {
                    expect(err).to.be.null;
                    expect(user).to.be.ok;
                    expect(user.passport).to.be.ok;
                    expect(user.passport.length).to.be.equal(4);
                    expect(user.passport[3]).to.be.equal("test3");
                    done();
                });
            });
        });
    });

    describe("removepassport", function() {
        beforeEach(function(done) {
            User.Create({
                    email : email1,
                    password : password
                },
                function(err, savedUser) {
                    expect(err).to.be.null;
                    expect(savedUser).to.not.be.null;
                    expect(savedUser.email).to.equal(email1);
                    User.AddPassport(email1, ["test1", "test2", "test3"], function(err, user) {
                        expect(err).to.be.null;
                        expect(user).to.be.ok;
                        expect(user.passport).to.be.ok;
                        expect(user.passport.length).to.be.equal(3);
                        done();
                    });
                }
            );
        });

        afterEach(function(done) {
            User.Remove({email: email1}, done);
        });

        it("unknow", function(done) {
            User.RemovePassport(email1, "test", function(err, user) {
                expect(err).to.be.null;
                expect(user).to.be.ok;
                expect(user.passport).to.be.ok;
                expect(user.passport.length).to.be.equal(3);
                done();
            });
        });

        it("multiple", function(done) {
            User.RemovePassport(email1, ["test1", "test3"], function(err, user) {
                expect(err).to.be.null;
                expect(user).to.be.ok;
                expect(user.passport).to.be.ok;
                expect(user.passport.length).to.be.equal(1);
                done();
            });
        });
    });
    */
});