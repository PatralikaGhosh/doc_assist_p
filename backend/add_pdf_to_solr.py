import pysolr
import re
import sys
from nltk_chunking import chunk_text
from pdf2image import convert_from_path
import pytesseract

# pip install pytesseract, pip install pdf2image, brew install poppler
# Sample usage: python3 add_pdf_to_solr.py "fish_article.pdf"

solr_url = 'http://localhost:8983/solr/document_processing'
solr = pysolr.Solr(solr_url)

# Convert PDF pages to images using pdf2image
pages = convert_from_path(sys.argv[1])
content = ""
for page in pages:
    # Extract text from each page image using pytesseract
    page_text = pytesseract.image_to_string(page)
    content += page_text

# Split text into chunks for Solr indexing
chunks = chunk_text(content, min_sentences=3, max_sentences=10, threshold=0.2)
documents = []
for i, para in enumerate(chunks, 1):
    documents.append({
        'id': str(i),
        'content': para,
    })

solr.add(documents)
solr.commit()
