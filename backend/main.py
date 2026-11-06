from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database.connection import engine, Base, get_db, SessionLocal
from database.models import ProductModel
from schemas.product_schema import ProductResponse, ProductCreate
from services.seed_service import load_initial_products
from services.scoring_service import calculate_product_score
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from services.shipping_service import cotizar_envio, calcular_precio_venta_optimo

# Creamos las tablas explícitamente al cargar el archivo
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Dropi Analyzer API",
    description="API backend para el análisis automatizado de productos de Dropi",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite peticiones desde cualquier origen (ideal para desarrollo local)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    # Creamos una sesión directa y segura para el seed al arrancar
    db = SessionLocal()
    try:
        load_initial_products(db)
    finally:
        db.close()

@app.get("/")
def read_root():
    return {
        "mensaje": "¡Bienvenido al backend de Dropi Analyzer!",
        "estado": "Servidor funcionando correctamente con Base de Datos SQLite",
        "autor": "Jason"
    }

@app.get("/api/products", response_model=List[ProductResponse])
def get_products(db: Session = Depends(get_db)):
    products = db.query(ProductModel).all()
    return products

@app.post("/api/products/analyze", response_model=ProductResponse)
def analyze_and_create_product(product_data: ProductCreate, db: Session = Depends(get_db)):
    analysis = calculate_product_score(
        provider_price=product_data.provider_price,
        suggested_price=product_data.suggested_price,
        stock=product_data.stock
    )
    
    new_product = ProductModel(
        name=product_data.name,
        category=product_data.category,
        provider_price=product_data.provider_price,
        suggested_price=product_data.suggested_price,
        potential_profit=product_data.potential_profit,
        stock=product_data.stock,
        image_url=product_data.image_url,
        description=product_data.description,
        score=analysis["score"],
        commercial_potential=analysis["commercial_potential"],
        promo_ease=analysis["promo_ease"],
        advantages="Alto margen calculado automáticamente por el sistema.",
        disadvantages="Requiere validación de creative testing en pauta digital.",
        target_audience="Compradores digitales impulsivos."
    )
    
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "database": "Conectada (SQLite)"}
@app.post("/api/products/simulate")
def simulate_product(data: dict):
    provider_price = float(data.get("provider_price", 0))
    cpa_pauta = float(data.get("cpa_pauta", 22000))
    margen = float(data.get("margen", 0.30))
    
    # 1. Calculamos el flete promedio con transportadoras
    envios = cotizar_envio(provider_price, provider_price * 2.5, "nacional")
    flete_promedio = sum(e["costo_total_envio"] for e in envios) / len(envios)
    
    # 2. Precio sugerido inteligente
    calculo_precio = calcular_precio_venta_optimo(provider_price, flete_promedio, cpa_pauta, margen)
    precio_sugerido = calculo_precio["precio_recomendado"]
    
    # Recalcular cotizaciones reales de envio con el precio sugerido final
    envios_finales = cotizar_envio(provider_price, precio_sugerido, "nacional")
    
    # 3. Puntuación inteligente
    analysis = calculate_product_score(provider_price, precio_sugerido, int(data.get("stock", 100)))
    
    return {
        "precio_sugerido": precio_sugerido,
        "ganancia_neta_estimada": calculo_precio["ganancia_neta_estimada"],
        "cotizaciones_envio": envios_finales,
        "analysis": analysis
    }
@app.delete("/api/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not product:
        return {"error": "Producto no encontrado"}
    
    db.delete(product)
    db.commit()
    return {"mensaje": f"Producto con ID {product_id} eliminado exitosamente"}