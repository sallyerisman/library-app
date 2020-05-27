/*  ***HTML requests for books*** */

const models = require('../models');

// Get all books
const index = async (req, res) => {
	try {
		const all_books = await models.Book.fetchAll();

		res.send({
			status: 'success',
			data: {
				books: all_books
			}
		});
	}

	catch {
		res.status(500).send({
			status: "error",
			message: "Sorry, database threw an error when trying to get all books.",
		})
	}

};

// Get specific book
const show = async (req, res) => {
	try {
		const book = await models.Book.fetchById(req.params.bookId, { withRelated: ["author"] });

		if (book) {
			res.send({
				status: 'success',
				data: {
					book,
				}
			});
		} else {
			res.status(404).send({
				status: "fail",
				message: `Sorry, database threw an error when trying to book with id ${req.params.bookId}.`,
			})
		}

	}

	catch {
		res.status(500).send({
			status: "error",
			message: `Sorry, database threw an error when trying to find this particular book.`,
		})
	}

};

module.exports = {
	index,
	show,
}
