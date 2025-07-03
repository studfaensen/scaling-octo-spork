# backend/app.py
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from Bio import SeqIO
from io import StringIO
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
db = SQLAlchemy(app)
migrate = Migrate(app, db)
CORS(app) 


from models import Organism, Gene, Protein

def serialize_organism(organism):
    return {
        'id': organism.id,
        'name': organism.name,
        'taxonomy_id': organism.taxonomy_id
    }

def serialize_gene(gene):
    return {
        'id': gene.id,
        'name': gene.name,
        'description': gene.description,
        'organism_id': gene.organism_id,
        'organism_name': gene.organism.name if gene.organism else None
    }

def serialize_protein(protein):
    return {
        'id': protein.id,
        'name': protein.name,
        'description': protein.description,
        'sequence': protein.sequence,
        'gene_id': protein.gene_id,
        'gene_name': protein.gene.name if protein.gene else None,
        'pdb_id': protein.pdb_id # NEU
    }

#CRUD

@app.route('/proteins', methods=['POST'])
def create_protein():
    data = request.json

    if not all(k in data for k in ('id', 'name')):
        return jsonify({"error": "Missing 'id' or 'name' in request data"}), 400
    

    if Protein.query.get(data['id']):
        return jsonify({"error": f"Protein with ID {data['id']} already exists"}), 409 # 409 Conflict

    new_protein = Protein(
        id=data['id'],
        name=data['name'],
        description=data.get('description'),
        sequence=data.get('sequence'),
        gene_id=data.get('gene_id'),
        pdb_id=data.get('pdb_id') # NEU
    )
    try:
        db.session.add(new_protein)
        db.session.commit()
        return jsonify(serialize_protein(new_protein)), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500


@app.route('/proteins', methods=['GET'])
def get_proteins():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search_term = request.args.get('search', '')

    # Verwenden von .outerjoin() um auch Proteine ohne Gene/Organismen zu erhalten
    query = Protein.query.outerjoin(Gene).outerjoin(Organism) 
    if search_term:
        query = query.filter(
            (Protein.name.ilike(f'%{search_term}%')) |
            (Protein.description.ilike(f'%{search_term}%')) |
            (Gene.name.ilike(f'%{search_term}%')) |
            (Organism.name.ilike(f'%{search_term}%'))
        )

    proteins_pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    proteins = [serialize_protein(p) for p in proteins_pagination.items]

    return jsonify({
        'proteins': proteins,
        'total_pages': proteins_pagination.pages,
        'current_page': proteins_pagination.page,
        'total_items': proteins_pagination.total
    })

@app.route('/proteins/<string:protein_id>', methods=['GET'])
def get_protein(protein_id):
    protein = Protein.query.get(protein_id)
    if protein is None:
        return jsonify({"error": "Protein not found"}), 404
    return jsonify(serialize_protein(protein))

@app.route('/proteins/<string:protein_id>', methods=['PUT'])
def update_protein(protein_id):
    protein = Protein.query.get(protein_id)
    if protein is None:
        return jsonify({"error": "Protein not found"}), 404

    data = request.json
    protein.name = data.get('name', protein.name)
    protein.description = data.get('description', protein.description)
    protein.sequence = data.get('sequence', protein.sequence)
    protein.gene_id = data.get('gene_id', protein.gene_id)
    protein.pdb_id = data.get('pdb_id', protein.pdb_id)
    try:
        db.session.commit()
        return jsonify(serialize_protein(protein))
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500


@app.route('/proteins/<string:protein_id>', methods=['DELETE'])
def delete_protein(protein_id):
    protein = Protein.query.get(protein_id)
    if protein is None:
        return jsonify({"error": "Protein not found"}), 404

    try:
        db.session.delete(protein)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500


@app.route('/seed_data', methods=['POST'])
def seed_data():
    if Organism.query.count() == 0:
        org1 = Organism(name="Homo sapiens", taxonomy_id="9606")
        org2 = Organism(name="Mus musculus", taxonomy_id="10090")
        db.session.add_all([org1, org2])
        db.session.commit()

        gene1 = Gene(name="TP53", description="Tumor protein p53", organism=org1)
        gene2 = Gene(name="BRCA1", description="Breast cancer type 1 susceptibility protein", organism=org1)
        gene3 = Gene(name="Trp53", description="Tumor protein p53", organism=org2)
        db.session.add_all([gene1, gene2, gene3])
        db.session.commit()

        protein1 = Protein(id="P04637", name="p53", description="Cellular tumor antigen p53", sequence="MQDLSE...KLESPG", gene=gene1)
        protein2 = Protein(id="P38398", name="BRCA1_HUMAN", description="Breast cancer type 1 susceptibility protein homolog", sequence="MDLSALRV...TNLCSFEK", gene=gene2)
        db.session.add_all([protein1, protein2])
        db.session.commit()
        return jsonify({"message": "Data seeded successfully"}), 201
    return jsonify({"message": "Data already exists"}), 200

@app.route('/upload_fasta', methods=['POST'])
def upload_fasta():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file and file.filename.endswith(('.fasta', '.fa', '.fna', '.fas')):
        try:
            file_content = file.read().decode('utf-8')
            fasta_io = StringIO(file_content)

            added_proteins = []
            skipped_proteins = []

            for record in SeqIO.parse(fasta_io, "fasta"):

                parts = record.id.split('|')
                if len(parts) >= 2:

                    protein_id = parts[1].split(' ')[0] 
                else:

                    protein_id = record.id.split(' ')[0]

                protein_id = protein_id[:20]

                protein_name = record.description.split(' ', 1)[0]
                if '|' in record.description and len(record.description.split('|')) > 1:
                    protein_name = record.description.split('|')[1].split(' ')[0]

                protein_description = record.description
                protein_sequence = str(record.seq)

                existing_protein = Protein.query.get(protein_id)
                if existing_protein:
                    skipped_proteins.append({"id": protein_id, "reason": "Already exists"})
                    continue # Überspringen, wenn es bereits existiert

                new_protein = Protein(
                    id=protein_id,
                    name=protein_name,
                    description=protein_description,
                    sequence=protein_sequence,
                    gene_id=None
                )
                db.session.add(new_protein)
                added_proteins.append(serialize_protein(new_protein))
            
            db.session.commit()
            return jsonify({
                "message": "FASTA file processed successfully",
                "added_count": len(added_proteins),
                "skipped_count": len(skipped_proteins),
                "added_proteins": added_proteins,
                "skipped_proteins": skipped_proteins
            }), 200

        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"Error processing FASTA file: {str(e)}"}), 500
    else:
        return jsonify({"error": "Invalid file type. Please upload a FASTA file (.fasta, .fa, .fna, .fas)."}), 400

if __name__ == '__main__':
    with app.app_context():
        if not db.engine.dialect.has_table(db.engine, 'alembic_version'):
             db.create_all()
    app.run(debug=True, port=5000)
