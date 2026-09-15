const SUPABASE_URL = "https://lbkashskoxymzdqhfzsy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_TPUmHZvfmxrdJ6GHxJjIqA_luL_8u3e";

const { createClient } = supabase;

const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

// Access screen
const accessScreen = document.getElementById("access-screen");
const loginScreen = document.getElementById("login-screen");

const accessPassword = document.getElementById("access-password");
const accessButton = document.getElementById("access-button");
const accessError = document.getElementById("access-error");

// Login
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("login-button");
const loginMessage = document.getElementById("login-message");

// Temporary access gate
const ACCESS_PASSWORD = "CHANGE_THIS_LATER";

accessButton.addEventListener("click", () => {
    if (accessPassword.value === ACCESS_PASSWORD) {
        accessScreen.classList.add("hidden");
        loginScreen.classList.remove("hidden");
        accessError.textContent = "";
    } else {
        accessError.textContent = "Incorrect access password.";
    }
});

// Allow Enter key on access password
accessPassword.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        accessButton.click();
    }
});

// Login with Supabase
loginButton.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    loginMessage.textContent = "";

    if (!email || !password) {
        loginMessage.textContent = "Please enter your email and password.";
        return;
    }

    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        loginMessage.textContent = error.message;
    } else {
        loginMessage.textContent = "Login successful!";

        console.log("Logged in user:", data.user);

        window.location.href = "dashboard.html";
    }

    loginButton.disabled = false;
    loginButton.textContent = "Log in";
});
