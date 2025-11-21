# app.py
from fastapi import FastAPI
from pydantic import BaseModel
from vectorstore import load_vectorstore
from llm_generator import load_llm
from rag_pipeline import create_rag_pipeline

app = FastAPI()

# Load models & pipeline once
vectorstore = load_vectorstore()
llm = load_llm()
qa_pipeline = create_rag_pipeline(vectorstore, llm)

class QueryRequest(BaseModel):
    question: str

@app.post("/ask")
def ask_question(req: QueryRequest):
    result = qa_pipeline.run(req.question)
    return {"answer": result}
