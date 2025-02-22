import sys
import json
import nltk
import re

from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords, wordnet
from nltk.stem import WordNetLemmatizer

# nltk.download('punkt')
# nltk.download('stopwords')
# nltk.download('wordnet') 
nltk.download('averaged_perceptron_tagger_eng')

# Function to get POS tag
def get_wordnet_pos(word):
    tag = nltk.pos_tag([word])[0][1][0].upper()
    tag_dict = {"J": wordnet.ADJ, "N": wordnet.NOUN, "V": wordnet.VERB, "R": wordnet.ADV}
    return tag_dict.get(tag, wordnet.NOUN)

def extract_keywords(text):
    '''
    Stemming: the words "running", "runner", and "runs" might all be reduced to "run" by a stemming algorithm, but sometimes it might also reduce "arguing" to "argu".
    Lemmatize: the word "better" would be lemmatized to "good"
    '''
    words = re.findall('\w+', text.lower())
    # words = word_tokenize(text.lower())
    stop_words = set(stopwords.words("english"))
    keywords = [word for word in words if word.isalpha() and word.lower() not in stop_words]
    # Remove hello, hi, hey, etc.
    keywords = [word for word in keywords if word not in ["hello", "hi", "hey"]]

    # Lemmatization
    lm= nltk.WordNetLemmatizer()
    keywords_lemmatized = [lm.lemmatize(word, get_wordnet_pos(word)) for word in keywords]

    # Stemming
    ss = nltk.SnowballStemmer(language = 'english')
    keywords_stemmed = [ss.stem(word) for word in keywords_lemmatized]


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