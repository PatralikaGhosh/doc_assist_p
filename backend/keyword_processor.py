import sys
import json
import nltk
import re

from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

# nltk.download('punkt')
# nltk.download('stopwords')
# nltk.download('wordnet') 

def extract_keywords(text):
    words = re.findall('\w+', text.lower())
    # words = word_tokenize(text.lower())
    stop_words = set(stopwords.words("english"))
    keywords = [word for word in words if word.isalpha() and word.lower() not in stop_words]
    # Remove hello, hi, hey, etc.
    keywords = [word for word in keywords if word not in ["hello", "hi", "hey"]]

    # Stemming
    ss = nltk.SnowballStemmer(language = 'english')
    keywords_stemmed = [ss.stem(word) for word in keywords]

    return keywords_stemmed

def clean_text(text):
    return text.replace("\n", " ").replace("\r", " ").replace("\t", " ")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps([]))  # Always return valid JSON
        sys.exit(1)

    input_text = sys.argv[1]
    cleaned_text = clean_text(input_text)
    keywords = extract_keywords(cleaned_text)

    print(json.dumps(keywords))  # Ensure JSON output