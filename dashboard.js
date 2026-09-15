const SUPABASE_URL = "https://lbkashskoxymzdqhfzsy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_TPUmHZvfmxrdJ6GHxJjIqA_luL_8u3e";

const { createClient } = supabase;

const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// ============================================
// GLOBAL VARIABLES
// ============================================

let currentUser = null;
let currentNoteId = null;
let allNotes = [];


// ============================================
// AUTHENTICATION
// ============================================

async function checkAuthentication() {

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();

    if (!session) {
        window.location.href = "index.html";
        return;
    }

    currentUser = session.user;

    document.getElementById("user-email").textContent =
        currentUser.email;

    console.log("Authenticated user:", currentUser);

    await loadNotes();
    // ============================================
// HOME PRIORITY NOTES
// ============================================

async function loadHomePriorityNotes() {

    if (!currentUser) {
        return;
    }

    const homeContainer =
        document.getElementById("home-priority-notes");

    const { data, error } = await supabaseClient
        .from("notes")
        .select("*")
        .eq("user_id", currentUser.id)
        .eq("is_priority", true)
        .order("updated_at", {
            ascending: false
        })
        .limit(4);


    if (error) {

        console.error(
            "Error loading priority notes:",
            error
        );

        homeContainer.innerHTML = `
            <div class="home-empty-state">
                <h3>Could not load priority notes</h3>
                <p>${escapeHtml(error.message)}</p>
            </div>
        `;

        return;
    }


    if (!data || data.length === 0) {

        homeContainer.innerHTML = `
            <div class="home-empty-state">
                <h3>No priority notes</h3>
                <p>
                    Mark a note as ⭐ Priority and it will appear here.
                </p>
            </div>
        `;

        return;
    }


    homeContainer.innerHTML = data.map(note => {

        const preview =
            note.content.length > 150
                ? note.content.substring(0, 150) + "..."
                : note.content;


        return `

            <article
                class="home-note-card"
                data-home-note-id="${note.id}"
            >

                <div class="home-note-priority">
                    ⭐ Priority
                </div>

                <h3>
                    ${escapeHtml(note.title)}
                </h3>

                <div class="home-note-preview">
                    ${escapeHtml(preview)}
                </div>

                <div class="home-note-folder">
                    ${escapeHtml(note.folder)}
                </div>

            </article>

        `;

    }).join("");


    document
        .querySelectorAll("[data-home-note-id]")
        .forEach(card => {

            card.addEventListener("click", () => {

                const noteId =
                    card.dataset.homeNoteId;

                const note =
                    allNotes.find(
                        item => item.id === noteId
                    );

                if (note) {

                    openEditor(note);

                } else {

                    // If the note isn't currently in
                    // allNotes, go to Notebook.

                    document
                        .querySelector(
                            '[data-section="notebook"]'
                        )
                        .click();

                }

            });

        });

}
await loadHomePriorityNotes();
}


// ============================================
// NAVIGATION
// ============================================

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

        if (sectionName === "notebook") {
            loadNotes();
        }

    });

});


// ============================================
// LOGOUT
// ============================================

document
    .getElementById("logout-button")
    .addEventListener("click", async () => {

        await supabaseClient.auth.signOut();

        window.location.href = "index.html";

    });


// ============================================
// NOTEBOOK ELEMENTS
// ============================================

const newNoteButton =
    document.getElementById("new-note-button");

const noteSearch =
    document.getElementById("note-search");

const noteFilter =
    document.getElementById("note-filter");

const notesContainer =
    document.getElementById("notes-container");

const noteEditorOverlay =
    document.getElementById("note-editor-overlay");

const closeEditorButton =
    document.getElementById("close-editor-button");

const cancelNoteButton =
    document.getElementById("cancel-note-button");

const saveNoteButton =
    document.getElementById("save-note-button");

const deleteNoteButton =
    document.getElementById("delete-note-button");

const noteTitle =
    document.getElementById("note-title");

const noteContent =
    document.getElementById("note-content");

const notePriority =
    document.getElementById("note-priority");

const noteFolder =
    document.getElementById("note-folder");

const editorTitle =
    document.getElementById("editor-title");


// ============================================
// LOAD NOTES
// ============================================

async function loadNotes() {

    if (!currentUser) {
        return;
    }

    const { data, error } = await supabaseClient
        .from("notes")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("is_priority", {
            ascending: false
        })
        .order("updated_at", {
            ascending: false
        });

    if (error) {

        console.error("Error loading notes:", error);

        notesContainer.innerHTML = `
            <div class="empty-notes">
                <h3>Could not load notes</h3>
                <p>${error.message}</p>
            </div>
        `;

        return;
    }

    allNotes = data || [];

    displayNotes(allNotes);
}


// ============================================
// DISPLAY NOTES
// ============================================

