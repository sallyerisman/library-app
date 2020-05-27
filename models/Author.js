/* AUTHOR MODEL */

module.exports = (bookshelf) => {
	return bookshelf.model('Author', {
		tableName: 'authors',
		books() {
			return this.hasMany('Book');
		},
	});
}

