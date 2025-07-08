// src/components/HomePage.js
import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import './HomePage.css';

// Зверніть увагу: цей URL призначений ТІЛЬКИ для читання даних.
// Операції POST/PUT/DELETE не будуть працювати з raw.githubusercontent.com
const API_URL_READ_ONLY = 'https://raw.githubusercontent.com/natalimsh/notes/main/data/db.json';
// Для локального розроблення з json-server використовуйте:
const API_URL_LOCAL_CRUD = 'http://localhost:3001/notes';

// Вибираємо, який API_URL використовувати.
// Можна додати логіку для визначення середовища (development/production)
// Але для простоти зараз просто перемкнемо.
const IS_PRODUCTION_DEPLOYMENT = true; // Змініть на false, якщо тестуєте локально з json-server
const API_URL = IS_PRODUCTION_DEPLOYMENT ? API_URL_READ_ONLY : API_URL_LOCAL_CRUD;

function HomePage() {
  const [notes, setNotes] = useState([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedText, setEditedText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Прапор для визначення, чи доступні операції запису
  const isCrudEnabled = !IS_PRODUCTION_DEPLOYMENT; // CRUD лише при локальному запуску

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        // Якщо файл db.json не знайдено або інша помилка читання
        if (response.status === 404 && IS_PRODUCTION_DEPLOYMENT) {
          setError("Файл даних не знайдено на GitHub. Переконайтеся, що 'data/db.json' існує та доступний.");
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      const data = await response.json();
      // Переконаємося, що data це масив. Для raw GitHub це буде об'єкт з ключем 'notes'
      // Або просто масив, якщо ви завантажили тільки сам масив нотаток.
      // Давайте припустимо, що raw.githubusercontent.com повертає об'єкт { "notes": [...] }
      setNotes(data.notes || []); // Якщо API_URL вказує на { "notes": [...] }
      // Якщо API_URL_READ_ONLY вказує лише на сам масив нотаток, то setNotes(data);
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
    if (!isCrudEnabled) {
      alert('Додавання нотаток неможливе на публічному деплої (тільки для читання).');
      return;
    }
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
    if (!isCrudEnabled) {
      alert('Видалення нотаток неможливе на публічному деплої (тільки для читання).');
      return;
    }
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
    if (!isCrudEnabled) {
      alert('Редагування нотаток неможливе на публічному деплої (тільки для читання).');
      return;
    }
    setEditingNoteId(note.id);
    setEditedTitle(note.title);
    setEditedText(note.text);
  };

  const saveEditedNote = async () => {
    if (!isCrudEnabled) {
      alert('Збереження відредагованих нотаток неможливе на публічному деплої (тільки для читання).');
      return;
    }
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
          disabled={!isCrudEnabled} // Вимкнено для деплою
        />
        <textarea
          placeholder="Текст нотатки"
          value={newNoteText}
          onChange={(e) => setNewNoteText(e.target.value)}
          disabled={!isCrudEnabled} // Вимкнено для деплою
        ></textarea>
        <button onClick={addNote} disabled={!isCrudEnabled}>Додати нотатку</button>
        {!isCrudEnabled && (
          <p className="warning-message">
            * Додавання нотаток неможливе на Vercel (дані тільки для читання).
          </p>
        )}
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
                      disabled={!isCrudEnabled} // Вимкнено для деплою
                    />
                    <textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      disabled={!isCrudEnabled} // Вимкнено для деплою
                    ></textarea>
                    <div className="edit-buttons">
                      <button className="save-button" onClick={saveEditedNote} disabled={!isCrudEnabled}>Зберегти</button>
                      <button className="cancel-button" onClick={cancelEditing}>Скасувати</button>
                    </div>
                    {!isCrudEnabled && (
                      <p className="warning-message">
                        * Редагування неможливе на Vercel (дані тільки для читання).
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <h3>{note.title}</h3>
                    <p>{note.text}</p>
                    <div className="note-actions">
                      <button className="edit-button" onClick={() => startEditing(note)} disabled={!isCrudEnabled}>Редагувати</button>
                      <button className="delete-button" onClick={() => deleteNote(note.id)} disabled={!isCrudEnabled}>Видалити</button>
                      {!isCrudEnabled && (
                        <p className="warning-message">
                          * Зміни неможливі на Vercel (дані тільки для читання).
                        </p>
                      )}
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