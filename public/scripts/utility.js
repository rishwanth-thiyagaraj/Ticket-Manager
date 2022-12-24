var tickets = [];
/**
 * Display the proper window after certain actions.
 * Example: Display the user home page after successful login by a user.
 *
 * @param {Element} active The section to be displayed.
 * @param {Element} inactive The section to be hidden.
 */
function redirectWindow(active, inactive) {
	inactive.classList.add("inactive");
	active.classList.remove("inactive");
}
/**
 * Get the element with the argument id.
 *
 * @param {string} id
 * @return {Element} HTML element with the given id.
 */
function getElement(id) {
	return document.getElementById(id);
}

/**
 * Fetch the data of the current user to update the contents of the page.
 *
 * @return {promise} Result of fetch i.e., If the data was fetched successfully or not.
 */
function getUserData() {
	let promise = new Promise((resolve, reject) => {
		fetch(`http://localhost:3333/userdata/?user=${currentUserName}`, {
			method: "GET",
		})
			.then((response) => resolve(response.json()))
			.catch((err) => {
				reject(err);
			});
	});
	return promise;
}

/**
 * Store the fetched data in a variable.
 * Update the tickets after storing the data.
 */
async function storeUserData() {
	let userData = await getUserData();
	UserData = JSON.parse(userData);
	if (currentUserName != "admin") updateTickets({ status: filterOption.value });
	else
		updateTickets({
			status: filterByStatus.value,
			priority: filterByPriority.value,
			urgency: filterByUrgency.value,
			month: filterByMonth.value,
		});
}

/**
 * Display the tickets raised by the user by accessing the data retrieved from user's file.
 * Display the tickets according to the filter options the user has selected.
 * Display "No tickets yet" when the ticket list is empty.
 *
 * @param {Array} filterTickets Array of tickets raised by the user.
 */
function updateTickets(filterTickets) {
	let currentTicketContainer,
		closed = 0,
		open = 0,
		closedStat = getElement("closed-tickets"),
		openStat = getElement("open-tickets"),
		totalStat = getElement("total-tickets");
	tickets = UserData["tickets"].slice();
	if (Object.keys(filterTickets).length == 1) {
		if (filterTickets.status != "all") {
			tickets = tickets.filter((element) => {
				return element["status"] == filterTickets.status;
			});
		}
		currentTicketContainer = ticketContainer;
	} else {
		if (filterTickets.status != "all") {
			tickets = tickets.filter((element) => {
				return element["status"] == filterTickets.status;
			});
		}
		if (filterTickets.priority != "all") {
			tickets = tickets.filter((element) => {
				return element["priority"] == filterTickets.priority;
			});
		}
		if (filterTickets.urgency != "all") {
			tickets = tickets.filter((element) => {
				return element["urgency"] == filterTickets.urgency;
			});
		}
		if (filterTickets.month != "all") {
			tickets = tickets.filter((element) => {
				let month = new Date(element.date).getMonth();
				return month == filterTickets.month;
			});
		}
		currentTicketContainer = adminTicketContainer;
	}
	currentTicketContainer.replaceChildren();
	if (tickets.length != 0) {
		for (let i = 0; i < tickets.length; i++) {
			let ticket = document.createElement("div"),
				urgency = document.createElement("div"),
				date = document.createElement("div"),
				subject = document.createElement("div"),
				priority = document.createElement("div"),
				ticketTopSection = document.createElement("div"),
				ticketBottomSection = document.createElement("div"),
				username = document.createElement("h3");
			priority.className = "priority";
			ticket.className = "ticket";
			ticketTopSection.className = "ticket-top";
			ticketBottomSection.className = "ticket-bottom";
			urgency.className = "urgency";
			date.className = "date";
			subject.className = "subject";
			username.innerText = tickets[i].name;
			urgency.innerText = tickets[i].urgency;
			subject.innerText = tickets[i].subject;
			priority.innerText = tickets[i].priority;
			date.innerText = `${parseInt(new Date(tickets[i].date).getDate())}/${
				parseInt(new Date(tickets[i].date).getMonth()) + 1
			}`;
			ticketTopSection.appendChild(urgency);
			ticketTopSection.appendChild(priority);
			ticketBottomSection.appendChild(subject);
			ticketBottomSection.appendChild(date);
			ticket.appendChild(username);
			ticket.appendChild(ticketTopSection);
			ticket.appendChild(ticketBottomSection);
			ticket.id = i;
			if (tickets[i].status == "closed") closed++;
			else open++;
			ticket.classList.add(tickets[i].status);
			currentTicketContainer.appendChild(ticket);
			currentTicketContainer.scrollTop = -currentTicketContainer.scrollHeight;
		}
		closedStat.innerText = closed;
		openStat.innerText = open;
		totalStat.innerText = tickets.length;
	} else {
		currentTicketContainer.innerHTML = `<h3>No tickets yet</h3>`;
		closedStat.innerText = "0";
		openStat.innerText = "0";
		totalStat.innerText = "0";
	}
}

/**
 * View the contents of the ticket upon click.
 * Display the name of the user, subject, priority, urgency and
 * description of the particular ticket that was clicked.
 *
 * @param {String} index id of the ticket node that was clicked.
 */
function displayTicket(index) {
	if (currentUserName == "admin") {
		redirectWindow(viewTicketWindow, adminPageWindow);
		let close = getElement("close-ticket-button"),
			open = getElement("open-ticket-button");
		close.classList.remove("inactive");
		open.classList.remove("inactive");
	} else redirectWindow(viewTicketWindow, userPageWindow);
	selectedTicketId = tickets[index].ticketNo;
	index = parseInt(index);
	let name = getElement("view-name"),
		subject = getElement("view-subject"),
		urgency = getElement("view-urgency"),
		priority = getElement("view-priority"),
		description = getElement("view-description");
	name.value = tickets[index].name;
	subject.value = tickets[index].subject;
	priority.value = tickets[index].priority;
	urgency.value = tickets[index].urgency;
	description.innerHTML = tickets[index].description;
}
