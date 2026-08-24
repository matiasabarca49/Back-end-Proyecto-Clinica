from typing import Annotated, Literal
from pydantic import BaseModel, EmailStr, Field, field_validator, AfterValidator
from utils.dates_helper import valid_date

#Definición de tipos de texto con límites finitos
ShortStr = Annotated[str, Field(min_length=1, max_length=50)]     # Nombres, apellidos, afiliados
MediumStr = Annotated[str, Field(min_length=1, max_length=150)]   # Coberturas, direcciones
NoteStr = Annotated[str, Field(min_length=1, max_length=1000)]    # Descripciones individuales
DateYYMMDD = Annotated[str, AfterValidator(valid_date)]

class TreatmentItem(BaseModel):
    name: NoteStr
    dateStart: DateYYMMDD
    dateEnd: DateYYMMDD
    status: Literal["progress","pending", "finalized", "canceled"]


class ObservationItem(BaseModel):
    name: NoteStr
    date: DateYYMMDD
    status: Literal["progress","pending", "finalized", "canceled"]

class ToothStatusItem(BaseModel):
    tooth: int = Field(..., ge=11, le=85)  # Validación de rango para dientes (11-85)
    caries: dict[
        Literal["vestibular", "mesial", "oclusal", "distal", "lingual"],
        Literal["0", "1", "2"]
    ]
    corona: bool
    extracted: bool
    allcaries: bool
    incurable: bool
    malposition:bool 
    periodontal: bool
    inscrustration: bool

# Esquema del paciente
class PatientPDF(BaseModel):
    name: ShortStr
    lastName: ShortStr
    birth: DateYYMMDD

    # Opción A: Restringir a valores específicos conocidos
    typeDNI: Literal["DNI", "PASAPORTE", "LC", "LE", "CI"]
    dni: str = Field(..., min_length=5, max_length=10, pattern=r"^\d+$")
    
    # Opciones de sexo finitas (ajustar según la lógica de negocio)
    sex: Literal["male", "female", "anoher", "prefer_not_to_say"]
    
    address: MediumStr
    phone: str = Field(..., min_length=5, max_length=16, pattern=r"^\+?[0-9\s\-]+$")
    email: EmailStr = Field(..., max_length=254)
    
    medicalCoverage: MediumStr
    nAffiliate: ShortStr

    # 3. Validación de Listas (Límite de elementos + tipo de dato interno)
    treatments: list[TreatmentItem] = Field(..., max_length=200)
    observations: list[ObservationItem] = Field(..., max_length=100)
    dentalStatus: list[ToothStatusItem] = Field(..., max_length=50)

    