import sys
import json
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

def extract_keywords(text):
    words = word_tokenize(text.lower())
    stop_words = set(stopwords.words("english"))
    keywords = [word for word in words if word.isalnum() and word.lower() not in stop_words]
    return keywords

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps([]))  # Always return valid JSON
        sys.exit(1)

    input_text = sys.argv[1]
    keywords = extract_keywords(input_text)

    print(json.dumps(keywords))  # Ensure JSON output