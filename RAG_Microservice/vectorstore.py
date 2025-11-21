from langchain.vectorstores import Chroma
from langchain.embeddings import HuggingFaceEmbeddings

def build_vectorstore(chunks, persist_directory="chroma_db"):
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vectorstore = Chroma.from_texts(chunks, embedding=embeddings, persist_directory=persist_directory)
    vectorstore.persist()
    return vectorstore

def load_vectorstore(persist_directory="chroma_db"):
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    return Chroma(persist_directory=persist_directory, embedding_function=embeddings)
