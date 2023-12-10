// import { showTrips, handletrips } from "./trips.js";
// import { showLoginRegister, handleLoginRegister } from "./loginRegister.js";
// import { handleLogin } from "./login.js";
// import { handleAddEdit } from "./addEdit.js";
// import { handleRegister } from "./register.js";
// import moment from "moment";

// console.log(moment().date().toString());
document.addEventListener("DOMContentLoaded", () => {
  token = localStorage.getItem("token");
  message = document.getElementById("message");

  handleLoginRegister();
  handleLogin();
  handletrips();
  handleRegister();
  handleAddEdit();
  if (token) {
    showTrips();
  } else {
    showLoginRegister();
  }
});
let activeDiv = null;
export const setDiv = (newDiv) => {
  if (newDiv != activeDiv) {
    if (activeDiv) {
      activeDiv.style.display = "none";
    }
    newDiv.style.display = "block";
    activeDiv = newDiv;
  }
};

export let inputEnabled = true;
export const enableInput = (state) => {
  inputEnabled = state;
};

export let token = null;
export const setToken = (value) => {
  token = value;
  if (value) {
    localStorage.setItem("token", value);
  } else {
    localStorage.removeItem("token");
  }
};

export let message = null;

let tripsDiv = null;
let tripsTable = null;
let tripsTableHeader = null;

export const handletrips = () => {
  tripsDiv = document.getElementById("trips");
  const logoff = document.getElementById("logoff");
  const addtrip = document.getElementById("add-trip");
  tripsTable = document.getElementById("trips-table");
  tripsTableHeader = document.getElementById("trips-table-header");

  tripsDiv.addEventListener("click", (e) => {
    if (inputEnabled && e.target.nodeName === "BUTTON") {
      if (e.target === addtrip) {
        showAddEdit(null);
      } else if (e.target === logoff) {
        showLoginRegister();
      } else if (e.target === logoff) {
        setToken(null);

        message.textContent = "You have been logged off.";

        tripsTable.replaceChildren([tripsTableHeader]);

        showLoginRegister();
      } else if (e.target.classList.contains("editButton")) {
        message.textContent = "";
        showAddEdit(e.target.dataset.id);
      } else if (e.target.classList.contains("deleteButton")) {
        showDelete(e.target.dataset.id);
      }
    }
  });
};

export const showTrips = async () => {
  try {
    enableInput(false);

    const response = await fetch("/api/v1/trips", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    let children = [tripsTableHeader];

    if (response.status === 200) {
      if (data.count === 0) {
        tripsTable.replaceChildren(...children); // clear this for safety
      } else {
        for (let i = 0; i < data.trips.length; i++) {
          let rowEntry = document.createElement("tr");

          let editButton = `<td><button type="button" class="editButton" data-id=${data.trips[i]._id}>edit</button></td>`;
          let deleteButton = `<td><button type="button" class="deleteButton" data-id=${data.trips[i]._id}>delete</button></td>`;
          let rowHTML = `
            <td>${new Date(data.trips[i].date).toDateString()}</td>
            <td>${data.trips[i].from}</td>
            <td>${data.trips[i].to}</td>
            <div>${editButton}${deleteButton}</div>`;

          rowEntry.innerHTML = rowHTML;
          children.push(rowEntry);
        }
        tripsTable.replaceChildren(...children);
      }
    } else {
      message.textContent = data.msg;
    }
  } catch (err) {
    console.log(err);
    message.textContent = "A communication error occurred.";
  }
  enableInput(true);
  setDiv(tripsDiv);
};

let loginRegisterDiv = null;
export const handleLoginRegister = () => {
  loginRegisterDiv = document.getElementById("logon-register");
  const login = document.getElementById("logon");
  const register = document.getElementById("register");

  loginRegisterDiv.addEventListener("click", (e) => {
    if (inputEnabled && e.target.nodeName === "BUTTON") {
      if (e.target === login) {
        showLogin();
      } else if (e.target === register) {
        showRegister();
      }
    }
  });
};

export const showLoginRegister = () => {
  setDiv(loginRegisterDiv);
};

let loginDiv = null;
let email = null;
let password = null;

export const handleLogin = () => {
  loginDiv = document.getElementById("logon-div");
  email = document.getElementById("email");
  password = document.getElementById("password");
  const logonButton = document.getElementById("logon-button");
  const logonCancel = document.getElementById("logon-cancel");

  loginDiv.addEventListener("click", async (e) => {
    if (inputEnabled && e.target.nodeName === "BUTTON") {
      if (e.target === logonButton) {
        enableInput(false);

        try {
          const response = await fetch("/api/v1/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: email.value,
              password: password.value,
            }),
          });

          const data = await response.json();
          if (response.status === 200) {
            message.textContent = `Logon successful.  Welcome ${data.user.name}`;
            setToken(data.token);

            email.value = "";
            password.value = "";

            showTrips();
          } else {
            message.textContent = data.msg;
          }
        } catch (err) {
          console.error(err);
          message.textContent = "A communications error occurred.";
        }

        enableInput(true);
      } else if (e.target === logonCancel) {
        email.value = "";
        password.value = "";
        showLoginRegister();
      }
    }
  });
};

