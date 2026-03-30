from http.server import BaseHTTPRequestHandler
import json


def calcola_interesse_composto(capitale: float, tasso: float, anni: int) -> str:
    """Calcola l'interesse composto."""
    risultato = capitale * ((1 + tasso / 100) ** anni)
    return f"{risultato:.2f}"


def calcola_budget(entrate: float, spese: float) -> str:
    """Calcola il saldo di budget."""
    saldo = entrate - spese
    if saldo > 0:
        return "Risparmio: " + str(saldo)
    else:
        return "Deficit: " + str(abs(saldo))


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Esempio di test con valori default
        risultato = {
            "interesse_composto": calcola_interesse_composto(1000, 5, 10),
            "budget": calcola_budget(2000, 1500)
        }
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(risultato).encode())

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(content_length))

        action = body.get("action")

        if action == "interesse":
            risultato = calcola_interesse_composto(
                float(body["capitale"]),
                float(body["tasso"]),
                int(body["anni"])
            )
        elif action == "budget":
            risultato = calcola_budget(
                float(body["entrate"]),
                float(body["spese"])
            )
        else:
            risultato = "Azione non valida. Usa 'interesse' o 'budget'."

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"risultato": risultato}).encode())
