const login = getElement("login-form"),
	register = getElement("register-form"),
	signupRedirectButton = getElement("signup-redirect-button"),
	loginRedirectButton = getElement("login-redirect-button"),
	loginWindow = getElement("login-window"),
	logoutButton = getElement("logout-button"),
	adminLogoutButton = getElement("admin-logout-button"),
	registerWindow = getElement("register-window"),
	userPageWindow = getElement("user-home-page"),
	adminPageWindow = getElement("admin-home-page"),
	filterOption = getElement("filter-options"),
	filterByStatus = getElement("filter-by-status"),
	filterByPriority = getElement("filter-by-priority"),
	filterByUrgency = getElement("filter-by-urgency"),
	filterByMonth = getElement("filter-by-month"),
	closeRaiseTicketButton = getElement("close-raise-window"),
	closeViewButton = getElement("close-view-window"),
	raiseTicketButton = getElement("raise-ticket-button"),
	raiseTicketWindow = getElement("raise-ticket-window"),
	raiseTicketForm = getElement("raise-ticket-form"),
	ticketContainer = getElement("ticket-container"),
	adminTicketContainer = getElement("admin-ticket-container"),
	viewTicketWindow = getElement("view-ticket-window"),
	closeTicketButton = getElement("close-ticket-button"),
	openTicketButton = getElement("open-ticket-button");
var currentUserName = "",
	UserData = {},
	selectedTicketId;

/*
 * Open the raise ticket window when user clicks "Raise Ticket" button.
 *
 */
raiseTicketButton.addEventListener("click", (e) => {
	let userName = getElement("name");
	userName.value = currentUserName;
	e.preventDefault();
	redirectWindow(raiseTicketWindow, userPageWindow);
});

/*
 * Close the raise ticket window when user close button.
 * Change the values of fields to default
 */
closeRaiseTicketButton.addEventListener("click", () => {
	let priority = getElement("priority"),
		urgency = getElement("urgency"),
		subject = getElement("subject"),
		description = getElement("description");
	redirectWindow(userPageWindow, raiseTicketWindow);
	subject.value = description.value = "";
	priority.value = "Low";
	urgency.value = "Less urgent";
});

/**
 * Close view a ticket window after viewing the ticket.
 *
 */
closeViewButton.addEventListener("click", () => {
	if (currentUserName == "admin")
		redirectWindow(adminPageWindow, viewTicketWindow);
	else redirectWindow(userPageWindow, viewTicketWindow);
});

/*
 * Update the tickets based on the filter option selected.
 */
filterOption.addEventListener("change", (e) => {
	e.preventDefault();
	storeUserData();
});

/*
 * Update the tickets based on the filter option selected.
 */
document.querySelectorAll(".user-actions").forEach((item) => {
	item.addEventListener("change", (e) => {
		e.preventDefault();
		storeUserData();
	});
});

/**
 * Redirect to register user window when sign up button is clicked in login window.
 *
 * */
signupRedirectButton.addEventListener("click", (e) => {
	e.preventDefault();
	redirectWindow(registerWindow, loginWindow);
	getElement("new-username").value = "";
	getElement("new-password").value = "";
	getElement("confirm-password").value = "";
});

/**
 * Redirect to log in window when login button is clicked in register window.
 *
 * */
loginRedirectButton.addEventListener("click", (e) => {
	e.preventDefault();
	redirectWindow(loginWindow, registerWindow);
	getElement("username").value = "";
	getElement("password").value = "";
});

/**
 * Redirect to user home page window when a user successfully logs in with right credentials.
 * The credentials are checked with the data in the server.
 *
 * */
login.addEventListener("submit", (e) => {
	const username = getElement("username"),
		password = getElement("password");
	e.preventDefault();
	fetch("http://localhost:3333/login", {
		method: "POST",
		headers: {
			Accept: "application/json, text/plain,*/*",
			"Content-type": "application/json",
		},
		body: JSON.stringify({
			username: username.value,
			password: password.value,
		}),
	})
		.then((data) => {
			if (data.status == 410) {
				alert("Invalid password");
			} else if (data.status == 411) {
				alert("User not found.\nPlease signup to continue ");
			} else {
				alert("Login successful");
				currentUserName = username.value;
				if (currentUserName != "admin") {
					redirectWindow(userPageWindow, loginWindow);
					let close = getElement("close-ticket-button"),
						open = getElement("open-ticket-button");
					if (!close.classList.contains("inactive")) {
						close.classList.add("inactive");
						open.classList.add("inactive");
					}
				} else {
					redirectWindow(adminPageWindow, loginWindow);
				}
				let currentUser = getElement("current-user");
				currentUser.innerText = currentUserName; //Display the name of the current user
				storeUserData();
			}
		})
		.catch((err) => {
			alert("Something Went Wrong");
		});
});

/**
 * Send the data given by the user to server as a request to store the data.
 * Redirect the user to login window.
 *
 * */
