from kafka import KafkaConsumer
import sys
import json
from datetime import datetime

servidores_bootstrap = 'kafka:9092'
topic = 'mi_tema' + sys.argv[1]

consumidor: KafkaConsumer = KafkaConsumer(topic, bootstrap_servers=[servidores_bootstrap])

# Promedio de latencia
count: int = 0
average: float = 0

# Latencia maxima
max_latency: float = 0
ignore_rows: int = 5 # Ignora las primeras latencias en el calculo de latencia maxima, ya que estas suelen durar mas

try:
    for msg in consumidor:
        data: json = json.loads(msg.value.decode())
        timestamp: datetime = datetime.strptime(data['data']['timestamp'], '%Y-%m-%d %H:%M:%S.%f')
        latency: float = (datetime.now() - timestamp).total_seconds() * 1000

        # Estadisticas
        # Latencia maxima
        if ignore_rows > 0:
            ignore_rows -= 1
        else:
            max_latency = latency if latency > max_latency else max_latency

        # Calcular promedio de latencia
        average = (average * count + latency) / (count + 1)
        count += 1

        print(f"Dispositivo {data['id']} enviando: {data['data']}", f"Latencia: {str(latency)} ms")
except KeyboardInterrupt:
    print(f"\nMensajes recibidos: {count}", f"\nPromedio de latencia: {average} ms", f"\nMaxima latencia: {max_latency} ms")