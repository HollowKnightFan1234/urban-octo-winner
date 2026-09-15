const SUPABASE_URL = "https://lbkashskoxymzdqhfzsy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_TPUmHZvfmxrdJ6GHxJjIqA_luL_8u3e";

const { createClient } = supabase;

const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// Check authentication
async function checkAuthentication() {

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();

    if (!session) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("user-email").textContent =
        session.user.email;

    console.log("Authenticated user:", session.user);
}


// Navigation
const navItems = document.querySelectorAll("[data-section]");
const sections = document.querySelectorAll(".page-section");
const pageTitle = document.getElementById("page-title");

navItems.forEach((item) => {

    item.addEventListener("click", () => {

        const sectionName = item.dataset.section;

        sections.forEach((section) => {
            section.classList.remove("active-section");
        });

        const selectedSection =
            document.getElementById(`${sectionName}-section`);

        if (selectedSection) {
            selectedSection.classList.add("active-section");
        }

        document.querySelectorAll(".nav-item").forEach((nav) => {
            nav.classList.remove("active");
        });

        if (item.classList.contains("nav-item")) {
            item.classList.add("active");
        }

        pageTitle.textContent =
            sectionName.charAt(0).toUpperCase() +
            sectionName.slice(1);

    });

});


// Logout
document
    .getElementById("logout-button")
    .addEventListener("click", async () => {

        await supabaseClient.auth.signOut();

        window.location.href = "index.html";

    });


// Start authentication check
checkAuthentication();
