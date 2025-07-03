// frontend/src/components/FastaUpload.js
import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000'; // Muss mit Ihrem Backend-Port übereinstimmen

const FastaUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [uploadMessage, setUploadMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setUploadStatus('');
        setUploadMessage(null);
        setError(null);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file first.');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        setUploadStatus('Uploading...');
        setError(null);
        setUploadMessage(null);

        try {
            const response = await axios.post(`${API_URL}/upload_fasta`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setUploadStatus('Upload successful!');
            setUploadMessage(response.data); // Zeigt die detaillierte Antwort des Backends an
            setSelectedFile(null); // Datei nach Upload zurücksetzen
            document.getElementById('fastaFileInput').value = ''; // Input leeren
        } catch (err) {
            setUploadStatus('Upload failed.');
            if (err.response) {
                setError(`Error: ${err.response.data.error || err.response.statusText}`);
                console.error('Upload error response:', err.response.data);
            } else {
                setError(`Network error: ${err.message}`);
                console.error('Upload error:', err);
            }
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', maxWidth: '600px', margin: '20px auto' }}>
            <h2>Upload FASTA File</h2>
            <input
                type="file"
                id="fastaFileInput"
                accept=".fasta,.fa,.fna,.fas"
                onChange={handleFileChange}
                style={{ marginBottom: '15px' }}
            />
            <button onClick={handleUpload} disabled={!selectedFile || uploadStatus === 'Uploading...'}>
                {uploadStatus === 'Uploading...' ? 'Uploading...' : 'Upload FASTA'}
            </button>

            {uploadStatus && <p style={{ marginTop: '10px' }}>Status: {uploadStatus}</p>}
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
            {uploadMessage && (
                <div style={{ marginTop: '15px', background: '#e9e9e9', padding: '10px', borderRadius: '5px' }}>
                    <h3>Upload Summary:</h3>
                    <p>Added Proteins: {uploadMessage.added_count}</p>
                    <p>Skipped Proteins (already exists): {uploadMessage.skipped_count}</p>
                    {uploadMessage.skipped_proteins && uploadMessage.skipped_proteins.length > 0 && (
                        <div>
                            <h4>Skipped Details:</h4>
                            <ul>
                                {uploadMessage.skipped_proteins.map((p, index) => (
                                    <li key={index}>{p.id} ({p.reason})</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {/* Sie können hier auch added_proteins anzeigen, falls gewünscht */}
                </div>
            )}
        </div>
    );
};

export default FastaUpload;
