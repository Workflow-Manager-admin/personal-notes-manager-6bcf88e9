import React, { useState, useEffect } from "react";
import "./App.css";
import { supabase } from "./supabaseClient";

// Color scheme (for easy maintenance)
const COLORS = {
  accent: "#fbc02d",
  primary: "#1976d2",
  secondary: "#424242",
};

// PUBLIC_INTERFACE
/**
 * App is the main entry point of the notes application.
 * Provides a modern, minimalistic UI with header, side panel, and main content area.
 */
function App() {
  // App-level state
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [view, setView] = useState("list"); // 'list', 'view', 'edit', 'create'
  const [error, setError] = useState("");
  const [formNote, setFormNote] = useState({ title: "", content: "" });

  // Fetch notes
  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line
  }, []);

  // PUBLIC_INTERFACE
  /** Fetch all notes from Supabase */
  async function fetchNotes() {
    setLoading(true);
    setError("");
    const { data, error } = await supabase.from("notes").select("*").order("updated_at", { ascending: false });
    if (error) setError("Failed to load notes.");
    else setNotes(data);
    setLoading(false);
  }

  // PUBLIC_INTERFACE
  /** Create a new note in Supabase */
  async function handleCreateNote(e) {
    e.preventDefault();
    if (!formNote.title.trim()) return setError("Title is required.");
    setLoading(true);
    setError("");
    const { data, error: insertError } = await supabase
      .from("notes")
      .insert([{ title: formNote.title, content: formNote.content }])
      .select()
      .single();
    if (insertError) setError("Error creating note.");
    else {
      setNotes([data, ...notes]);
      setSelectedNote(data);
      setView("view");
      setFormNote({ title: "", content: "" });
    }
    setLoading(false);
  }

  // PUBLIC_INTERFACE
  /** Delete a note from Supabase */
  async function handleDeleteNote(noteId) {
    setLoading(true);
    setError("");
    const { error: delError } = await supabase.from("notes").delete().eq("id", noteId);
    if (delError) setError("Failed to delete note.");
    else {
      setNotes(notes.filter((n) => n.id !== noteId));
      setView("list");
      setSelectedNote(null);
    }
    setLoading(false);
  }

  // PUBLIC_INTERFACE
  /** Update a note in Supabase */
  async function handleUpdateNote(e) {
    e.preventDefault();
    if (!formNote.title.trim()) return setError("Title is required.");
    setLoading(true);
    setError("");
    const { data, error: updateError } = await supabase
      .from("notes")
      .update({ title: formNote.title, content: formNote.content })
      .eq("id", selectedNote.id)
      .select()
      .single();
    if (updateError) setError("Error updating note.");
    else {
      setNotes(notes.map((n) => (n.id === selectedNote.id ? data : n)));
      setSelectedNote(data);
      setView("view");
      setFormNote({ title: "", content: "" });
    }
    setLoading(false);
  }

  // Handler: start editing selected note
  function startEditNote(note) {
    setSelectedNote(note);
    setFormNote({ title: note.title, content: note.content });
    setView("edit");
  }

  // Handler: start creating new note
  function startCreateNote() {
    setSelectedNote(null);
    setFormNote({ title: "", content: "" });
    setView("create");
  }

  // Handler: Show a note in view mode
  function showNote(note) {
    setSelectedNote(note);
    setView("view");
  }

  // UI: Side Panel List item
  function NoteListItem({ note, isActive, onClick }) {
    return (
      <div
        className="note-list-item"
        style={{
          background: isActive ? COLORS.accent + "11" : "inherit",
          borderLeft: isActive ? `4px solid ${COLORS.accent}` : "4px solid transparent",
        }}
        onClick={onClick}
      >
        <div className="note-title" style={{ fontWeight: 600 }}>{note.title}</div>
        <div className="note-updated">{formatDate(note.updated_at)}</div>
      </div>
    );
  }

  return (
    <div className="NotesAppRoot">
      {/* Header Bar */}
      <header
        style={{
          background: COLORS.primary,
          color: "#fff",
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          boxShadow: "0 2px 8px 0 #0001",
          letterSpacing: 1.2,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 22, letterSpacing: 2 }}>Notes</span>
        <button
          className="btn-create-note"
          style={{
            background: COLORS.accent,
            color: COLORS.secondary,
            fontWeight: 600,
            border: "none",
            borderRadius: 8,
            padding: "8px 20px",
            fontSize: 16,
            cursor: "pointer",
          }}
          onClick={startCreateNote}
          aria-label="New note"
        >
          + New
        </button>
      </header>

      {/* Main panel with sidebar and content */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          minHeight: "calc(100vh - 56px)",
          background: "var(--bg-secondary)",
          transition: "background 0.3s",
        }}
      >
        {/* Sidebar List */}
        <aside
          style={{
            minWidth: 260,
            background: "#f6f7fb",
            borderRight: "1px solid #eee",
            padding: 0,
            height: "100%",
            overflowY: "auto",
          }}
        >
          <div style={{ fontSize: 14, color: COLORS.secondary, fontWeight: 500, padding: "20px 18px 4px" }}>
            All Notes
          </div>
          {loading ? (
            <div style={{ color: COLORS.primary, padding: 18 }}>Loading...</div>
          ) : notes.length === 0 ? (
            <div style={{ color: "#888", padding: 18 }}>No notes yet.</div>
          ) : (
            notes.map((note) => (
              <NoteListItem
                key={note.id}
                note={note}
                isActive={selectedNote?.id === note.id && (view === "view" || view === "edit")}
                onClick={() => showNote(note)}
              />
            ))
          )}
        </aside>
        {/* Content Area */}
        <main
          style={{
            flex: 1,
            padding: "38px max(6vw,32px) 32px",
            background: "#fff",
            boxSizing: "border-box",
            minHeight: 0,
          }}
        >
          {/* Display error */}
          {error && (
            <div
              style={{
                background: "#fdeadb",
                color: "#b14612",
                border: "1px solid #ffe2b9",
                padding: "12px 24px",
                borderRadius: 8,
                marginBottom: 18,
                fontSize: 15,
              }}
            >
              ⚠️ {error}
            </div>
          )}
          {view === "view" && selectedNote && (
            <section>
              <h2 style={{ fontWeight: 700, color: COLORS.primary, marginBottom: 12, marginTop: 0 }}>
                {selectedNote.title}
              </h2>
              <div
                style={{
                  fontSize: 15.5,
                  background: "#fafaff",
                  border: "1px solid #f2f2f2",
                  borderRadius: 8,
                  minHeight: 200,
                  padding: 22,
                }}
              >
                {selectedNote.content
                  ? selectedNote.content
                  : <span style={{ color: "#bbb" }}><em>No content.</em></span>}
              </div>
              <div style={{ margin: "32px 0 0", display: "flex", gap: 12 }}>
                <button
                  className="btn"
                  style={{
                    background: COLORS.primary,
                    color: "#fff",
                    borderRadius: 8,
                    fontWeight: 500,
                    fontSize: 15,
                    border: "none",
                    padding: "10px 22px",
                    cursor: "pointer",
                  }}
                  aria-label="Edit"
                  onClick={() => startEditNote(selectedNote)}
                >
                  Edit
                </button>
                <button
                  className="btn"
                  style={{
                    background: "#fff",
                    color: "#c00",
                    border: "1px solid #ffd7d7",
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 15,
                    padding: "10px 18px",
                    cursor: "pointer",
                  }}
                  aria-label="Delete"
                  onClick={() => handleDeleteNote(selectedNote.id)}
                  disabled={loading}
                >
                  Delete
                </button>
                <button
                  className="btn"
                  style={{
                    background: "#f8f9fa",
                    color: COLORS.secondary,
                    borderRadius: 8,
                    border: "1px solid #e1e1e1",
                    fontWeight: 400,
                    marginLeft: "auto",
                    padding: "10px 16px",
                    cursor: "pointer",
                  }}
                  aria-label="Back to list"
                  onClick={() => {
                    setSelectedNote(null);
                    setView("list");
                  }}
                >
                  Back
                </button>
              </div>
            </section>
          )}

          {(view === "create" || view === "edit") && (
            <section>
              <h2 style={{ fontWeight: 700, color: COLORS.primary, marginBottom: 18, marginTop: 0 }}>
                {view === "create" ? "New Note" : "Edit Note"}
              </h2>
              <form
                style={{ maxWidth: 540, margin: 0, display: "flex", flexDirection: "column", gap: 18 }}
                onSubmit={view === "create" ? handleCreateNote : handleUpdateNote}
                autoComplete="off"
              >
                <input
                  type="text"
                  placeholder="Title"
                  aria-label="Note title"
                  value={formNote.title}
                  onChange={(e) =>
                    setFormNote((note) => ({
                      ...note,
                      title: e.target.value.slice(0, 100),
                    }))
                  }
                  style={{
                    fontSize: 17.5,
                    borderRadius: 7,
                    border: "1.5px solid #e1e1e1",
                    padding: "11px 16px",
                    fontWeight: 500,
                  }}
                  maxLength={100}
                  required
                />
                <textarea
                  placeholder="Note content"
                  aria-label="Note content"
                  rows={9}
                  value={formNote.content}
                  onChange={(e) =>
                    setFormNote((note) => ({
                      ...note,
                      content: e.target.value,
                    }))
                  }
                  style={{
                    fontSize: 15.5,
                    borderRadius: 7,
                    border: "1.5px solid #ececec",
                    padding: "12px 16px",
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />
                <div style={{ display: "flex", gap: 18 }}>
                  <button
                    className="btn"
                    type="submit"
                    style={{
                      background: COLORS.primary,
                      color: "#fff",
                      fontWeight: 600,
                      border: "none",
                      borderRadius: 7,
                      fontSize: 16,
                      padding: "10px 28px",
                      cursor: "pointer",
                      opacity: loading ? 0.7 : 1,
                    }}
                    disabled={loading}
                  >
                    {view === "create" ? "Create" : "Save"}
                  </button>
                  <button
                    type="button"
                    className="btn"
                    style={{
                      background: "#f8f9fa",
                      color: COLORS.secondary,
                      borderRadius: 7,
                      fontWeight: 400,
                      fontSize: 16,
                      padding: "10px 24px",
                      border: "1px solid #e1e1e1",
                      marginLeft: "auto",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setFormNote({ title: "", content: "" });
                      if (view === "edit") setView("view");
                      else setView("list");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* List/content default */}
          {view === "list" && (
            <section>
              <div style={{ color: COLORS.secondary, marginTop: 48, textAlign: "center", fontSize: 20 }}>
                Select a note or create a new one.
              </div>
            </section>
          )}
        </main>
      </div>
      {/* Minimalistic overall app background styling */}
      <style>
        {`
          .NotesAppRoot {
            background: var(--bg-primary,#f3f4f8);
            min-height: 100vh;
            font-family: 'Inter','Segoe UI',Arial,sans-serif;
            color: #222;
          }
          .note-list-item {
            cursor: pointer;
            padding: 13px 18px 11px 24px;
            border-bottom: 1px solid #edf0f3;
            transition: background 0.18s, border-left 0.18s;
            display: flex;
            flex-direction: column;
            gap: 2px;
            font-size: 16px;
          }
          .note-list-item:hover {
            background: ${COLORS.accent}16;
          }
          .note-title {
            color: #232628;
            font-weight: 600;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .note-updated {
            font-size: 12.7px;
            color: #999;
            padding-left: 1px;
          }
          @media (max-width: 750px) {
            aside { min-width: 54vw !important; }
            .NotesAppRoot main { padding: 8vw 4vw 24px !important; }
          }
        `}
      </style>
    </div>
  );
}

function formatDate(dt) {
  if (!dt) return "";
  const date = new Date(dt);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default App;
