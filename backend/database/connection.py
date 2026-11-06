from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

#Definimos la ruta de nuestra base de datos SQLite local
# Definimos la ruta de nuestra nueva base de datos SQLite limpia
SQLALCHEMY_DATABASE_URL = "sqlite:///./dropi_analyzer_v2.db"

#Creamos el motor de base de datos SQLite
#(check_same_thread es necesario solo para SQLite en FastAPI)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

#Fábrica de sesiones para interactuar con la BD
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

#Base declarativa para nuestros modelos ORM
Base = declarative_base()

#Dependencia para obtener la sesión de base de datos en los endpoints
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()