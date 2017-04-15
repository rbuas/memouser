module.exports = MemoUserDB;

var bcrypt = require("bcrypt");
var moment = require("moment");
var crypto = require("crypto");

var jsext = require("jsext");
var MemoDB = require("memodb");

MemoUserDB.extends( MemoDB );
function MemoUserDB (options) {
    var self = this;
    self.options = Object.assign(MemoUserDB.DEFAULTOPTIONS, MemoDB.DEFAULTOPTIONS, options);
    MemoDB.call(self, self.options);
}

MemoUserDB.DEFAULTOPTIONS = {
    type : "user",
    schema : self.SCHEMA,
    schemadefault : self.SCHEMADEFAULT,
    badgekeys : self.BADGEKEYS,
    hashsize : 16,
    encryptsalt : 10,
    message : function(userbadge, message) {
        console.log("MEMOUSER::MESSAGE: " , message, userbadge);
    }
};

MemoUserDB.MESSAGE = {
    CONFIRM : "CONFIRM",
    REVIVE : "REVIVE",
    RESETPASSWORD : "RESETPASSWORD"
};

MemoUserDB.ERROR = Object.assign({}, MemoDB.ERROR, {
    MISSING_ID : "Missing user identification (email)",
    MISSING_PASSWORD : "Missing user password",
    EMAIL : "The email and id of an user is not the same",
    STATUS_VALUE : "Non valid value of enun STATUS",
    GENDER_VALUE : "Non valid value of enun GENDER",
    PROFILE_VALUE : "Non valid value of enun PROFILE",
    ENCRYPT : "Error during encryption",
    WRONG_PASSWORD : "The password not match with registered password",
    NOTLOGGED : "User not logged",
    TOKEN : "User token doesn't match",
    STATUS : "Not an allowed state to process this operation",

    USER_PARAMS : "Missing required params",
    USER_DATA : "Missing user data",
    USER_UNKNOW : "Unknow user",
    USER_NOTAUTHORIZED : "User not authorized",
    USER_CONFIRMATION : "Waiting confirmation",
    USER_BLOCKED : "User blocked",
    USER_REMOVED : "User removed"
});

MemoUserDB.STATUS = {
    ON : "N",
    OFF : "F",
    OUT : "T",
    CONFIRM : "C",
    REVIVE : "R",
    BLOCK : "B"
};

MemoUserDB.GENDER = {
    MALE : "M",
    FAMALE : "F"
};

MemoUserDB.PROFILE = {
    ADMIN : "A",   //backoffice administrator
    GUEST : "G",   //middleoffice guest
    CLIENT : "C"   //frontoffice client
};

MemoUserDB.prototype.SCHEMA = {
    id : String,
    email : String,
    password : String,
    token : String,
    label : String,
    name : String,
    birthday : Date,
    since : Date,
    status : String,
    lastlogin : Date,
    gender : String,
    profile : String,
    lang : String,
    passport : Array,
    favorite : Array
};

MemoUserDB.prototype.BADGEKEYS = ["email","label","name","birthday","since","status","gender","profile","lang","passport","favorite"];

MemoUserDB.prototype.SCHEMADEFAULT = function() {
    var self = this;
    return {
        token : buildToken(self.options.hashsize),
        since : moment(),
        lastlogin : moment(),
        passport : [],
        favorite : [],
        status : MemoUserDB.STATUS.CONFIRM
    };
}

MemoUserDB.prototype.verifyPassport = function(id, password) {
    var self = this;
    return new Promise(function(resolve, reject) {
        self.get(id)
        .then(function(user) {
            if(!user || !user.password) return reject({error:MemoUserDB.ERROR.MISSING_PASSWORD});

            return verifyPassword(self, user, password);
        })
        .then(resolve)
        .catch(reject)
    });
}

MemoUserDB.prototype.message = function(id, message) {
    var self = this;
    return new Promise(function(resolve, reject) {
        self.get(id)
        .then(function(user) {
            var userbadget = sendMessage(self, user, message);
            return {user:userbadget, message:message};
        })
        .then(resolve)
        .catch(reject);
    });
}

MemoUserDB.prototype.badget = function(id) {
    var self = this;
    return new Promise(function(resolve, reject) {
        self.get(id)
        .then(function(user) {
            return pickUserBadge(self, user);
        })
        .then(resolve)
        .catch(reject);
    });
}

