from datetime import datetime

def valid_date(value: str) -> str:
    try:
        datetime.strptime(value, "%Y-%m-%d")
    except ValueError:
        raise ValueError("La fecha debe tener el formato YYYY-MM-DD (ej. 24-08-26)")
    return value