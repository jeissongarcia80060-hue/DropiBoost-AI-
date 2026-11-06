from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from datetime import datetime
from database.connection import Base

class ProductModel(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    category = Column(String, index=True, nullable=True)
    provider_price = Column(Float, nullable=False)
    suggested_price = Column(Float, nullable=False)
    potential_profit = Column(Float, nullable=False)
    stock = Column(Integer, default=0)
    image_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    
    score = Column(Float, default=0.0)
    commercial_potential = Column(String, default="Pendiente")
    promo_ease = Column(String, default="Pendiente")
    advantages = Column(Text, nullable=True)
    disadvantages = Column(Text, nullable=True)
    target_audience = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)