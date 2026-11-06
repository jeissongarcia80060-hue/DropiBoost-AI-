from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    category: Optional[str] = None
    provider_price: float
    suggested_price: float
    potential_profit: float
    stock: Optional[int] = 0
    image_url: Optional[str] = None
    description: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    score: float
    commercial_potential: str
    promo_ease: str
    advantages: Optional[str] = None
    disadvantages: Optional[str] = None
    target_audience: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True