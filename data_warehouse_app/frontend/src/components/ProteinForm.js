// frontend/src/components/ProteinForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import proteinService from '../services/proteinService';

const ProteinForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        sequence: '',
        gene_id: '',
        pdb_id: ''
    });
    const [isEditMode, setIsEditMode] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            setIsEditMode(true);
            const fetchProtein = async () => {
                setLoading(true);
                try {
                    const response = await proteinService.getProtein(id);
                    setFormData(response.data);
                } catch (err) {
                    setError('Failed to load protein for editing. Protein not found or API error.');
                    console.error('Error fetching protein for edit:', err);
                } finally {
                    setLoading(false);
                }
            };
            fetchProtein();
        } else {
            setLoading(false);
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            if (isEditMode) {
                // Im Bearbeitungsmodus wird die ID nicht geändert, nur die anderen Felder
                await proteinService.updateProtein(id, formData);
            } else {
                // Beim Erstellen muss die ID neu sein
                await proteinService.createProtein(formData);
            }
            navigate('/');
        } catch (err) {
            setError('Failed to save protein. Please check your input and ensure the ID is unique if creating.');
            console.error('Error saving protein:', err.response?.data || err.message);
        }
    };

    if (loading && isEditMode) return <div>Loading protein data for editing...</div>;
    if (error && isEditMode) return <div>Error: {error}</div>;

    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', maxWidth: '600px', margin: '20px auto' }}>
            <h2>{isEditMode ? 'Edit Protein' : 'Add New Protein'}</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>UniProt ID:</label>
                    <input
                        type="text"
                        name="id"
                        value={formData.id}
                        onChange={handleChange}
                        required
                        readOnly={isEditMode} // ID ist im Bearbeitungsmodus nur lesbar
                        style={{ 
                            width: '100%', 
                            padding: '8px', 
                            boxSizing: 'border-box',
                            backgroundColor: isEditMode ? '#e9e9e9' : 'white' // Grauer Hintergrund im ReadOnly-Modus
                        }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Description:</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box', minHeight: '80px' }}
                    ></textarea>
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Sequence:</label>
                    <textarea
                        name="sequence"
                        value={formData.sequence}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box', minHeight: '120px' }}
                    ></textarea>
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Gene ID (if applicable):</label>
                    <input
                        type="number"
                        name="gene_id"
                        value={formData.gene_id}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>PDB ID (e.g., 1CRN):</label>
                    <input
                        type="text"
                        name="pdb_id"
                        value={formData.pdb_id}
                        onChange={handleChange}
                        maxLength="10"
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <button type="submit" style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    {isEditMode ? 'Update Protein' : 'Create Protein'}
                </button>
            </form>
        </div>
    );
};

export default ProteinForm;
