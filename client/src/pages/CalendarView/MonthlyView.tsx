/** @format */

import React, { useState } from "react";
import styles from "./View.module.css";
import { useCurrentUserContext } from "../../context/currentUserContext";
import dayjs from "dayjs";
import { intToCurrencyString } from "../../utilities/utilityFunctions";
import IncomeExpenseDashboard from "../../components/IncomeExpenseDashboard";
import IncomeExpenseRow from "../../components/IncomeExpenseRow";

/* ====================================================
// Type Declaration
==================================================== */

interface MonthlyViewProps {
	currentViewPage: "Daily" | "Weekly" | "Monthly" | "YTD";
}

const MonthlyView = ({ currentViewPage }: MonthlyViewProps) => {
	/* ====================================================
    // Context
    ==================================================== */

	const { incomeRecords, expenseRecords } = useCurrentUserContext();

	/* ====================================================
    // Income or expense to be displayed
    ==================================================== */
	const [displayRecord, setDisplayRecord] = useState<"Income" | "Expenses">("Income");

	/* ====================================================
    // Date for display
    ==================================================== */

	const [dateToDisplay, setDateToDisplay] = useState(dayjs());

	const handleBackArrow = () => {
		setDateToDisplay((prevState) => prevState.subtract(1, "month"));
	};

	const handleForwardArrow = () => {
		setDateToDisplay((prevState) => prevState.add(1, "month"));
	};

	/* ====================================================
    // Filtered Income Records for Month to Display
    ==================================================== */

	// Filter income records to those with mth & yr we want to display
	let incomeRecordsToDisplay = incomeRecords.filter((record) => {
		const dateToCompare = dayjs(record.date);

		return dateToDisplay.isSame(dateToCompare, "month");
	});

	/* ====================================================
    // Total Income for Displayed Month
    ==================================================== */

	let totalIncome = 0;

	for (let i = 0; i < incomeRecordsToDisplay.length; i++) {
		totalIncome += Number(incomeRecordsToDisplay[i].amount);
	}

	// this will be displayed in HTML
	const totalIncomeString = intToCurrencyString(totalIncome);

	/* ====================================================
    // List of Dates with Income Records for Displayed Month
    ==================================================== */

	const datesWithIncomeRecordsSet = new Set();

	for (let i = 0; i < incomeRecordsToDisplay.length; i++) {
		datesWithIncomeRecordsSet.add(incomeRecordsToDisplay[i].date);
	}

	const datesWithIncomeRecords = Array.from(datesWithIncomeRecordsSet);

	/* ====================================================
    // Income Rows to Display
    ==================================================== */

	const incomeRecordRows = datesWithIncomeRecords.map((date, index) => <IncomeExpenseRow key={index} date={date} recordsToDisplay={incomeRecordsToDisplay} displayRecord={displayRecord} />);

	/* ====================================================
    // Filtered Expense Records for Month to Display
    ==================================================== */

	// Filter expense records to those with mth & yr we want to display
	let expenseRecordsToDisplay = expenseRecords.filter((record) => {
		const dateToCompare = dayjs(record.date);

		return dateToDisplay.isSame(dateToCompare, "month");
	});

	/* ====================================================
    // Total Expenses for Displayed Month
    ==================================================== */

	let totalExpenses = 0;

	if (expenseRecordsToDisplay.length > 0) {
		for (let i = 0; i < expenseRecordsToDisplay.length; i++) {
			totalExpenses += Number(expenseRecordsToDisplay[i].amount);
		}
	}

	const totalExpensesString = intToCurrencyString(totalExpenses);

	/* ====================================================
    // List of Dates with Expense Records for Displayed Month
    ==================================================== */

	const datesWithExpenseRecordsSet = new Set();

	for (let i = 0; i < expenseRecordsToDisplay.length; i++) {
		datesWithExpenseRecordsSet.add(expenseRecordsToDisplay[i].date);
	}

	const datesWithExpenseRecords = Array.from(datesWithExpenseRecordsSet);

	/* ====================================================
    // Expense Rows to Display
    ==================================================== */

	const expenseRecordRows = datesWithExpenseRecords.map((date, index) => <IncomeExpenseRow key={index} date={date} recordsToDisplay={expenseRecordsToDisplay} displayRecord={displayRecord} />);

	/* ====================================================
    // Handle Clicks on Income or Expense Tabs
    ==================================================== */
	const handleIncomeClick = () => {
		setDisplayRecord("Income");
	};

	const handleExpensesClick = () => {
		setDisplayRecord("Expenses");
	};

	return (
		<div>
			{/* Dashboard */}
			<IncomeExpenseDashboard
				currentViewPage={currentViewPage}
				dateToDisplay={dateToDisplay}
				totalIncomeString={totalIncomeString}
				totalExpensesString={totalExpensesString}
				handleBackArrow={handleBackArrow}
				handleForwardArrow={handleForwardArrow}
			/>
			{/* Income or Expense Tab */}
			<div className={styles.tabContainer}>
				<div className={displayRecord === "Income" ? styles.tabActive : styles.tab} onClick={handleIncomeClick}>
					<h1>Income</h1>
				</div>
				<div className={displayRecord === "Expenses" ? styles.tabActive : styles.tab} onClick={handleExpensesClick}>
					<h1>Expenses</h1>
				</div>
			</div>
			{/* Income or Expense Records */}

			<div className={styles.rowsContainer}>{displayRecord === "Income" ? incomeRecordRows : expenseRecordRows}</div>
		</div>
	);
};

export default MonthlyView;
