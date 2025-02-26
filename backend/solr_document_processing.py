import pysolr
import re
import tika
import sys
import json
from nltk_chunking import chunk_text
from keyword_processor import clean_text, extract_keywords


tika.initVM()
from tika import parser
parsed = parser.from_file('/Users/rohanganta/Desktop/article.pdf')
content = parsed["content"]
cleaned_content = re.sub(r'(?<!\n)\n(?!\n)', ' ', content)
chunks = chunk_text(content, min_sentences=3, max_sentences=10, threshold=0.2)


solr_url = 'http://localhost:8983/solr/chatbot_docs'
solr = pysolr.Solr(solr_url)
response = solr.ping()

documents = []
for i, para in enumerate(chunks, 1):
    documents.append({
        'id': str(i),
        'content': para,
    })

solr.add(documents)
solr.commit()

if len(sys.argv) < 2:
    print(json.dumps([]))  # Always return valid JSON
    sys.exit(1)

sample_query = sys.argv[1]
cleaned = clean_text(sample_query)
keywords = extract_keywords(cleaned)
print(json.dumps(keywords))  # Ensure JSON output

content_query = "content:"
for keyword in keywords:
    if content_query == "content:":
        content_query += keyword
    else:
        content_query += "+" + keyword

results = solr.search(content_query)

for result in results:
    print(result)
    print('\n')

