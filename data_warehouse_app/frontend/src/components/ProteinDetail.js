// frontend/src/components/ProteinDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import proteinService from '../services/proteinService';

const ProteinDetail = () => {
    const { id } = useParams();
    const [protein, setProtein] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProtein = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await proteinService.getProtein(id);
                setProtein(response.data);
            } catch (err) {
                setError('Failed to load protein details. Protein not found or API error.');
                console.error('Error fetching protein:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProtein();
    }, [id]);

    if (loading) return <div>Loading protein details...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!protein) return <div>Protein not found.</div>;

    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', maxWidth: '800px', margin: '20px auto' }}>
            <h2>Protein Details: {protein.name}</h2>
            <p><strong>UniProt ID:</strong> {protein.id}</p>
            <p><strong>Description:</strong> {protein.description || 'No description provided.'}</p>
            <p><strong>Sequence:</strong> <textarea readOnly value={protein.sequence || 'No sequence provided.'} style={{ width: '100%', height: '150px', resize: 'vertical' }}></textarea></p>
            <p><strong>Gene ID:</strong> {protein.gene_id || 'N/A'}</p>
            <p><strong>Gene Name:</strong> {protein.gene_name || 'N/A'}</p>
            <p><strong>PDB ID:</strong> {protein.pdb_id || 'N/A'}</p> {/* NEU: PDB ID anzeigen */}

            <div style={{ marginTop: '20px' }}>
                <Link to="/" style={{ display: 'inline-block', padding: '8px 15px', background: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '5px', marginRight: '10px' }}>Back to List</Link>
                {protein.pdb_id && ( // Button nur anzeigen, wenn PDB ID vorhanden ist
                    <Link to={`/proteins/${protein.id}/3d`} style={{ display: 'inline-block', padding: '8px 15px', background: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
                        View 3D Structure
                    </Link>
                )}
            </div>
        </div>
    );
};

export default ProteinDetail;
