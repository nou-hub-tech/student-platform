# rag_pipeline.py
from langchain.chains import RetrievalQA

def create_rag_pipeline(vectorstore, llm):
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    qa_chain = RetrievalQA.from_chain_type(llm=llm, retriever=retriever)
    return qa_chain
