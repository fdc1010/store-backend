const bcrypt = require('bcrypt');

const SALT_ROUNDS = 8;

class BcryptHash {
  static check(plain, hash) {
    return bcrypt.compareSync(plain, hash.replace(/^\$2y(.+)$/i, '$2a$1'));
  }

  static hash(plain) {
    const salt = bcrypt.genSaltSync(SALT_ROUNDS, 'a');
    return bcrypt.hashSync(plain, salt).replace('$2a$', '$2y$');
  }

}

module.exports = BcryptHash;
