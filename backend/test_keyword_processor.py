import unittest
from keyword_processor import extract_keywords, clean_text

class TestKeywordProcessor(unittest.TestCase):

    def test_extract_keywords_basic(self):
        text = "Hello, this is a test. Testing keyword extraction!"
        expected_keywords = ['test', 'test', 'keyword', 'extract']
        self.assertEqual(extract_keywords(text), expected_keywords)

    def test_extract_keywords_with_stopwords(self):
        text = "The quick brown fox jumps over the lazy dog."
        expected_keywords = ['quick', 'brown', 'fox', 'jump', 'lazi', 'dog']
        self.assertEqual(extract_keywords(text), expected_keywords)

    def test_extract_keywords_with_custom_exclusions(self):
        text = "Hello, hi, hey there! This is a custom test."
        expected_keywords = ['custom', 'test']
        self.assertEqual(extract_keywords(text), expected_keywords)

    def test_extract_keywords_with_special_characters(self):
        text = "Python@3.9 is awesome! #coding"
        expected_keywords = ['python', 'awesom', 'cod']
        self.assertEqual(extract_keywords(text), expected_keywords)

    def test_clean_text(self):
        text = "Hello\nWorld!\rThis\tis a test."
        expected_cleaned_text = "Hello World! This is a test."
        self.assertEqual(clean_text(text), expected_cleaned_text)

if __name__ == "__main__":
    unittest.main()