// src/components/Header.js
import React from 'react';
import './Header.css'; // Припустимо, що ви створите Header.css

function Header({ title }) {
  return (
    <header className="app-header">
      <h1>{title}</h1>
    </header>
  );
}

export default Header;