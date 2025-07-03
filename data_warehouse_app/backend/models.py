# backend/models.py
from flask_sqlalchemy import SQLAlchemy
from app import db # Assuming db is initialized in app.py

class Organism(db.Model):
    __tablename__ = 'organisms'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True, nullable=False)
    taxonomy_id = db.Column(db.String(50), unique=True)
    genes = db.relationship('Gene', backref='organism', lazy=True)

class Gene(db.Model):
    __tablename__ = 'genes'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True, nullable=False)
    description = db.Column(db.Text)
    organism_id = db.Column(db.Integer, db.ForeignKey('organisms.id'))
    proteins = db.relationship('Protein', backref='gene', lazy=True)

class Protein(db.Model):
    __tablename__ = 'proteins'
    id = db.Column(db.String(20), primary_key=True) # UniProt Accession ID
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    sequence = db.Column(db.Text)
    gene_id = db.Column(db.Integer, db.ForeignKey('genes.id'))
    pdb_id = db.Column(db.String(10), nullable=True) # NEUE SPALTE für PDB ID (z.B. '1CRN')
