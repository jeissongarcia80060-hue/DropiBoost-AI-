def calculate_product_score(provider_price: float, suggested_price: float, stock: int) -> dict:
    """
    Algoritmo de puntuación inteligente (0 a 100).
    Evalúa margen de ganancia, atractivo del precio y stock disponible.
    """
    # 1. Cálculo del margen de ganancia porcentual
    if suggested_price <= 0:
        margin_percentage = 0
    else:
        margin_percentage = ((suggested_price - provider_price) / suggested_price) * 100

    # 2. Puntuación basada en el margen (Hasta 40 puntos)
    # Un margen ideal en dropshipping supera el 50-60%
    margin_score = min(40, (margin_percentage / 70) * 40)

    # 3. Puntuación basada en el volumen de stock disponible (Hasta 20 puntos)
    if stock > 100:
        stock_score = 20
    elif stock > 30:
        stock_score = 15
    elif stock > 0:
        stock_score = 10
    else:
        stock_score = 0

    # 4. Puntuación base de demanda de mercado estimada (40 puntos por defecto para MVP)
    demand_score = 35.0

    # Puntuación Total Final
    total_score = round(margin_score + stock_score + demand_score, 1)
    if total_score > 100:
        total_score = 100.0

    # Clasificación comercial
    if total_score >= 80:
        potential = "Alto"
        promo_ease = "Muy Fácil"
    elif total_score >= 60:
        potential = "Medio"
        promo_ease = "Fácil"
    else:
        potential = "Bajo"
        promo_ease = "Moderado"

    return {
        "score": total_score,
        "commercial_potential": potential,
        "promo_ease": promo_ease,
        "margin_percentage": round(margin_percentage, 1)
    }