// frontend/src/components/Protein3DViewer.js
import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import proteinService from '../services/proteinService';


const Protein3DViewer = () => {
    const { id } = useParams();
    const viewerContainerRef = useRef(null);
    const [protein, setProtein] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [molstarLoaded, setMolstarLoaded] = useState(false);

    useEffect(() => {
        const fetchDataAndLoadMolstar = async () => {
            setLoading(true);
            setError(null);
            try {
                const proteinResponse = await proteinService.getProtein(id);
                const fetchedProtein = proteinResponse.data;
                setProtein(fetchedProtein);

                if (!fetchedProtein.pdb_id) {
                    setError('No PDB ID available for this protein.');
                    setLoading(false);
                    return;
                }
                console.log(fetchedProtein)

                setMolstarLoaded(true);

                if (viewerContainerRef.current && window.molstar) {
                    const viewer = new window.molstar.Viewer(viewerContainerRef.current, {
                        layoutIs  : 'landscape',
                        layoutShowControls: true,
                        layoutShowSequence: true,
                        layoutShowLog: false,
                        layoutShowLeftPanel: true,
                        layoutShowRightPanel: true,
                        layoutShowExpand: true,
                        viewportShowExpand: true,
                        viewportShowSelectionMode: true,
                        viewportShowAnimation: true,
                        viewportShowStats: true,
                        volumeStreamingServer: 'https://maps.rcsb.org/',
                        pdbProvider: 'rcsb',
                    });

                    await viewer.loadPdb(fetchedProtein.pdb_id);
                }
                setLoading(false);
            } catch (err) {
                console.error('Detailed 3D Viewer Error Object:', err);
                let errorMessage = 'Unknown error occurred.';
                if (err.message) {
                    errorMessage = `Error: ${err.message}`;
                } else if (err.response && err.response.data && err.response.data.error) {
                    errorMessage = `API Error: ${err.response.data.error}`;
                } else if (err instanceof Error) {
                    errorMessage = `Client-side error: ${err.message}`;
                }
                setError(`Failed to load 3D structure: ${errorMessage}. Please ensure the PDB ID is valid and you have an internet connection.`);
                setLoading(false);
            }
        };

        fetchDataAndLoadMolstar();
    }, [id]);

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading 3D viewer...</div>;
    if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>Error: {error}</div>;
    if (!protein || !protein.pdb_id) return <div style={{ textAlign: 'center', marginTop: '50px' }}>No PDB ID available for this protein.</div>;

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h2>3D Structure of {protein.name} (PDB ID: {protein.pdb_id})</h2>

	    <iframe width="1080" height="720" src="https://molstar.org/viewer/" />
	    {/*
            <div
                ref={viewerContainerRef}
                style={{
                    width: '100%',
                    height: '600px',
                    position: 'relative',
                    marginBottom: '20px',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#f0f0f0'
                }}
            >
                {!molstarLoaded && (
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#555' }}>
                        Loading Molstar viewer assets...
                    </div>
                )}
            </div>
            */}

            <Link to={`/proteins/${id}`} style={{ display: 'inline-block', padding: '8px 15px', background: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
                Back to Protein Details
            </Link>
        </div>
    );
};

export default Protein3DViewer;
