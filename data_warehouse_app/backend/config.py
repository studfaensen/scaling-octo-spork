# backend/config.py
import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
                              'postgresql://dw_user:your_secure_password@localhost/uniprot_dw'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
