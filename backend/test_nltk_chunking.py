import unittest
from nltk_chunking import jaccard_similarity, chunk_text

class TestNltkChunking(unittest.TestCase):

    def test_jaccard_similarity_identical_sentences(self):
        sent1 = "The quick brown fox jumps over the lazy dog."
        sent2 = "The quick brown fox jumps over the lazy dog."
        self.assertAlmostEqual(jaccard_similarity(sent1, sent2), 1.0)

    def test_jaccard_similarity_different_sentences(self):
        sent1 = "The quick brown fox."
        sent2 = "A lazy dog sleeps."
        self.assertAlmostEqual(jaccard_similarity(sent1, sent2), 0.1111111111111111)

    def test_jaccard_similarity_partial_overlap(self):
        sent1 = "The quick brown fox."
        sent2 = "The brown fox jumps."
        self.assertAlmostEqual(jaccard_similarity(sent1, sent2), 0.6666666666666666)

    def test_chunk_text_basic(self):
        text = "This is sentence one. This is sentence two. This is sentence three. This is sentence four."
        chunks = chunk_text(text, min_sentences=2, max_sentences=3, threshold=0.1)
        self.assertEqual(len(chunks), 2)
        self.assertEqual(chunks[0], "This is sentence one. This is sentence two. This is sentence three.")
        self.assertEqual(chunks[1], "This is sentence four.")

    def test_chunk_text_threshold_split(self):
        text = "This is a cat. Cats are great pets. Dogs are also great pets. I love animals."
        chunks = chunk_text(text, min_sentences=2, max_sentences=5, threshold=0.2)
        self.assertEqual(len(chunks), 2)
        self.assertEqual(chunks[0], "This is a cat. Cats are great pets. Dogs are also great pets.")
        self.assertEqual(chunks[1], "I love animals.")

    def test_chunk_text_max_sentences_split(self):
        text = "Sentence one. Sentence two. Sentence three. Sentence four. Sentence five. Sentence six."
        chunks = chunk_text(text, min_sentences=2, max_sentences=3, threshold=0.5)
        self.assertEqual(len(chunks), 2)
        self.assertEqual(chunks[0], "Sentence one. Sentence two. Sentence three.")
        self.assertEqual(chunks[1], "Sentence four. Sentence five. Sentence six.")

    def test_chunk_text_single_sentence(self):
        text = "This is a single sentence."
        chunks = chunk_text(text, min_sentences=1, max_sentences=3, threshold=0.5)
        self.assertEqual(len(chunks), 1)
        self.assertEqual(chunks[0], "This is a single sentence.")

if __name__ == "__main__":
    unittest.main()