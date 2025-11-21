from text_loader import load_text
from chunker import chunk_text
from vectorstore import build_vectorstore

if __name__ == "__main__":
    txt_path = "data\\university_info.txt"
    
    text = load_text(txt_path)
    print(f"text loaded. Length: {len(text)} characters")

    chunks = chunk_text(text)
    print(f"Text split into {len(chunks)} chunks")

    build_vectorstore(chunks)
    print("✅ Data preparation complete. Vectorstore saved.")