function displayNotes(notes) {

    if (notes.length === 0) {

        notesContainer.innerHTML = `
            <div class="empty-notes">
                <h3>No notes yet</h3>
                <p>Create your first note.</p>
            </div>
        `;

        return;
    }


    notesContainer.innerHTML = notes.map(note => {

        const preview =
            note.content.length > 180
                ? note.content.substring(0, 180) + "..."
                : note.content;

        return `

            <article
                class="note-card ${note.is_priority ? "priority" : ""}"
                data-note-id="${note.id}"
            >

                ${note.is_priority
                    ? `<div class="note-priority">⭐ Priority</div>`
                    : ""
                }

                <h3>${escapeHtml(note.title)}</h3>

                <div class="note-preview">
                    ${escapeHtml(preview)}
                </div>

                <div class="note-meta">
                    ${escapeHtml(note.folder)}
                </div>

            </article>

        `;

    }).join("");


    document.querySelectorAll(".note-card").forEach(card => {

        card.addEventListener("click", () => {

            const noteId = card.dataset.noteId;

            const note = allNotes.find(
                item => item.id === noteId
            );

            if (note) {
                openEditor(note);
            }

        });

    });

}


// ============================================
// CREATE NEW NOTE
// ============================================

newNoteButton.addEventListener("click", () => {

    currentNoteId = null;

    editorTitle.textContent = "New Note";

    noteTitle.value = "";
    noteContent.value = "";
    notePriority.checked = false;
    noteFolder.value = "General";

    deleteNoteButton.classList.add("hidden");

    noteEditorOverlay.classList.remove("hidden");

    noteTitle.focus();

});


// ============================================
// OPEN EXISTING NOTE
// ============================================

function openEditor(note) {

    currentNoteId = note.id;

    editorTitle.textContent = "Edit Note";

    noteTitle.value = note.title;
    noteContent.value = note.content;
    notePriority.checked = note.is_priority;
    noteFolder.value = note.folder;

    deleteNoteButton.classList.remove("hidden");

    noteEditorOverlay.classList.remove("hidden");

}


// ============================================
// CLOSE EDITOR
// ============================================

function closeEditor() {

    noteEditorOverlay.classList.add("hidden");

    currentNoteId = null;

}

closeEditorButton.addEventListener(
    "click",
    closeEditor
);

cancelNoteButton.addEventListener(
    "click",
    closeEditor
);


// ============================================
// SAVE NOTE
// ============================================

saveNoteButton.addEventListener("click", async () => {

    const title =
        noteTitle.value.trim() || "Untitled Note";

    const content =
        noteContent.value;

    const folder =
        noteFolder.value.trim() || "General";

    const isPriority =
        notePriority.checked;


    saveNoteButton.disabled = true;
    saveNoteButton.textContent = "Saving...";


    let error;


    if (currentNoteId) {

        const result = await supabaseClient
            .from("notes")
            .update({
                title: title,
                content: content,
                folder: folder,
                is_priority: isPriority,
                updated_at: new Date().toISOString()
            })
            .eq("id", currentNoteId)
            .eq("user_id", currentUser.id);

        error = result.error;

    } else {

        const result = await supabaseClient
            .from("notes")
            .insert({
                user_id: currentUser.id,
                title: title,
                content: content,
                folder: folder,
                is_priority: isPriority
            });

        error = result.error;

    }


    if (error) {

        console.error("Error saving note:", error);

        alert(
            "Could not save the note:\n\n" +
            error.message
        );

    } else {

        closeEditor();

        await loadNotes();
        await loadHomePriorityNotes();

    }


    saveNoteButton.disabled = false;
    saveNoteButton.textContent = "Save Note";

});


// ============================================
// DELETE NOTE
// ============================================

deleteNoteButton.addEventListener("click", async () => {

    if (!currentNoteId) {
        return;
    }


    const confirmed = confirm(
        "Are you sure you want to delete this note?"
    );

    if (!confirmed) {
        return;
    }


    deleteNoteButton.disabled = true;
    deleteNoteButton.textContent = "Deleting...";


    const { error } = await supabaseClient
        .from("notes")
        .delete()
        .eq("id", currentNoteId)
        .eq("user_id", currentUser.id);


    if (error) {

        console.error("Error deleting note:", error);

        alert(
            "Could not delete the note:\n\n" +
            error.message
        );

    } else {

        closeEditor();

        await loadNotes();

    }


    deleteNoteButton.disabled = false;
    deleteNoteButton.textContent = "Delete";

});


// ============================================
// SEARCH
// ============================================

noteSearch.addEventListener("input", applyFilters);

noteFilter.addEventListener("change", applyFilters);


function applyFilters() {

    const searchTerm =
        noteSearch.value
            .trim()
            .toLowerCase();

    const filter =
        noteFilter.value;


    let filteredNotes = allNotes.filter(note => {

        const matchesSearch =
            note.title.toLowerCase().includes(searchTerm) ||
            note.content.toLowerCase().includes(searchTerm) ||
            note.folder.toLowerCase().includes(searchTerm);

        const matchesPriority =
            filter === "all" ||
            (filter === "priority" && note.is_priority);

        return matchesSearch && matchesPriority;

    });


    filteredNotes.sort((a, b) => {

        if (a.is_priority !== b.is_priority) {
            return a.is_priority ? -1 : 1;
        }

        return new Date(b.updated_at) -
               new Date(a.updated_at);

    });


    displayNotes(filteredNotes);

}


// ============================================
// HTML SAFETY
// ============================================

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// ============================================
// START APP
// ============================================

checkAuthentication();