register.addEventListener("submit", (e) => {
	e.preventDefault();
	let newUsername = getElement("new-username"),
		newPassword = getElement("new-password"),
		confirmPassword = getElement("confirm-password");
	if (newPassword.value !== confirmPassword.value) {
		alert("Passwords Do Not Match");
	} else {
		fetch("http://localhost:3333/register", {
			method: "POST",
			headers: {
				Accept: "application/json, text/plain,*/*",
				"Content-type": "application/json",
			},
			body: JSON.stringify({
				newusername: newUsername.value,
				newpassword: newPassword.value,
				confirm: confirmPassword.value,
			}),
		})
			.then((data) => {
				if (data.status == 412) {
					alert("Invalid Username");
				} else if (data.status == 413) {
					alert("Existing user");
				} else {
					alert("Registration successful");
					redirectWindow(loginWindow, registerWindow);
					newUsername.value = "";
					newPassword.value = "";
					confirmPassword.value = "";
				}
			})
			.catch((err) => {
				alert("Something Went Wrong");
				redirectWindow(loginWindow, registerWindow);
			});
	}
});

/**
 * Raise tickets to address the problem in hand.
 * Navigate back to home page when user submits a ticket.
 * Send the ticket details to server to update the files of the user and admin.
 *
 * */
raiseTicketForm.addEventListener("submit", (e) => {
	e.preventDefault();
	redirectWindow(userPageWindow, raiseTicketWindow);
	let date = new Date();
	let name = getElement("name"),
		priority = getElement("priority"),
		urgency = getElement("urgency"),
		subject = getElement("subject"),
		description = getElement("description"),
		status = "open";
	fetch("http://localhost:3333/raiseticket", {
		method: "POST",
		headers: {
			Accept: "application/json, text/plain,*/*",
			"Content-type": "application/json",
		},
		body: JSON.stringify({
			name: name.value,
			priority: priority.value,
			urgency: urgency.value,
			subject: subject.value,
			description: description.value,
			status: status,
			date: date,
			ticketNo: 0,
		}),
	})
		.then((data) => {
			if (!data.ok) {
				alert("Something went wrong");
			} else {
				alert("Ticket raised successfully");
				storeUserData();
				name.value = subject.value = description.value = "";
				priority.value = "Low";
				urgency.value = "Less urgent";
			}
		})
		.catch((err) => {
			alert("Something went wrong");
		});
});

/**
 * Find the id of the ticket that was clicked by user.
 *
 * @param {Event} event The click event that triggers this method.
 */
const selectTicket = (event) => {
	if (
		event.target.className == "ticket open" ||
		event.target.className == "ticket closed"
	) {
		displayTicket(event.target.id);
	} else if (
		event.target.parentNode.className == "ticket-top" ||
		event.target.parentNode.className == "ticket-bottom"
	) {
		displayTicket(event.target.parentNode.parentNode.id);
	} else if (
		event.target.parentNode.className == "ticket closed" ||
		event.target.parentNode.className == "ticket open"
	) {
		displayTicket(event.target.parentNode.id);
	}
};

/**
 * Run selectTicket method whenever a ticket in the ticket container is clicked.
 */
ticketContainer.addEventListener("click", selectTicket);
adminTicketContainer.addEventListener("click", selectTicket);

/**
 * Redirect to login window when logout button is clicked and remove stored data of last user.
 *
 * */
logoutButton.addEventListener("click", () => {
	redirectWindow(loginWindow, userPageWindow);
	currentUserName = "";
	UserData = {};
	getElement("username").value = "";
	getElement("password").value = "";
	filterOption.value = "all";
});

/**
 * Redirect to login window when logout button is clicked and remove stored data of last user.
 *
 * */
adminLogoutButton.addEventListener("click", () => {
	redirectWindow(loginWindow, adminPageWindow);
	currentUserName = "";
	UserData = {};
	getElement("username").value = "";
	getElement("password").value = "";
});

/**
 * Update the status of a ticket as closed when the admin clicks on Close Ticket button.
 * Navigate back to list of tickets after clicking Close Ticket button.
 *
 * */
closeTicketButton.addEventListener("click", (e) => {
	e.preventDefault();
	redirectWindow(adminPageWindow, viewTicketWindow);
	updateStatus(selectedTicketId, "closed");
});

/**
 * Update the status of a ticket as open when the admin clicks on Close Ticket button.
 * Navigate back to list of tickets after clicking Close Ticket button.
 *
 * */
openTicketButton.addEventListener("click", (e) => {
	e.preventDefault();
	redirectWindow(adminPageWindow, viewTicketWindow);
	updateStatus(selectedTicketId, "open");
});

/**
 * Send the ticketNo of the ticket whose status has to be updated to the server.
 *
 * @param {string} ticketNo Unique ticket number to identify tickets.
 * @param {string} status The status that is to be updated for the ticket.
 */
function updateStatus(ticketNo, status) {
	fetch("http://localhost:3333/changestatus", {
		method: "POST",
		headers: {
			Accept: "application/json, text/plain,*/*",
			"Content-type": "application/json",
		},
		body: JSON.stringify({
			ticketNo: ticketNo,
			status: status,
		}),
	})
		.then((data) => {
			if (!data.ok) {
				alert("Something went wrong");
			} else {
				alert("Status Updated successfully");
				storeUserData();
			}
		})
		.catch((err) => {
			alert("Something went wrong");
		});
}
