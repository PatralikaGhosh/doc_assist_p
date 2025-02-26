import nltk
from nltk.tokenize import sent_tokenize, word_tokenize

# Ensure the necessary NLTK data is downloaded (only needed once)
nltk.download('punkt', quiet=True)

def jaccard_similarity(sent1, sent2):
    """Compute the Jaccard similarity between two sentences based on word tokens."""
    tokens1 = set(word_tokenize(sent1.lower()))
    tokens2 = set(word_tokenize(sent2.lower()))
    union = tokens1.union(tokens2)
    if not union:
        return 0.0
    return len(tokens1.intersection(tokens2)) / len(union)

def chunk_text(text, min_sentences=3, max_sentences=10, threshold=0.2):
    """
    Split text into logical paragraphs (chunks) using NLTK.
    
    Parameters:
      text (str): The input text (e.g., 3 pages of text).
      min_sentences (int): Minimum sentences per chunk if similarity allows.
      max_sentences (int): Maximum sentences per chunk.
      threshold (float): Similarity threshold below which a new chunk is started.
                         Lower values mean more sensitivity to topic shifts.
    
    Returns:
      list of str: A list of paragraphs, each as a concatenated string of sentences.
      
    Logic:
      - The text is first split into sentences.
      - For each sentence, we compute its similarity with the last sentence of the current chunk.
      - If similarity is below the threshold and we have at least min_sentences in the current chunk,
        we start a new paragraph.
      - If the current chunk reaches max_sentences, we also start a new paragraph.
      - Otherwise, we add the sentence to the current chunk.
    """
    sentences = sent_tokenize(text)
    paragraphs = []
    current_paragraph = []

    for sent in sentences:
        if current_paragraph:
            sim = jaccard_similarity(current_paragraph[-1], sent)
            # If sentences are very different and we already have enough sentences, start new paragraph.
            if sim < threshold and len(current_paragraph) >= min_sentences:
                paragraphs.append(" ".join(current_paragraph))
                current_paragraph = [sent]
            # Also, if max_sentences reached, force a new paragraph.
            elif len(current_paragraph) >= max_sentences:
                paragraphs.append(" ".join(current_paragraph))
                current_paragraph = [sent]
            else:
                current_paragraph.append(sent)
        else:
            current_paragraph.append(sent)
    
    if current_paragraph:
        paragraphs.append(" ".join(current_paragraph))
    return paragraphs



