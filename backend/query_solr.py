import pysolr
import sys
import json
from keyword_processor import clean_text, extract_keywords
from google import genai

# Sample usage: python3 query_solr.py "Tell me about the impact of future invasions of fish"

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

############ GEMINI ############

# Initialize the client with your API key
client = genai.Client(api_key="AIzaSyDNz5nOyYpdSYAHeDJM57iU2nhcG-6KdVc")

# Step 2: Extract the content field from each result
content_list = [result['content'][0] for result in results_list if 'content' in result]

# Step 3: Combine the extracted content into one string
combined_content = "\n".join(content_list)

# myQuestion = f"Tell me about the impact of future invasions of fish? Begin your response with 'to answer your question,'. Explain in 100 words or less. Use this as information:\n\n{combined_content}"
myQuestion = f"{cleaned}? Begin your response with 'to answer your question,'. Explain in 100 words or less. Use this as information:\n\n{combined_content}"

# Step 5: Send to Gemini API
response = client.models.generate_content(
    model="gemini-2.0-flash", contents=myQuestion
)

print("Cleaned user query:", cleaned)
print(response.text)