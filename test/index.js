var chai = require('chai')
var chaiAsPromised = require("chai-as-promised")
chai.use(chaiAsPromised)
var expect = chai.expect
var httpMocks = require('node-mocks-http')
var middlewareRun = require("../index")

function middlewareSetTest(value){
  return function(req, res, next){
    req.test = value
    return next()
  }
}

function middlewareNextRoute(req, res, next){
  return next("route")
}

function middlewareSendfunction(value){
  return function(req, res, next){
    return res.send("hi")
  }
}

function middlewareThrowError(req, res, next){
  throw new Error("test error thrown")
}

function middlewareNextError(req, res, next){
  return next(new Error("test error next"))
}

describe("middlewareRun()", function(){
  it("should have test prop foo & return route", function(done){
    var req  = httpMocks.createRequest({})
    var res = httpMocks.createResponse()
    middlewareRun(req, res, [
      middlewareSetTest("foo"),
      middlewareNextRoute,
      middlewareSetTest("bar")
    ]).then(function(value){
      expect(req).to.have.property("test", "foo")
      expect(value).to.equal("route")
    }).then(done).catch(done)
  })
  it("should have test prop bar & return next", function(done){
    var req  = httpMocks.createRequest({})
    var res = httpMocks.createResponse()
    middlewareRun(req, res, [
      middlewareSetTest("foo"),
      middlewareSetTest("bar")
    ]).then(function(value){
      expect(req).to.have.property("test", "bar")
      expect(value).to.equal("next")
    }).then(done).catch(done)
  })
  it("should have test prop foo & catch thrown error", function(done){
    var req  = httpMocks.createRequest({})
    var res = httpMocks.createResponse()
    middlewareRun(req, res, [
      middlewareSetTest("foo"),
      middlewareThrowError,
      middlewareSetTest("bar")
    ]).then(function(value){
      expect(value).to.have.property("message", "test error thrown")
      expect(req).to.have.property("test", "foo")
    }).then(done).catch(done)
  })
  it("should have test prop foo & catch next error", function(done){
    var req  = httpMocks.createRequest({})
    var res = httpMocks.createResponse()
    middlewareRun(req, res, [
      middlewareSetTest("foo"),
      middlewareNextError,
      middlewareSetTest("bar")
    ]).then(function(value){
      expect(value).to.have.property("message", "test error next")
      expect(req).to.have.property("test", "foo")
    }).then(done).catch(done)
  })
})
