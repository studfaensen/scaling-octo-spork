// frontend/src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav style={{ padding: '10px', background: '#f0f0f0', display: 'flex', gap: '15px' }}>
            <Link to="/">Proteins List</Link>
            <Link to="/create">Add New Protein</Link>
            <Link to="/upload-fasta">Upload FASTA</Link> {/* Neuer Link */}
        </nav>
    );
};

export default Navbar;