export const showLogin = () => {
  email.value = null;
  password.value = null;
  setDiv(loginDiv);
};

let addEditDiv = null;
let datecol = null;
let fromcol = null;
let tocol = null;
let addingtrip = null;

export const handleAddEdit = () => {
  addEditDiv = document.getElementById("edit-trip");
  datecol = document.getElementById("datecol");
  fromcol = document.getElementById("fromcol");
  tocol = document.getElementById("tocol");
  addingtrip = document.getElementById("adding-trip");
  const editCancel = document.getElementById("edit-cancel");

  addEditDiv.addEventListener("click", async (e) => {
    if (inputEnabled && e.target.nodeName === "BUTTON") {
      if (e.target === addingtrip) {
        enableInput(false);

        let method = "POST";
        let url = "/api/v1/trips";
        if (addingtrip.textContent === "update") {
          method = "PATCH";
          url = `/api/v1/trips/${addEditDiv.dataset.id}`;
        }
        try {
          const response = await fetch(url, {
            method: method,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              date: datecol.value,
              from: fromcol.value,
              to: tocol.value,
            }),
          });

          const data = await response.json();
          if (response.status === 200 || response.status === 201) {
            if (response.status === 200) {
              // a 200 is expected for a successful update
              message.textContent = "The job entry was updated.";
            } else {
              // a 201 is expected for a successful create
              message.textContent = "The job entry was created.";
            }

            datecol.value = "";
            fromcol.value = "";
            tocol.value = "";
            showTrips();
          } else {
            message.textContent = data.msg;
          }
        } catch (err) {
          console.log(err);
          message.textContent = "A communication error occurred.";
        }

        enableInput(true);
      } else if (e.target === editCancel) {
        message.textContent = "";
        showTrips();
      }
    }
  });
};

export const showAddEdit = async (tripId) => {
  if (!tripId) {
    datecol.value = "";
    fromcol.value = "";
    tocol.value = "";
    addingtrip.textContent = "add";
    message.textContent = "";

    setDiv(addEditDiv);
  } else {
    enableInput(false);
    try {
      const response = await fetch(`/api/v1/trips/${tripId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.status === 200) {
        datecol.value = data.trip.date.slice(0, 10); //mm/dd/yyyy

        console.log("data.trip.Date ====> ", data.trip.date.slice(0, 10));
        fromcol.value = data.trip.from;
        tocol.value = data.trip.to;
        addingtrip.textContent = "update";
        message.textContent = "";
        addEditDiv.dataset.id = tripId;

        setDiv(addEditDiv);
      } else {
        // might happen if the list has been updated since last display
        message.textContent = "The trips entry was not found";
        showTrips();
      }
    } catch (err) {
      console.log(err);
      message.textContent = "A communications error has occurred.";
      showTrips();
    }

    enableInput(true);
  }
};

let registerDiv = null;
let name = null;
let email1 = null;
let password1 = null;
let password2 = null;

export const handleRegister = () => {
  registerDiv = document.getElementById("register-div");
  name = document.getElementById("name");
  email1 = document.getElementById("email1");
  password1 = document.getElementById("password1");
  password2 = document.getElementById("password2");
  const registerButton = document.getElementById("register-button");
  const registerCancel = document.getElementById("register-cancel");

  registerDiv.addEventListener("click", async (e) => {
    if (inputEnabled && e.target.nodeName === "BUTTON") {
      if (e.target === registerButton) {
        if (password1.value != password2.value) {
          message.textContent = "The passwords entered do not match.";
        } else {
          enableInput(false);

          try {
            const response = await fetch("/api/v1/auth/register", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: name.value,
                email: email1.value,
                password: password1.value,
              }),
            });

            const data = await response.json();
            if (response.status === 201) {
              message.textContent = `Registration successful.  Welcome ${data.user.name}`;
              setToken(data.token);

              name.value = "";
              email1.value = "";
              password1.value = "";
              password2.value = "";

              showTrips();
            } else {
              message.textContent = data.msg;
            }
          } catch (err) {
            console.error(err);
            message.textContent = "A communications error occurred.";
          }

          enableInput(true);
        }
      } else if (e.target === registerCancel) {
        name.value = "";
        email1.value = "";
        password1.value = "";
        password2.value = "";
        showLoginRegister();
      }
    }
  });
};

export const showRegister = () => {
  email1.value = null;
  password1.value = null;
  password2.value = null;
  setDiv(registerDiv);
};

export const showDelete = async (tripId) => {
  if (!tripId) {
    datecol.value = "";
    fromcol.value = "";
    tocol.value = "";
    addingtrip.textContent = "delete";
    message.textContent = "";

    setDiv(addEditDiv);
  } else {
    enableInput(false);
    try {
      const response = await fetch(`/api/v1/trips/${tripId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.status === 200) {
        datecol.value = "";
        fromcol.value = "";
        tocol.value = "";
        addingtrip.textContent = "add";
        message.textContent = "Delete success";
        addEditDiv.dataset.id = tripId;
        showTrips();
      } else {
        message.textContent = "Delete was not successful!";
      }
    } catch (err) {
      console.log(err);
      message.textContent = "A communications error has occurred.";
      showTrips();
    }

    enableInput(true);
  }
};
