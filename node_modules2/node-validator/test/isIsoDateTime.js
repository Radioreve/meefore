var assert = require('assert');
require('should');

var validator = require('../lib/validator');

function expectFailure(message, childName, childValue) {
  message.should.not.be.empty;
}

function expectSuccess() {
  throw new Error('fail');
}

describe('validator.isIsoDateTime', function () {
  it('should pass Date',
    function (done) {
      validator.isIsoDateTime().validate(new Date(), expectSuccess);
      done();
    });

  it('should fail unix offset (milliseconds)',
    function (done) {
      validator.isIsoDateTime().validate(1318781876406, expectFailure);
      done();
    });

  it('should pass ISO8601 string date/times',
    function (done) {
      validator.isIsoDateTime().validate('2013-02-08T09:30:26.123Z', expectSuccess);
      validator.isIsoDateTime().validate('2013-02-08T09:30:26Z', expectSuccess);
      validator.isIsoDateTime().validate('2013-02-08T09:30:26+0700', expectSuccess);
      validator.isIsoDateTime().validate('2013-02-08T09:30:26.123+0700', expectSuccess);

      validator.isIsoDateTime().validate('2013-02-08 09:30:26.123Z', expectSuccess);
      validator.isIsoDateTime().validate('2013-02-08 09:30:26Z', expectSuccess);
      validator.isIsoDateTime().validate('2013-02-08 09:30:26+0700', expectSuccess);
      validator.isIsoDateTime().validate('2013-02-08 09:30:26.123+0700', expectSuccess);
      done();
    });

  it('should fail ISO8601 string date/times with no time zone',
    function (done) {
      validator.isIsoDateTime().validate('2013-02-08T09:30:26', expectFailure);
      validator.isIsoDateTime().validate('2013-02-08T09:30:26.123', expectFailure);
      done();
    });

  it('should fail ISO8601 string date only',
    function (done) {
      validator.isIsoDateTime().validate('2013-02-08', expectFailure);
      done();
    });

  it('should fail non-ISO8601 string date/times',
    function (done) {
      validator.isIsoDateTime().validate('2013-W06-5T09:30:26', expectFailure);
      validator.isIsoDateTime().validate('12/12/2012 12:12:12', expectFailure);
      done();
    });

  it('should fail object',
    function (done) {
      validator.isDate().validate({year: 2014, month: 10, day: 14}, expectFailure);
      done();
    });

  it('should fail invalid dates',
    function (done) {
      validator.isDate().validate('asd', expectFailure);
      validator.isDate().validate(null, expectFailure);
      validator.isDate().validate({}, expectFailure);
      validator.isDate().validate([], expectFailure);
      validator.isDate().validate(function () {}, expectFailure);
      done();
    });

});