MemoUserDB.prototype.signup = function(user) {
    var self = this;
    return new Promise(function(resolve, reject) {
        var badge = pickUserBadge(self, user);
        var isNewUser = true;
        var error = assertUser(user, isNewUser);
        if(error) return reject({error:error, user:badge});

        user.id = user.id || user.email;
        user.email = user.email || user.id;
        user.birthday = moment.utc(user.birthday, "YYYYMMDD");
        user.status = MemoUserDB.STATUS.CONFIRM;
        encryptPassword(self, user.password)
        .then(function(encryptedPassword) {
            if(!encryptedPassword) return reject({error:MemoUserDB.ERROR.ENCRYPT});

            user.password = encryptedPassword;
            return self.create(user);
        })
        .then(function(newuser) {
            sendMessage(self, newuser, MemoUserDB.MESSAGE.CONFIRM);
            return newuser;
        })
        .then(resolve)
        .catch(reject);
    });
}

MemoUserDB.prototype.signout = function(id) {
    var self = this;
    return new Promise(function(resolve, reject) {
        if(!id) return reject({error:MemoUserDB.ERROR.MISSING_ID});

        self.get(id)
        .then(function(user) {
            user.status = MemoUserDB.STATUS.OUT;
            return self.update(verifiedUser);
        })
        .then(resolve)
        .catch(reject);
    });
}

MemoUserDB.prototype.login = function(id, password) {
    var self = this;
    return new Promise(function(resolve, reject) {
        self.verifyPassport(id, password)
        .then(function(verifiedUser) {
            if(!verifiedUser || verifiedUser.status != MemoUserDB.STATUS.OFF) return reject({error:MemoUserDB.ERROR.NOTLOGGED, status:verifiedUser && verifiedUser.status});

            verifiedUser.status = MemoUserDB.STATUS.ON;
            verifiedUser.lastlogin = moment();
            return self.update(verifiedUser);
        })
        .then(resolve)
        .catch(reject);
    });
}

MemoUserDB.prototype.logout = function(id) {
    var self = this;
    return new Promise(function(resolve, reject) {
        self.get(id)
        .then(function(user) {
            if(!user || user.status != MemoUserDB.STATUS.ON) return reject({error:MemoUserDB.ERROR.NOTLOGGED, status:user && user.status});

            user.status = MemoUserDB.STATUS.OFF;
            return self.update(user);
        })
        .then(resolve)
        .catch(reject);
    });
}

MemoUserDB.prototype.confirm = function(id, token) {
    var self = this;
    return new Promise(function(resolve, reject) {
        self.get(id)
        .then(function(user) {
            if(!user) return reject({error:MemoUserDB.ERROR.NOTFOUND});

            var stateToConfirm = [MemoUserDB.STATUS.CONFIRM, MemoUserDB.STATUS.REVIVE];
            if(stateToConfirm.indexOf(user.status) < 0) return reject({error:MemoUserDB.ERROR.STATUS, status:user.status});

            if(user.token != token) return reject({error:MemoUserDB.ERROR.TOKEN});

            verifiedUser.status = MemoUserDB.STATUS.OFF;
            return self.update(verifiedUser);
        })
        .then(resolve)
        .catch(reject);
    });
}

MemoUserDB.prototype.update = function(user) {
    var self = this;
    return new Promise(function(resolve, reject) {
        if(user.password) {
            user.password = null;
            delete user.password;
        }
        if(user.newpassword) {
            encryptPassword(self, user.newpassword)
            .then(function(encryptedPassword) {
                if(!encryptedPassword) return reject({error:MemoUserDB.ERROR.ENCRYPT});

                user.password = encryptedPassword;
                return MemoDB.prototype.update.call(self, user);
            })
            .then(resolve)
            .catch(reject);
        }
    });
}

MemoUserDB.prototype.revive = function(id) {
    var self = this;
    return new Promise(function(resolve, reject) {
        self.get(id)
        .then(function(user) {
            if(!user) return reject({error:MemoUserDB.ERROR.NOTFOUND});

            if(user.status != MemoUserDB.STATE.OUT) return reject({error:MemoUserDB.ERROR.STATUS, status:user.status});

            user.status = MemoUserDB.STATUS.CONFIRM;

            sendMessage(self, user, MemoUserDB.MESSAGE.REVIVE);

            return self.update(user);
        })
        .then(resolve)
        .catch(reject);
    });
}

