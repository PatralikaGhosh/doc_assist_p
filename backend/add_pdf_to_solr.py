import pysolr
import sys
from nltk_chunking import chunk_text
from pdf2image import convert_from_path
import pytesseract

# pip install pytesseract, pip install pdf2image, brew install poppler
# Sample usage: python3 add_pdf_to_solr.py "file1.pdf" "file2.pdf"

solr_url = 'http://localhost:8983/solr/document_processing'
solr = pysolr.Solr(solr_url)

# Check if at least one file was provided
if len(sys.argv) < 2:
    print("Usage: python3 add_pdf_to_solr.py <file1.pdf> [<file2.pdf> ...]")
    sys.exit(1)

all_docs = []

for pdf_file in sys.argv[1:]:
    print(f"Processing {pdf_file} ...")
    # Convert PDF pages to images using pdf2image
    pages = convert_from_path(pdf_file)
    content = ""
    
    # Extract text from each page image using pytesseract
    for page in pages:
        page_text = pytesseract.image_to_string(page)
        content += page_text
    
    # Split text into chunks for Solr indexing
    chunks = chunk_text(content, min_sentences=3, max_sentences=10, threshold=0.2)
    
    # Build documents for each chunk
    for i, para in enumerate(chunks, start=1):
        doc_id = f"{pdf_file}-{i}"
        all_docs.append({
            'id': doc_id,
            'filename': pdf_file,
            'content': para,
        })

# Send all documents to Solr
if all_docs:
    solr.add(all_docs)
    solr.commit()
    print(f"Successfully indexed {len(all_docs)} chunks from {len(sys.argv) - 1} files.")
else:
    print("No content found to index.")
