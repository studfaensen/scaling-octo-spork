// frontend/src/components/ProteinList.js
import React, { useEffect, useState } from 'react';
import proteinService from '../services/proteinService';
import { Link } from 'react-router-dom';

const ProteinList = () => {
    const [proteins, setProteins] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProteins = async (page, searchTerm) => {
        setLoading(true);
        setError(null);
        try {
            const response = await proteinService.getProteins(page, 10, searchTerm);
            setProteins(response.data.proteins);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.total_pages);
        } catch (err) {
            setError('Failed to fetch proteins.');
            console.error('Error fetching proteins:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProteins(currentPage, search);
    }, [currentPage, search]);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this protein?')) {
            try {
                await proteinService.deleteProtein(id);
                fetchProteins(currentPage, search);
            } catch (err) {
                setError('Failed to delete protein.');
                console.error('Error deleting protein:', err);
            }
        }
    };

    return (
        <div>
            <h2>Protein List</h2>
            <input
                type="text"
                placeholder="Search proteins..."
	    	value = {search}
                onChange={handleSearchChange}
                style={{ marginBottom: '10px', padding: '8px', width: '300px' }}
            />
	    { loading ? <div>Loading proteins...</div> :
	      error ? <div>Error: {error}</div> :
              <>
		    <ul style={{ listStyle: 'none', padding: 0 }}>
			{proteins.length > 0 ? (
			    proteins.map((protein) => (
				<li key={protein.id} style={{ border: '1px solid #eee', padding: '10px', margin: '5px 0', borderRadius: '5px' }}>
				    <strong>{protein.name} ({protein.id})</strong>
				    <p style={{ margin: '5px 0' }}>Gene: {protein.gene_name || 'N/A'}</p>
				    <p style={{ margin: '5px 0' }}>Description: {protein.description ? `${protein.description.substring(0, 100)}...` : 'No description'}</p>
				    <div style={{ marginTop: '10px' }}>
					<Link to={`/proteins/${protein.id}`} style={{ marginRight: '10px', color: 'blue', textDecoration: 'none' }}>View Detail</Link>
					<Link to={`/edit/${protein.id}`} style={{ marginRight: '10px', color: 'green', textDecoration: 'none' }}>Edit</Link>
					<button onClick={() => handleDelete(protein.id)} style={{ background: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '3px' }}>Delete</button>
				    </div>
				</li>
			    ))
			) : (
			    <p>No proteins found.</p>
			)}
		    </ul>
		    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
			<button
			    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
			    disabled={currentPage === 1}
			    style={{ padding: '8px 15px', cursor: 'pointer' }}
			>
			    Previous
			</button>
			<span style={{ alignSelf: 'center' }}>Page {currentPage} of {totalPages}</span>
			<button
			    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
			    disabled={currentPage === totalPages}
			    style={{ padding: '8px 15px', cursor: 'pointer' }}
			>
			    Next
			</button>
		    </div>
		</>
	    }
        </div>
    );
};

export default ProteinList;
