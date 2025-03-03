import pysolr
import re
import tika
import sys
from nltk_chunking import chunk_text

# Sample usage: python add_pdf_to_solr.py "fish_article.pdf"

solr_url = 'http://localhost:8983/solr/document_processing'
solr = pysolr.Solr(solr_url)

# response = solr.ping() # debugging purposes when connecting to solr
# print(response)

# Script to add new pdf chunks to solr
tika.initVM()
from tika import parser
parsed = parser.from_file(sys.argv[1])
content = parsed["content"]
cleaned_content = re.sub(r'\n+', '', content)
chunks = chunk_text(content, min_sentences=3, max_sentences=10, threshold=0.2)
documents = []
for i, para in enumerate(chunks, 1):
    documents.append({
        'id': str(i),
        'content': para,
    })

solr.add(documents)
solr.commit()