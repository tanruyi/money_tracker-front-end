/** @format */

import React, { useState } from "react";
import styles from "./Budget.module.css";
import { useCurrentUserContext } from "../context/currentUserContext";
import { intToCurrencyString } from "../utilities/utilityFunctions";
import BudgetDashboard from "../components/BudgetDashboard";
import BudgetRow from "../components/BudgetRow";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import CustomParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
dayjs.extend(isBetween, CustomParseFormat);
dayjs.extend(isSameOrBefore, isSameOrAfter);

const Budget = () => {
	/* ====================================================
    // Context
    ==================================================== */

	const { budgets } = useCurrentUserContext();

	/* ====================================================
    // Current period to be displayed to be displayed
    ==================================================== */
	const [currentPeriodView, setCurrentPeriodView] = useState<"Monthly" | "YTD">("Monthly");

	/* ====================================================
    // Handle Clicks on Monthly or YTD Tabs
    ==================================================== */
	const handleMonthlyClick = () => {
		setCurrentPeriodView("Monthly");
	};

	const handleYTDClick = () => {
		setCurrentPeriodView("YTD");
	};

	/* ====================================================
    // Date for display
    ==================================================== */

	const [dateToDisplay, setDateToDisplay] = useState(dayjs());

	const handleBackArrow = () => {
		if (currentPeriodView === "Monthly") {
			setDateToDisplay((prevState) => prevState.subtract(1, "month"));
		} else if (currentPeriodView === "YTD") {
			setDateToDisplay((prevState) => prevState.subtract(1, "year"));
		}
	};

	const handleForwardArrow = () => {
		if (currentPeriodView === "Monthly") {
			setDateToDisplay((prevState) => prevState.add(1, "month"));
		} else if (currentPeriodView === "YTD") {
			setDateToDisplay((prevState) => prevState.add(1, "year"));
		}
	};

	/* ====================================================
    // Filtered Budget Income Records to Display
    ==================================================== */

	// Filter for income records
	const budgetIncomeRecords = budgets.filter((record) => record.recordId === 1);

	// Filter budget income records to those within period we want to display, start mth & end mth inclusive
	let budgetIncomeRecordsToDisplay = budgetIncomeRecords.filter((record) => {
		return dateToDisplay.isBetween(dayjs(record.startMonth), dayjs(record.endMonth), "month", "[]");
	});

	/* ====================================================
    // Total Income for Displayed Period
    ==================================================== */

	let totalIncome = 0;

	// Calculate the total for the mth
	if (currentPeriodView === "Monthly") {
		for (let i = 0; i < budgetIncomeRecordsToDisplay.length; i++) {
			totalIncome += Number(budgetIncomeRecordsToDisplay[i].amount);
		}
		// Calculate total for YTD
	} else if (currentPeriodView === "YTD") {
		for (let i = 0; i < budgetIncomeRecordsToDisplay.length; i++) {
			// Get the start & end mth of the record in dayjs
			const startMth = dayjs(budgetIncomeRecordsToDisplay[i].startMonth);
			const endMth = dayjs(budgetIncomeRecordsToDisplay[i].endMonth);

			// Get the yr of display in string
			const currentYr = dateToDisplay.format("YYYY");

			// Get the 1 Jan & 31 Dec of yr of display in dayjs
			const startofYr = dayjs(`${currentYr}-01-01`, "YYYY-MM-DD");
			const endofYr = dayjs(`${currentYr}-12-31`, "YYYY-MM-DD");

			let noOfMonths = 0;

			// Get boolean whether start & end mth are within the year of display
			const startMthWithinYr = startMth.isBetween(startofYr, endofYr, "month", "[]");
			const endMthWithinYr = endMth.isBetween(startofYr, endofYr, "month", "[]");

			// Get the number of months b/w start & end mth within yr of display
			if (startMthWithinYr && endMthWithinYr) {
				noOfMonths = endMth.diff(startMth, "month") + 1;
			} else if (!startMthWithinYr && endMthWithinYr) {
				noOfMonths = endMth.diff(startofYr, "month") + 1;
			} else if (!startMthWithinYr && !endMthWithinYr) {
				noOfMonths = endofYr.diff(startofYr, "month") + 1;
			} else if (startMthWithinYr && !endMthWithinYr) {
				noOfMonths = endofYr.diff(startMth, "month") + 1;
			}

			totalIncome += noOfMonths * Number(budgetIncomeRecordsToDisplay[i].amount);
		}
	}

	// this will be displayed in HTML
	const totalIncomeString = `$${intToCurrencyString(totalIncome)}`;

	/* ====================================================
    // Income Rows to Display
    ==================================================== */

	const budgetIncomeRows = budgetIncomeRecordsToDisplay.map((record, index) => <BudgetRow key={index} record={record} type={"Income"} />);

	/* ====================================================
	// Filtered Expense Records to Display
	==================================================== */
	// Filter for expense records
	const budgetExpenseRecords = budgets.filter((record) => record.recordId === 2);

	// Filter budget expense records to those within period we want to display
	const budgetExpenseRecordsToDisplay = budgetExpenseRecords.filter((record) => {
		return dateToDisplay.isBetween(dayjs(record.startMonth), dayjs(record.endMonth), "month", "[]");
	});

	/* ====================================================
	// Total Expenses for Displayed Period
	==================================================== */

	let totalExpenses = 0;

	// Calculate the total for the mth
	if (currentPeriodView === "Monthly") {
		for (let i = 0; i < budgetExpenseRecordsToDisplay.length; i++) {
			totalExpenses += Number(budgetExpenseRecordsToDisplay[i].amount);
		}
	} else if (currentPeriodView === "YTD") {
		for (let i = 0; i < budgetExpenseRecordsToDisplay.length; i++) {
			// Get the start & end mth of the record in dayjs
			const startMth = dayjs(budgetExpenseRecordsToDisplay[i].startMonth);
			const endMth = dayjs(budgetExpenseRecordsToDisplay[i].endMonth);

			// Get the yr of display in string
			const currentYr = dateToDisplay.format("YYYY");

			// Get the 1 Jan & 31 Dec of yr of display in dayjs
			const startofYr = dayjs(`${currentYr}-01-01`, "YYYY-MM-DD");
			const endofYr = dayjs(`${currentYr}-12-31`, "YYYY-MM-DD");

			let noOfMonths = 0;

			// Get boolean whether start & end mth are within the year of display
			const startMthWithinYr = startMth.isBetween(startofYr, endofYr, "month", "[]");
			const endMthWithinYr = endMth.isBetween(startofYr, endofYr, "month", "[]");

			// Get the number of months b/w start & end mth within yr of display
			if (startMthWithinYr && endMthWithinYr) {
				noOfMonths = endMth.diff(startMth, "month") + 1;
			} else if (!startMthWithinYr && endMthWithinYr) {
				noOfMonths = endMth.diff(startofYr, "month") + 1;
			} else if (!startMthWithinYr && !endMthWithinYr) {
				noOfMonths = endofYr.diff(startofYr, "month") + 1;
			} else if (startMthWithinYr && !endMthWithinYr) {
				noOfMonths = endofYr.diff(startMth, "month") + 1;
			}

			totalExpenses += noOfMonths * Number(budgetExpenseRecordsToDisplay[i].amount);
		}
	}

	// this will be displayed in HTML
	const totalExpensesString = `-$${intToCurrencyString(totalExpenses)}`;

	/* ====================================================
	// Expense Rows to Display
	==================================================== */

	const expenseRecordRows = budgetExpenseRecordsToDisplay.map((record, index) => <BudgetRow key={index} record={record} type={"Expenses"} />);

	return (
		<div>
			{/* Dashboard */}
			<BudgetDashboard
				currentPeriodView={currentPeriodView}
				dateToDisplay={dateToDisplay}
				handleBackArrow={handleBackArrow}
				handleForwardArrow={handleForwardArrow}
				totalIncome={totalIncome}
				totalExpenses={totalExpenses}
			/>
			{/* Monthly or YTD Tab */}
			<div className={styles.tabContainer}>
				<div className={currentPeriodView === "Monthly" ? styles.tabActive : styles.tab} onClick={handleMonthlyClick}>
					<h1>Monthly</h1>
				</div>
				<div className={currentPeriodView === "YTD" ? styles.tabActive : styles.tab} onClick={handleYTDClick}>
					<h1>YTD</h1>
				</div>
			</div>
			{/* Budget Records */}
			<div className={styles.budgetRowsContainer}>
				<div className={styles.budgetRowsColumn}>
					<div className={styles.header}>
						<h1>Income</h1>
						<h1>{totalIncomeString}</h1>
					</div>
					{budgetIncomeRows}
				</div>
				<div className={styles.budgetRowsColumn}>
					<div className={styles.header}>
						<h1>Expenses</h1>
						<h1>{totalExpensesString}</h1>
					</div>
					{expenseRecordRows}
				</div>
			</div>
		</div>
	);
};

export default Budget;
