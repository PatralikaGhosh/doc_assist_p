import sys
import nltk
import re
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
    words = re.findall(r'\w+', text.lower())
    stop_words = set(stopwords.words("english"))
    keywords = [word for word in words if word.isalpha() and word.lower() not in stop_words]
    keywords = [word for word in keywords if word not in ["hello", "hi", "hey"]]

    # Lemmatization
    lm = WordNetLemmatizer()
    keywords_lemmatized = [lm.lemmatize(word, get_wordnet_pos(word)) for word in keywords]

    # Stemming
    ss = nltk.SnowballStemmer(language='english')
    keywords_stemmed = [ss.stem(word) for word in keywords_lemmatized]

    return keywords_stemmed

if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(1)

    input_text = sys.argv[1]
    keywords = extract_keywords(input_text)

    # Print extracted keywords to the terminal
    print("Extracted Keywords:", keywords, file=sys.stderr)

    # Send plain text response to Node.js
    print("hey this worked so push your changes and tell people, bye gurl!")
    sys.stdout.flush()
