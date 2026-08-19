from fastapi import FastAPI

from routes.pdf_routes import router as pdf_router

app = FastAPI(
    title="Clinical History PDF Service",
    version="1.0.0"
)

app.include_router(pdf_router)

@app.get("/health")
def health():
    return {
        "status": "UP",
        "service": "pdf-service"
    }

