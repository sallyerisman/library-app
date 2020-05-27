/* USER MODEL */
const bcrypt = require("bcryptjs");

module.exports = (bookshelf) => {
	return bookshelf.model('User', {
		hasTimestamps: true,
		tableName: 'users',
		books() {
			return this.belongsToMany('Book');
		}
	}, {
		hashSaltRounds: 10,

		fetchById(id, options) {
			return new this({ id }).fetch(options)
		},

		login: async function(username, password) {
			// Check if user exists
			const  user = await new this({ username }).fetch({ require: false });
			if (!user) {
				return false;
			}

			// Get hashed password from db
			const hash = user.get('password');

			// Generate hash of cleartext password
			// Compare new hash with hash from db
			const result = await bcrypt.compare(password, hash);

			// Return user if hashes match, otherwise false
			return (result)
				? user
				: false;

		}
	});
};


