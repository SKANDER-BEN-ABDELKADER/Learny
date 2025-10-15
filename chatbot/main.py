from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate


template = """
Answer the question below .
Here is the conversation history: {context}
Question: {question}
Answer:
"""

model = OllamaLLM(model="llama3")
prompt =  ChatPromptTemplate.from_template(template)
chain = prompt | model

def handle_conversetion():
    context = ""
    print("Hi, I'm a chatbot. How can I help you today?")
    print("Enter 'exit' to end the conversation.")
    while True:
        question = input("You: ")
        if question.lower() == "exit":
            print("Goodbye!")
            break
        result = chain.invoke({"context":context, "question": question})
        print("Chatbot: ", result)
        context += f"\nUser: {question}\nChatbot: {result}\n"

if __name__ == "__main__":
    handle_conversetion()
        
        


