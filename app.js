const accessScreen = document.getElementById("access-screen");
const loginScreen = document.getElementById("login-screen");

const accessPassword = document.getElementById("access-password");
const accessButton = document.getElementById("access-button");
const accessError = document.getElementById("access-error");

const ACCESS_PASSWORD = "CHANGE_THIS_LATER";

accessButton.addEventListener("click", () => {

    if (accessPassword.value === ACCESS_PASSWORD) {

        accessScreen.classList.add("hidden");
        loginScreen.classList.remove("hidden");

        accessError.textContent = "";

    } else {

        accessError.textContent =
            "Incorrect access password.";

    }

});
