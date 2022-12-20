const path = require('path');

class StrHelper {
  getFileExtension(filename) {
    return path.extname(filename);
  }

  slug(str) {
    return str
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '')
      ;
  }

  padNumber(number, digit = 4) {
    const str = number + "";
    let pad = "";
    for (let i = 0; i < digit; i++) {
      pad += "0";
    }
    return pad.substring(0, pad.length - str.length) + str
  }

  randomString(length = 16, options = {
    characters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    unique: false
  }) {
    let characters = options.characters.split('');
    let result = '';
    for (let i = 0; i < length; i++) {
      let index = Math.floor(Math.random() * characters.length);
      result += characters[index];
      if (options.unique) characters.splice(index, 1)
    }
    
    return result;
  }
  
}

module.exports = new StrHelper