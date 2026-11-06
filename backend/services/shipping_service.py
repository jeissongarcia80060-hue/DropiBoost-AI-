# backend/services/shipping_service.py

TRANSPORTADORAS_DROPI = {
    "interrapidisimo": {
        "nombre": "Inter Rapidísimo",
        "tarifa_urbana": 11000,
        "tarifa_nacional": 14500,
        "comision_recaudo_pct": 0.03,  # 3% recaudo COD
        "minimo_recaudo": 3000
    },
    "servientrega": {
        "nombre": "Servientrega",
        "tarifa_urbana": 12500,
        "tarifa_nacional": 16000,
        "comision_recaudo_pct": 0.035, # 3.5% recaudo COD
        "minimo_recaudo": 3200
    },
    "coordinadora": {
        "nombre": "Coordinadora",
        "tarifa_urbana": 11500,
        "tarifa_nacional": 15000,
        "comision_recaudo_pct": 0.03,
        "minimo_recaudo": 3000
    },
    "envia": {
        "nombre": "Envía Colvanes",
        "tarifa_urbana": 11000,
        "tarifa_nacional": 14000,
        "comision_recaudo_pct": 0.03,
        "minimo_recaudo": 2800
    },
    "tcc": {
        "nombre": "TCC",
        "tarifa_urbana": 12000,
        "tarifa_nacional": 15500,
        "comision_recaudo_pct": 0.032,
        "minimo_recaudo": 3000
    }
}

def cotizar_envio(proveedor_price: float, sugerido_price: float, tipo_envio: str = "nacional"):
    """
    Calcula el costo de envío de cada transportadora en Dropi Colombia
    considerando la tarifa de flete + la comisión por recaudo contra entrega (COD).
    """
    cotizaciones = []
    
    for key, t in TRANSPORTADORAS_DROPI.items():
        flete_base = t["tarifa_urbana"] if tipo_envio == "urbano" else t["tarifa_nacional"]
        
        # Comisión de recaudo contra entrega sobre el precio de venta final
        comision_recaudo = max(sugerido_price * t["comision_recaudo_pct"], t["minimo_recaudo"])
        costo_total_envio = flete_base + comision_recaudo
        
        cotizaciones.append({
            "key": key,
            "nombre": t["nombre"],
            "flete_base": flete_base,
            "comision_recaudo": round(comision_recaudo),
            "costo_total_envio": round(costo_total_envio)
        })
        
    return cotizaciones

def calcular_precio_venta_optimo(provider_price: float, flete_promedio: float = 16000.0, cpa_pauta: float = 22000.0, margen_deseado_pct: float = 0.30):
    """
    Fórmula Dropshipping Colombia COD:
    PV = (Costo Producto + Flete + Pauta) / (1 - Margen Deseado)
    """
    costos_fijos = provider_price + flete_promedio + cpa_pauta
    precio_recomendado = costos_fijos / (1 - margen_deseado_pct)
    ganancia_neta_estimada = precio_recomendado * margen_deseado_pct
    
    return {
        "precio_recomendado": round(precio_recomendado, -2), # Redondeado a centenas
        "ganancia_neta_estimada": round(ganancia_neta_estimada),
        "costos_desglosados": {
            "producto": provider_price,
            "flete_estimado": flete_promedio,
            "pauta_estimada": cpa_pauta
        }
    }