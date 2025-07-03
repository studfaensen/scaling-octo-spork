// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProteinList from './components/ProteinList';
import ProteinDetail from './components/ProteinDetail';
import ProteinForm from './components/ProteinForm';
import FastaUpload from './components/FastaUpload';
import Protein3DViewer from './components/Protein3DViewer'; // NEU: Import der 3D-Viewer-Komponente

function App() {
    return (
        <Router>
            <Navbar />
            <div style={{ padding: '20px' }}>
                <Routes>
                    <Route path="/" element={<ProteinList />} />
                    <Route path="/proteins/:id" element={<ProteinDetail />} />
                    <Route path="/create" element={<ProteinForm />} />
                    <Route path="/edit/:id" element={<ProteinForm />} />
                    <Route path="/upload-fasta" element={<FastaUpload />} />
                    <Route path="/proteins/:id/3d" element={<Protein3DViewer />} /> {/* NEU: Route für 3D-Viewer */}
                </Routes>
            </div>
        </Router>
    );
}

export default App;