MemoUserDB.prototype.addPassport = function(id, path) {
    var self = this;
    return new Promise(function(resolve, reject) {
        self.get(id)
        .then(function(user) {
            if(!user) return reject({error:MemoUserDB.ERROR.NOTFOUND});

            if(!user.passport) user.passport = [];
            user.passport.push(path);

            return self.update(user);
        })
        .then(resolve)
        .catch(reject);
    });
}

MemoUserDB.prototype.remPassport = function(id, path) {
    var self = this;
    return new Promise(function(resolve, reject) {
        self.get(id)
        .then(function(user) {
            if(!user) return reject({error:MemoUserDB.ERROR.NOTFOUND});

            if(!user.passport) user.passport = [];
            
            user.passport.removeValue(path);

            return self.update(user);
        })
        .then(resolve)
        .catch(reject);
    });
}

MemoUserDB.prototype.resetPassword = function(id) {
    var self = this;
    return new Promise(function(resolve, reject) {
        self.get(id)
        .then(function(user) {
            if(!user) return reject({error:MemoUserDB.ERROR.NOTFOUND});

            if(user.state != MemoUserDB.ERROR.CONFIRM) {
                user.token = buildToken(self.options.hashsize);
                return self.update(user);
            }

            return user;
        })
        .then(function(user) {
            var userbadget = sendMessage(self, user, MemoUserDB.MESSAGE.RESETPASSWORD);
            return {user:userbadget, message:MemoUserDB.MESSAGE.RESETPASSWORD};
        })
        .then(resolve)
        .catch(reject);
    });
}

MemoUserDB.prototype.newPassword = function(id, newpassword) {
    var self = this;
    return new Promise(function(resolve, reject) {
        self.get(id)
        .then(function(user) {
            if(!user) return reject({error:MemoUserDB.ERROR.NOTFOUND});

            if(user.token != token) return reject({error:MemoUserDB.ERROR.TOKEN});

            user.newpassword = newpassword;
            return self.update(user);
        })
        .then(resolve)
        .catch(reject);
    });
}

MemoUserDB.prototype.purge = function(days) {
    var self = this;
    return new Promise(function(resolve, reject) {
        //TODO
    });
}



// PRIVATE

function buildToken (size) {
    return crypto.randomBytes(size).toString("hex");
}

function encryptPassword (self, password) {
    return new Promise(function (resolve, reject) {
        bcrypt.genSalt(self.options.encryptsalt, function(err, salt) {
            if (err) return reject(err);

            // hash the password using the new salt
            bcrypt.hash(password, salt, function(err, hash) {
                if (err) return reject(err);

                resolve(hash);
            });
        });
    });
}

function verifyPassword (self, user, candidate) {
    return new Promise(function (resolve, reject) {
        bcrypt.compare(candidate, user.password, function(err, isMatch) {
            if(!isMatch) return reject({error:MemoUserDB.ERROR.WRONG_PASSWORD});

            resolve(user);
        });
    });
}

function pickUserBadge (self, user) {
    return user && user.pick(self.BADGEKEYS);
}

function verifyEnun (value, options) {
    if(!value || !options) return false;

    for(var op in options) {
        if(!options.hasOwnProperty(op)) continue;

        var option = options[op];
        if(option == value) return true;
    }
    return false;
}

function assertUser (user, isNewUser) {
    if(!user || (!user.email && !user.id)) return MemoUserDB.ERROR.MISSING_ID;
    if(isNewUser && !user.password) return MemoUserDB.ERROR.MISSING_PASSWORD;

    if(user.id && user.email && user.id != user.email) return MemoUserDB.ERROR.EMAIL;

    if(user.status && !verifyEnun(user.status, MemoUserDB.STATUS)) return MemoUserDB.ERROR.STATUS_VALUE;
    if(user.gender && !verifyEnun(user.gender, MemoUserDB.GENDER)) return MemoUserDB.ERROR.GENDER_VALUE;
    if(user.profile && !verifyEnun(user.profile, MemoUserDB.PROFILE)) return MemoUserDB.ERROR.PROFILE_VALUE;
}

function sendMessage (self, user, message) {
    var messageAction = self.options.message;
    if(!message) return;

    var userbadget = pickUserBadge(self, user);
    message(userbadget, message);
    return userbadget;
}