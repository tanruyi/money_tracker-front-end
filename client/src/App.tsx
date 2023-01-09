/** @format */

import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { useCurrentUserContext } from "./context/currentUserContext";
import "./App.css";
import Navbar from "./common/Navbar";
import Login from "./pages/Welcome";
import Settings from "./pages/Settings";
import Budget from "./pages/Budget";
import Analyse from "./pages/Analyse";
import Admin from "./pages/Admin";
import CalendarView from "./pages/CalendarView";
import Unauthorised from "./pages/Unauthorised";
import Missing from "./pages/Missing";
import Userbar from "./common/Userbar";

function App() {
	/* ====================================================
    // Context
    ==================================================== */
	const { currentUser } = useCurrentUserContext();

	/* ====================================================
    // HTML Components
    ==================================================== */

	const [currentViewPage, setCurrentViewPage] = useState<"Daily" | "Weekly" | "Monthly" | "YTD">("Monthly");

	const updateCurrentViewPage = (page: "Daily" | "Weekly" | "Monthly" | "YTD") => {
		setCurrentViewPage(page);
	};

	// Login page
	const defaultPages = (
		<Routes>
			<Route path="/" element={<Login />} />
			<Route path="/calendar" element={<Unauthorised />} />
			<Route path="/budget" element={<Unauthorised />} />
			<Route path="/analyse" element={<Unauthorised />} />
			<Route path="/settings" element={<Unauthorised />} />
			<Route path="/admin" element={<Unauthorised />} />

			{/* Catch all */}
			<Route path="/*" element={<Missing />} />
		</Routes>
	);

	// Pages available only after log in
	const mainPages = (
		<>
			<Navbar currentViewPage={currentViewPage} updateCurrentViewPage={updateCurrentViewPage} />
			<Routes>
				<Route path="/calendar" element={<CalendarView currentViewPage={currentViewPage} />} />
				<Route path="/budget" element={<Budget />} />
				<Route path="/analyse" element={<Analyse />} />
				<Route path="/settings" element={<Settings />} />

				{/* Admin page only for users with role admin */}
				<Route path="/admin" element={currentUser.role === "admin" ? <Admin /> : <Unauthorised />} />

				{/* Catch all */}
				<Route path="/*" element={<Missing />} />
			</Routes>{" "}
		</>
	);

	// Render log in page if user not logged in, otherwise render pages available after log in
	return (
        <div className="appContainer">
            {/* TODO: remove temp changes */}
			{/* {currentUser.id === 0 ? defaultPages : mainPages} */}
            <Navbar currentViewPage={currentViewPage} updateCurrentViewPage={updateCurrentViewPage} />
            <Userbar />
		</div>
	);
}

export default App;
