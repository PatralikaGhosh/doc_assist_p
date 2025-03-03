import pysolr
import sys
import json
from nltk_chunking import chunk_text
from keyword_processor import clean_text, extract_keywords

# Sample usage: python solr_document_processing.py "Tell me about the impact of future invasions of fish"

solr_url = 'http://localhost:8983/solr/document_processing'
solr = pysolr.Solr(solr_url)

sample_query = sys.argv[1]
cleaned = clean_text(sample_query)
keywords = extract_keywords(cleaned)

content_query = "content:"
for keyword in keywords:
    if content_query == "content:":
        content_query += keyword
    else:
        content_query += "+" + keyword

results = solr.search(content_query)

results_list = [result for result in results]  # convert results to a list
print(json.dumps(results_list))