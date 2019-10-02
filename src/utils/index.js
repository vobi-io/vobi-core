var randomstring = require('randomstring')
var multer = require('multer')
var crypto = require('crypto')
var mime = require('mime')
var path = require('path')
var axios = require('axios')

var AUTH_HEADER = 'authorization'
var DEFAULT_TOKEN_BODY_FIELD = 'access_token'
var DEFAULT_TOKEN_QUERY_PARAM_NAME = 'access_token'

class Utils {
  compare (sort) {
    if (Object.keys(sort).length <= 0) {
      return () => true
    }
    const name = Object.keys(sort)[0]
    const desc = sort[name]

    return (a, b) => {
      if (typeof a[name] === 'string') {
        return desc === '-1'
          ? a[name].localeCompare(b[name])
          : !a[name].localeCompare(b[name])
      }

      return desc === '-1' ? a[name] < b[name] : a[name] > b[name]
    }
  }

  isObject (obj) {
    return typeof obj === 'object'
  }

  generateHash (password) {
    var bcrypt = require('bcrypt-nodejs')
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
  }

  generateRandomHash () {
    var bcrypt = require('bcrypt-nodejs')

    var randomText = crypto.randomBytes(16)
      .toString('hex')

    return bcrypt
      .hashSync(randomText, bcrypt.genSaltSync(5), null)
      .replace(/\+/g, '0') // replace '+' with '0'
      .replace(/\//g, '0') // replace '/' with '0';
      .replace(/\./g, '0') // replace '.' with '0';
  }

  /**
   * Generate Random password
   * @param {any} length of generated string
   * @returns {String} generated random string
   *
   * @memberOf Utils
   */
  generateRandomPassword (length) {
    return randomstring.generate(length)
  }

  /**
   * Generates AlphNumeric random string for object_codes
   * @returns {String} generated string with alphanumeric characters
   * @memberOf Utils
   */
  generateCode (length = 6) {
    return randomstring.generate({
      length,
      charset: 'alphanumeric',
      capitalization: 'uppercase'
    })
  }

  extractToken (req) {
    var token = null
    // Extract the jwt from the request
    // Try the header first
    if (req.headers[AUTH_HEADER]) token = req.headers[AUTH_HEADER]

    // If not in the header try the body
    if (!token && req.body) token = req.body[DEFAULT_TOKEN_BODY_FIELD]

    // if not in the body try query params
    if (!token) token = req.query[DEFAULT_TOKEN_QUERY_PARAM_NAME]

    return token
  }

  parseAuthHeader (hdrValue) {
    if (typeof hdrValue !== 'string') {
      return null
    }

    var re = /(\S+)\s+(\S+)/
    var matches = hdrValue.match(re)
    return matches && { scheme: matches[1], value: matches[2] }
  }

  /**
   * extracts file using multer
   * @param {Request} req request
   * @param {Response} res response
   * @param {string} what type of files should be upload ex: "images", "excel"
   * @returns {Promise<Express.Multer.File>} file
   */
  extractFiles (req, res, type, uploadDir) {
    const logoFormats = ['.jpg', '.png']
    const excelFormats = ['.xlsx', '.xls']
    const vcfFormats = ['.vcf']

    let ROOT_DIR = uploadDir
    if (type === 'logo') {
      ROOT_DIR = `${ROOT_DIR}/images`
    }

    return new Promise((resolve, reject) => {
      var storage = multer.diskStorage({
        destination: function(req, file, cb) {
          cb(null, ROOT_DIR)
        },
        filename: function(req, file, cb) {
          crypto.pseudoRandomBytes(16, (err, raw) => {
            if (err) {
              reject(err)
            }
            cb(
              null,
              raw.toString('hex') +
                Date.now() +
                '.' +
                (mime.extension(file.mimetype) ||
                  file.originalname.split('.').pop())
            )
          })
        }
      })
      let upload = multer({
        storage: storage,
        fileFilter: function(req, file, cb) {
          switch (type) {
            case 'logo':
              if (!logoFormats.includes(path.extname(file.originalname))) {
                return cb(new Error('Only formats .jpg .png are allowed!'))
              }
              cb(null, true)
              break
            case 'excel':
              if (!excelFormats.includes(path.extname(file.originalname))) {
                return cb(new Error('Only formats .xlsx .xls are allowed!'))
              }
              cb(null, true)
              break
            case 'vcf':
              if (!vcfFormats.includes(path.extname(file.originalname))) {
                return cb(new Error('Only formats .vcf are allowed!'))
              }
              cb(null, true)
              break
            default:
              cb(null, true)
          }
        }
      }).any()

      upload(req, res, err => {
        if (err) return reject(err)
        if (req.files.length === 0) return reject(`There is no files selected!`)
        resolve(req.files)
      })
    })
  }

  getAddressByIP (ip) {
    return axios.get(`http://ip-api.com/json/${ip}?lang=en`).then(data => data)
  }

  getAddressByIPByCordiantes (lat, long, key) {
    return axios
      // eslint-disable-next-line
      .get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${key}`)
      .then(result => {
        const { data } = result
        let country = ''
        let city = ''
        if (data.results[0].address_components[6]) {
          country = data.results[0].address_components[6].long_name
        }
        if (data.results[0].address_components[4]) {
          country = data.results[0].address_components[4].long_name
        }
        return { city, country }
      })
  }

  padToZeros (digit, pad = '000000') {
    let str = '' + digit
    return pad.substring(0, pad.length - str.length) + str
  }
}
module.exports = new Utils()
