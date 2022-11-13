/** @format */

import React, { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Budget, useCurrentUserContext } from "../context/currentUserContext";
import { updateBudgetAPI, deleteBudgetAPI } from "../apis/budget";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, OutlinedInput, Select, TextField, InputAdornment, Stack } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { Income, Category } from "../context/currentUserContext";

/* ====================================================
// Type Declaration
==================================================== */

interface newBudgetInputState {
	recordType: string;
	recordId: number;
	categoryName: string;
	categoryId: number;
	startMonth: any;
	endMonth: any;
	amount: string;
}

interface newBudgetData {
	categoryId: number;
	amount: number | undefined;
	recordId: number;
	startMonth: Dayjs;
	endMonth: Dayjs;
}

interface BudgetEditModalProps {
	openModal: boolean;
	handleClose: () => void;
	record: Budget;
	categoryRecord: Category;
	type: string;
}

const BudgetEditModal = ({ openModal, handleClose, record, categoryRecord, type }: BudgetEditModalProps) => {
	/* ====================================================
	// Context
	==================================================== */

	const { currentUserId, categories, refreshData } = useCurrentUserContext();

	/* ====================================================
    // Edit record modal
    ==================================================== */

	const [error, setError] = useState<any>();

	// Controls inputs
	const [newBudgetInput, setNewBudgetInput] = useState<newBudgetInputState>({
		recordType: type,
		recordId: categoryRecord.recordId,
		categoryName: categoryRecord.categoryName,
		categoryId: record.categoryId,
		startMonth: record.startMonth,
		endMonth: record.endMonth,
		amount: String(record.amount),
	});

	const handleRecordType = (e: any) => {
		setNewBudgetInput((prevState) => {
			return {
				...prevState,
				recordType: e.target.value,
			};
		});

		if (e.target.value === "Income") {
			setNewBudgetInput((prevState) => {
				return {
					...prevState,
					recordId: 1,
				};
			});
		} else if (e.target.value === "Expenses") {
			setNewBudgetInput((prevState) => {
				return {
					...prevState,
					recordId: 2,
				};
			});
		}
	};

	const handleCategoryName = (e: any) => {
		let categoryId: number;

		for (let i = 0; i < categories.length; i++) {
			if (categories[i].categoryName === e.target.value) {
				categoryId = categories[i].id;
				break;
			}
			continue;
		}

		setNewBudgetInput((prevState) => {
			return {
				...prevState,
				categoryName: e.target.value,
				categoryId: categoryId,
			};
		});
	};

	const handleStartMonth = (newDate: Dayjs | null) => {
		setNewBudgetInput((prevState) => {
			return {
				...prevState,
				startMonth: newDate,
			};
		});
	};

	const handleEndMonth = (newDate: Dayjs | null) => {
		setNewBudgetInput((prevState) => {
			return {
				...prevState,
				endMonth: newDate,
			};
		});
	};

	const handleAmount = (e: any) => {
		setNewBudgetInput((prevState) => {
			return {
				...prevState,
				amount: e.target.value,
			};
		});
	};

	// Runs on click of update button
	const handleUpdateBudget = async () => {
		const id = record.id;

		let data: newBudgetData = {
			categoryId: newBudgetInput.categoryId,
			amount: Number(newBudgetInput.amount),
			recordId: newBudgetInput.recordId,
			startMonth: newBudgetInput.startMonth,
			endMonth: newBudgetInput.endMonth,
		};

		if (data.categoryId || data.amount || data.recordId || data.startMonth || data.endMonth) {
			try {
				const response = await updateBudgetAPI(id, data);

				// Refreshes the data on page
				refreshData();

				// Close modal upon successful update
				handleClose();
			} catch (err) {
				if (typeof err === "string") {
					setError(err);
				} else if (err instanceof Error) {
					setError(err.message);
				}
			}
		}
	};

	const handleDeleteBudget = async () => {
		const requestBody = {
			data: {
				id: record.id,
			},
		};

		try {
			const response = await deleteBudgetAPI(requestBody);

			// Refreshes the data on page
			refreshData();

			// Close modal upon successful update
			handleClose();
		} catch (err) {
			if (typeof err === "string") {
				setError(err);
			} else if (err instanceof Error) {
				setError(err.message);
			}
		}
	};

	/* ====================================================
    // Filters the category names to display for selection in modal based on record type selected
    ==================================================== */

	const categoryNamesForSelection = categories.filter((category) => category.recordId === newBudgetInput.recordId);

	let categoryNamesToDisplay;

	if (categoryNamesForSelection.length > 0) {
		categoryNamesToDisplay = categoryNamesForSelection.map((category) => (
			<MenuItem value={category.categoryName} key={`categoryId${category.id}`}>
				{category.categoryName}
			</MenuItem>
		));
	} else {
		categoryNamesToDisplay = (
			<MenuItem value="" disabled>
				Please select a record type first
			</MenuItem>
		);
	}

	return (
		<Dialog open={openModal} fullWidth onClose={handleClose} sx={{ marginLeft: "auto", marginRight: "auto" }}>
			<DialogTitle>Create Category</DialogTitle>
			<DialogContent>
				<Box component="form" sx={{ marginTop: "1rem" }}>
					<Stack spacing={3}>
						{/* Dropdown for record type */}
						<FormControl>
							<InputLabel htmlFor="income-or-expense">Record Type</InputLabel>
							<Select value={newBudgetInput.recordType} onChange={handleRecordType} input={<OutlinedInput label="Record Type" id="income-or-expense" />}>
								<MenuItem value={"Income"}>Income</MenuItem>
								<MenuItem value={"Expenses"}>Expenses</MenuItem>
							</Select>
						</FormControl>
						{/* Dropdown for category name */}
						<FormControl>
							<InputLabel htmlFor="categoryName">Category Name</InputLabel>
							<Select value={newBudgetInput.categoryName} onChange={handleCategoryName} input={<OutlinedInput label="Category Name" id="categoryName" />}>
								{categoryNamesToDisplay}
							</Select>
						</FormControl>
						{/* Date picker */}
						<LocalizationProvider dateAdapter={AdapterDayjs}>
							<DesktopDatePicker
								label="Start Month"
								views={["month", "year"]}
								value={newBudgetInput.startMonth}
								onChange={handleStartMonth}
								renderInput={(params) => <TextField {...params} helperText={null} />}
							/>
							<DesktopDatePicker
								label="End Month"
								views={["month", "year"]}
								value={newBudgetInput.endMonth}
								onChange={handleEndMonth}
								renderInput={(params) => <TextField {...params} helperText={null} />}
							/>
						</LocalizationProvider>
						{/* Amount text field */}
						<FormControl>
							<InputLabel htmlFor="amount">Monthly Amount</InputLabel>
							<OutlinedInput
								id="amount"
								label="Monthly Amount"
								value={newBudgetInput.amount}
								onChange={handleAmount}
								startAdornment={<InputAdornment position="start">$</InputAdornment>}
							/>
						</FormControl>
					</Stack>
				</Box>
			</DialogContent>
			<DialogActions>
				<Button variant="contained" size="large" onClick={handleUpdateBudget}>
					Update
				</Button>
				<Button variant="contained" size="large" onClick={handleDeleteBudget}>
					Delete
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default BudgetEditModal;