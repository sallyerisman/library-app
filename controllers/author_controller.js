/*  ***HTML requests for authors*** */

const models = require('../models');

// Get all authors
const index = async (req, res) => {
	try {
		const all_authors = await models.Author.fetchAll();

		res.send({
			status: 'success',
			data: {
				authors: all_authors
			}
		});
	}

	catch (error) {
		res.status(500).send({
			status: "error",
			message: "Sorry, database threw an error when trying to get all authors.",
		})
	}

};

// Get specific author
const show = async (req, res) => {
	try {
		const author = await new models.Author({ id: req.params.authorId}).fetch({ withRelated: "books" });

		if (author) {
			res.send({
				status: 'success',
				data: {
					author,
				}
			});
		} else {
			res.status(404).send({
				status: "fail",
				message: `Sorry, database threw an error when trying to find the author with id ${req.params.authorId}.`,
			})
		}
	}

	catch {
		res.status(500).send({
			status: "fail",
			message: `Sorry, database threw an error when trying to find this particular author.`,
		})
	}

};

module.exports = {
	index,
	show,
}
