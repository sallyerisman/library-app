/*  ***HTML requests for users*** */

const bcrypt = require("bcryptjs");

const { matchedData, validationResult } = require("express-validator");
const models = require('../models');


// Get all users
const index = async (req, res) => {
	try {
		const all_users = await models.User.fetchAll();

		res.send({
			status: 'success',
			data: {
				users: all_users
			}
		});
	}

	catch {
		res.status(500).send({
			status: "error",
			message: "Sorry, database threw an error when trying to get all users.",
		})
	}

};

// Show specific user
const show = async (req, res) => {

	try {
		const user = await new models.User({ id: req.params.userId}).fetch({ withRelated: "books" });

		if (!user) {
			res.status(404).send({
				status: "fail",
				data: 'User not found.',
			});
			return;
		}

		res.send({
			status: 'success',
			data: {
				user,
			}
		});
	}

	catch {
		res.status(500).send({
			status: "error",
			message: `Sorry, database threw an error when trying to find user.`,
		})
	}

};

// Create a new user
const store = async (req, res) => {
	// Find any validation errors in this request and wrap them in an object
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		res.status(422).send({
			status: 'fail',
			data: errors.array(),
		});
		return;
	}

	const validData = matchedData(req);

	// Generate a hash of "validData.password"
	try {
		validData.password = await bcrypt.hash(validData.password, models.User.hashSaltRounds);
		// hash.salt is returned from bcrypt.hash()
	}

	catch (error) {
		res.status(500).send({
			status: "error",
			message: "Error thrown when trying to hash the password."
		});
		throw error;
	}

	try {
		// Insert data into database
		const user = await new models.User(validData).save();

		if (!user) {
			res.status(500).send({
				status: "fail",
				message: 'Unexpected result when inserting user into database.',
			});
			return;
		}

		const newUser = await new models.User({ id: user.id}).fetch({ withRelated: "books" });

		res.send({
			status: 'success',
			data: {
				user: newUser,
			}
		});

	} catch (error) {
		res.status(500).send({
			status: "fail",
			message: "Sorry, database threw an error when trying to store a new user.",
		});
		throw error;
	}
};

// Update a specific user
const update = async (req, res) => {
	const userId = req.params.userId;

	const user = await new models.User({ id: userId }).fetch({ require: false });
	if (!user) {
		res.status(404).send({
			status: 'fail',
			data: 'User Not Found',
		});
		return;
	}

	// Find any validation errors and wrap them in an object
	const errors = validationResult(req);
	if (!errors.isEmpty()) {

		res.status(422).send({
			status: 'fail',
			data: errors.array(),
		});
		return;
	}

	const validData = matchedData(req);
	try {
		const updatedUser = await user.save(validData);

		res.send({
			status: 'success',
			data: {
				user: updatedUser,
			},
		});

	} catch (error) {
		res.status(500).send({
			status: 'error',
			message: 'Exception thrown in database when updating the user.',
		});
		throw error;
	}
}

// Delete a specific user
const destroy = async (req, res) => {
	const userId = req.params.userId;

	try {
		const user = await new models.User({ id: req.params.userId}).fetch();
		if (!user) {
			res.status(405).send({
				status: "fail",
				data: null,
				message: `No user with ID ${userId} to delete.`,
			});
			return;
		}

		user.destroy();

		res.send({
			status: 'success',
			data: null,
		});

	} catch (error) {
		res.status(500).send({
			status: "error",
			message: `Sorry, database threw an error when trying to destroy user with ID ${userId}.`,
		});
		throw error;
	}
};

module.exports = {
	index,
	show,
	store,
	update,
	destroy,
}


