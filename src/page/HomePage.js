// src/components/HomePage.js
import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import './HomePage.css';

const API_URL = 'http://localhost:3001/notes';

function HomePage() {
  const [notes, setNotes] = useState([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedText, setEditedText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setNotes(data);
    } catch (err) {
      setError("Не вдалося завантажити нотатки: " + err.message);
      console.error("Помилка завантаження нотаток:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const addNote = async () => {
    if (newNoteTitle.trim() === '' || newNoteText.trim() === '') {
      alert('Будь ласка, введіть заголовок і текст нотатки.');
      return;
    }

    const newNote = {
      title: newNoteTitle,
      text: newNoteText,
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNote),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const addedNote = await response.json();
      setNotes([...notes, addedNote]);
      setNewNoteTitle('');
      setNewNoteText('');
    } catch (err) {
      setError("Не вдалося додати нотатку: " + err.message);
      console.error("Помилка додавання нотатки:", err);
    }
  };

  const deleteNote = async (id) => {
    if (window.confirm('Ви впевнені, що хочете видалити цю нотатку?')) {
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        setNotes(notes.filter(note => note.id !== id));
      } catch (err) {
        setError("Не вдалося видалити нотатку: " + err.message);
        console.error("Помилка видалення нотатки:", err);
      }
    }
  };

  const startEditing = (note) => {
    setEditingNoteId(note.id);
    setEditedTitle(note.title);
    setEditedText(note.text);
  };

  const saveEditedNote = async () => {
    if (editedTitle.trim() === '' || editedText.trim() === '') {
      alert('Заголовок і текст нотатки не можуть бути пустими.');
      return;
    }

    const updatedNote = {
      title: editedTitle,
      text: editedText,
    };

    try {
      const response = await fetch(`${API_URL}/${editingNoteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedNote),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const savedNote = await response.json();
      setNotes(notes.map(note =>
        note.id === editingNoteId
          ? savedNote
          : note
      ));
      setEditingNoteId(null);
      setEditedTitle('');
      setEditedText('');
    } catch (err) {
      setError("Не вдалося оновити нотатку: " + err.message);
      console.error("Помилка оновлення нотатки:", err);
    }
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
    setEditedTitle('');
    setEditedText('');
  };

  if (loading) {
    return (
      <div className="home-page">
        <Header title="Мій Додаток Нотаток" />
        <p>Завантаження нотаток...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page">
        <Header title="Мій Додаток Нотаток" />
        <p className="error-message">Помилка: {error}</p>
        <button onClick={fetchNotes}>Спробувати завантажити знову</button>
      </div>
    );
  }

  return (
    <div className="home-page">
      <Header title="Мій Додаток Нотаток" />

      <div className="add-note-section">
        <h2>Додати нову нотатку</h2>
        <input
          type="text"
          placeholder="Заголовок нотатки"
          value={newNoteTitle}
          onChange={(e) => setNewNoteTitle(e.target.value)}
        />
        <textarea
          placeholder="Текст нотатки"
          value={newNoteText}
          onChange={(e) => setNewNoteText(e.target.value)}
        ></textarea>
        <button onClick={addNote}>Додати нотатку</button>
      </div>

      <div className="notes-list-section">
        <h2>Мої нотатки</h2>
        {notes.length === 0 ? (
          <p>Поки що нотаток немає. Додайте першу!</p>
        ) : (
          <div className="notes-grid">
            {notes.map((note) => (
              <div key={note.id} className="note-card">
                {editingNoteId === note.id ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                    />
                    <textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                    ></textarea>
                    <div className="edit-buttons">
                      <button className="save-button" onClick={saveEditedNote}>Зберегти</button>
                      <button className="cancel-button" onClick={cancelEditing}>Скасувати</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3>{note.title}</h3>
                    <p>{note.text}</p>
                    <div className="note-actions">
                      <button className="edit-button" onClick={() => startEditing(note)}>Редагувати</button>
                      <button className="delete-button" onClick={() => deleteNote(note.id)}>Видалити</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;