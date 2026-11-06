from sqlalchemy.orm import Session
from database.models import ProductModel

def load_initial_products(db: Session):
    # Verificamos si ya existen productos para no duplicar
    existing_count = db.query(ProductModel).count()
    if existing_count > 0:
        return {"message": "Los datos de prueba ya estaban cargados."}

    sample_products = [
        ProductModel(
            name="Corrector Postural Magnético Inteligente",
            category="Salud y Bienestar",
            provider_price=18500.0,
            suggested_price=65000.0,
            potential_profit=46500.0,
            stock=150,
            image_url="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500",
            description="Corrector de postura ajustable con soporte magnético para la espalda y hombros.",
            score=88.5,
            commercial_potential="Alto",
            promo_ease="Fácil",
            advantages="Alto margen de ganancia, soluciona un dolor muy común (dolor de espalda por teletrabajo).",
            disadvantages="Requiere buena segmentación en anuncios para evitar público desinteresado.",
            target_audience="Personas de 25 a 50 años que trabajan frente al computador."
        ),
        ProductModel(
            name="Mini Licuadora Portátil Recargable USB",
            category="Hogar y Cocina",
            provider_price=22000.0,
            suggested_price=69900.0,
            potential_profit=47900.0,
            stock=200,
            image_url="https://images.unsplash.com/photo-1570857502809-08184874388e?w=500",
            description="Licuadora portátil de 6 cuchillas ideal para jugos y batidos en el gimnasio o la oficina.",
            score=92.0,
            commercial_potential="Alto",
            promo_ease="Muy Fácil",
            advantages="Excelente atractivo visual para videos cortos en TikTok y Reels.",
            disadvantages="Alta competencia en temporadas de mitad de año.",
            target_audience="Deportistas, personas fitness y amantes de la vida saludable."
        ),
        ProductModel(
            name="Organizador de Zapatos apilable transparente",
            category="Organización del Hogar",
            provider_price=9500.0,
            suggested_price=35000.0,
            potential_profit=25500.0,
            stock=80,
            image_url="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500",
            description="Cajas organizadoras plásticas transparentes para calzado, diseño modular.",
            score=74.0,
            commercial_potential="Medio",
            promo_ease="Fácil",
            advantages="Producto de compra por impulso y necesidad práctica en el hogar.",
            disadvantages="El costo de envío puede ser elevado debido al volumen del paquete.",
            target_audience="Amantes del orden y la organización en el hogar."
        )
    ]

    db.add_all(sample_products)
    db.commit()
    return {"message": "¡Productos de prueba cargados exitosamente!", "total": len(sample_products)}