/* global describe, before, it, afterEach */
var async = require('async')
var common = require('../common')
var should = require('should')
var TestModel

describe('ephemeral model', function () {
  before(function () {
    TestModel = common.Arrow.Model.extend('appc.redis/ephemeral', 'testEphemeral', {
      fields: {
        fname: {
          type: String, required: false
        },
        lname: {
          type: String, required: false
        },
        age: {
          type: Number, required: false
        }
      }
    })
  })

  describe('#create', function () {
    it('should create instances', function (next) {
      var fname = 'Hello world'
      var lname = 'Test'

      TestModel.create({
        fname: fname,
        lname: lname
      }, function (err, instance) {
        should(err).not.be.ok
        should(instance).be.an.Object
        should(instance.getPrimaryKey()).be.a.String
        should(instance.fname).equal(fname)
        should(instance.lname).equal(lname)
        next()
      })
    })

    it('should create multiple instances', function (next) {
      var fname = 'Hello world'
      var lname = 'Test'

      TestModel.create([
        {
          fname: fname,
          lname: lname
        },
        {
          fname: fname,
          lname: lname
        }
      ], function (err, instances) {
        should(err).not.be.ok
        should(instances).be.an.Array
        should(instances).have.length(2)

        should(instances[0].getPrimaryKey()).be.a.String
        should(instances[0].fname).equal(fname)
        should(instances[0].lname).equal(lname)

        should(instances[1].getPrimaryKey()).be.a.String
        should(instances[1].fname).equal(fname)
        should(instances[1].lname).equal(lname)

        next()
      })
    })
  })

  describe('#findByID', function () {
    it('should handle bad ids', function (next) {
      TestModel.findByID('a_bad_id', function (err) {
        should(err).be.ok
        next()
      })
    })

    it('should find an instance by ID', function (next) {
      var fname = 'James'
      var lname = 'Smith'

      TestModel.create({
        fname: fname,
        lname: lname
      }, function (err, createdInstance) {
        should(err).not.be.ok
        should(createdInstance).be.an.Object

        var id = createdInstance.getPrimaryKey()
        TestModel.findByID(id, function (err, foundInstance) {
          should(err).not.be.ok
          should(foundInstance).be.an.Object

          should(foundInstance.getPrimaryKey()).equal(id)
          should(foundInstance.fname).equal(fname)
          should(foundInstance.lname).equal(lname)

          next()
        })
      })
    })

    it('should handle bad values', function (next) {
      TestModel.findByID({
        random: {
          field: 1
        }
      }, function (err) {
        should(err).be.ok
        should(err.message.indexOf('Unexpected value for findByID')).be.greaterThan(-1)

        next()
      })
    })
  })

  describe('#find', function () {
    it('should find a single instance', function (next) {
      var fname = 'James'
      var lname = 'Smith'

      TestModel.create({
        fname: fname,
        lname: lname
      }, function (err, createdInstance) {
        should(err).not.be.ok
        should(createdInstance).be.an.Object

        var id = createdInstance.getPrimaryKey()

        TestModel.find({
          fname: fname
        }, function (err, collection) {
          should(err).not.be.ok
          should(collection).be.an.Array

          var foundInstance = collection[0]

          should(foundInstance.getPrimaryKey()).equal(id)
          should(foundInstance.fname).equal(fname)
          should(foundInstance.lname).equal(lname)

          next()
        })
      })
    })

    it('should find multiple instances', function (next) {
      var fname = 'James'
      var lname = 'Smith'

      TestModel.create({
        fname: fname,
        lname: lname
      }, function (err, createdInstance1) {
        should(err).not.be.ok
        should(createdInstance1).be.an.Object

        TestModel.create({
          fname: fname,
          lname: lname
        }, function (err, createdInstance2) {
          should(err).not.be.ok
          should(createdInstance2).be.an.Object

          TestModel.find({
            fname: fname
          }, function (err, collection) {
            should(err).not.be.ok
            should(collection).be.an.Array

            should(collection).have.length(2)
            should(collection[0].fname).equal(fname)
            should(collection[0].lname).equal(lname)
            should(collection[1].fname).equal(fname)
            should(collection[1].lname).equal(lname)

            next()
          })
        })
      })
    })

    it('should limit instances', function (next) {
      var fname = 'James'
      var lname = 'Smith'

      TestModel.create({
        fname: fname,
        lname: lname
      }, function (err, createdInstance1) {
        should(err).not.be.ok
        should(createdInstance1).be.an.Object

        TestModel.create({
          fname: fname,
          lname: lname
        }, function (err, createdInstance2) {
          should(err).not.be.ok
          should(createdInstance2).be.an.Object

          TestModel.find({
            limit: 1,
            order: {
              fname: 1
            },
            where: {
              fname: fname
            }
          }, function (err, foundInstance) {
            should(err).not.be.ok
            should(foundInstance).be.an.Object

            should(foundInstance.fname).equal(fname)
            should(foundInstance.lname).equal(lname)

            next()
          })
        })
      })
    })

    it('should limit fields using sel', function (next) {
      var fname = 'James'
      var lname = 'Smith'

      TestModel.create({
        fname: fname,
        lname: lname
      }, function (err, createdInstance) {
        should(err).not.be.ok
        should(createdInstance).be.an.Object

        TestModel.find({
          limit: 1,
          sel: {
            fname: 1
          },
          where: {
            lname: lname
          }
        }, function (err, foundInstance) {
          should(err).not.be.ok
          should(foundInstance).be.an.Object

          should(foundInstance.fname).equal('James')
          should(foundInstance.lname).not.be.ok

          next()
        })
      })
    })

    it('should limit fields using unsel', function (next) {
      var fname = 'James'
      var lname = 'Smith'

      TestModel.create({
        fname: fname,
        lname: lname
      }, function (err, createdInstance) {
        should(err).not.be.ok
        should(createdInstance).be.an.Object

        TestModel.find({
          limit: 1,
          unsel: {
            lname: 1
          },
          where: {
            lname: lname
          }
        }, function (err, foundInstance) {
          should(err).not.be.ok
          should(foundInstance).be.an.Object

          should(foundInstance.fname).equal('James')
          should(foundInstance.lname).not.be.ok

          next()
        })
      })
    })
  })

  describe('#findAll', function () {
    it('should find all instances', function (next) {
      var fname = 'James'
      var lname = 'Smith'

      var count = 0

      async.whilst(
        function () { return count < 100 },
        function (callback) {
          count++
          TestModel.create({
            fname: fname + count,
            lname: lname + count
          }, function (err, record) {
            should(err).not.be.ok
            should(record).be.an.Object
            callback()
          })
        },
        function (err) {
          should(err).not.be.ok

          TestModel.count(function (err, count) {
            should(err).not.be.ok
            should(count).be.an.Number

            should(count).eql(100)

            TestModel.findAll(function (err, collection) {
              should(err).not.be.ok
              should(collection).be.an.Array

              should(collection).have.lengthOf(100)

              next()
            })
          })
        }
      )
    });

    (common.isRemote ? it.skip : it)('should limit to 1000 instances', function (next) {
      var fname = 'James'
      var lname = 'Smith'

      var count = 0

      async.whilst(
        function () { return count < 1010 },
        function (callback) {
          count++
          TestModel.create({
            fname: fname + count,
            lname: lname + count
          }, function (err, record) {
            should(err).not.be.ok
            should(record).be.an.Object
            callback()
          })
        },
        function (err) {
          should(err).not.be.ok

          TestModel.count(function (err, count) {
            should(err).not.be.ok
            should(count).be.an.Number

            should(count).eql(1010)

            TestModel.findAll(function (err, collection) {
              should(err).not.be.ok
              should(collection).be.an.Array

              should(collection).have.lengthOf(1000)

              next()
            })
          })
        }
      )
    })
  })

  describe('#delete and #deleteAll', function () {
    it('should remove an instance', function (next) {
      var fname = 'James'
      var lname = 'Smith'

      TestModel.create({
        fname: fname,
        lname: lname
      }, function (err, createdInstance) {
        should(err).not.be.ok
        should(createdInstance).be.an.Object

        TestModel.findAll(function (err, collection1) {
          should(err).not.be.ok
          should(collection1).be.an.Array

          should(collection1.length).equal(1)
          should(collection1[0].fname).equal(fname)
          should(collection1[0].lname).equal(lname)

          collection1[0].delete(function () {
            TestModel.findAll(function (err, collection2) {
              should(err).not.be.ok
              should(collection2).be.an.Array

              should(collection2.length).equal(0)

              next()
            })
          })
        })
      })
    })

    it('should remove all instances', function (next) {
      var fname = 'James'
      var lname = 'Smith'

      TestModel.create({
        fname: fname,
        lname: lname
      }, function (err, createdInstance1) {
        should(err).not.be.ok
        should(createdInstance1).be.an.Object

        TestModel.create({
          fname: fname,
          lname: lname
        }, function (err, createdInstance2) {
          should(err).not.be.ok
          should(createdInstance2).be.an.Object

          TestModel.findAll(function (err, collection1) {
            should(err).not.be.ok
            should(collection1).be.an.Array

            should(collection1.length).equal(2)

            TestModel.deleteAll(function () {
              TestModel.findAll(function (err, collection2) {
                should(err).not.be.ok
                should(collection2).be.an.Array

                should(collection2.length).equal(0)

                next()
              })
            })
          })
        })
      })
    })
  })

  describe('#save', function () {
    it('should update an instance', function (next) {
      var fname = 'James'
      var lname = 'Smith'

      TestModel.create({
        fname: fname,
        lname: lname
      }, function (err, createdInstance) {
        should(err).not.be.ok
        should(createdInstance).be.an.Object

        TestModel.findAll(function (err, collection1) {
          should(err).not.be.ok
          should(collection1).be.an.Array

          should(collection1.length).equal(1)
          should(collection1[0].fname).equal(fname)
          should(collection1[0].lname).equal(lname)

          collection1[0].set('lname', 'Jameson')

          collection1[0].save(function () {
            TestModel.findAll(function (err, collection2) {
              should(err).not.be.ok
              should(collection2).be.an.Array

              should(collection2.length).equal(1)
              should(collection2[0].fname).equal(fname)
              should(collection2[0].lname).equal('Jameson')

              next()
            })
          })
        })
      })
    })
  })

  describe('#expire', function () {
    it('should set an expiration', function (next) {
      var fname = 'Hello world'
      var lname = 'Test'

      TestModel.create({
        fname: fname,
        lname: lname
      }, function (err, instance) {
        should(err).not.be.ok
        should(instance).be.an.Object
        should(instance.getPrimaryKey()).be.a.String
        should(instance.fname).equal(fname)
        should(instance.lname).equal(lname)

        instance.expire(60, function (err, success) {
          should(err).not.be.ok
          should(success).be.true

          instance.ttl(function (err, ttl) {
            should(err).not.be.ok
            should(ttl).be.greaterThan(50).and.lessThan(61)

            next()
          })
        })
      })
    })
  })

  describe('#expireAt', function () {
    it('should set an expiration using millis', function (next) {
      var fname = 'Hello world'
      var lname = 'Test'

      TestModel.create({
        fname: fname,
        lname: lname
      }, function (err, instance) {
        should(err).not.be.ok
        should(instance).be.an.Object
        should(instance.getPrimaryKey()).be.a.String
        should(instance.fname).equal(fname)
        should(instance.lname).equal(lname)

        var ttl = 1000 * 60 * 60

        instance.expireAt(Date.now() + ttl, function (err, success) {
          should(err).not.be.ok
          should(success).be.true

          instance.ttl(function (err, ttl) {
            should(err).not.be.ok
            should(ttl).be.greaterThan(ttl - 5).and.lessThan(ttl + 1)

            next()
          })
        })
      })
    })

    it('should set an expiration using a string', function (next) {
      var fname = 'Hello world'
      var lname = 'Test'

      TestModel.create({
        fname: fname,
        lname: lname
      }, function (err, instance) {
        should(err).not.be.ok
        should(instance).be.an.Object
        should(instance.getPrimaryKey()).be.a.String
        should(instance.fname).equal(fname)
        should(instance.lname).equal(lname)

        var ttl = 1000 * 60 * 60

        instance.expireAt(new Date(Date.now() + ttl).toISOString(), function (err, success) {
          should(err).not.be.ok
          should(success).be.true

          instance.ttl(function (err, ttl) {
            should(err).not.be.ok
            should(ttl).be.greaterThan(ttl - 5).and.lessThan(ttl + 1)

            next()
          })
        })
      })
    })

    it('should set an expiration using a date', function (next) {
      var fname = 'Hello world'
      var lname = 'Test'

      TestModel.create({
        fname: fname,
        lname: lname
      }, function (err, instance) {
        should(err).not.be.ok
        should(instance).be.an.Object
        should(instance.getPrimaryKey()).be.a.String
        should(instance.fname).equal(fname)
        should(instance.lname).equal(lname)

        var ttl = 1000 * 60 * 60

        instance.expireAt(new Date(Date.now() + ttl), function (err, success) {
          should(err).not.be.ok
          should(success).be.true

          instance.ttl(function (err, ttl) {
            should(err).not.be.ok
            should(ttl).be.greaterThan(ttl - 5).and.lessThan(ttl + 1)

            next()
          })
        })
      })
    })
  })

  describe('#persist', function () {
    it('should clear an expiration', function (next) {
      var fname = 'Hello world'
      var lname = 'Test'

      TestModel.create({
        fname: fname,
        lname: lname
      }, function (err, instance) {
        should(err).not.be.ok
        should(instance).be.an.Object
        should(instance.getPrimaryKey()).be.a.String
        should(instance.fname).equal(fname)
        should(instance.lname).equal(lname)

        instance.expire(60, function (err, success) {
          should(err).not.be.ok
          should(success).be.true

          instance.ttl(function (err, ttl) {
            should(err).not.be.ok
            should(ttl).be.greaterThan(50).and.lessThan(61)

            instance.persist(function (err, success) {
              should(err).not.be.ok
              should(success).be.true

              instance.ttl(function (err, ttl) {
                should(err).not.be.ok
                should(ttl).eql(-1)

                next()
              })
            })
          })
        })
      })
    })
  })

  describe('#ids', function () {
    it('should retrieve ids for a Model', function (next) {
      var fname = 'Hello world'
      var lname = 'Test'

      TestModel.create({
        fname: fname,
        lname: lname
      }, function (err, instance) {
        should(err).not.be.ok
        should(instance).be.an.Object
        should(instance.getPrimaryKey()).be.a.String
        should(instance.fname).equal(fname)
        should(instance.lname).equal(lname)

        instance.ids(function (err, ids) {
          should(err).not.be.ok
          should(ids).be.ok
          should(ids).be.an.Array
          should(ids.length).eql(1)
          should(ids).containEql(instance.getPrimaryKey())

          next()
        })
      })
    })

    it('should retrieve a given number of ids for a Model', function (next) {
      var fname = 'Hello world'
      var lname = 'Test'

      TestModel.create({
        fname: fname,
        lname: lname
      }, function (err, instance1) {
        should(err).not.be.ok
        should(instance1).be.an.Object
        should(instance1.getPrimaryKey()).be.a.String
        should(instance1.fname).equal(fname)
        should(instance1.lname).equal(lname)

        TestModel.create({
          fname: fname,
          lname: lname
        }, function (err, instance2) {
          should(err).not.be.ok
          should(instance2).be.an.Object
          should(instance2.getPrimaryKey()).be.a.String
          should(instance2.fname).equal(fname)
          should(instance2.lname).equal(lname)

          instance1.ids(function (err, ids) {
            should(err).not.be.ok
            should(ids).be.ok
            should(ids).be.an.Array
            should(ids.length).eql(2)
            should(ids).containEql(instance1.getPrimaryKey())
            should(ids).containEql(instance2.getPrimaryKey())

            instance2.ids(1, function (err, ids) {
              should(err).not.be.ok
              should(ids).be.ok
              should(ids).be.an.Array
              should(ids.length).eql(1)

              next()
            })
          })
        })
      })
    })
  })

  afterEach(function (next) {
    TestModel.deleteAll(function (err) {
      if (err) {
        return next(err)
      }
      TestModel.getConnector().client.flushdb(next)
    })
  })
})
