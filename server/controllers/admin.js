/**
 * /* ==============================================
 * // DEPENDENCIES
 * ==============================================
 *
 * @format
 */

// Import Prisma Client
const { PrismaClient } = require("@prisma/client");

// Instantiate PrismaClient
const prisma = new PrismaClient();

// Import bcrypt
const bcrypt = require("bcrypt");

// Import utility function
const { generateRandomPw } = require("../utilities/generateRandomPw");

/* =========================================
// ROUTES
========================================= */

// Reset password
const resetPw = async (req, res) => {
	// Checks whether userId is provided, if not throw error
	if (!req?.body?.userId) {
		return res.status(400).json({ status: "error", message: "userId required" });
	}

	try {
		// Generate new random pw using uuid
		const newPw = generateRandomPw(12);

		// Hash the password 12 times
		const hashedNewPw = await bcrypt.hash(newPw, 12);

		// Update hashed pw saved in db
		const updatedUser = await prisma.users.update({
			where: {
				id: req.body.userId,
			},
			data: {
				password: hashedNewPw,
			},
		});

		console.log(`Password reset for user id: ${updatedUser.id}`);
		res.json(newPw);
	} catch (err) {
		console.error("PATCH /admin/reset_pw", err);
		res.status(400).json({ status: "error", message: "an error has occurred" });
	}
};

// Deletes all data and account for a user
const deleteAccount = async (req, res) => {
	// Checks whether userId is provided, if not throw error
	if (!req?.body?.userId) {
		return res.status(400).json({ status: "error", message: "userId required" });
	}

	try {
		// Delete all data before deleting user, due to the tables being connected via foreign key
		const deletedExpenses = await prisma.expenses.deleteMany({
			where: {
				userId: req.body.userId,
			},
		});

		const deletedIncome = await prisma.income.deleteMany({
			where: {
				userId: req.body.userId,
			},
		});

		const deletedBudget = await prisma.budget.deleteMany({
			where: {
				userId: req.body.userId,
			},
		});

		const deletedCategories = await prisma.categories.deleteMany({
			where: {
				userId: req.body.userId,
			},
		});

		const deletedUser = await prisma.users.delete({
			where: {
				id: req.body.userId,
			},
		});

		console.log(`User account & data deleted for deletedUser id: ${deletedUser.id}`);
		res.json({ status: "success", message: "account deleted" });
	} catch (err) {
		console.error("DELETE /admin/delete_account", err);
		res.status(400).json({ status: "error", message: "an error has occurred" });
	}
};

/* =========================================
// EXPORTS
========================================= */
module.exports = {
	deleteAccount,
	resetPw,
};
